"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DeliveryDashboard } from "@/components/DeliveryDashboard";
import DeliveriesCalendarPage from "@/components/DeliveriesCalendarPage";
import DeliveryHistory from "@/components/DeliveryHistory";
import { DashboardSearch } from "@/components/DashboardSearch";

export default function DashboardPage() {
  const [user, setUser] = useState<{ name: string; companyId: number } | null>(
    null,
  );
  const router = useRouter();
  const [tabParam, setTabParam] = useState<string | null>("dashboard");

  useEffect(() => {
    // Check if user is authenticated
    const authToken = localStorage.getItem("authToken");
    const userId = localStorage.getItem("userId");
    const companyId = localStorage.getItem("companyId");

    if (!authToken) {
      // Redirect to login page if not authenticated
      router.push("/");
      return;
    }

    // Set user data
    setUser({
      name: "demo", // In a real app, you would fetch the user's name
      companyId: companyId ? parseInt(companyId) : 1,
    });
  }, [router]);


  if (!user) {
    return null; // Or a loading spinner
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 bg-background">
      <Suspense fallback={<div>Loading...</div>}>
        <DashboardSearch onTabChange={setTabParam} />
      </Suspense>
      <div className="w-full max-w-7xl">

        <Tabs defaultValue={tabParam || "dashboard"} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="history">Delivery History</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard" className="w-full">
            <DeliveryDashboard companyId={user?.companyId || 1} />
          </TabsContent>
          <TabsContent value="history">
            <DeliveryHistory companyId={user?.companyId?.toString() || "1"} />
          </TabsContent>
          <TabsContent value="calendar">
            <DeliveriesCalendarPage
              companyId={user?.companyId || 1}
              shopId={1}
            />
          </TabsContent>
        </Tabs>

        <footer className="mt-12 pt-4 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} SimpleDeliveryTracker</p>
        </footer>
      </div>
    </main>
  );
}
