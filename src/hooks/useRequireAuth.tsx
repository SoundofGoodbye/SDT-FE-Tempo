import { useRouter, usePathname } from "next/navigation";
import { useEffect, useCallback, useRef } from "react";
import { isAuthenticated, refreshAccessToken, logout } from "@/lib/api/auth-service";

export function useRequireAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const isChecking = useRef(false);

  const checkAuth = useCallback(async () => {
    if (typeof window === "undefined") return;

    // Prevent multiple simultaneous checks
    if (isChecking.current) return;

    // Don't check auth on login page to prevent redirect loop
    if (pathname === "/" || pathname === "/login") return;

    isChecking.current = true;

    try {
      if (!isAuthenticated()) {
        // No valid tokens, redirect to login
        await logout(router);
        return;
      }

      // Set up periodic token refresh (every 10 minutes)
      const refreshInterval = setInterval(async () => {
        const newToken = await refreshAccessToken();
        if (!newToken) {
          clearInterval(refreshInterval);
          await logout(router);
        }
      }, 10 * 60 * 1000); // 10 minutes

      // Return cleanup function
      return () => clearInterval(refreshInterval);
    } finally {
      isChecking.current = false;
    }
  }, [router, pathname]);

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