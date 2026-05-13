/**
 * crypto.ts — All browser-side cryptographic operations
 *
 * Uses exclusively the Web Crypto API (browser-native, hardware-backed).
 * No third-party crypto libraries.
 *
 * Algorithms:
 *  Key exchange:     ECDH P-256
 *  Message cipher:   AES-256-GCM  (authenticated encryption)
 *  Password KDF:     PBKDF2 / SHA-256 / 100,000 iterations
 *  Key export:       PKCS8 (private), SPKI (public)
 *  Fingerprinting:   SHA-256 of SPKI bytes
 *
 * Memory safety:
 *  Use zeroBytes() on private key Uint8Arrays as soon as they are no
 *  longer needed. The functions here do NOT automatically zero their
 *  inputs — the caller (session.tsx) is responsible.
 *
 * IV invariant:
 *  Every AES-GCM call uses a fresh 12-byte random IV.
 *  IVs are NEVER reused for the same key.
 *  Reusing an IV with the same key breaks AES-GCM confidentiality.
 */

/** Overwrite a Uint8Array with zeros to minimise key material in memory. */
export function zeroBytes(arr: Uint8Array): void {
  arr.fill(0);
}

/**
 * Convert a base64 string to a Uint8Array<ArrayBuffer>.
 * We explicitly construct via Array.from so TypeScript knows the backing
 * buffer is a plain ArrayBuffer (not SharedArrayBuffer), which is required
 * by the Web Crypto API in TypeScript 5.9+.
 */
function b64ToU8(b64: string): Uint8Array<ArrayBuffer> {
  return new Uint8Array(Array.from(atob(b64), (c) => c.charCodeAt(0)));
}

/* ------------------------------------------------------------------ */
/* 1. ECDH key pair generation                                         */
/* ------------------------------------------------------------------ */
export async function generateKeyPair() {
  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey"],
  );

  const publicKeySpki = btoa(
    String.fromCharCode(
      ...new Uint8Array(await crypto.subtle.exportKey("spki", keyPair.publicKey)),
    ),
  );

  const privateKeyPkcs8 = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
  return {
    keyPair,
    publicKeySpki,
    privateKeyPkcs8: new Uint8Array(privateKeyPkcs8),
  };
}

/* ------------------------------------------------------------------ */
/* 2. PBKDF2 password → AES-256-GCM key                              */
/* ------------------------------------------------------------------ */
export async function deriveKeyFromPassword(password: string, salt: Uint8Array<ArrayBuffer>) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/* ------------------------------------------------------------------ */
/* 3. Encrypt private key (for server storage)                         */
/* ------------------------------------------------------------------ */
export async function encryptPrivateKey(privateKeyBytes: Uint8Array<ArrayBuffer>, password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKeyFromPassword(password, salt);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    privateKeyBytes,
  );
  return {
    encryptedPrivateKey: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    salt: btoa(String.fromCharCode(...salt)),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

/* ------------------------------------------------------------------ */
/* 4. Decrypt private key (at login)                                   */
/* ------------------------------------------------------------------ */
export async function decryptPrivateKey(
  encryptedPrivateKey: string,
  password: string,
  saltB64: string,
  ivB64: string,
): Promise<Uint8Array<ArrayBuffer>> {
  const encrypted = b64ToU8(encryptedPrivateKey);
  const salt = b64ToU8(saltB64);
  const iv = b64ToU8(ivB64);

  if (iv.length !== 12) throw new Error("Invalid IV length — expected 12 bytes");

  const key = await deriveKeyFromPassword(password, salt);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encrypted);
  return new Uint8Array(decrypted);
}

/* ------------------------------------------------------------------ */
/* 5. ECDH shared key derivation                                       */
/* ------------------------------------------------------------------ */
export async function deriveSharedKey(
  privateKeyPkcs8: Uint8Array<ArrayBuffer>,
  theirPublicKeySpki: string,
): Promise<CryptoKey> {
  const theirPublicKeyBytes = b64ToU8(theirPublicKeySpki);
  const theirPublicKey = await crypto.subtle.importKey(
    "spki",
    theirPublicKeyBytes,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    [],
  );
  const myPrivateKey = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyPkcs8 as Uint8Array<ArrayBuffer>,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "ECDH", public: theirPublicKey },
    myPrivateKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

/* ------------------------------------------------------------------ */
/* 6. Message encryption                                              */
/* ------------------------------------------------------------------ */
export async function encryptMessage(plaintext: string, sharedKey: CryptoKey) {
  if (!plaintext.trim()) throw new Error("Cannot encrypt empty message");
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    sharedKey,
    enc.encode(plaintext),
  );
  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

/* ------------------------------------------------------------------ */
/* 7. Message decryption                                              */
/* ------------------------------------------------------------------ */
export async function decryptMessage(
  ciphertextB64: string,
  ivB64: string,
  sharedKey: CryptoKey,
): Promise<string> {
  const ciphertext = Uint8Array.from(atob(ciphertextB64), (c) => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0));

  if (iv.length !== 12) throw new Error("Invalid IV length — expected 12 bytes");

  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, sharedKey, ciphertext);
  return new TextDecoder().decode(decrypted);
}

/* ------------------------------------------------------------------ */
/* 8. Public key fingerprint (SHA-256 of SPKI bytes)                 */
/* ------------------------------------------------------------------ */
export async function computeKeyFingerprint(publicKeySpkiB64: string): Promise<string> {
  const keyBytes = Uint8Array.from(atob(publicKeySpkiB64), (c) => c.charCodeAt(0));
  const hashBuffer = await crypto.subtle.digest("SHA-256", keyBytes);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0").toUpperCase())
    .join(":");
}

/* ------------------------------------------------------------------ */
/* 9. Client-side message ID generation (crypto-random UUID v4)       */
/* ------------------------------------------------------------------ */
export function generateMessageId(): string {
  return crypto.randomUUID();
}
