import React, { createContext, useContext, useState } from "react";
import { AuthResponse } from "@workspace/api-client-react";

interface SessionContextType {
  user: AuthResponse | null;
  privateKeyBytes: Uint8Array | null;
  login: (user: AuthResponse, privateKeyBytes: Uint8Array) => void;
  logout: () => void;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [privateKeyBytes, setPrivateKeyBytes] = useState<Uint8Array | null>(null);

  const login = (u: AuthResponse, pk: Uint8Array) => {
    setUser(u);
    setPrivateKeyBytes(pk);
  };

  const logout = () => {
    setUser(null);
    setPrivateKeyBytes(null);
  };

  return (
    <SessionContext.Provider value={{ user, privateKeyBytes, login, logout }}>
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
