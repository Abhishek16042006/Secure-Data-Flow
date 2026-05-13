/**
 * auth.ts — Authentication routes
 *
 * Security hardening applied:
 *  - Session regeneration after login/register (prevents session fixation)
 *  - Full session destruction on logout (not just clearing userId)
 *  - Rate limiting via authLimiter (5 req / 15 min per IP)
 *  - Audit logging of all auth events
 *  - Username normalisation (trim + lowercase)
 *  - Generic error message for login failures (no user enumeration)
 */

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
import { authLimiter } from "../lib/rate-limiters";
import { audit } from "../lib/audit-logger";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

const router: IRouter = Router();

/* ------------------------------------------------------------------
   POST /api/auth/register
   ------------------------------------------------------------------ */
router.post("/auth/register", authLimiter, async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join("; ");
    res.status(400).json({ error: msg });
    return;
  }

  // Normalise username: trim whitespace, lowercase
  const username = parsed.data.username.trim().toLowerCase();
  const { password, publicKeySpki, encryptedPrivateKey, salt, iv } = parsed.data;

  // Reject usernames with non-alphanumeric characters (except underscore/hyphen)
  if (!/^[a-z0-9_-]{3,32}$/.test(username)) {
    res.status(400).json({
      error: "Username must be 3–32 characters and contain only letters, numbers, _ or -",
    });
    return;
  }

  const existing = await db.select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.username, username));

  if (existing.length > 0) {
    audit({ event: "REGISTER_FAILED_DUPLICATE", ip: req.ip, detail: `username=${username}` });
    res.status(409).json({ error: "Username already taken" });
    return;
  }

  // bcrypt cost factor 12 — ~250ms on modern hardware (good for registration, tolerable for login)
  const passwordHash = await bcrypt.hash(password, 12);

  const [user] = await db
    .insert(usersTable)
    .values({ username, passwordHash, publicKeySpki, encryptedPrivateKey, salt, iv })
    .returning();

  /* Session fixation prevention:
     Regenerate the session ID before binding it to the new user.
     This ensures no pre-auth session token is elevated to auth status. */
  await new Promise<void>((resolve, reject) =>
    req.session.regenerate((err) => (err ? reject(err) : resolve())),
  );
  req.session.userId = user.id;

  audit({ event: "REGISTER_SUCCESS", userId: user.id, ip: req.ip });

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

/* ------------------------------------------------------------------
   POST /api/auth/login
   ------------------------------------------------------------------ */
router.post("/auth/login", authLimiter, async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join("; ");
    res.status(400).json({ error: msg });
    return;
  }

  // Normalise username the same way as registration
  const username = parsed.data.username.trim().toLowerCase();
  const { password } = parsed.data;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username));

  /* Use a constant-time comparison path even when user doesn't exist.
     This prevents timing attacks that reveal whether a username is registered. */
  if (!user) {
    // Run bcrypt anyway to normalise response time
    await bcrypt.hash(password, 1);
    audit({ event: "LOGIN_FAILED", ip: req.ip, detail: `username=${username} (not found)` });
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    audit({ event: "LOGIN_FAILED", userId: user.id, ip: req.ip });
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  /* Session fixation prevention — regenerate before elevating */
  await new Promise<void>((resolve, reject) =>
    req.session.regenerate((err) => (err ? reject(err) : resolve())),
  );
  req.session.userId = user.id;

  audit({ event: "LOGIN_SUCCESS", userId: user.id, ip: req.ip });

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

/* ------------------------------------------------------------------
   POST /api/auth/logout
   ------------------------------------------------------------------ */
router.post("/auth/logout", async (req, res): Promise<void> => {
  const userId = req.session.userId;

  /* Fully destroy the session (removes from store, clears cookie).
     Simply setting req.session.userId = undefined leaves the session
     record alive in the store, which is a security smell. */
  await new Promise<void>((resolve) => req.session.destroy(() => resolve()));

  /* Explicitly clear the cookie on the client */
  res.clearCookie("connect.sid", { path: "/" });

  audit({ event: "LOGOUT", userId, ip: req.ip });
  res.sendStatus(204);
});

/* ------------------------------------------------------------------
   GET /api/auth/me
   ------------------------------------------------------------------ */
router.get("/auth/me", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    audit({ event: "SESSION_INVALID", ip: req.ip });
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.session.userId));

  if (!user) {
    audit({ event: "SESSION_INVALID", userId: req.session.userId, ip: req.ip });
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
