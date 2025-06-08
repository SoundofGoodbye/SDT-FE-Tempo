"use client";

import { TempoInit } from "@/components/tempo-init";
import Sidebar from "@/components/Sidebar";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem("isAuthenticated") === "true";
      setIsAuthenticated(authStatus);
      setIsLoading(false);
    };

    checkAuth();

    // Listen for storage changes (when user logs in/out)
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  const shouldShowSidebar =
    isAuthenticated && pathname !== "/login" && !isLoading;

  if (isLoading) {
    return (
      <html lang="en" suppressHydrationWarning>
        <Script src="https://api.tempolabs.ai/proxy-asset?url=https://storage.googleapis.com/tempo-public-assets/error-handling.js" />
        <body className={inter.className}>
          <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
          <TempoInit />
        </body>
      </html>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <Script src="https://api.tempolabs.ai/proxy-asset?url=https://storage.googleapis.com/tempo-public-assets/error-handling.js" />
      <body className={inter.className}>
        {shouldShowSidebar ? (
          <div className="flex flex-col lg:flex-row h-screen bg-background">
            <Sidebar />
            <main className="flex-1 overflow-auto">{children}</main>
          </div>
        ) : (
          <main className="min-h-screen bg-background">{children}</main>
        )}
        <TempoInit />
      </body>
    </html>
  );
}
