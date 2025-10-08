import React, { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const devBypass =
    String(process.env.EXPO_PUBLIC_DEV_AUTH_BYPASS || "false").toLowerCase() ===
    "true";
  const [authed, setAuthed] = useState(false);

  const value = useMemo(() => {
    const isAuthenticated = devBypass || authed;
    return {
      isAuthenticated,
      devBypass,
      signIn: () => setAuthed(true),
      signOut: () => setAuthed(false),
    };
  }, [devBypass, authed]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

