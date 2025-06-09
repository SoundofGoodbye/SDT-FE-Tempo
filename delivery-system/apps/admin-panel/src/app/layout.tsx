"use client";

import { TempoInit } from "@/components/tempo-init";
import Sidebar from "@/components/Sidebar";
import { Inter } from "next/font/google";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { AuthWrapper } from "@/components/AuthWrapper";
import { isAuthenticated } from "@delivery-system/api-client";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuth = isAuthenticated();
  const isLoginPage = pathname === "/login";

  // Show sidebar only when authenticated and not on login page
  const shouldShowSidebar = isAuth && !isLoginPage;

  return (
      <html lang="en" suppressHydrationWarning>
      <Script src="https://api.tempolabs.ai/proxy-asset?url=https://storage.googleapis.com/tempo-public-assets/error-handling.js" />
      <body className={inter.className}>
      <AuthWrapper>
        {shouldShowSidebar ? (
            <div className="flex flex-col lg:flex-row h-screen bg-background">
              <Sidebar />
              <main className="flex-1 overflow-auto">{children}</main>
            </div>
        ) : (
            <main className="min-h-screen bg-background">{children}</main>
        )}
      </AuthWrapper>
      <TempoInit />
      </body>
      </html>
  );
}