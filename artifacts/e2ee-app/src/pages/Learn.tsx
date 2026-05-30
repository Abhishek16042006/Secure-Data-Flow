import React, { useState } from "react";
import { Link } from "wouter";
import { Lock, ArrowLeft, ChevronDown, ChevronUp, ShieldCheck, AlertTriangle, Key, Database, Globe, Cpu } from "lucide-react";

function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="bg-card border border-card-border rounded overflow-hidden">
      {label && (
        <div className="px-4 py-1.5 border-b border-card-border bg-background text-xs text-primary font-mono">
          {label}
        </div>
      )}
      <pre className="p-4 text-xs text-green-300 font-mono overflow-x-auto leading-relaxed whitespace-pre">
        {code.trim()}
      </pre>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3 border-b border-border pb-3">
        <Icon className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function Learn() {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([0, 1]));

  const toggleStep = (i: number) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const workflowSteps = [
    {
      title: "Step 1 — User Signup: Key Generation",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            When a user registers, the browser generates an ECDH P-256 key pair entirely client-side.
            The private key is then encrypted with a password-derived key (PBKDF2 → AES-GCM) before
            leaving the browser. The server only ever stores the encrypted blob — it cannot decrypt it
            without the user's password, which is never sent in usable form after hashing.
          </p>
          <CodeBlock label="browser — src/lib/crypto.ts" code={`
// 1. Generate ECDH P-256 key pair
const keyPair = await crypto.subtle.generateKey(
  { name: "ECDH", namedCurve: "P-256" },
  true,            // extractable = true so we can export
  ["deriveKey"]    // usage
);

// 2. Export keys to transferable formats
const publicKeySpki  = btoa(...await crypto.subtle.exportKey("spki",  keyPair.publicKey));
const privateKeyPkcs8 = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

// 3. Derive an AES-GCM key from the user's password using PBKDF2
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv   = crypto.getRandomValues(new Uint8Array(12));
const passwordKeyMaterial = await crypto.subtle.importKey(
  "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]
);
const wrappingKey = await crypto.subtle.deriveKey(
  { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
  passwordKeyMaterial,
  { name: "AES-GCM", length: 256 },
  false, ["encrypt", "decrypt"]
);

// 4. Encrypt the private key with the password-derived key
const encryptedPrivateKey = await crypto.subtle.encrypt(
  { name: "AES-GCM", iv },
  wrappingKey,
  privateKeyPkcs8
);

// 5. Send to server — server stores ciphertext, salt, iv, and public key
POST /api/auth/register {
  username, password,        // password for account auth (bcrypt hashed server-side)
  publicKeySpki,             // public key — fine to store, it's public
  encryptedPrivateKey,       // encrypted blob — server cannot decrypt this
  salt, iv                   // needed to re-derive the wrapping key on login
}
`} />
        </div>
      ),
    },
    {
      title: "Step 2 — Login: Decrypting the Private Key",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            On login, the server returns the encrypted private key blob (stored in the database).
            The browser re-derives the wrapping key from the user's password and decrypts the private
            key in memory. The decrypted private key bytes are stored <strong className="text-foreground">only in JavaScript memory</strong> —
            never in localStorage, sessionStorage, or cookies.
          </p>
          <CodeBlock label="browser — on login response" code={`
// Server returns: { encryptedPrivateKey, salt, iv, publicKeySpki, ... }

// Re-derive the same wrapping key from password + stored salt
const salt = Uint8Array.from(atob(response.salt), c => c.charCodeAt(0));
const iv   = Uint8Array.from(atob(response.iv),   c => c.charCodeAt(0));
const encryptedBytes = Uint8Array.from(atob(response.encryptedPrivateKey), c => c.charCodeAt(0));

const passwordKey = await crypto.subtle.importKey(
  "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]
);
const wrappingKey = await crypto.subtle.deriveKey(
  { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
  passwordKey,
  { name: "AES-GCM", length: 256 },
  false, ["encrypt", "decrypt"]
);

// Decrypt the private key back to raw bytes
const privateKeyBytes = await crypto.subtle.decrypt(
  { name: "AES-GCM", iv },
  wrappingKey,
  encryptedBytes
);
// privateKeyBytes is a Uint8Array — store ONLY in React state (memory)
// If the user refreshes, they must re-enter their password
`} />
        </div>
      ),
    },
    {
      title: "Step 3 — Sending an Encrypted Message",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            To send a message, the sender fetches the recipient's public key (already on the server
            since it's public). Both sides independently derive the <strong className="text-foreground">same shared ECDH secret</strong> —
            this is the magic of ECDH: deriving with your private key + their public key gives the
            same result as their private key + your public key. The plaintext is encrypted with
            AES-256-GCM using this shared secret. A second ciphertext is stored for the sender
            (encrypted with their own self-derived key) so they can read their sent messages.
          </p>
          <CodeBlock label="browser — sending a message" code={`
// 1. Import their public key
const theirPublicKeyBytes = Uint8Array.from(atob(recipientPublicKeySpki), c => c.charCodeAt(0));
const theirPublicKey = await crypto.subtle.importKey(
  "spki", theirPublicKeyBytes,
  { name: "ECDH", namedCurve: "P-256" }, false, []
);

// 2. Import my private key from in-memory bytes
const myPrivateKey = await crypto.subtle.importKey(
  "pkcs8", privateKeyBytes,
  { name: "ECDH", namedCurve: "P-256" }, false, ["deriveKey"]
);

// 3. Derive shared AES-GCM key (ECDH key agreement)
const sharedKey = await crypto.subtle.deriveKey(
  { name: "ECDH", public: theirPublicKey },
  myPrivateKey,
  { name: "AES-GCM", length: 256 },
  false, ["encrypt", "decrypt"]
);

// 4. Encrypt the plaintext message
const iv = crypto.getRandomValues(new Uint8Array(12));
const ciphertext = await crypto.subtle.encrypt(
  { name: "AES-GCM", iv },
  sharedKey,
  new TextEncoder().encode(plaintext)
);

// 5. POST only ciphertext to server — never plaintext
POST /api/messages {
  recipientId,
  ciphertextForRecipient: btoa(...ciphertext),  // encrypted with shared ECDH key
  ciphertextForSender:    btoa(...selfCiphertext), // encrypted with self-key for inbox
  ivForRecipient: btoa(...iv),
  ivForSender:    btoa(...selfIv)
}
`} />
        </div>
      ),
    },
    {
      title: "Step 4 — Receiving and Decrypting a Message",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            The recipient fetches the encrypted message from the server. They derive the same shared
            secret (their private key + sender's public key) and decrypt the ciphertext locally.
            The server only provides the opaque encrypted blob — it cannot read the content.
          </p>
          <CodeBlock label="browser — decrypting a received message" code={`
// 1. Fetch encrypted messages from server
// GET /api/messages/conversation/:partnerId
// Returns: [{ senderId, ciphertextForRecipient, ivForRecipient, ... }]

// 2. For each message, derive the same shared key (ECDH is symmetric)
//    sender's public key + MY private key = same shared secret as:
//    MY public key + sender's private key  (that's what they used to encrypt)
const sharedKey = await crypto.subtle.deriveKey(
  { name: "ECDH", public: senderPublicKey },   // sender's public key (from /api/users/:id/public-key)
  myPrivateKey,                                 // my private key (in memory)
  { name: "AES-GCM", length: 256 },
  false, ["encrypt", "decrypt"]
);

// 3. Decrypt
const iv = Uint8Array.from(atob(message.ivForRecipient), c => c.charCodeAt(0));
const ciphertext = Uint8Array.from(atob(message.ciphertextForRecipient), c => c.charCodeAt(0));

const decryptedBuffer = await crypto.subtle.decrypt(
  { name: "AES-GCM", iv },
  sharedKey,
  ciphertext
);

const plaintext = new TextDecoder().decode(decryptedBuffer);
// plaintext is now the original message — never stored, only displayed
`} />
        </div>
      ),
    },
    {
      title: "Step 5 — What the Server Stores (Database)",
      content: (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            The server and database only ever hold data that is either public or encrypted.
            No plaintext messages, no private keys.
          </p>
          <CodeBlock label="PostgreSQL schema — what the server knows" code={`
-- users table: server stores public key + encrypted private key blob
CREATE TABLE users (
  id                  SERIAL PRIMARY KEY,
  username            TEXT NOT NULL UNIQUE,
  password_hash       TEXT NOT NULL,        -- bcrypt hash, not the real password
  public_key_spki     TEXT NOT NULL,        -- ECDH public key (base64) — it's public, fine
  encrypted_private_key TEXT NOT NULL,      -- AES-GCM encrypted blob — useless without password
  salt                TEXT NOT NULL,        -- PBKDF2 salt (not secret by itself)
  iv                  TEXT NOT NULL         -- AES-GCM IV for the private key encryption
);

-- messages table: server stores ONLY ciphertext
CREATE TABLE messages (
  id                        SERIAL PRIMARY KEY,
  sender_id                 INTEGER REFERENCES users(id),
  recipient_id              INTEGER REFERENCES users(id),
  ciphertext_for_recipient  TEXT NOT NULL,  -- AES-GCM ciphertext (opaque to server)
  ciphertext_for_sender     TEXT NOT NULL,  -- sender's own copy (also opaque)
  iv_for_recipient          TEXT NOT NULL,
  iv_for_sender             TEXT NOT NULL,
  created_at                TIMESTAMPTZ DEFAULT NOW()
);

-- What the server CANNOT do:
-- X  Read any message content
-- X  Decrypt the private key (no password)
-- X  Impersonate a user (no private key)
-- X  Perform MITM without detection (public keys are distributed and pinnable)
`} />
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-[100dvh] bg-background text-foreground font-mono">
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link href="/">
            <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </Link>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2 text-primary font-bold">
            <Lock className="w-5 h-5" />
            E2EE — Architecture & Security Guide
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-14">

        <Section title="Architecture Overview" icon={Cpu}>
          <p className="text-sm text-muted-foreground">
            E2EE follows a strict zero-knowledge architecture. The server is a dumb pipe —
            it routes ciphertext and stores metadata, but it has no ability to read any message content.
          </p>
          <CodeBlock label="System Architecture (text diagram)" code={`
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER (You)                        │
│                                                             │
│   Web Crypto API (AES-GCM, ECDH, PBKDF2)                  │
│   ┌────────────┐  ┌─────────────────┐  ┌───────────────┐  │
│   │ Key Pair   │  │  Encrypt Msg    │  │  Decrypt Msg  │  │
│   │ (ECDH P256)│  │  (AES-256-GCM) │  │ (AES-256-GCM) │  │
│   └────────────┘  └─────────────────┘  └───────────────┘  │
│         │                 │                    ▲            │
│         │ publicKeySpki   │ ciphertext only    │ ciphertext │
└─────────┼─────────────────┼────────────────────┼────────────┘
          │                 │                    │
          ▼                 ▼                    │
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Express / Node)                  │
│                                                             │
│   Auth routes (/api/auth/*)                                │
│   Message routes (/api/messages/*)                         │
│   User routes (/api/users/*)                               │
│                                                             │
│   ✓  Validates session tokens                              │
│   ✓  Stores/retrieves ciphertext                           │
│   X  Cannot read ciphertext (no private key)               │
│   X  Cannot decrypt messages                               │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 DATABASE (PostgreSQL)                        │
│                                                             │
│   users:    id, username, password_hash,                    │
│             public_key_spki (public),                       │
│             encrypted_private_key (AES-GCM blob)            │
│                                                             │
│   messages: sender_id, recipient_id,                        │
│             ciphertext_for_recipient (opaque),              │
│             ciphertext_for_sender    (opaque),              │
│             iv_for_recipient, iv_for_sender                 │
│                                                             │
│   ✓  Stores structured encrypted data                      │
│   X  No plaintext is ever written here                     │
└─────────────────────────────────────────────────────────────┘

KEY EXCHANGE FLOW:
  Alice private key  ──ECDH──>  Shared Secret  <──ECDH──  Bob public key
  Bob private key    ──ECDH──>  Shared Secret  <──ECDH──  Alice public key
  (Both sides independently derive the SAME AES key)
`} />
        </Section>

        <Section title="Step-by-Step Workflow" icon={Key}>
          <p className="text-sm text-muted-foreground">
            Walk through each stage of the E2EE lifecycle — from key generation to message delivery.
          </p>
          <div className="space-y-3">
            {workflowSteps.map((step, i) => (
              <div key={i} className="border border-border">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-secondary transition-colors"
                  onClick={() => toggleStep(i)}
                >
                  <span className="text-sm font-medium">{step.title}</span>
                  {expandedSteps.has(i) ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>
                {expandedSteps.has(i) && (
                  <div className="px-4 pb-4 border-t border-border pt-4">
                    {step.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>

        <Section title="Core Crypto Code Examples" icon={Globe}>
          <p className="text-sm text-muted-foreground">
            These are the exact functions used in this application. No libraries — pure Web Crypto API built into every modern browser.
          </p>
          <div className="space-y-4">
            <CodeBlock label="1. Generate ECDH key pair" code={`
async function generateKeyPair() {
  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,           // exportable
    ["deriveKey"]   // key usage
  );
  // Export public key as base64 SPKI string
  const publicKeySpki = btoa(String.fromCharCode(...new Uint8Array(
    await crypto.subtle.exportKey("spki", keyPair.publicKey)
  )));
  // Export private key as raw bytes
  const privateKeyBytes = new Uint8Array(
    await crypto.subtle.exportKey("pkcs8", keyPair.privateKey)
  );
  return { publicKeySpki, privateKeyBytes };
}`} />
            <CodeBlock label="2. Derive AES key from password (PBKDF2)" code={`
async function deriveKeyFromPassword(password: string, salt: Uint8Array) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}`} />
            <CodeBlock label="3. Derive shared ECDH secret (key agreement)" code={`
async function deriveSharedKey(
  myPrivateKeyBytes: Uint8Array,
  theirPublicKeySpki: string
): Promise<CryptoKey> {
  const theirKeyBytes = Uint8Array.from(atob(theirPublicKeySpki), c => c.charCodeAt(0));
  const theirPublicKey = await crypto.subtle.importKey(
    "spki", theirKeyBytes, { name: "ECDH", namedCurve: "P-256" }, false, []
  );
  const myPrivateKey = await crypto.subtle.importKey(
    "pkcs8", myPrivateKeyBytes, { name: "ECDH", namedCurve: "P-256" }, false, ["deriveKey"]
  );
  // Magic: Alice.private + Bob.public == Bob.private + Alice.public
  return crypto.subtle.deriveKey(
    { name: "ECDH", public: theirPublicKey },
    myPrivateKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}`} />
            <CodeBlock label="4. Encrypt a message (AES-256-GCM)" code={`
async function encryptMessage(plaintext: string, sharedKey: CryptoKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12)); // fresh IV every time
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    sharedKey,
    encoded
  );
  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
    iv: btoa(String.fromCharCode(...iv))
  };
}`} />
            <CodeBlock label="5. Decrypt a message (AES-256-GCM)" code={`
async function decryptMessage(
  ciphertextB64: string,
  ivB64: string,
  sharedKey: CryptoKey
): Promise<string> {
  const ciphertext = Uint8Array.from(atob(ciphertextB64), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    sharedKey,
    ciphertext
  );
  return new TextDecoder().decode(decrypted);
}`} />
          </div>
        </Section>

        <Section title="Security Checklist" icon={ShieldCheck}>
          <div className="space-y-3">
            <div className="border border-border p-4 space-y-2">
              <div className="text-sm font-bold text-primary mb-3">Do — recommended practices</div>
              {[
                { text: "Use Web Crypto API (browser built-in) — never hand-roll crypto primitives", detail: "crypto.subtle is implemented in C++ by the browser engine, vetted by thousands of security engineers." },
                { text: "Generate a fresh IV (nonce) for every single encryption", detail: "Reusing an IV with the same key under AES-GCM is catastrophic — it leaks the key." },
                { text: "Use PBKDF2 with 100,000+ iterations to derive keys from passwords", detail: "This makes brute-force attacks expensive. Store only the salt, never the derived key." },
                { text: "Store the private key only in JavaScript memory (React state)", detail: "localStorage and sessionStorage persist across tabs. A XSS attack would steal any stored key." },
                { text: "Use ECDH for key agreement — never transmit a symmetric key over the network", detail: "ECDH lets two parties derive the same shared secret without ever sending it." },
                { text: "Always verify the public key fingerprint out-of-band before trusting it", detail: "A malicious server could serve a fake public key. Compare fingerprints via another channel." },
                { text: "Use HTTPS (TLS) to prevent MITM attacks at the transport layer", detail: "E2EE protects message contents, but TLS protects the key distribution mechanism." },
              ].map((item, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-primary shrink-0 mt-0.5">+</span>
                  <div>
                    <div className="text-sm text-foreground">{item.text}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border border-destructive/30 p-4 space-y-2">
              <div className="text-sm font-bold text-destructive mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Never — critical mistakes to avoid
              </div>
              {[
                { text: "Never implement your own crypto primitives", detail: "Do not write your own AES, RSA, or elliptic curve math. One timing error leaks the key." },
                { text: "Never reuse a nonce/IV with the same key", detail: "Under AES-GCM, one nonce reuse can reveal the keystream and allow plaintext recovery." },
                { text: "Never store the private key in localStorage, sessionStorage, or cookies", detail: "Any JavaScript on the page (including XSS payloads) can read these." },
                { text: "Never send the plaintext password or private key to the server", detail: "The server only needs the bcrypt hash (for auth) and the encrypted key blob." },
                { text: "Never use ECB mode for AES", detail: "ECB is deterministic and leaks patterns. Always use GCM, CCM, or CBC with HMAC." },
                { text: "Never trust the server's public key without out-of-band verification", detail: "A compromised server can substitute its own key — always verify fingerprints separately." },
                { text: "Never use MD5 or SHA-1 for anything security-critical", detail: "Use SHA-256 or SHA-384 for hashing. MD5 and SHA-1 are broken." },
              ].map((item, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-destructive shrink-0 mt-0.5">x</span>
                  <div>
                    <div className="text-sm text-foreground">{item.text}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border border-border p-4 space-y-2">
              <div className="text-sm font-bold mb-3 flex items-center gap-2">
                <Key className="w-4 h-4 text-primary" />
                Key Backup / Recovery
              </div>
              <p className="text-sm text-muted-foreground">
                This is the hardest problem in E2EE systems. If a user loses their password, all
                their messages are permanently unreadable — that's the price of true E2EE.
                Strategies to mitigate this:
              </p>
              {[
                "Allow users to export a recovery code (encrypted private key + a strong random phrase) to save offline",
                "Offer a device-linking flow: scan a QR code from an already-authenticated device to transfer the private key",
                "Never store a plaintext copy of the private key for recovery — that defeats E2EE",
                "Clearly communicate to users that password recovery resets all message access",
              ].map((item, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="text-primary shrink-0 mt-0.5">~</span>
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Adapting This Design" icon={Database}>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                title: "Secure Chat (Signal-style)",
                points: [
                  "Add the Signal Protocol's Double Ratchet algorithm for forward secrecy",
                  "Each message uses a fresh derived key — compromising one key reveals only one message",
                  "Add pre-keys (one-time ECDH keys) so users can receive messages while offline",
                  "Use X3DH (Extended Triple Diffie-Hellman) for initial key agreement",
                ],
              },
              {
                title: "Encrypted File Sharing",
                points: [
                  "Generate a random AES-256 key per file, encrypt the file with it",
                  "Encrypt the file key with the recipient's ECDH public key",
                  "Store the encrypted file in object storage (S3, Cloudflare R2)",
                  "Send only the encrypted key and file pointer through the API",
                ],
              },
              {
                title: "Encrypted Web Forms",
                points: [
                  "Each form submission gets a fresh AES-GCM key",
                  "Encrypt the entire form payload client-side before POST",
                  "Only the form owner (with their private key) can decrypt submissions",
                  "Useful for medical intake forms, legal documents, HR surveys",
                ],
              },
              {
                title: "Group Messaging",
                points: [
                  "Create a group symmetric key, encrypt it for each member's public key",
                  "All members decrypt the group key on login, then use it for messages",
                  "Rotate the group key when a member leaves (forward secrecy)",
                  "Store N encrypted copies of the group key (one per member)",
                ],
              },
            ].map(card => (
              <div key={card.title} className="border border-border p-4 space-y-3">
                <div className="text-sm font-bold text-primary">{card.title}</div>
                <ul className="space-y-1.5">
                  {card.points.map((p, i) => (
                    <li key={i} className="flex gap-2 text-xs text-muted-foreground">
                      <span className="text-primary mt-0.5 shrink-0">+</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <div className="border-t border-border pt-6 text-center text-xs text-muted-foreground space-y-1">
          <div className="flex items-center justify-center gap-2">
            <Lock className="w-3 h-3 text-primary" />
            <span>E2EE — End-to-End Encryption Demo</span>
          </div>
          <div>Built with Web Crypto API (ECDH P-256 + AES-256-GCM + PBKDF2) · Node.js + Express · PostgreSQL</div>
          <div>The server has never seen your messages in plaintext.</div>
        </div>
      </div>
    </div>
  );
}
