/**
 * trust-store.ts
 *
 * Trust-On-First-Use (TOFU) storage.
 *
 * Stores public-key fingerprints in localStorage keyed by userId.
 * Only fingerprints are stored — never public keys themselves, and
 * certainly never private keys or plaintexts.
 *
 * Threat model:
 *   localStorage is readable by any JS on the page (XSS risk).
 *   We only store fingerprints (SHA-256 hashes) which are:
 *   1. Not secret — public keys are public by definition.
 *   2. Not useful to an attacker — knowing a fingerprint doesn't
 *      help decrypt messages.
 *   3. Integrity-sensitive — we WANT to detect if they change.
 */

const STORAGE_KEY = "cipherchat:tofu";

interface TofuStore {
  [userId: number]: string; // fingerprint hex string
}

function load(): TofuStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TofuStore) : {};
  } catch {
    return {};
  }
}

function save(store: TofuStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Storage full or unavailable — non-fatal
  }
}

/** Look up the stored fingerprint for a user. Returns null if not yet trusted. */
export function getTrustedFingerprint(userId: number): string | null {
  return load()[userId] ?? null;
}

/** Store or update the trusted fingerprint for a user. */
export function setTrustedFingerprint(userId: number, fingerprint: string): void {
  const store = load();
  store[userId] = fingerprint;
  save(store);
}

/** Remove all trust records (e.g. on account switch or explicit reset). */
export function clearAllTrust(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Check a live fingerprint against stored trust.
 * Returns:
 *  'first-use'  — no prior record, should prompt user to verify
 *  'trusted'    — matches stored fingerprint
 *  'changed'    — MISMATCH — possible key substitution attack
 */
export type TrustResult = "first-use" | "trusted" | "changed";

export function checkTrust(userId: number, liveFingerprint: string): TrustResult {
  const stored = getTrustedFingerprint(userId);
  if (stored === null) return "first-use";
  if (stored === liveFingerprint) return "trusted";
  return "changed";
}
