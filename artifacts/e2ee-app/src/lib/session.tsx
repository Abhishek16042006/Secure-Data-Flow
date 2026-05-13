/**
 * session.tsx — Authentication context
 *
 * Memory-safety hardening:
 *  - Private key bytes are zeroed (overwritten with 0x00) before the
 *    reference is dropped on logout. This minimises the window in which
 *    a GC-delayed Uint8Array could be read by a memory-scanning attack.
 *  - The same zero-out happens on tab close / page hide.
 *  - No private key material is written to localStorage, sessionStorage,
 *    or cookies — ever.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { AuthResponse } from "@workspace/api-client-react";

interface SessionContextType {
  user: AuthResponse | null;
  privateKeyBytes: Uint8Array<ArrayBuffer> | null;
  login: (user: AuthResponse, privateKeyBytes: Uint8Array<ArrayBuffer>) => void;
  logout: () => void;
  /** True when user cookie exists but key is absent (page refresh scenario) */
  isSessionLocked: boolean;
}

const SessionContext = createContext<SessionContextType | null>(null);

/**
 * Overwrite every byte of a Uint8Array with zeros so the GC cannot
 * later scan freed memory and find key material.
 */
function zeroBytes(arr: Uint8Array): void {
  arr.fill(0);
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [privateKeyBytes, setPrivateKeyBytes] = useState<Uint8Array<ArrayBuffer> | null>(null);
  const [isSessionLocked, setIsSessionLocked] = useState(false);

  /** Zero the key and clear all auth state */
  const clearCryptoState = useCallback((currentKey: Uint8Array | null) => {
    if (currentKey) {
      zeroBytes(currentKey);
    }
    setPrivateKeyBytes(null);
    setUser(null);
    setIsSessionLocked(false);
  }, []);

  const login = useCallback((u: AuthResponse, pk: Uint8Array<ArrayBuffer>) => {
    setUser(u);
    setPrivateKeyBytes(pk);
    setIsSessionLocked(false);
  }, []);

  const logout = useCallback(() => {
    // Capture current ref before state update so we can zero it
    setPrivateKeyBytes((current) => {
      if (current) zeroBytes(current);
      return null;
    });
    setUser(null);
    setIsSessionLocked(false);
  }, []);

  /* ------------------------------------------------------------------
     Tab / browser close — zero the key as early as possible.
     "pagehide" fires more reliably than "beforeunload" on mobile.
     ------------------------------------------------------------------ */
  useEffect(() => {
    const handlePageHide = () => {
      setPrivateKeyBytes((current) => {
        if (current) zeroBytes(current);
        return null;
      });
    };
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("beforeunload", handlePageHide);
    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("beforeunload", handlePageHide);
    };
  }, []);

  /* ------------------------------------------------------------------
     Session lock detection:
     If the server says we're authenticated (/api/auth/me returns a user)
     but we have no private key in memory, the page was refreshed and the
     key is gone. Show a "Session locked — please log in again" banner.
     ------------------------------------------------------------------ */
  useEffect(() => {
    if (user && !privateKeyBytes) {
      setIsSessionLocked(true);
    } else {
      setIsSessionLocked(false);
    }
  }, [user, privateKeyBytes]);

  return (
    <SessionContext.Provider value={{ user, privateKeyBytes, login, logout, isSessionLocked }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}
