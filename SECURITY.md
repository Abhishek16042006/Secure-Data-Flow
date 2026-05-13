# Security Policy

## Reporting a Vulnerability

This is a student research project (ISE coursework). It is **not** a production service.

If you find a security issue in the cryptographic implementation or the E2EE architecture, please open a GitHub issue labelled `[security]` or email the project owner directly.

---

## Security Architecture Summary

CipherChat implements end-to-end encryption using exclusively browser-native Web Crypto API.

### Key invariants

1. **The server is zero-knowledge.** It stores only ciphertext, public keys, and encrypted key blobs. It never touches plaintext.
2. **Private keys live in RAM only.** They are never written to `localStorage`, `sessionStorage`, cookies, or the database. They are zeroed on logout and tab close.
3. **Every AES-GCM encryption uses a fresh 12-byte IV.** IV reuse with the same key breaks confidentiality and integrity.
4. **Replay attacks are blocked** by a UUID per message + ±5 minute timestamp window + PostgreSQL unique constraint.
5. **Session fixation is prevented** by `req.session.regenerate()` after every successful login/register.

### Cryptographic algorithms

| Purpose | Algorithm | Notes |
|---------|-----------|-------|
| Key agreement | ECDH P-256 | NIST-approved, browser-native |
| Message encryption | AES-256-GCM | Authenticated encryption (AEAD) |
| Password KDF | PBKDF2 / SHA-256 / 100k iterations | Protects encrypted private key blob |
| Key export | SPKI (public), PKCS8 (private) | Standard Web Crypto formats |
| Identity binding | SHA-256 of SPKI | Displayed as hex fingerprint |
| Session IDs | express-session (HMAC-signed) | httpOnly, secure, sameSite |

### Defence layers

```
Internet
   │
   ▼ HTTPS + HSTS
Reverse Proxy (Replit)
   │
   ▼ Helmet headers (CSP, X-Frame-Options, …)
Express API Server
   │
   ├── Global rate limit: 200 req/min
   ├── Auth rate limit: 5 req/15 min per IP
   ├── Message rate limit: 60 req/min
   │
   ├── Session validation (httpOnly cookie)
   ├── Session regeneration on login (session fixation prevention)
   │
   ├── Zod input validation
   ├── Base64 + IV-length checks
   ├── Payload size limit (64 KB)
   │
   ├── Message-request gate (403 if no accepted request)
   ├── Replay protection (UUID dedup + timestamp window)
   │
   └── PostgreSQL (Drizzle ORM, parameterised queries)
```

---

## Running the Security Tests

```bash
# Crypto unit tests (Node 24 with WebCrypto)
pnpm --filter @workspace/e2ee-app run test

# Type safety check
pnpm run typecheck

# Audit dependencies
pnpm audit
```

---

## Known Limitations

- **No forward secrecy.** If a private key is later compromised, all past messages encrypted to that key can be decrypted. Mitigation: implement X3DH + Double Ratchet (Signal protocol).
- **TOFU on first use.** The fingerprint trust system gives no protection on the very first key exchange. Users should verify fingerprints out-of-band.
- **Browser memory attacks.** JavaScript cannot guarantee memory wiping; `zeroBytes()` minimises but cannot eliminate key material residue in GC-collected memory.
- **Rate limits are per-IP.** In production, add CAPTCHA to auth endpoints and consider per-account limits.

---

## Dependencies

Key security-relevant dependencies:

| Package | Version | Purpose |
|---------|---------|---------|
| `helmet` | ^8 | Security headers |
| `express-rate-limit` | ^7 | Rate limiting |
| `bcryptjs` | ^3 | Password hashing |
| `express-session` | ^1.19 | Session management |
| `socket.io` | ^4 | Real-time (session-authenticated) |
| `drizzle-orm` | ^0.45 | Parameterised DB queries |
| `zod` | ^3.25 | Input validation |

Dependency age policy: pnpm workspace enforces a 1-day minimum release age for all packages to defend against supply-chain attacks.
