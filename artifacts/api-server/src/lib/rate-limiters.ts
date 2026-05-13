/**
 * rate-limiters.ts
 *
 * Centralised express-rate-limit configurations.
 * Each limiter is scoped to a specific attack surface:
 *
 *  authLimiter      – brute-force login / register (5 req / 15 min)
 *  messageLimiter   – message flooding (60 req / min)
 *  requestLimiter   – message-request spam (10 req / 15 min)
 *  globalLimiter    – catch-all for all API routes (200 req / min)
 */

import rateLimit from "express-rate-limit";

const json429 = (_req: any, res: any) =>
  res.status(429).json({ error: "Too many requests — please slow down." });

/** Brute-force protection on login and register */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: json429,
  // Count every attempt regardless of outcome (prevents timing oracle)
  skipSuccessfulRequests: false,
});

/** Prevent message flooding */
export const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: json429,
});

/** Prevent message-request spam */
export const requestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: json429,
});

/** Catch-all for all /api routes */
export const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  limit: 200,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: json429,
});
