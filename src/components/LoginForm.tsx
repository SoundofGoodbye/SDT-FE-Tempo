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
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Loader2 } from "lucide-react";

interface LoginFormProps {
  onLoginSuccess?: (authToken: string, companyId: number) => void;
}

const LoginForm = ({ onLoginSuccess = () => {} }: LoginFormProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Mock authentication - replace with actual API call
      // const response = await fetch('http://localhost:8080/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ username, password }),
      // });

      // if (!response.ok) {
      //   throw new Error('Authentication failed');
      // }

      // const data = await response.json();
      // localStorage.setItem('authToken', data.token);
      // localStorage.setItem('userId', data.userId);
      // localStorage.setItem('companyId', data.companyId);

      // Simulate network delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check for valid credentials
      if (
        (username === "admin@sdt.com" && password === "123456") ||
        (username === "manager@sdt.com" && password === "123456") ||
        (username === "delivery_guy@sdt.com" && password === "123456")
      ) {
        // Base64 encode username:password for Basic Auth
        const authToken = 'Basic ' + btoa(username + ':' + password);

        // Pass the auth token and company ID to the parent component
        onLoginSuccess(authToken, 1);
        router.push("/dashboard");
      } else {
        throw new Error("Invalid username or password");
      }
    } catch (err) {
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
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
