"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isAuthenticated, logout } from "@/lib/api/auth-service";

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
      logout(router);
    }
  }, [router, pathname]);

  return <>{children}</>;
}
