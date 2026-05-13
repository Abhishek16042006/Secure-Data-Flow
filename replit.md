# CipherChat — E2EE Secure Messenger

A fully working end-to-end encrypted (E2EE) web messaging application with comprehensive security hardening. Every message is encrypted in the browser before it reaches the server. The server never sees plaintext messages or private keys.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/e2ee-app run dev` — run the React frontend (port 18364)
- `pnpm --filter @workspace/e2ee-app run test` — run 19 crypto unit tests (vitest)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL`, `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, TanStack Query, Wouter, Web Crypto API, Socket.IO client, Vitest
- Backend: Express 5 + express-session + bcryptjs + Helmet + express-rate-limit + Socket.IO
- DB: PostgreSQL + Drizzle ORM
- Crypto: Web Crypto API (ECDH P-256, AES-256-GCM, PBKDF2)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/users.ts` — users table (with key storage)
- `lib/db/src/schema/messages.ts` — messages table (ciphertext + replay-protection fields)
- `lib/db/src/schema/message-requests.ts` — message request table (with indexes)
- `artifacts/e2ee-app/src/lib/crypto.ts` — all Web Crypto API functions + fingerprint + memory safety
- `artifacts/e2ee-app/src/lib/session.tsx` — auth context (private key zeroed on logout/tab close)
- `artifacts/e2ee-app/src/lib/fingerprint.ts` — SHA-256 public key fingerprinting
- `artifacts/e2ee-app/src/lib/trust-store.ts` — TOFU localStorage trust records
- `artifacts/e2ee-app/src/lib/socket.ts` — Socket.IO client singleton
- `artifacts/e2ee-app/src/lib/__tests__/crypto.test.ts` — 19 crypto unit tests
- `artifacts/e2ee-app/src/pages/Landing.tsx` — login/register page
- `artifacts/e2ee-app/src/pages/Dashboard.tsx` — real-time E2EE chat with fingerprints, session-locked banner
- `artifacts/e2ee-app/src/pages/Learn.tsx` — architecture guide + code examples
- `artifacts/e2ee-app/src/components/FingerprintModal.tsx` — identity verification modal (TOFU)
- `artifacts/api-server/src/app.ts` — Express app with Helmet, CORS, rate limits, session hardening
- `artifacts/api-server/src/index.ts` — HTTP server + Socket.IO bootstrap
- `artifacts/api-server/src/lib/rate-limiters.ts` — per-route rate limit configs
- `artifacts/api-server/src/lib/audit-logger.ts` — structured security event logging
- `artifacts/api-server/src/sockets/index.ts` — Socket.IO server with session auth
- `artifacts/api-server/src/routes/auth.ts` — register, login, logout, /me (with session regeneration)
- `artifacts/api-server/src/routes/users.ts` — user directory + public key endpoint
- `artifacts/api-server/src/routes/messages.ts` — send (with replay protection), fetch, conversations, stats
- `artifacts/api-server/src/routes/message-requests.ts` — send, incoming, outgoing, accept/reject
- `THREAT_MODEL.md` — full STRIDE threat model
- `SECURITY.md` — security policy + architecture summary

## Architecture decisions

- **ECDH P-256 for key agreement**: Both parties independently derive the same shared secret. No symmetric key is ever transmitted over the network.
- **AES-256-GCM for message encryption**: Provides both confidentiality and integrity. A fresh random IV is generated per message.
- **PBKDF2 (100,000 iterations) to derive key from password**: The private key is stored server-side as an AES-GCM encrypted blob. Without the password, it cannot be decrypted.
- **Private key in memory only**: After login/register, the decrypted private key bytes live only in React state (a `Uint8Array<ArrayBuffer>`). They are never written to localStorage, sessionStorage, or cookies. They are zeroed on logout/tab close.
- **Dual ciphertext storage**: Each message stores two ciphertexts — one for the recipient (encrypted with ECDH shared key) and one for the sender (encrypted with a self-derived key) so both parties can read their own messages.
- **Server is zero-knowledge**: The server stores only: bcrypt hashes (for auth), public keys (public by nature), encrypted private key blobs (encrypted, useless without password), and message ciphertext (opaque without private keys).
- **Replay attack protection**: Each message carries a crypto-random UUID v4 (`messageId`) and a `clientSentAt` ISO timestamp. The server rejects duplicates (PostgreSQL unique constraint) and messages outside a ±5 minute window.
- **Session fixation prevention**: `req.session.regenerate()` is called after every successful login/register. `req.session.destroy()` + `clearCookie()` on logout.
- **Public key fingerprints (TOFU)**: SHA-256 of SPKI bytes, displayed as colon-separated hex. Stored in localStorage. Alerts user on key change (possible MitM).
- **Socket.IO real-time delivery**: Authenticated via express-session middleware (no separate credentials). Custom path `/api/socket.io` routes through the reverse proxy. Never relays plaintext.
- **Rate limiting**: 5 auth / 15 min, 60 messages / min, 10 requests / 15 min, 200 global / min.
- **Security headers**: Helmet (CSP off for API, HSTS 1 year + subdomains, X-Frame-Options, etc.)

## Product

- **Landing page** (`/`): Login/register with animated E2EE flow diagram
- **Dashboard** (`/dashboard`): Real-time E2EE messenger with conversation sidebar, stats, raw ciphertext viewer, fingerprint verification modal, session-locked banner, typing indicators, message read receipts
- **Learn page** (`/learn`): Full architecture guide, step-by-step workflow, code examples for all 7 crypto functions, security checklist, and adaptation ideas

## Gotchas

- Re-run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec change
- The private key is lost on page refresh (by design) — users must re-login; a yellow "Session locked" banner is shown
- ECDH `deriveSharedKey(myPrivateKey, theirPublicKey)` and `deriveSharedKey(theirPrivateKey, myPublicKey)` produce the same AES key — that's how ECDH works
- Sender reads their own sent messages using `ciphertextForSender` (encrypted with `deriveSharedKey(myPrivateKey, myPublicKey)`)
- Socket.IO uses path `/api/socket.io` — this routes through the reverse proxy to the API server at port 8080
- The `Uint8Array<ArrayBuffer>` (not `ArrayBufferLike`) type is required throughout crypto paths — TypeScript 5.9 strictness
