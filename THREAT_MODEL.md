# CipherChat — Threat Model

> **Classification:** Public documentation  
> **Last updated:** 2026-05-13  
> **Methodology:** STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege)

---

## System Overview

CipherChat is an E2EE web messenger. Messages are encrypted client-side using the Web Crypto API before being transmitted to the server. The server stores and relays ciphertext only.

```
┌─────────────────┐          HTTPS          ┌──────────────────┐
│  Browser (Alice) │  ──── ciphertext ────►  │  API Server      │
│  - ECDH P-256   │                          │  (zero-knowledge)│
│  - AES-256-GCM  │  ◄─── ciphertext ────   │  - Express 5     │
│  - Private key  │                          │  - PostgreSQL    │
│    in RAM only  │                          │  - Socket.IO     │
└─────────────────┘                          └──────────────────┘
```

**Zero-knowledge guarantee:** The server stores only:
- bcrypt hashes (for auth)
- SPKI public keys (public by nature)
- AES-GCM encrypted private key blobs (useless without password)
- Message ciphertext (opaque without private keys)

---

## Assets Under Protection

| Asset | Sensitivity | Where stored |
|-------|------------|--------------|
| Plaintext messages | Critical | Browser RAM only (never persisted) |
| Private key (PKCS8) | Critical | Browser RAM only (zeroed on logout) |
| Password | Critical | Never stored anywhere (hashed w/ bcrypt) |
| Encrypted private key blob | High | PostgreSQL (AES-GCM encrypted) |
| Session token | High | HTTP-only cookie |
| Public keys | Public | PostgreSQL (readable by all users) |
| Message ciphertext | Medium | PostgreSQL (useless without private key) |

---

## Threat Actors

| Actor | Capability | Goal |
|-------|-----------|------|
| **Passive network eavesdropper** | Read network traffic | Intercept messages |
| **Compromised API server** | Full server access | Read stored messages |
| **Malicious other user** | Valid authenticated session | Read others' messages |
| **Brute-force attacker** | Automated HTTP requests | Enumerate users/passwords |
| **Replay attacker** | Capture + re-send messages | Duplicate or forge messages |
| **MitM / Key substitution** | Intercept key exchange | Substitute their key for recipient's |
| **Insider threat** | DB access | Read message content |
| **XSS attacker** | JS execution in browser | Steal session or key material |

---

## STRIDE Analysis

### S — Spoofing

| Threat | Mitigation | Status |
|--------|-----------|--------|
| Session fixation (attacker uses pre-auth session ID) | `req.session.regenerate()` after login/register | ✅ Implemented |
| Session cookie theft | `httpOnly: true`, `secure: true` (prod), `sameSite: strict` | ✅ Implemented |
| Password brute-force | bcrypt cost 12, rate limit 5 req/15 min per IP | ✅ Implemented |
| Username enumeration via timing | Constant-time path: bcrypt run even when user not found | ✅ Implemented |
| Token forgery | express-session with `SESSION_SECRET`, rolling cookies | ✅ Implemented |

### T — Tampering

| Threat | Mitigation | Status |
|--------|-----------|--------|
| Ciphertext modification | AES-GCM provides authentication — tampered bytes cause decryption failure | ✅ By design |
| Replay attack (resend captured request) | `messageId` UUID deduplication + timestamp window (±5 min) | ✅ Implemented |
| Malformed base64 / IV injection | Server validates: base64 regex, IV = exactly 12 bytes | ✅ Implemented |
| Payload flooding | 64 KB body limit, per-route rate limiting | ✅ Implemented |
| SQL injection | Drizzle ORM parameterised queries throughout | ✅ By design |

### R — Repudiation

| Threat | Mitigation | Status |
|--------|-----------|--------|
| "I didn't send that" | `messageId` UUID stored with message; `clientSentAt` timestamp | ✅ Implemented |
| Auth events untracked | Structured audit log: LOGIN_SUCCESS/FAILED, REGISTER, LOGOUT | ✅ Implemented |
| Rate-limit hits untracked | RATE_LIMIT_HIT audit events | ✅ Implemented |

### I — Information Disclosure

| Threat | Mitigation | Status |
|--------|-----------|--------|
| Server reads plaintext | Server only stores ciphertext; never handles decryption | ✅ By design |
| Private key exposure | Key lives only in RAM; zeroed on logout/tab close | ✅ Implemented |
| Private key in localStorage/cookie | Explicit policy: never written to persistent storage | ✅ By design |
| DB breach reveals messages | All messages are ciphertext; useless without private keys | ✅ By design |
| DB breach reveals passwords | bcrypt hashed with cost 12 | ✅ Implemented |
| Key material in server logs | Audit logger explicitly excludes all key/plaintext material | ✅ Implemented |
| Missing security headers | helmet() — CSP, HSTS, X-Frame-Options, etc. | ✅ Implemented |

### D — Denial of Service

| Threat | Mitigation | Status |
|--------|-----------|--------|
| Login endpoint flooding | 5 req / 15 min per IP | ✅ Implemented |
| Message endpoint flooding | 60 req / min per IP | ✅ Implemented |
| Request endpoint spam | 10 req / 15 min per IP | ✅ Implemented |
| Global API flooding | 200 req / min catch-all | ✅ Implemented |
| Payload size DoS | 64 KB body limit; 88 KB base64 ciphertext limit | ✅ Implemented |
| Large DB table scans | Indexes: (sender_id, created_at), (recipient_id, created_at), (recipient_id, status) | ✅ Implemented |

### E — Elevation of Privilege

| Threat | Mitigation | Status |
|--------|-----------|--------|
| Read other user's messages | Per-message auth check: only sender/recipient can fetch | ✅ Implemented |
| Send messages without accepted request | Message-request gate: 403 if no accepted request exists | ✅ Implemented |
| Accept requests sent to another user | `recipientId === userId` check on PATCH /message-requests/:id | ✅ Implemented |
| Unauthenticated Socket.IO access | Session middleware applied to socket handshake; no session → rejected | ✅ Implemented |

---

## Key Substitution / MitM Attack

This is the most sophisticated realistic threat against E2EE systems.

**Scenario:** A compromised server substitutes Eve's public key for Bob's. Alice encrypts to Eve instead of Bob.

**Mitigation: Trust-On-First-Use (TOFU) fingerprinting**
1. When Alice opens a conversation with Bob, the app computes SHA-256 of Bob's SPKI public key.
2. The fingerprint is stored in Alice's `localStorage` under `cipherchat:tofu`.
3. On subsequent sessions, the live fingerprint is compared to the stored one.
4. **If it changed:** A red WARNING banner is displayed with the text "Key mismatch detected — possible impersonation."
5. Alice can verify Bob's fingerprint out-of-band (phone call, in person).

**Residual risk:** TOFU provides no protection on first use. Users must verify fingerprints out-of-band for high-security use cases.

---

## Residual Risks (Known Limitations)

| Risk | Severity | Notes |
|------|---------|-------|
| XSS can steal private key from RAM | Critical | Mitigated by CSP + Helmet; but no key escrow |
| No forward secrecy (static ECDH keys) | High | Future: X3DH + double ratchet (Signal protocol) |
| TOFU provides no first-use guarantee | Medium | Requires out-of-band verification |
| localStorage TOFU data is XSS-readable | Low | Only fingerprints stored, not keys |
| Browser memory is GC-delayed | Low | `zeroBytes()` minimises window but GC timing is non-deterministic |
| Session cookie theft via physical access | Low | httpOnly prevents JS access; mitigated by session expiry |
| Rate limits bypass via IP rotation | Low | Production deployment should add CAPTCHA for auth endpoints |

---

## Security Controls Summary

| Layer | Control |
|-------|---------|
| Transport | HTTPS (TLS 1.2+), HSTS header |
| Application | Helmet (14 headers), CORS strict |
| Session | httpOnly+secure cookie, session regeneration, rolling |
| Authentication | bcrypt-12, rate limit 5/15min, no user enumeration |
| Authorisation | Per-route session checks, message-request gate |
| Replay protection | UUID dedup + ±5 min timestamp window |
| Rate limiting | Per-route + global limits |
| Input validation | Zod schemas, base64 regex, IV length, payload size |
| Cryptography | ECDH P-256, AES-256-GCM, PBKDF2-100k |
| Memory safety | Key zeroed on logout/tab close |
| Audit logging | Structured security events (pino) |
| Real-time | Socket.IO with session auth, no plaintext relayed |
| Identity | SHA-256 fingerprints, TOFU with change detection |
| Database | Parameterised queries, soft deletes, replay indexes |
