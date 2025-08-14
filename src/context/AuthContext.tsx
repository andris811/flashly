import { createContext, useContext, useEffect, useMemo, useState } from "react";
import API, { setAuthToken } from "../services/api";

type MeResponse = { id: string; email: string };

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
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const stored = localStorage.getItem("flashly::token");
    if (!stored) {
      setLoading(false);
      return;
    }
    setToken(stored);
    setAuthToken(stored);

    API.get<MeResponse>("/auth/me")
      .then(({ data }) => setUser({ id: data.id, email: data.email }))
      .catch(() => {
        setAuthToken(null);
        localStorage.removeItem("flashly::token");
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (jwt: string) => {
    setToken(jwt);
    localStorage.setItem("flashly::token", jwt);
    setAuthToken(jwt);
    const { data } = await API.get<MeResponse>("/auth/me");
    setUser({ id: data.id, email: data.email });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("flashly::token");
    setAuthToken(null);
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