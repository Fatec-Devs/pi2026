import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import { authService } from "../services/auth.service";
import { setAuthToken } from "../services/api";
import { mockClientId } from "../services/mocks/data";
import type { RegisterClientDTO, User } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  clientId: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: RegisterClientDTO) => Promise<void>;
  signOut: () => Promise<void>;
}

const KEY = "session";
const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await SecureStore.getItemAsync(KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as { token: string; user: User };
          setToken(parsed.token);
          setUser(parsed.user);
          setAuthToken(parsed.token);
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  const persist = async (t: string, u: User) => {
    setToken(t); setUser(u); setAuthToken(t);
    await SecureStore.setItemAsync(KEY, JSON.stringify({ token: t, user: u }));
  };

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await authService.login(email, password);
    await persist(res.accessToken, res.user);
  }, []);

  const signUp = useCallback(async (data: RegisterClientDTO) => {
    const res = await authService.registerClient(data);
    await persist(res.accessToken, res.user);
  }, []);

  const signOut = useCallback(async () => {
    setUser(null); setToken(null); setAuthToken(null);
    await SecureStore.deleteItemAsync(KEY);
  }, []);

  const value = useMemo<AuthState>(() => ({
    user, token, clientId: user ? mockClientId : null,
    loading, signIn, signUp, signOut,
  }), [user, token, loading, signIn, signUp, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
