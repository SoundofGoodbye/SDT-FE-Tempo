import { useRouter } from "next/navigation";
import { useEffect, useCallback } from "react";
import { isAuthenticated, refreshAccessToken, logout } from "@/lib/api/auth-service";

export function useRequireAuth() {
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    if (typeof window === "undefined") return;

    if (!isAuthenticated()) {
      // No valid tokens, redirect to login
      logout(router);
      return;
    }

    // Set up periodic token refresh (every 10 minutes)
    const refreshInterval = setInterval(async () => {
      const newToken = await refreshAccessToken();
      if (!newToken) {
        clearInterval(refreshInterval);
        logout(router);
      }
    }, 10 * 60 * 1000); // 10 minutes

    // Return cleanup function
    return () => clearInterval(refreshInterval);
  }, [router]);

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