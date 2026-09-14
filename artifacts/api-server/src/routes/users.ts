import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, ne } from "drizzle-orm";
import {
  GetUserPublicKeyParams,
  GetUserPublicKeyResponse,
  ListUsersResponse,
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

router.get("/users", async (req, res): Promise<void> => {
  const userId = requireAuth(req, res);
  if (!userId) return;

  const allUsers = await db
    .select({
      id: usersTable.id,
      username: usersTable.username,
      publicKeySpki: usersTable.publicKeySpki,
    })
    .from(usersTable)
    .orderBy(usersTable.username);

  const filtered = userId
    ? allUsers.filter((u) => u.id !== userId)
    : allUsers;

  res.json(ListUsersResponse.parse(filtered));
});

router.get("/users/:id/public-key", async (req, res): Promise<void> => {
  if (!requireAuth(req, res)) return;

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetUserPublicKeyParams.safeParse({ id: Number(raw) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid user id" });
    return;
  }

  const [user] = await db
    .select({ publicKeySpki: usersTable.publicKeySpki })
    .from(usersTable)
    .where(eq(usersTable.id, params.data.id));

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(GetUserPublicKeyResponse.parse({ publicKeySpki: user.publicKeySpki }));
});

export default router;
