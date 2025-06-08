// delivery-system/packages/hooks/src/useRequireAuth.tsx
import { useEffect, useCallback, useRef } from "react";
import { isAuthenticated, refreshAccessToken, logout, NavigationCallback } from "@delivery-system/api-client";

interface UseRequireAuthOptions {
  navigate: NavigationCallback;
  currentPath: string;
  redirectPath?: string;
}

export function useRequireAuth({
                                 navigate,
                                 currentPath,
                                 redirectPath = "/"
                               }: UseRequireAuthOptions) {
  const isChecking = useRef(false);

  const checkAuth = useCallback(async () => {
    if (typeof window === "undefined") return;

    // Prevent multiple simultaneous checks
    if (isChecking.current) return;

    // Don't check auth on login page to prevent redirect loop
    if (currentPath === "/" || currentPath === "/login") return;

    isChecking.current = true;

    try {
      if (!isAuthenticated()) {
        // No valid tokens, redirect to login
        await logout(navigate);
        return;
      }

      // Set up periodic token refresh (every 10 minutes)
      const refreshInterval = setInterval(async () => {
        const newToken = await refreshAccessToken();
        if (!newToken) {
          clearInterval(refreshInterval);
          await logout(navigate);
        }
      }, 10 * 60 * 1000); // 10 minutes

      // Return cleanup function
      return () => clearInterval(refreshInterval);
    } finally {
      isChecking.current = false;
    }
  }, [navigate, currentPath]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    checkAuth().then((cleanupFn) => {
      cleanup = cleanupFn;
    });

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [checkAuth]);
}