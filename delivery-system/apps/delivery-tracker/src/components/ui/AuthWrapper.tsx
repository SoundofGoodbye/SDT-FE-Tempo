"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { isAuthenticated, logout } from '@delivery-system/api-client';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === "/") {
      return;
    }
    if (!isAuthenticated()) {
      // Create navigation callback
      const navigate = (path: string) => router.push(path);
      logout(navigate);
    }
  }, [router, pathname]);

  return <>{children}</>;
}