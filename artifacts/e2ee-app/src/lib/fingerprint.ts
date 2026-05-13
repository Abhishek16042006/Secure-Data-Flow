/**
 * fingerprint.ts
 *
 * Public key fingerprinting using SHA-256.
 *
 * Why fingerprints matter for E2EE:
 *   The server distributes public keys. If the server is compromised or a
 *   MitM substitutes a different key, messages would be encrypted to the
 *   attacker rather than the intended recipient.
 *
 *   Fingerprints let users independently verify identity out-of-band
 *   (e.g. "does your fingerprint end in 4F:A2?").
 *
 * Trust-On-First-Use (TOFU):
 *   The first time you talk to someone, their fingerprint is stored.
 *   On subsequent sessions the stored fingerprint is compared to the
 *   server-provided key. A mismatch triggers a loud warning.
 */

/**
 * Derive a hex fingerprint from a base64-encoded SPKI public key.
 * Returns a colon-separated uppercase hex string:
 *   "AB:CD:EF:12:34:..."  (64 hex chars → 32 pairs)
 */
export async function computeFingerprint(publicKeySpkiB64: string): Promise<string> {
  const keyBytes = Uint8Array.from(atob(publicKeySpkiB64), (c) => c.charCodeAt(0));
  const hashBuffer = await crypto.subtle.digest("SHA-256", keyBytes);
  const hashBytes = new Uint8Array(hashBuffer);
  return Array.from(hashBytes)
    .map((b) => b.toString(16).padStart(2, "0").toUpperCase())
    .join(":");
}

/**
 * Format a full fingerprint for display — show only the last 4 pairs
 * as a short identifier, with full version available on expand.
 */
export function shortFingerprint(fingerprint: string): string {
  const parts = fingerprint.split(":");
  return parts.slice(-4).join(":");
}
