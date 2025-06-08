// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@delivery-system/ui-components";
import { DeliveryDashboard } from "@/components/feature/DeliveryDashboard";
import DeliveryHistory from "@/components/feature/DeliveryHistory";
import { DashboardSearch } from "@/components/feature/DashboardSearch"; // Use app wrapper
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { getCompanyId, getUserEmail } from '@delivery-system/api-client';

// Tab labels - ready for multi-language support
const tabLabels = {
  dashboard: "Dashboard",
  history: "Delivery History"
};

export default function DashboardPage() {
  const [user, setUser] = useState<{ email: string | null; companyId: number | null} | null>(
      null,
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tabParam, setTabParam] = useState<string | null>("dashboard");

  // Use the auth hook to protect this page
  useRequireAuth();

  useEffect(() => {
    // Set user data from auth cookies
    const userEmail = getUserEmail();
    const companyId = getCompanyId();

    setUser({
      email: userEmail,
      companyId: companyId,
    });
  }, []);

  if (!user) {
    return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
  }

  return (
      <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 bg-background">
        <Suspense fallback={<div>Loading...</div>}>
          <DashboardSearch onTabChange={setTabParam} />
        </Suspense>
        <div className="w-full max-w-7xl">

          <Tabs defaultValue={tabParam || "dashboard"} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="dashboard">{tabLabels.dashboard}</TabsTrigger>
              <TabsTrigger value="history">{tabLabels.history}</TabsTrigger>
            </TabsList>
            <TabsContent value="dashboard" className="w-full">
              <DeliveryDashboard companyId={user?.companyId || 1} />
            </TabsContent>
            <TabsContent value="history">
              <DeliveryHistory companyId={user?.companyId?.toString() || "1"} />
            </TabsContent>
          </Tabs>

          <footer className="mt-12 pt-4 border-t text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} SimpleDeliveryTracker</p>
          </footer>
        </div>
      </main>
  );
}