"use client";

import React from "react";
import { hasRole } from '@delivery-system/api-client';
import { Alert, AlertDescription } from "@delivery-system/ui-components";
import { ShieldOff } from "lucide-react";
import VersionList from "@/components/feature/VersionList";

interface RoleGuardProps {
    roles: string[];
    children: React.ReactNode;
    fallback?: React.ReactNode;
    requireAll?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
                                                        roles,
                                                        children,
                                                        fallback,
                                                        requireAll = false
                                                    }) => {
    const hasRequiredRole = requireAll
        ? roles.every(role => hasRole(role))
        : roles.some(role => hasRole(role));

    if (!hasRequiredRole) {
        return fallback || (
            <Alert variant="destructive" className="max-w-md mx-auto mt-8">
                <ShieldOff className="h-4 w-4" />
                <AlertDescription>
                    You don't have permission to access this content.
                </AlertDescription>
            </Alert>
        );
    }

    return <>{children}</>;
};
export default RoleGuard;