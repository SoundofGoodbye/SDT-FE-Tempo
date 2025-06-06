import { TempoInit } from "@/components/tempo-init";
import { Navigation } from "@/components/Navigation";
import { AuthWrapper } from "@/components/AuthWrapper";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SimpleDeliveryTracker",
  description: "Track and manage your deliveries efficiently",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <Script src="https://api.tempolabs.ai/proxy-asset?url=https://storage.googleapis.com/tempo-public-assets/error-handling.js" />
      <body className={inter.className}>
        <Suspense fallback={<div className="h-16 border-b"></div>}>
          <Navigation />
        </Suspense>
        <div className="pt-16">
          <AuthWrapper>
            {children}
          </AuthWrapper>
        </div>
        <TempoInit />
      </body>
    </html>
  );
}
