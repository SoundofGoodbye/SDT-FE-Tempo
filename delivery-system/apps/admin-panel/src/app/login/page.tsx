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
import { login, hasRole, getCompanyId } from "@delivery-system/api-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Call the real API
      await login({ email, password, rememberMe });

      // Check user roles to determine redirect
      const isAdmin = hasRole("ADMIN");
      const companyId = getCompanyId();

      // Redirect based on role
      if (isAdmin) {
        router.push("/insights");
      } else if (companyId) {
        router.push(`/companies/${companyId}`);
      } else {
        // Fallback to insights if no company assigned
        router.push("/insights");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password. Please try again.");
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
              <div className="flex items-center space-x-2">
                <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="remember-me" className="text-sm font-normal cursor-pointer">
                  Remember me
                </Label>
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