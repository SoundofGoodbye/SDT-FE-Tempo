"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { useRequireAuth } from "@delivery-system/hooks";

interface AuthWrapperProps {
    children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
    const router = useRouter();
    const pathname = usePathname();

    useRequireAuth({
        navigate: (path) => router.push(path),
        currentPath: pathname,
        redirectPath: "/login"
    });

    return <>{children}</>;
}