"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "@/components/LoginForm";
import { DeliveryDashboard } from "@/components/DeliveryDashboard";
import { useState } from "react";

interface LoginFormProps {
  onLogin: (userData: { name: string; companyId: number }) => void;
}

interface LoginFormComponentProps {
  onLoginSuccess?: () => void;
}

export default function Home() {
  // In a real app, this would be determined by checking authentication state
  // For now, we'll use a simple state to toggle between logged in and logged out
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; companyId: number } | null>(
    null,
  );

  const handleLogin = (userData: { name: string; companyId: number }) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 bg-background">
      <div className="w-full max-w-7xl">
        <header className="flex justify-between items-center mb-8 pb-4 border-b">
          <h1 className="text-2xl font-bold">SimpleDeliveryTracker</h1>
          {isAuthenticated && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {user?.name}
              </span>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          )}
        </header>

        {!isAuthenticated ? (
          <div className="flex justify-center items-center min-h-[70vh]">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Login to SimpleDeliveryTracker</CardTitle>
                <CardDescription>
                  Enter your credentials to access your delivery dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LoginForm
                  onLoginSuccess={() =>
                    handleLogin({ name: "demo", companyId: 1 })
                  }
                />
              </CardContent>
            </Card>
          </div>
        ) : (
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="history">Delivery History</TabsTrigger>
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
          </Tabs>
        )}

        <footer className="mt-12 pt-4 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} SimpleDeliveryTracker</p>
        </footer>
      </div>
    </main>
  );
}
