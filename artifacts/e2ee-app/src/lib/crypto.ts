// src/lib/crypto.ts

// 1. Key pair generation (ECDH P-256)
export async function generateKeyPair() {
  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey"]
  );
  const publicKeySpki = btoa(String.fromCharCode(...new Uint8Array(
    await crypto.subtle.exportKey("spki", keyPair.publicKey)
  )));
  const privateKeyPkcs8 = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
  return { keyPair, publicKeySpki, privateKeyPkcs8: new Uint8Array(privateKeyPkcs8) };
}

// 2. Derive AES-GCM key from password (PBKDF2)
export async function deriveKeyFromPassword(password: string, salt: Uint8Array) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// 3. Encrypt private key with password
export async function encryptPrivateKey(privateKeyBytes: Uint8Array, password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKeyFromPassword(password, salt);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, privateKeyBytes);
  return {
    encryptedPrivateKey: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    salt: btoa(String.fromCharCode(...salt)),
    iv: btoa(String.fromCharCode(...iv))
  };
}

// 4. Decrypt private key
export async function decryptPrivateKey(encryptedPrivateKey: string, password: string, saltB64: string, ivB64: string) {
  const encrypted = Uint8Array.from(atob(encryptedPrivateKey), c => c.charCodeAt(0));
  const salt = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
  const key = await deriveKeyFromPassword(password, salt);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encrypted);
  return new Uint8Array(decrypted);
}

// 5. Derive shared ECDH secret as AES-GCM key
export async function deriveSharedKey(privateKeyPkcs8: Uint8Array, theirPublicKeySpki: string) {
  const theirPublicKeyBytes = Uint8Array.from(atob(theirPublicKeySpki), c => c.charCodeAt(0));
  const theirPublicKey = await crypto.subtle.importKey("spki", theirPublicKeyBytes, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const myPrivateKey = await crypto.subtle.importKey("pkcs8", privateKeyPkcs8, { name: "ECDH", namedCurve: "P-256" }, false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "ECDH", public: theirPublicKey },
    myPrivateKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// 6. Encrypt a string message
export async function encryptMessage(plaintext: string, sharedKey: CryptoKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, sharedKey, enc.encode(plaintext));
  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
    iv: btoa(String.fromCharCode(...iv))
  };
}

// 7. Decrypt a string message
export async function decryptMessage(ciphertextB64: string, ivB64: string, sharedKey: CryptoKey) {
  const ciphertext = Uint8Array.from(atob(ciphertextB64), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, sharedKey, ciphertext);
  return new TextDecoder().decode(decrypted);
}
