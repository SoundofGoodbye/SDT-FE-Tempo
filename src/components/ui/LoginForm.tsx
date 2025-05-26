"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./card";
import { Input } from "./input";
import { Label } from "./label";
import { Button } from "./button";
import { Alert, AlertDescription } from "./alert";
import { Loader2 } from "lucide-react";
import { login } from "@/lib/api/auth-service";

interface LoginFormProps {
  onLoginSuccess?: (authToken: string, companyId: number) => void;
}

const LoginForm = ({ onLoginSuccess = () => {} }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Use the shared login function
      const data = await login({ email, password });

      // Call the parent callback, if provided
      onLoginSuccess(data.accessToken, data.companyId || 1);
      router.push("/dashboard");
    } catch (err: any) {
      setError(
          err instanceof Error ? err.message : "Login failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="flex justify-center items-center min-h-[350px] bg-background">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Login
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access SimpleDeliveryTracker
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="text"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                ) : (
                    "Login"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center">
            <p className="text-sm text-muted-foreground mb-1">
              Demo users available:
            </p>
            <ul className="text-xs text-muted-foreground">
              <li>admin@sdt.com / 123456</li>
              <li>manager@sdt.com / 123456</li>
              <li>delivery_guy@sdt.com / 123456</li>
            </ul>
          </CardFooter>
        </Card>
      </div>
  );
};

export default LoginForm;
