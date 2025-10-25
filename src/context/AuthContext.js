import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { checkHealth } from "../services/api";
import {
  loadStoredSession,
  login,
  logout,
  register,
} from "../services/auth";
import {
  getCurrentUser,
  updateCurrentUser,
  deleteCurrentUser,
} from "../services/users";
import { saveSession } from "../services/session";

const AuthContext = createContext(null);

const devBypassEnv =
  String(process.env.EXPO_PUBLIC_DEV_AUTH_BYPASS || "false").toLowerCase() ===
  "true";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [healthStatus, setHealthStatus] = useState("unknown");

  const devBypass = devBypassEnv;

  const applyAuthResult = useCallback((authResult) => {
    if (!authResult) return;
    setToken(authResult.accessToken);
    setUser(authResult.user);
  }, []);

  const handleLogin = useCallback(
    async (credentials) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await login(credentials);
        applyAuthResult(result);
        return result.user;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [applyAuthResult]
  );

  const handleRegister = useCallback(
    async (payload) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await register(payload);
        applyAuthResult(result);
        return result.user;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [applyAuthResult]
  );

  const handleLogout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await logout();
    } catch (err) {
      if (!err?.isUnauthorized) {
        setError(err);
      }
    } finally {
      setToken(null);
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await getCurrentUser();
    setUser(me);
    await saveSession({ token, user: me });
    return me;
  }, [token]);

  const updateProfile = useCallback(
    async (patch) => {
      const updated = await updateCurrentUser(patch);
      setUser(updated);
      await saveSession({ token, user: updated });
      return updated;
    },
    [token]
  );

  const deleteAccount = useCallback(async () => {
    await deleteCurrentUser();
    await handleLogout();
  }, [handleLogout]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const stored = await loadStoredSession();
        if (cancelled) return;
        if (stored.token) {
          setToken(stored.token);
          if (stored.user) setUser(stored.user);
          try {
            const me = await getCurrentUser();
            if (cancelled) return;
            setUser(me);
            await saveSession({ token: stored.token, user: me });
          } catch (err) {
            if (cancelled) return;
            if (err?.isUnauthorized || err?.status === 401) {
              await handleLogout();
            } else {
              setError(err);
            }
          }
        }
      } finally {
        if (!cancelled) setIsReady(true);
      }
    }

    async function verifyHealth() {
      try {
        await checkHealth();
        if (!cancelled) setHealthStatus("ok");
      } catch (err) {
        if (!cancelled) {
          setHealthStatus("error");
          setError(err);
        }
      }
    }

    if (!devBypass) {
      verifyHealth();
      bootstrap();
    } else {
      setIsReady(true);
      setHealthStatus("dev");
      setUser((prev) => prev || { username: "dev-user" });
    }

    return () => {
      cancelled = true;
    };
  }, [devBypass, handleLogout]);

  const isAuthenticated = !!token && !!user;

  const value = useMemo(
    () => ({
      user,
      token,
      error,
      healthStatus,
      isAuthenticated: devBypass ? true : isAuthenticated,
      isReady,
      isLoading,
      devBypass,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
      refreshUser,
      updateProfile,
      deleteAccount,
    }),
    [
      user,
      token,
      error,
      healthStatus,
      isAuthenticated,
      isReady,
      isLoading,
      devBypass,
      handleLogin,
      handleRegister,
      handleLogout,
      refreshUser,
      updateProfile,
      deleteAccount,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

