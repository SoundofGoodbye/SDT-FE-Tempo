"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DeliveryDashboard } from "@/components/DeliveryDashboard";
import DeliveriesCalendarPage from "@/components/DeliveriesCalendarPage";

export default function DashboardPage() {
  const [user, setUser] = useState<{ name: string; companyId: number } | null>(
    null,
  );
  const router = useRouter();

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

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("companyId");
    router.push("/");
  };

  if (!user) {
    return null; // Or a loading spinner
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 bg-background">
      <div className="w-full max-w-7xl">
        <header className="flex justify-between items-center mb-8 pb-4 border-b">
          <h1 className="text-2xl font-bold">SimpleDeliveryTracker</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.name}
            </span>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </header>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="history">Delivery History</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard" className="w-full">
            <DeliveryDashboard companyId={user?.companyId || 1} />
          </TabsContent>
          <TabsContent value="history">
            <div className="text-center py-12">
              <h2 className="text-xl font-medium">Delivery History</h2>
              <p className="text-muted-foreground mt-2">
                View your past deliveries and compare versions
              </p>
              <div className="mt-8">
                {/* Delivery History component would be rendered here */}
                <p>Delivery history will be displayed here</p>
              </div>
            </div>
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
