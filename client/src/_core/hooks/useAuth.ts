import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";

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
  const utils = trpc.useUtils();
  const mockAuthEnabled = import.meta.env.VITE_MOCK_AUTH === "true";

  // Use mock user if mock auth is enabled
  const meQuery = mockAuthEnabled
    ? { 
        data: MOCK_USER, 
        isLoading: false, 
        error: null, 
        refetch: async () => ({ data: MOCK_USER }) 
      }
    : trpc.auth.me.useQuery(undefined, {
        retry: false,
        refetchOnWindowFocus: false,
      });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
    },
  });

  const logout = useCallback(async () => {
    try {
      if (mockAuthEnabled) {
        return;
      }
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        return;
      }
      throw error;
    } finally {
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    }
  }, [logoutMutation, utils, mockAuthEnabled]);

  const state = useMemo(() => {
    localStorage.setItem(
      "manus-runtime-user-info",
      JSON.stringify(meQuery.data)
    );
    return {
      user: meQuery.data ?? null,
      loading: meQuery.isLoading || logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(meQuery.data),
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (meQuery.isLoading || logoutMutation.isPending) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    
    // Skip redirect in mock auth mode
    if (mockAuthEnabled) return;
    
    const finalRedirectPath = redirectPath || getLoginUrl();
    if (window.location.pathname === finalRedirectPath) return;

    window.location.href = finalRedirectPath;
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    logoutMutation.isPending,
    meQuery.isLoading,
    state.user,
    mockAuthEnabled,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
