/**
 * messages.ts — Encrypted message routes
 *
 * Security hardening applied:
 *  - Accepted-request gate: messages are blocked (403) unless an accepted
 *    message_request exists between the two parties.
 *  - Replay-attack protection:
 *      1. Client sends a crypto-random UUID (messageId).
 *      2. Server rejects any duplicate messageId (DB unique constraint).
 *      3. Server rejects messages whose clientSentAt is > 5 minutes old.
 *  - Input validation: base64 regex, IV length (12 bytes = 16 base64 chars),
 *    max ciphertext size.
 *  - Rate limiting via messageLimiter (60 req / min).
 *  - Soft-delete support (deletedAt field).
 *  - Audit logging of blocked / suspicious events.
 */

import { Router, type IRouter } from "express";
import { db, messagesTable, usersTable, messageRequestsTable } from "@workspace/db";
import { eq, or, and, isNull, sql } from "drizzle-orm";
import {
  SendMessageBody,
  GetConversationParams,
  GetConversationResponse,
  ListConversationsResponse,
  GetMessageStatsResponse,
} from "@workspace/api-zod";
import { messageLimiter } from "../lib/rate-limiters";
import { audit } from "../lib/audit-logger";
import { emitNewMessage, emitMessageRead } from "../sockets/index";

const router: IRouter = Router();

/* ------------------------------------------------------------------
   Shared auth guard
   ------------------------------------------------------------------ */
function requireAuth(req: any, res: any): number | null {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  return userId;
}

/* ------------------------------------------------------------------
   Validate a base64 string.
   AES-GCM IV must be exactly 12 bytes → 16 base64 chars (with padding).
   ------------------------------------------------------------------ */
const BASE64_RE = /^[A-Za-z0-9+/]+=*$/;

function isValidBase64(s: string): boolean {
  return BASE64_RE.test(s);
}

function decodeBase64Length(b64: string): number {
  const padded = b64.replace(/=/g, "");
  return Math.floor((padded.length * 3) / 4);
}

/* ------------------------------------------------------------------
   POST /api/messages — Send an encrypted message
   ------------------------------------------------------------------ */
router.post("/messages", messageLimiter, async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join("; ");
    res.status(400).json({ error: msg });
    return;
  }

  const {
    recipientId,
    ciphertextForRecipient,
    ciphertextForSender,
    ivForRecipient,
    ivForSender,
    messageId,
    clientSentAt,
  } = parsed.data;

  /* --- Input hardening: validate base64 format ------------------- */
  for (const [field, value] of [
    ["ciphertextForRecipient", ciphertextForRecipient],
    ["ciphertextForSender", ciphertextForSender],
    ["ivForRecipient", ivForRecipient],
    ["ivForSender", ivForSender],
  ] as const) {
    if (!isValidBase64(value)) {
      audit({ event: "SUSPICIOUS_PAYLOAD", userId, ip: req.ip, detail: `bad base64 in ${field}` });
      res.status(400).json({ error: `${field} is not valid base64` });
      return;
    }
  }

  /* --- IV length check: must be exactly 12 bytes (AES-GCM nonce) -- */
  if (decodeBase64Length(ivForRecipient) !== 12 || decodeBase64Length(ivForSender) !== 12) {
    audit({ event: "SUSPICIOUS_PAYLOAD", userId, ip: req.ip, detail: "IV length != 12" });
    res.status(400).json({ error: "IV must be exactly 12 bytes (AES-GCM requirement)" });
    return;
  }

  /* --- Max ciphertext size: 64 KB of base64 ≈ 48 KB plaintext ------ */
  if (ciphertextForRecipient.length > 88_000 || ciphertextForSender.length > 88_000) {
    res.status(413).json({ error: "Message payload too large" });
    return;
  }

  /* --- Replay protection: timestamp window ≤ 5 minutes ------------ */
  const sentAt = new Date(clientSentAt);
  const ageMs = Date.now() - sentAt.getTime();
  if (isNaN(sentAt.getTime()) || ageMs > 5 * 60 * 1000 || ageMs < -30_000) {
    audit({ event: "MESSAGE_REPLAY_REJECTED", userId, ip: req.ip, detail: `age=${ageMs}ms` });
    res.status(400).json({ error: "Message timestamp is outside the allowed window (±5 min)" });
    return;
  }

  /* --- Must have an accepted request between the two parties ------- */
  const [accepted] = await db
    .select({ id: messageRequestsTable.id })
    .from(messageRequestsTable)
    .where(
      and(
        or(
          and(
            eq(messageRequestsTable.senderId, userId),
            eq(messageRequestsTable.recipientId, recipientId),
          ),
          and(
            eq(messageRequestsTable.senderId, recipientId),
            eq(messageRequestsTable.recipientId, userId),
          ),
        ),
        eq(messageRequestsTable.status, "accepted"),
      ),
    )
    .limit(1);

  if (!accepted) {
    audit({ event: "MESSAGE_SEND_BLOCKED_NO_REQUEST", userId, targetUserId: recipientId, ip: req.ip });
    res.status(403).json({ error: "You must have an accepted message request to send messages to this user" });
    return;
  }

  /* --- Insert — unique constraint on message_id rejects replays ---- */
  let msg;
  try {
    [msg] = await db
      .insert(messagesTable)
      .values({
        messageId,
        senderId: userId,
        recipientId,
        ciphertextForRecipient,
        ciphertextForSender,
        ivForRecipient,
        ivForSender,
        clientSentAt: sentAt,
        status: "sent",
      })
      .returning();
  } catch (err: any) {
    // PostgreSQL unique violation code 23505
    if (err?.code === "23505") {
      audit({ event: "MESSAGE_REPLAY_REJECTED", userId, ip: req.ip, detail: `duplicate messageId=${messageId}` });
      res.status(409).json({ error: "Duplicate message ID — possible replay attack" });
      return;
    }
    throw err;
  }

  const response = {
    id: msg.id,
    messageId: msg.messageId ?? messageId,
    senderId: msg.senderId,
    recipientId: msg.recipientId,
    ciphertextForRecipient: msg.ciphertextForRecipient,
    ciphertextForSender: msg.ciphertextForSender,
    ivForRecipient: msg.ivForRecipient,
    ivForSender: msg.ivForSender,
    status: msg.status,
    createdAt: msg.createdAt.toISOString(),
    clientSentAt: msg.clientSentAt?.toISOString() ?? clientSentAt,
  };

  /* Deliver encrypted payload to recipient in real time */
  emitNewMessage(recipientId, userId, response);

  audit({ event: "MESSAGE_SEND_SUCCESS", userId, targetUserId: recipientId, ip: req.ip });
  res.status(201).json(response);
});

/* ------------------------------------------------------------------
   GET /api/messages/conversation/:otherUserId
   ------------------------------------------------------------------ */
router.get("/messages/conversation/:otherUserId", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const raw = Array.isArray(req.params.otherUserId)
    ? req.params.otherUserId[0]
    : req.params.otherUserId;
  const params = GetConversationParams.safeParse({ otherUserId: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid user id" });
    return;
  }

  const { otherUserId } = params.data;

  const msgs = await db
    .select()
    .from(messagesTable)
    .where(
      and(
        or(
          and(eq(messagesTable.senderId, userId), eq(messagesTable.recipientId, otherUserId)),
          and(eq(messagesTable.senderId, otherUserId), eq(messagesTable.recipientId, userId)),
        ),
        /* Exclude soft-deleted messages */
        isNull(messagesTable.deletedAt),
      ),
    )
    .orderBy(messagesTable.createdAt);

  res.json(
    GetConversationResponse.parse(
      msgs.map((m) => ({
        id: m.id,
        messageId: m.messageId ?? `legacy-${m.id}`,
        senderId: m.senderId,
        recipientId: m.recipientId,
        ciphertextForRecipient: m.ciphertextForRecipient,
        ciphertextForSender: m.ciphertextForSender,
        ivForRecipient: m.ivForRecipient,
        ivForSender: m.ivForSender,
        status: m.status,
        createdAt: m.createdAt.toISOString(),
        clientSentAt: m.clientSentAt?.toISOString() ?? m.createdAt.toISOString(),
      })),
    ),
  );
});

/* ------------------------------------------------------------------
   PATCH /api/messages/:id/read — mark a message as read
   ------------------------------------------------------------------ */
router.patch("/messages/:id/read", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const msgId = parseInt(req.params.id, 10);
  if (isNaN(msgId)) {
    res.status(400).json({ error: "Invalid message id" });
    return;
  }

  const [msg] = await db
    .select()
    .from(messagesTable)
    .where(and(eq(messagesTable.id, msgId), eq(messagesTable.recipientId, userId)))
    .limit(1);

  if (!msg) {
    res.status(404).json({ error: "Message not found" });
    return;
  }

  const [updated] = await db
    .update(messagesTable)
    .set({ status: "read" })
    .where(eq(messagesTable.id, msgId))
    .returning();

  /* Notify sender that their message was read */
  emitMessageRead(updated.senderId, { messageId: updated.id, status: "read" });

  res.json({ id: updated.id, status: updated.status });
});

/* ------------------------------------------------------------------
   GET /api/messages/conversations — list accepted partners
   ------------------------------------------------------------------ */
router.get("/messages/conversations", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const rows = await db.execute<{
    partnerId: number;
    partnerUsername: string;
    partnerPublicKeySpki: string;
    messageCount: number;
    lastMessageAt: string;
  }>(sql`
    SELECT
      p.partner_id                                          AS "partnerId",
      u.username                                           AS "partnerUsername",
      u.public_key_spki                                    AS "partnerPublicKeySpki",
      COUNT(m.id)::int                                     AS "messageCount",
      COALESCE(MAX(m.created_at), MAX(mr.created_at))::text AS "lastMessageAt"
    FROM (
      SELECT CASE WHEN sender_id = ${userId} THEN recipient_id ELSE sender_id END AS partner_id
      FROM message_requests
      WHERE (sender_id = ${userId} OR recipient_id = ${userId})
        AND status = 'accepted'
    ) p
    JOIN users u ON u.id = p.partner_id
    LEFT JOIN messages m ON (
      (m.sender_id = ${userId} AND m.recipient_id = p.partner_id)
      OR (m.sender_id = p.partner_id AND m.recipient_id = ${userId})
    ) AND m.deleted_at IS NULL
    LEFT JOIN message_requests mr ON (
      (mr.sender_id = ${userId} AND mr.recipient_id = p.partner_id)
      OR (mr.sender_id = p.partner_id AND mr.recipient_id = ${userId})
    ) AND mr.status = 'accepted'
    GROUP BY p.partner_id, u.username, u.public_key_spki
    ORDER BY COALESCE(MAX(m.created_at), MAX(mr.created_at)) DESC
  `);

  res.json(ListConversationsResponse.parse(rows.rows));
});

/* ------------------------------------------------------------------
   GET /api/messages/stats
   ------------------------------------------------------------------ */
router.get("/messages/stats", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const [sentRow] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(messagesTable)
    .where(and(eq(messagesTable.senderId, userId), isNull(messagesTable.deletedAt)));

  const [receivedRow] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(messagesTable)
    .where(and(eq(messagesTable.recipientId, userId), isNull(messagesTable.deletedAt)));

  const [convoRow] = await db
    .select({ count: sql<number>`COUNT(DISTINCT CASE WHEN ${messagesTable.senderId} = ${userId} THEN ${messagesTable.recipientId} ELSE ${messagesTable.senderId} END)::int` })
    .from(messagesTable)
    .where(
      and(
        or(eq(messagesTable.senderId, userId), eq(messagesTable.recipientId, userId)),
        isNull(messagesTable.deletedAt),
      ),
    );

  res.json(
    GetMessageStatsResponse.parse({
      totalSent: sentRow?.count ?? 0,
      totalReceived: receivedRow?.count ?? 0,
      conversationCount: convoRow?.count ?? 0,
    }),
  );
});

export default router;
