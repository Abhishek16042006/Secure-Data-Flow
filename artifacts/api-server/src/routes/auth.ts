import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  RegisterBody,
  LoginBody,
  LoginResponse,
  GetMeResponse,
} from "@workspace/api-zod";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

const router: IRouter = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { username, password, publicKeySpki, encryptedPrivateKey, salt, iv } =
    parsed.data;

  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username));

  if (existing.length > 0) {
    res.status(409).json({ error: "Username already taken" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [user] = await db
    .insert(usersTable)
    .values({ username, passwordHash, publicKeySpki, encryptedPrivateKey, salt, iv })
    .returning();

  req.session.userId = user.id;

  res.status(201).json(
    LoginResponse.parse({
      id: user.id,
      username: user.username,
      publicKeySpki: user.publicKeySpki,
      encryptedPrivateKey: user.encryptedPrivateKey,
      salt: user.salt,
      iv: user.iv,
    }),
  );
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { username, password } = parsed.data;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username));

  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  req.session.userId = user.id;

  res.json(
    LoginResponse.parse({
      id: user.id,
      username: user.username,
      publicKeySpki: user.publicKeySpki,
      encryptedPrivateKey: user.encryptedPrivateKey,
      salt: user.salt,
      iv: user.iv,
    }),
  );
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {
    res.sendStatus(204);
  });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.session.userId));

  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  res.json(
    GetMeResponse.parse({
      id: user.id,
      username: user.username,
      publicKeySpki: user.publicKeySpki,
      encryptedPrivateKey: user.encryptedPrivateKey,
      salt: user.salt,
      iv: user.iv,
    }),
  );
});

export default router;
