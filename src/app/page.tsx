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
import LoginForm from "@/components/LoginForm";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface LoginFormComponentProps {
  onLoginSuccess?: (authToken: string, companyId: number) => void;
}

export default function Home() {
  const router = useRouter();

  // Check if user is already authenticated
  useEffect(() => {
    const authToken = localStorage.getItem("authToken");
    if (authToken) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleLogin = (authToken: string, companyId: number) => {
    // Store user data in localStorage
    localStorage.setItem("authToken", authToken);
    localStorage.setItem("companyId", companyId.toString());

    // Redirect to dashboard
    router.push("/dashboard");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 bg-background">
      <div className="w-full max-w-7xl">
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
                onLoginSuccess={(authToken, companyId) =>
                  handleLogin(authToken, companyId)
                }
              />
            </CardContent>
          </Card>
        </div>

        <footer className="mt-12 pt-4 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} SimpleDeliveryTracker</p>
        </footer>
      </div>
    </main>
  );
}
