/**
 * crypto.test.ts
 *
 * Unit tests for all cryptographic primitives.
 * Runs in Node 24 which ships WebCrypto as globalThis.crypto.
 *
 * Coverage:
 *  1. Key pair generation — produces valid SPKI and PKCS8 bytes
 *  2. Password KDF (PBKDF2) — deterministic with same salt
 *  3. Private key encrypt/decrypt round-trip
 *  4. Shared key derivation — ECDH commutativity property
 *  5. Message encryption + decryption round-trip
 *  6. Wrong key → decryption throws
 *  7. IV uniqueness — never reuse IVs
 *  8. Fingerprint determinism and format
 *  9. generateMessageId — valid UUID v4 format
 * 10. Memory safety: zeroBytes wipes the array
 */

import { describe, it, expect } from "vitest";
import {
  generateKeyPair,
  decryptPrivateKey,
  encryptPrivateKey,
  deriveSharedKey,
  encryptMessage,
  decryptMessage,
  computeKeyFingerprint,
  generateMessageId,
  zeroBytes,
} from "../crypto";

describe("generateKeyPair", () => {
  it("returns a non-empty SPKI base64 string", async () => {
    const { publicKeySpki } = await generateKeyPair();
    expect(typeof publicKeySpki).toBe("string");
    expect(publicKeySpki.length).toBeGreaterThan(80);
    // Should be valid base64
    expect(() => atob(publicKeySpki)).not.toThrow();
  });

  it("returns a non-empty PKCS8 Uint8Array", async () => {
    const { privateKeyPkcs8 } = await generateKeyPair();
    expect(privateKeyPkcs8).toBeInstanceOf(Uint8Array);
    expect(privateKeyPkcs8.length).toBeGreaterThan(100);
  });

  it("generates unique key pairs each call", async () => {
    const a = await generateKeyPair();
    const b = await generateKeyPair();
    expect(a.publicKeySpki).not.toBe(b.publicKeySpki);
  });
});

describe("encryptPrivateKey / decryptPrivateKey", () => {
  it("round-trips: decrypt(encrypt(key, pwd), pwd) === key", async () => {
    const { privateKeyPkcs8 } = await generateKeyPair();
    const password = "SuperSecretPassword!42";
    const { encryptedPrivateKey, salt, iv } = await encryptPrivateKey(privateKeyPkcs8, password);

    const decrypted = await decryptPrivateKey(encryptedPrivateKey, password, salt, iv);
    expect(Array.from(decrypted)).toEqual(Array.from(privateKeyPkcs8));
  });

  it("throws with wrong password", async () => {
    const { privateKeyPkcs8 } = await generateKeyPair();
    const { encryptedPrivateKey, salt, iv } = await encryptPrivateKey(privateKeyPkcs8, "correct");
    await expect(decryptPrivateKey(encryptedPrivateKey, "wrong", salt, iv)).rejects.toThrow();
  });
});

describe("ECDH shared key commutativity", () => {
  it("Alice→Bob key equals Bob→Alice key (ECDH property)", async () => {
    const alice = await generateKeyPair();
    const bob = await generateKeyPair();

    const aliceShared = await deriveSharedKey(alice.privateKeyPkcs8, bob.publicKeySpki);
    const bobShared = await deriveSharedKey(bob.privateKeyPkcs8, alice.publicKeySpki);

    // Both keys should decrypt a message encrypted with either
    const { ciphertext, iv } = await encryptMessage("Hello Bob", aliceShared);
    const plaintext = await decryptMessage(ciphertext, iv, bobShared);
    expect(plaintext).toBe("Hello Bob");
  });

  it("self-key: encrypt with self, decrypt with self (for sender inbox)", async () => {
    const alice = await generateKeyPair();
    const selfKey = await deriveSharedKey(alice.privateKeyPkcs8, alice.publicKeySpki);
    const { ciphertext, iv } = await encryptMessage("My own message", selfKey);
    const selfKeyAgain = await deriveSharedKey(alice.privateKeyPkcs8, alice.publicKeySpki);
    const plaintext = await decryptMessage(ciphertext, iv, selfKeyAgain);
    expect(plaintext).toBe("My own message");
  });
});

describe("encryptMessage / decryptMessage", () => {
  it("round-trip preserves plaintext", async () => {
    const { privateKeyPkcs8, publicKeySpki } = await generateKeyPair();
    const sharedKey = await deriveSharedKey(privateKeyPkcs8, publicKeySpki);

    const original = "Hello, E2EE world! 🔒";
    const { ciphertext, iv } = await encryptMessage(original, sharedKey);
    const result = await decryptMessage(ciphertext, iv, sharedKey);
    expect(result).toBe(original);
  });

  it("throws when decrypting with wrong key", async () => {
    const alice = await generateKeyPair();
    const bob = await generateKeyPair();
    const carol = await generateKeyPair();

    const aliceBobKey = await deriveSharedKey(alice.privateKeyPkcs8, bob.publicKeySpki);
    const aliceCarolKey = await deriveSharedKey(alice.privateKeyPkcs8, carol.publicKeySpki);

    const { ciphertext, iv } = await encryptMessage("Secret", aliceBobKey);
    await expect(decryptMessage(ciphertext, iv, aliceCarolKey)).rejects.toThrow();
  });

  it("rejects empty plaintext", async () => {
    const { privateKeyPkcs8, publicKeySpki } = await generateKeyPair();
    const key = await deriveSharedKey(privateKeyPkcs8, publicKeySpki);
    await expect(encryptMessage("", key)).rejects.toThrow();
    await expect(encryptMessage("   ", key)).rejects.toThrow();
  });

  it("each encryption produces a unique IV", async () => {
    const { privateKeyPkcs8, publicKeySpki } = await generateKeyPair();
    const key = await deriveSharedKey(privateKeyPkcs8, publicKeySpki);

    const ivs = new Set<string>();
    for (let i = 0; i < 10; i++) {
      const { iv } = await encryptMessage("test", key);
      ivs.add(iv);
    }
    expect(ivs.size).toBe(10); // All IVs must be unique
  });

  it("IV is 12 bytes (16 base64 chars + padding)", async () => {
    const { privateKeyPkcs8, publicKeySpki } = await generateKeyPair();
    const key = await deriveSharedKey(privateKeyPkcs8, publicKeySpki);
    const { iv } = await encryptMessage("test", key);
    const ivBytes = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
    expect(ivBytes.length).toBe(12);
  });
});

describe("computeKeyFingerprint", () => {
  it("returns a colon-separated uppercase hex string", async () => {
    const { publicKeySpki } = await generateKeyPair();
    const fp = await computeKeyFingerprint(publicKeySpki);
    expect(fp).toMatch(/^([0-9A-F]{2}:){31}[0-9A-F]{2}$/);
  });

  it("is deterministic for the same key", async () => {
    const { publicKeySpki } = await generateKeyPair();
    const fp1 = await computeKeyFingerprint(publicKeySpki);
    const fp2 = await computeKeyFingerprint(publicKeySpki);
    expect(fp1).toBe(fp2);
  });

  it("differs for different keys", async () => {
    const a = await generateKeyPair();
    const b = await generateKeyPair();
    const fp1 = await computeKeyFingerprint(a.publicKeySpki);
    const fp2 = await computeKeyFingerprint(b.publicKeySpki);
    expect(fp1).not.toBe(fp2);
  });
});

describe("generateMessageId", () => {
  it("returns a valid UUID v4 format", () => {
    const id = generateMessageId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it("is unique across calls", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateMessageId()));
    expect(ids.size).toBe(100);
  });
});

describe("zeroBytes (memory safety)", () => {
  it("overwrites all bytes with zero", () => {
    const arr = new Uint8Array([1, 2, 3, 4, 5, 255, 128]);
    zeroBytes(arr);
    expect(Array.from(arr)).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });

  it("does not throw on empty array", () => {
    expect(() => zeroBytes(new Uint8Array(0))).not.toThrow();
  });
});
