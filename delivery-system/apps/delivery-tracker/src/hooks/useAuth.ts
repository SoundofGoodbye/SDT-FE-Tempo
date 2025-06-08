// apps/delivery-tracker/src/hooks/useAuth.ts (or wherever you want to place it in your app)
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { logout, logoutAllSessions, NavigationCallback } from "@delivery-system/api-client";

export function useAuth() {
    const router = useRouter();

    const navigate: NavigationCallback = useCallback((path: string) => {
        router.push(path);
    }, [router]);

    const handleLogout = useCallback(async () => {
        await logout(navigate);
    }, [navigate]);

    const handleLogoutAllSessions = useCallback(async () => {
        await logoutAllSessions(navigate);
    }, [navigate]);

    return {
        logout: handleLogout,
        logoutAllSessions: handleLogoutAllSessions,
    };
}