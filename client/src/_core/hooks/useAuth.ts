import { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "../../lib/api";
import { getLoginUrl } from "../../const";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

// Mock user for development
const MOCK_USER = {
  id: 1,
  name: "Demo User",
  email: "demo@realsourcing.local",
  role: "admin" as const,
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath } = options ?? {};
  const mockAuthEnabled = import.meta.env.VITE_MOCK_AUTH === "true";
  
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = useCallback(async () => {
    if (mockAuthEnabled) {
      setUser(MOCK_USER);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.getCurrentUser();
      if (response.error) {
        setError(new Error(response.error));
        setUser(null);
      } else {
        setUser(response.data);
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch user'));
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [mockAuthEnabled]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    if (mockAuthEnabled) {
      setUser(null);
      return;
    }

    try {
      await api.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  }, [mockAuthEnabled]);

  const state = useMemo(() => {
    if (user) {
      localStorage.setItem("manus-runtime-user-info", JSON.stringify(user));
    }
    return {
      user,
      loading,
      error,
      isAuthenticated: Boolean(user),
    };
  }, [user, loading, error]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (loading) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (mockAuthEnabled) return;

    const finalRedirectPath = redirectPath || getLoginUrl();
    if (window.location.pathname === finalRedirectPath) return;

    window.location.href = finalRedirectPath;
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    loading,
    state.user,
    mockAuthEnabled,
  ]);

  return {
    ...state,
    refresh: fetchUser,
    logout,
  };
}
