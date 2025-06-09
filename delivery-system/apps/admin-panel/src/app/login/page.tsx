"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Mock authentication - in a real app, this would call an API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock user role check - in a real app, this would come from the auth response
      let userRole = "manager";
      let assignedCompanyId = "1"; // Default assigned company for managers

      if (email === "admin@sdt.com" && password === "123456") {
        userRole = "admin";
        assignedCompanyId = null;
      } else if (email === "manager@sdt.com" && password === "123456") {
        userRole = "manager";
        assignedCompanyId = "1"; // Assigned to Acme Logistics
      } else {
        throw new Error("Invalid credentials");
      }

      // Store user info in localStorage or a state management solution
      localStorage.setItem("userRole", userRole);
      localStorage.setItem("isAuthenticated", "true");
      if (assignedCompanyId) {
        localStorage.setItem("assignedCompanyId", assignedCompanyId);
      }

      // Redirect based on role
      if (userRole === "admin") {
        router.push("/insights");
      } else {
        router.push(`/companies/${assignedCompanyId}`);
      }
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-6">
            <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground text-xl font-bold">
                L
              </span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            Login to Logistics Admin
          </CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="#" className="text-sm text-primary hover:underline">
            Go to delivery app
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
