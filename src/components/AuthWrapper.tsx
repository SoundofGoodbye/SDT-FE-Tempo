"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === "/" || pathname === "/login") {
      return;
    }

    // Check if user is authenticated
    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      router.push("/login");
    }
  }, [router, pathname]);

  return <>{children}</>;
}