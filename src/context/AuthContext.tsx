// context/AuthContext.tsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import API, { setAuthToken } from "../services/api";
import { getToken, saveToken, clearToken } from "../services/tokenStore";

type MeResponse = { id: string; email: string };
type User = { id: string; email: string };

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (jwt: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initial load: read token from Capacitor Preferences, validate with /auth/me
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const stored = await getToken();
        if (!stored) return;
        setToken(stored);
        setAuthToken(stored); // sets default Authorization on API
        const { data } = await API.get<MeResponse>("/auth/me");
        if (!alive) return;
        setUser({ id: data.id, email: data.email });
      } catch {
        // token invalid → clear everything
        await clearToken();
        setAuthToken(null);
        if (alive) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const login = async (jwt: string) => {
    // persist → set default header → fetch user
    await saveToken(jwt);
    setAuthToken(jwt);
    setToken(jwt);
    const { data } = await API.get<MeResponse>("/auth/me");
    setUser({ id: data.id, email: data.email });
  };

  const logout = async () => {
    await clearToken();
    setAuthToken(null);
    setUser(null);
    setToken(null);
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