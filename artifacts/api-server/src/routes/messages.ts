import { Router, type IRouter } from "express";
import { db, messagesTable, usersTable } from "@workspace/db";
import { eq, or, and, ne, sql } from "drizzle-orm";
import {
  SendMessageBody,
  GetConversationParams,
  GetConversationResponse,
  ListConversationsResponse,
  GetMessageStatsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function requireAuth(req: any, res: any): number | null {
  const userId = req.session?.userId;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return null;
  }
  return userId;
}

router.post("/messages", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const {
    recipientId,
    ciphertextForRecipient,
    ciphertextForSender,
    ivForRecipient,
    ivForSender,
  } = parsed.data;

  const [msg] = await db
    .insert(messagesTable)
    .values({
      senderId: userId,
      recipientId,
      ciphertextForRecipient,
      ciphertextForSender,
      ivForRecipient,
      ivForSender,
    })
    .returning();

  res.status(201).json({
    id: msg.id,
    senderId: msg.senderId,
    recipientId: msg.recipientId,
    ciphertextForRecipient: msg.ciphertextForRecipient,
    ciphertextForSender: msg.ciphertextForSender,
    ivForRecipient: msg.ivForRecipient,
    ivForSender: msg.ivForSender,
    createdAt: msg.createdAt.toISOString(),
  });
});

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
      or(
        and(
          eq(messagesTable.senderId, userId),
          eq(messagesTable.recipientId, otherUserId),
        ),
        and(
          eq(messagesTable.senderId, otherUserId),
          eq(messagesTable.recipientId, userId),
        ),
      ),
    )
    .orderBy(messagesTable.createdAt);

  res.json(
    GetConversationResponse.parse(
      msgs.map((m) => ({
        id: m.id,
        senderId: m.senderId,
        recipientId: m.recipientId,
        ciphertextForRecipient: m.ciphertextForRecipient,
        ciphertextForSender: m.ciphertextForSender,
        ivForRecipient: m.ivForRecipient,
        ivForSender: m.ivForSender,
        createdAt: m.createdAt.toISOString(),
      })),
    ),
  );
});

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
      sub.partner_id        AS "partnerId",
      u.username            AS "partnerUsername",
      u.public_key_spki     AS "partnerPublicKeySpki",
      COUNT(*)::int         AS "messageCount",
      MAX(sub.created_at)::text AS "lastMessageAt"
    FROM (
      SELECT
        CASE WHEN sender_id = ${userId} THEN recipient_id ELSE sender_id END AS partner_id,
        created_at
      FROM messages
      WHERE sender_id = ${userId} OR recipient_id = ${userId}
    ) sub
    JOIN users u ON u.id = sub.partner_id
    GROUP BY sub.partner_id, u.username, u.public_key_spki
    ORDER BY MAX(sub.created_at) DESC
  `);

  res.json(ListConversationsResponse.parse(rows.rows));
});

router.get("/messages/stats", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const [sentRow] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(messagesTable)
    .where(eq(messagesTable.senderId, userId));

  const [receivedRow] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(messagesTable)
    .where(eq(messagesTable.recipientId, userId));

  const [convoRow] = await db
    .select({ count: sql<number>`COUNT(DISTINCT CASE WHEN ${messagesTable.senderId} = ${userId} THEN ${messagesTable.recipientId} ELSE ${messagesTable.senderId} END)::int` })
    .from(messagesTable)
    .where(
      or(
        eq(messagesTable.senderId, userId),
        eq(messagesTable.recipientId, userId),
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
