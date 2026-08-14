import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as authApi from "@/services/auth/authApi";
import { registerAuthFailureHandler } from "@/lib/apiClient";
import type { AdminUser } from "@/services/auth/authApi";

interface AuthContextValue {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Comfortably inside the 15-minute access-token TTL so the session is kept
// alive silently before it would ever expire mid-use.
const SILENT_REFRESH_INTERVAL_MS = 10 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const lastRefreshRef = useRef<number>(0);

  const clearSession = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const applySession = useCallback((sessionUser: AdminUser) => {
    setUser(sessionUser);
    setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      try {
        const { user: me } = await authApi.getCurrentAdmin();
        if (!cancelled) applySession(me);
      } catch {
        try {
          const { user: refreshed } = await authApi.refresh();
          if (!cancelled) {
            applySession(refreshed);
            lastRefreshRef.current = Date.now();
          }
        } catch {
          if (!cancelled) clearSession();
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [applySession, clearSession]);

  useEffect(() => {
    registerAuthFailureHandler(() => clearSession());
    return () => registerAuthFailureHandler(null);
  }, [clearSession]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const silentRefresh = async () => {
      try {
        const { user: refreshed } = await authApi.refresh();
        applySession(refreshed);
        lastRefreshRef.current = Date.now();
      } catch {
        clearSession();
      }
    };

    const interval = setInterval(silentRefresh, SILENT_REFRESH_INTERVAL_MS);

    // Browsers throttle setInterval in backgrounded tabs — catch up on refocus.
    const onVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        Date.now() - lastRefreshRef.current > SILENT_REFRESH_INTERVAL_MS
      ) {
        silentRefresh();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [isAuthenticated, applySession, clearSession]);

  const login = useCallback(
    async (username: string, password: string) => {
      const { user: loggedInUser } = await authApi.login(username, password);
      applySession(loggedInUser);
      lastRefreshRef.current = Date.now();
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    clearSession();
  }, [clearSession]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
