# CipherChat — E2EE Secure Messenger

A fully working end-to-end encrypted (E2EE) web messaging application. Every message is encrypted in the browser before it reaches the server. The server never sees plaintext messages or private keys.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/e2ee-app run dev` — run the React frontend (port 18364)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL`, `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, TanStack Query, Wouter, Web Crypto API
- Backend: Express 5 + express-session + bcryptjs
- DB: PostgreSQL + Drizzle ORM
- Crypto: Web Crypto API (ECDH P-256, AES-256-GCM, PBKDF2)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/users.ts` — users table (with key storage)
- `lib/db/src/schema/messages.ts` — messages table (ciphertext only)
- `artifacts/e2ee-app/src/lib/crypto.ts` — all Web Crypto API functions
- `artifacts/e2ee-app/src/lib/session.tsx` — auth context (private key stored in memory)
- `artifacts/e2ee-app/src/pages/Landing.tsx` — login/register page
- `artifacts/e2ee-app/src/pages/Dashboard.tsx` — main messenger with E2EE chat
- `artifacts/e2ee-app/src/pages/Learn.tsx` — architecture guide + code examples
- `artifacts/api-server/src/routes/auth.ts` — register, login, logout, /me
- `artifacts/api-server/src/routes/users.ts` — user directory + public key endpoint
- `artifacts/api-server/src/routes/messages.ts` — send, fetch, conversations, stats

## Architecture decisions

- **ECDH P-256 for key agreement**: Both parties independently derive the same shared secret. No symmetric key is ever transmitted over the network.
- **AES-256-GCM for message encryption**: Provides both confidentiality and integrity. A fresh random IV is generated per message.
- **PBKDF2 (100,000 iterations) to derive key from password**: The private key is stored server-side as an AES-GCM encrypted blob. Without the password, it cannot be decrypted.
- **Private key in memory only**: After login/register, the decrypted private key bytes live only in React state (a `Uint8Array`). They are never written to localStorage, sessionStorage, or cookies.
- **Dual ciphertext storage**: Each message stores two ciphertexts — one for the recipient (encrypted with ECDH shared key) and one for the sender (encrypted with a self-derived key) so both parties can read their own messages.
- **Server is zero-knowledge**: The server stores only: bcrypt hashes (for auth), public keys (public by nature), encrypted private key blobs (encrypted, useless without password), and message ciphertext (opaque without private keys).

## Product

- **Landing page** (`/`): Login/register with animated E2EE flow diagram
- **Dashboard** (`/dashboard`): Real-time E2EE messenger with conversation sidebar, stats, raw ciphertext viewer, and composing/sending encrypted messages
- **Learn page** (`/learn`): Full architecture guide, step-by-step workflow, code examples for all 7 crypto functions, security checklist, and adaptation ideas

## Gotchas

- Re-run `pnpm --filter @workspace/api-spec run codegen` after any OpenAPI spec change
- The private key is lost on page refresh (by design) — users must re-login
- ECDH `deriveSharedKey(myPrivateKey, theirPublicKey)` and `deriveSharedKey(theirPrivateKey, myPublicKey)` produce the same AES key — that's how ECDH works
- Sender reads their own sent messages using `ciphertextForSender` (encrypted with `deriveSharedKey(myPrivateKey, myPublicKey)`)
