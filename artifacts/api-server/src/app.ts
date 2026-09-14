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

import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import helmet from "helmet";
import pinoHttp from "pino-http";
import session from "express-session";
import router from "./routes";
import { logger } from "./lib/logger";
import { globalLimiter } from "./lib/rate-limiters";

const isProduction = process.env.NODE_ENV === "production";
const sessionSecret = process.env.SESSION_SECRET;
const configuredOrigin = process.env.ALLOWED_ORIGIN;

if (!sessionSecret) {
  throw new Error("SESSION_SECRET environment variable is required");
}

if (isProduction && sessionSecret.length < 32) {
  throw new Error("SESSION_SECRET must be at least 32 characters in production");
}

function validateProductionOrigin(value: string | undefined): string {
  if (!value) {
    throw new Error("ALLOWED_ORIGIN environment variable is required in production");
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("ALLOWED_ORIGIN must be a valid absolute URL in production");
  }

  if (!["https:", "http:"].includes(parsed.protocol) || parsed.pathname !== "/" ||
      parsed.search || parsed.hash || parsed.username || parsed.password) {
    throw new Error("ALLOWED_ORIGIN must contain only an origin");
  }

  if (parsed.protocol !== "https:" && process.env.NODE_ENV === "production") {
    throw new Error("ALLOWED_ORIGIN must use HTTPS in production");
  }

  return parsed.origin;
}

export const allowedOrigin = isProduction
  ? validateProductionOrigin(configuredOrigin)
  : true;

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
app.use(express.urlencoded({ extended: false, limit: "64kb", parameterLimit: 50 }));

/* ------------------------------------------------------------------
   6. Global rate limit (catch-all)
   ------------------------------------------------------------------ */
app.use("/api", globalLimiter);

/* ------------------------------------------------------------------
   7. Browser-origin guard for state-changing requests
   SameSite=Strict is the primary CSRF defense in production. This
   secondary check rejects cross-origin browser requests when a browser
   supplies an Origin or Referer header, while still allowing non-browser
   clients that omit both headers.
   ------------------------------------------------------------------ */
function sameOriginStateChange(req: Request, res: Response, next: NextFunction): void {
  if (!isProduction || ["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    next();
    return;
  }

  const origin = req.get("origin");
  const referer = req.get("referer");
  const candidate = origin ?? (referer ? (() => {
    try {
      return new URL(referer).origin;
    } catch {
      return null;
    }
  })() : null);

  if ((origin || referer) && (!candidate || candidate !== allowedOrigin)) {
    res.status(403).json({ error: "Cross-origin request rejected" });
    return;
  }

  next();
}

/* ------------------------------------------------------------------
   8. Session — hardened cookie settings
      rolling: true  → extends expiry on each request (keeps active
                        users logged in, but idle sessions time out)
      regenerate()   → called manually in auth routes after login
                        to prevent session fixation attacks
   ------------------------------------------------------------------ */
export const sessionMiddleware = session({
  name: "cipherchat.sid",
  secret: sessionSecret,
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
   9. Routes
   ------------------------------------------------------------------ */
app.use("/api", sameOriginStateChange);
app.use("/api", router);

/* Keep unknown API paths JSON-only and avoid Express's default HTML response. */
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Not found" });
});

/* Never expose stack traces, SQL, filesystem paths, or parser details to clients. */
app.use((err: unknown, req: Request, res: Response, next: NextFunction): void => {
  if (res.headersSent) {
    next(err);
    return;
  }

  const isMalformedJson =
    typeof err === "object" &&
    err !== null &&
    "type" in err &&
    (err as { type?: unknown }).type === "entity.parse.failed";

  if (isMalformedJson) {
    res.status(400).json({ error: "Invalid JSON payload" });
    return;
  }

  const isPayloadTooLarge =
    typeof err === "object" &&
    err !== null &&
    "type" in err &&
    (err as { type?: unknown }).type === "entity.too.large";

  if (isPayloadTooLarge) {
    res.status(413).json({ error: "Request payload too large" });
    return;
  }

  logger.error(
    { err, method: req.method, path: req.path },
    "Unhandled request error",
  );
  res.status(500).json({ error: "Internal server error" });
});

export default app;
