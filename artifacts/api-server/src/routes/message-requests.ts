import { Router, type IRouter } from "express";
import { db, messageRequestsTable, usersTable } from "@workspace/db";
import { eq, and, or } from "drizzle-orm";
import {
  SendMessageRequestBody,
  RespondToMessageRequestBody,
  RespondToMessageRequestParams,
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

function formatRequest(r: any, senderUsername: string, recipientUsername: string, senderPublicKeySpki: string, recipientPublicKeySpki: string) {
  return {
    id: r.id,
    senderId: r.senderId,
    senderUsername,
    senderPublicKeySpki,
    recipientId: r.recipientId,
    recipientUsername,
    recipientPublicKeySpki,
    status: r.status,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
  };
}

router.post("/message-requests", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const parsed = SendMessageRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "recipientId must be a positive integer" });
    return;
  }
  const { recipientId } = parsed.data;

  if (recipientId === userId) {
    res.status(400).json({ error: "You cannot send a request to yourself" });
    return;
  }

  const recipient = await db.select().from(usersTable).where(eq(usersTable.id, recipientId)).limit(1);
  if (recipient.length === 0) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const existing = await db
    .select()
    .from(messageRequestsTable)
    .where(
      or(
        and(eq(messageRequestsTable.senderId, userId), eq(messageRequestsTable.recipientId, recipientId)),
        and(eq(messageRequestsTable.senderId, recipientId), eq(messageRequestsTable.recipientId, userId)),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    const e = existing[0];
    if (e.status === "accepted") {
      res.status(409).json({ error: "You are already connected with this user" });
    } else if (e.status === "pending") {
      res.status(409).json({ error: "A request already exists between you and this user" });
    } else {
      res.status(409).json({ error: "A request already exists" });
    }
    return;
  }

  const [newReq] = await db
    .insert(messageRequestsTable)
    .values({ senderId: userId, recipientId, status: "pending" })
    .returning();

  const sender = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);

  res.status(201).json(
    formatRequest(newReq, sender[0].username, recipient[0].username, sender[0].publicKeySpki, recipient[0].publicKeySpki),
  );
});

router.get("/message-requests/incoming", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const rows = await db
    .select()
    .from(messageRequestsTable)
    .where(and(eq(messageRequestsTable.recipientId, userId), eq(messageRequestsTable.status, "pending")));

  const result = await Promise.all(
    rows.map(async (r) => {
      const [sender] = await db.select().from(usersTable).where(eq(usersTable.id, r.senderId)).limit(1);
      const [me] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      return formatRequest(r, sender.username, me.username, sender.publicKeySpki, me.publicKeySpki);
    }),
  );

  res.json(result);
});

router.get("/message-requests/outgoing", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const rows = await db
    .select()
    .from(messageRequestsTable)
    .where(eq(messageRequestsTable.senderId, userId));

  const result = await Promise.all(
    rows.map(async (r) => {
      const [recipient] = await db.select().from(usersTable).where(eq(usersTable.id, r.recipientId)).limit(1);
      const [me] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
      return formatRequest(r, me.username, recipient.username, me.publicKeySpki, recipient.publicKeySpki);
    }),
  );

  res.json(result);
});

router.patch("/message-requests/:id", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const params = RespondToMessageRequestParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid request id" });
    return;
  }

  const body = RespondToMessageRequestBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: 'action must be "accept" or "reject"' });
    return;
  }

  const [request] = await db
    .select()
    .from(messageRequestsTable)
    .where(eq(messageRequestsTable.id, params.data.id))
    .limit(1);

  if (!request) {
    res.status(404).json({ error: "Request not found" });
    return;
  }

  if (request.recipientId !== userId) {
    res.status(403).json({ error: "You can only respond to requests sent to you" });
    return;
  }

  if (request.status !== "pending") {
    res.status(400).json({ error: `Request already ${request.status}` });
    return;
  }

  const newStatus = body.data.action === "accept" ? "accepted" : "rejected";

  const [updated] = await db
    .update(messageRequestsTable)
    .set({ status: newStatus })
    .where(eq(messageRequestsTable.id, params.data.id))
    .returning();

  const [sender] = await db.select().from(usersTable).where(eq(usersTable.id, updated.senderId)).limit(1);
  const [recipient] = await db.select().from(usersTable).where(eq(usersTable.id, updated.recipientId)).limit(1);

  res.json(formatRequest(updated, sender.username, recipient.username, sender.publicKeySpki, recipient.publicKeySpki));
});

export default router;
