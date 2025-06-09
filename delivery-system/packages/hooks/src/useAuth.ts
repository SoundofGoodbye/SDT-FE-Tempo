// packages/hooks/src/useAuth.ts
import { useCallback, useMemo } from "react";
import {
    logout,
    logoutAllSessions,
    getUserEmail,
    getUserId,
    getUserRoles,
    getCompanyId,
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getUserPermissions,
    isAuthenticated,
    ROLES,
    PERMISSIONS,
    type Permission
} from "@delivery-system/api-client";

export interface User {
    id: string;
    email: string;
    roles: string[];
    companyId: number | null;
    name: string;
}

export interface UseAuthOptions {
    navigate: (path: string) => void;
}

export function useAuth({ navigate }: UseAuthOptions) {
    // Get current user data
    const getCurrentUser = useCallback((): User | null => {
        if (!isAuthenticated()) {
            return null;
        }

        const userId = getUserId();
        const email = getUserEmail();
        const roles = getUserRoles();
        const companyId = getCompanyId();

        if (!userId || !email) {
            return null;
        }

        // Extract name from email
        const name = email.split('@')[0]
            .split('.')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');

        return {
            id: userId.toString(),
            email,
            roles,
            companyId,
            name,
        };
    }, []);

    // Logout functions
    const handleLogout = useCallback(async () => {
        await logout(navigate);
    }, [navigate]);

    const handleLogoutAllSessions = useCallback(async () => {
        await logoutAllSessions(navigate);
    }, [navigate]);

    // Memoize permission checks
    const permissions = useMemo(() => getUserPermissions(), []);

    // Permission check helpers
    const can = useCallback((permission: Permission) => {
        return hasPermission(permission);
    }, []);

    const canAny = useCallback((permissions: Permission[]) => {
        return hasAnyPermission(permissions);
    }, []);

    const canAll = useCallback((permissions: Permission[]) => {
        return hasAllPermissions(permissions);
    }, []);

    return {
        user: getCurrentUser(),
        logout: handleLogout,
        logoutAllSessions: handleLogoutAllSessions,

        // Permission checks
        permissions,
        can,
        canAny,
        canAll,

        // Role checks (convenience methods)
        isAdmin: hasRole(ROLES.ADMIN),
        isManager: hasRole(ROLES.MANAGER),
        isShopAssistant: hasRole(ROLES.SHOP_ASSISTANT),
        isDeliveryGuy: hasRole(ROLES.DELIVERY_GUY),

        // Re-export utilities
        hasRole,
        isAuthenticated: isAuthenticated(),
    };
}

// Export constants for use in components
export { ROLES, PERMISSIONS } from "@delivery-system/api-client";