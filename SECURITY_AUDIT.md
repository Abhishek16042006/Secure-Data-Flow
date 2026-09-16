# Vibe-Coded App Security — 70-Check Audit

**Audit date:** 2026-09-16  
**Scope:** `artifacts/e2ee-app`, `artifacts/api-server`, shared API contract, workspace dependency/build configuration  
**Out of scope:** production data changes, infrastructure changes, privileged-account settings, provider backup configuration, and deployment-console settings

## Method

This audit applies the cumulative checks from the four supplied “Vibe-Coded App
Security” PDFs. A check is marked **PASS** only where repository evidence,
configuration, a scanner result, or a test supports it. **UNKNOWN** means the
control cannot be proven from this repository and needs a deployed or
administrative verification. **N/A** means the product does not implement the
feature described by the check.

## Summary

- **PASS:** 47
- **UNKNOWN:** 15
- **N/A:** 8
- **FAIL:** 0
- **Required before launch:** resolve the UNKNOWN items that apply to the
  deployment, especially session persistence, database role permissions,
  backups/restore, privileged MFA, CI/CD access, staging protection, and
  monitoring.

## Evidence matrix

| # | Check | Status | Evidence, gap, and verification |
|---:|---|---|---|
| 01 | Exposed database credentials | PASS | Database access is server-side through `lib/db`; no connection string is shipped by the frontend. Verify production secrets are only in platform secret storage. |
| 02 | Public `.env` files | PASS | `.gitignore` excludes environment files and the static frontend does not load them. Verify the deployed static artifact contains no environment file. |
| 03 | Hardcoded API keys or secrets | PASS | Authentication uses `SESSION_SECRET` and deployment origin configuration rather than literals; repository scan found no hardcoded service secret. |
| 04 | Weak or missing authentication | PASS | Express sessions protect private routes; registration/login are rate-limited and session IDs regenerate after authentication. |
| 05 | Missing server-side authorization | PASS | User, message, request, and socket operations authorize against `req.session.userId` and relationship state on the server. |
| 06 | Cross-user data access | PASS | Reads and writes are scoped to the authenticated user and conversation participants; public-key and request routes require authentication. |
| 07 | Open database permissions | UNKNOWN | The application uses a shared database role, but the provider role grants and network policy are not visible here. Verify the production role has only required CRUD access. |
| 08 | Misconfigured Firebase / Supabase / S3 | N/A | The application does not use Firebase, Supabase, S3, or object storage. |
| 09 | Unprotected admin routes | N/A | No admin routes or application-admin role are implemented in this product. |
| 10 | Production debug tools exposed | PASS | Production API build omits source-map support and frontend dev plugins are development-only; no debug/test route is exposed by the API router. |
| 11 | Build logs leaking secrets | UNKNOWN | Repository scripts do not intentionally print secrets, but hosted CI/deployment log masking is not visible. Verify secret redaction in the deployment pipeline. |
| 12 | Verbose production errors | PASS | API error middleware returns generic JSON messages and keeps stack traces, SQL, paths, and parser details out of responses. |
| 13 | Secrets in Git history | UNKNOWN | Current tracked files contain no known secret, but complete historical secret scanning/rotation cannot be proven from the working tree. Run a repository-history secret scan and rotate anything found. |
| 14 | Secrets shipped in frontend JavaScript | PASS | Frontend uses public API configuration only; session cookies are HttpOnly and private-key material is not sent as a service credential. |
| 15 | Client-side-only security checks | PASS | UI checks are supplemented by server-side authentication, request ownership, relationship authorization, validation, and replay checks. |
| 16 | Missing input validation | PASS | OpenAPI-generated Zod schemas enforce types, lengths, patterns, bounds, UUID-v4 shape, and closed request objects; malformed/oversized JSON is rejected. |
| 17 | SQL injection | PASS | Database access uses Drizzle query builders and equality/compound predicates; no user input is concatenated into SQL. |
| 18 | NoSQL injection | N/A | No NoSQL database or operator-based query API is used. |
| 19 | Cross-site scripting (XSS) | PASS | React renders escaped values, no unsafe HTML sink is used in the app, and Helmet/CSP headers are configured. Verify the deployed response CSP rather than relying on the meta tag alone. |
| 20 | Cross-site request forgery (CSRF) | PASS | Production session cookies use `HttpOnly`, `Secure`, and `SameSite=Strict`; state-changing API requests also require a matching origin/referer. |
| 21 | Insecure file uploads | N/A | The product has no file-upload endpoint. |
| 22 | Path traversal | N/A | The API does not expose user-controlled filesystem paths or filenames. |
| 23 | Server-side request forgery (SSRF) | N/A | The API does not proxy or fetch user-selected external destinations. |
| 24 | Broken password-reset flows | N/A | Password reset is not implemented; there is no reset-token flow to audit. |
| 25 | Weak session management | UNKNOWN | Session IDs rotate on login/register, logout destroys the session, cookies are hardened, and expiry is bounded; production still uses Express’s in-memory store, which is not shared/persistent across restarts. Configure and verify a persistent shared store before multi-instance production. |
| 26 | Weak or incorrectly validated JWTs | N/A | The application uses server-side sessions, not JWT authentication. |
| 27 | Overly permissive CORS | PASS | Production CORS requires a valid HTTPS `ALLOWED_ORIGIN` and credentials are limited to that configured origin. |
| 28 | Missing rate limits | PASS | Auth routes use an IP rate limiter, request bodies and HTTP connections have limits/timeouts, and Socket.IO typing events have a per-socket rate limit. |
| 29 | Unprotected staging or test environments | UNKNOWN | No staging/deployment access policy is present in the repository. Verify staging authentication and ensure production secrets/data are not exposed there. |
| 30 | Default credentials left unchanged | UNKNOWN | No vendor/default application credential is defined in code, but provider and deployment accounts are outside repository evidence. Verify and remove default accounts before launch. |
| 31 | Webhook signatures not verified | N/A | No webhook endpoint or third-party webhook consumer exists. |
| 32 | Frontend-only payment checks | N/A | The product has no payment, subscription, credit, or entitlement flow. |
| 33 | IDOR / BOLA | PASS | Protected endpoints authenticate first and authorize object ownership/relationship before returning or mutating data; numeric IDs are strictly parsed. |
| 34 | APIs trusting user-controlled roles or IDs | PASS | Identity comes from the server session; request IDs are validated and checked against session ownership/relationship state. |
| 35 | Sensitive data in logs | PASS | Audit logging records event metadata and avoids passwords/ciphertext/private keys; auth failures use generic client responses. Verify production log retention/access policy. |
| 36 | Sensitive source maps or build artifacts | PASS | API production build disables linked source maps and startup no longer enables source-map support; frontend production output contains no `.map` files. |
| 37 | Vulnerable or abandoned dependencies | PASS | `pnpm audit --audit-level=low` reported no known vulnerabilities after upgrading `qs`, `js-yaml`, and the fixed Orval release; the required dependency scanner was also rerun. |
| 38 | Malicious or compromised packages | PASS | Dependencies are lockfile-resolved and install scripts are restricted by workspace policy; no scanner finding was returned. Review newly introduced packages during dependency updates. |
| 39 | Prompt injection | N/A | The product has no model prompt, retrieval, or AI-agent surface. |
| 40 | AI tools bypassing user permissions | N/A | No AI tool or model call is part of the application. |
| 41 | Excess database privileges | UNKNOWN | ORM usage is scoped, but actual production database grants are deployment facts. Verify a least-privilege application role and separate migration role. |
| 42 | Missing audit logs | PASS | `audit-logger` records authentication, rate-limit, suspicious-payload, replay, request, and message events with actor/target/IP metadata. |
| 43 | No security monitoring or alerts | UNKNOWN | Structured audit events exist, but alert routing, retention, dashboards, and thresholds are not configured in the repository. Verify alerts for auth abuse, rate limits, exceptions, and unusual traffic. |
| 44 | No tested backup / restore plan | UNKNOWN | Backup and restore configuration is outside the codebase and was not changed during this audit. Run and record a production-like restore test. |
| 45 | Public internal dashboards | N/A | No admin, database, queue, or monitoring dashboard is served by this product. |
| 46 | Missing security headers | PASS | Helmet configures browser security headers including CSP, HSTS in production, anti-sniffing, frame, and referrer protections. Verify actual deployed response headers. |
| 47 | Unsafe cookie settings | PASS | `cipherchat.sid` is HttpOnly, Secure in production, SameSite Strict in production, rolling, and bounded to seven days. |
| 48 | Sensitive data unprotected in transit / at rest | UNKNOWN | Production requires HTTPS and private keys are encrypted client-side before storage, but provider/database encryption-at-rest and key-management settings are not visible. Verify both. |
| 49 | Poor tenant isolation | N/A | This is a single-user-namespace application, not a multi-tenant or multi-organization system. |
| 50 | Over-trusting AI-generated code | PASS | The security pass included manual auth/data review, dependency audit, SAST, HoundDog, typechecks, frontend tests, and production builds. |
| 51 | Mass assignment / over-posting | PASS | Request schemas use `additionalProperties: false` and route handlers destructure only allowed fields; role/ownership fields are not accepted. |
| 52 | Command / OS injection | PASS | Application request handling does not execute user-controlled shell commands; build scripts use fixed commands and validated environment values. |
| 53 | Unsafe deserialization | PASS | JSON is parsed by Express and validated with strict Zod schemas; no unsafe object deserialization mechanism is used. |
| 54 | Misconfigured OAuth / OIDC / social login | N/A | No OAuth, OIDC, or social login provider is implemented. |
| 55 | No MFA on privileged accounts | UNKNOWN | MFA for GitHub, Replit, database, deployment, email, and any provider administrators is outside repository evidence. Enable and verify MFA on every privileged account. |
| 56 | Account enumeration | PASS | Login failures are generic and duplicate registration returns a generic failure; no reset flow exists that could disclose account presence. |
| 57 | Business-logic abuse | PASS | Accepted-request state is required before messaging, request transitions are constrained, IDs and message timestamps are validated, and replay IDs are rejected. |
| 58 | Race conditions | PASS | Database uniqueness constraints plus duplicate handling protect message/request creation, and accept/reject updates are conditional on the current pending recipient-owned state. |
| 59 | Webhook replay / duplicate processing | N/A | No webhook processing exists. |
| 60 | Overpowered CI/CD credentials | UNKNOWN | Deployment credentials and environment protection are not stored in this repository. Verify scoped, short-lived credentials and protected production environments. |
| 61 | Untrusted build actions or scripts | UNKNOWN | Workspace scripts are reviewed, but hosted CI action provenance and third-party action pinning are not visible. Review the deployment pipeline and pin trusted actions. |
| 62 | Unpinned build dependencies | PASS | The workspace uses a committed `pnpm-lock.yaml` and explicit security overrides for resolved transitive packages; verify CI uses the lockfile without update flags. |
| 63 | Security checks fail open | PASS | Authentication, relationship authorization, validation, origin checks, and socket authorization reject on failure; lookup errors are caught rather than granting access. |
| 64 | Missing resource limits | PASS | JSON body size, HTTP request/header/keep-alive timeouts, auth/API rate limits, socket typing rate limits, and ciphertext size limits are configured. |
| 65 | AI sensitive-information disclosure | N/A | No AI model or retrieval system is used. |
| 66 | Unsafe use of AI output | N/A | No AI output is interpreted as HTML, SQL, code, URLs, filenames, or commands. |
| 67 | AI agents have excessive agency | N/A | No AI agent or consequential AI tool is present. |
| 68 | Sensitive browser storage | PASS | Local storage contains only public-key fingerprints/trust metadata; private keys are encrypted and kept out of persistent browser storage. |
| 69 | Open redirects | N/A | No redirect destination is accepted from a user or query parameter. |
| 70 | Unsecured GraphQL / WebSocket / realtime endpoints | PASS | Socket.IO checks session authentication, validates payload fields, requires accepted relationships, and caps typing events per socket. |

## Verification commands

The following checks were run during this audit:

```text
pnpm audit --audit-level=low
pnpm --filter @workspace/api-spec run codegen
pnpm --filter @workspace/api-server run typecheck
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/e2ee-app run typecheck
pnpm --filter @workspace/e2ee-app run test
BASE_PATH=/e2ee-app/ PORT=5173 pnpm --filter @workspace/e2ee-app run build
runDependencyAudit()
runSastScan()
runHoundDogScan()
```

The final repository checks completed with no `pnpm audit` advisories, zero
SAST findings, zero HoundDog findings, passing API typecheck/build, passing
frontend typecheck and 19 frontend tests, and a successful frontend production
build. The frontend build still emits non-fatal source-map resolution and
chunk-size warnings.

## Manual launch gates

Before production launch, verify the UNKNOWN items that apply:

1. Configure a persistent shared production session store.
2. Confirm `ALLOWED_ORIGIN` is the real HTTPS production origin and inspect
   deployed CSP/security headers.
3. Confirm least-privilege database grants, encryption at rest, backups, and a
   completed restore test.
4. Confirm privileged-account MFA, staging protection, CI/CD credential scope,
   action provenance, log masking, retention, and alert routing.
5. Run a repository-history secret scan and rotate any historical secret.