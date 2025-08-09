import { createContext, useContext, useEffect, useMemo, useState } from "react";
import API from "../services/api";

type User = { id: string; email: string };

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (jwt: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("flashly::token")
  );
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(!!token);

  // pull /auth/me if we have a token
  useEffect(() => {
    let cancelled = false;
    const fetchMe = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const res = await API.get<User>("/auth/me");
        if (!cancelled) setUser(res.data);
      } catch {
        if (!cancelled) {
          localStorage.removeItem("flashly::token");
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchMe();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = async (jwt: string) => {
    localStorage.setItem("flashly::token", jwt);
    setToken(jwt);
    setLoading(true);
    const res = await API.get<User>("/auth/me");
    setUser(res.data);
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("flashly::token");
    setToken(null);
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, token, loading, login, logout }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}