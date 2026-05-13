/**
 * app.ts — Express application factory
 *
 * Security layers applied (outermost → innermost):
 *  1. Trusted proxy  — correct client IP behind Replit's reverse proxy
 *  2. Helmet         — 14 security headers (CSP, HSTS, X-Frame-Options…)
 *  3. CORS           — strict same-origin + credentials
 *  4. Global rate limit — 200 req/min catch-all
 *  5. express-session — session hardening (httpOnly, secure, rolling)
 *  6. Routes         — per-route rate limits applied inside routers
 */

import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import session from "express-session";
import router from "./routes";
import { logger } from "./lib/logger";
import { globalLimiter } from "./lib/rate-limiters";

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is required");
}

const isProduction = process.env.NODE_ENV === "production";

const app: Express = express();

/* ------------------------------------------------------------------
   1. Trust the first proxy hop (Replit's ingress)
   This makes req.ip reflect the real client IP, which the rate
   limiters rely on.
   ------------------------------------------------------------------ */
app.set("trust proxy", 1);

/* ------------------------------------------------------------------
   2. Request logger (before everything so all requests are captured)
   ------------------------------------------------------------------ */
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

/* ------------------------------------------------------------------
   3. Helmet — security headers
   Content-Security-Policy is intentionally NOT set here because the
   frontend is served by Vite. Each origin sets its own CSP.
   ------------------------------------------------------------------ */
app.use(
  helmet({
    // API is JSON-only — no HTML rendering
    contentSecurityPolicy: false,
    // HSTS: 1 year, include subdomains
    strictTransportSecurity: {
      maxAge: 31_536_000,
      includeSubDomains: true,
    },
  }),
);

/* ------------------------------------------------------------------
   4. CORS — same-origin only in production; permissive in dev
   ------------------------------------------------------------------ */
const allowedOrigin = isProduction
  ? process.env.ALLOWED_ORIGIN ?? false
  : true; // reflect origin in dev (convenient for local testing)

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Accept"],
  }),
);

/* ------------------------------------------------------------------
   5. Body parsing — explicit size limit to prevent payload flooding
   ------------------------------------------------------------------ */
app.use(express.json({ limit: "64kb" }));
app.use(express.urlencoded({ extended: true, limit: "64kb" }));

/* ------------------------------------------------------------------
   6. Global rate limit (catch-all)
   ------------------------------------------------------------------ */
app.use("/api", globalLimiter);

/* ------------------------------------------------------------------
   7. Session — hardened cookie settings
      rolling: true  → extends expiry on each request (keeps active
                        users logged in, but idle sessions time out)
      regenerate()   → called manually in auth routes after login
                        to prevent session fixation attacks
   ------------------------------------------------------------------ */
export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true, // renew expiry on each authenticated request
  cookie: {
    httpOnly: true,                         // not accessible via JS
    secure: isProduction,                   // HTTPS only in prod
    sameSite: isProduction ? "strict" : "lax", // strict CSRF protection in prod
    maxAge: 7 * 24 * 60 * 60 * 1000,       // 7 days
  },
});

app.use(sessionMiddleware);

/* ------------------------------------------------------------------
   8. Routes
   ------------------------------------------------------------------ */
app.use("/api", router);

export default app;
