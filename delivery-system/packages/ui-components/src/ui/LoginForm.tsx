// delivery-system/packages/ui-components/src/ui/LoginForm.tsx
"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./card";
import { Input } from "./input";
import { Label } from "./label";
import { Button } from "./button";
import { Alert, AlertDescription } from "./alert";
import { Checkbox } from "./checkbox";
import { Loader2 } from "lucide-react";
import { login } from '@delivery-system/api-client';

interface LoginFormProps {
  onLoginSuccess?: (authToken: string, companyId: number) => void;
  onNavigate?: (path: string) => void; // Callback for navigation
}

export const LoginForm = ({
                            onLoginSuccess = () => {},
                            onNavigate
                          }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const data = await login({
        email,
        password,
        rememberMe
      });

      onLoginSuccess(data.accessToken, data.companyId);

      // Use callback for navigation instead of router
      if (onNavigate) {
        onNavigate("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="flex justify-center items-center min-h-[450px] bg-background">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
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
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="email"
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
                    autoComplete="current-password"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    disabled={isLoading}
                />
                <Label
                    htmlFor="rememberMe"
                    className="text-sm font-normal cursor-pointer"
                >
                  Keep me logged in for 1 year (recommended for shop terminals)
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
                    </>
                ) : (
                    "Login"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center">
            <p className="text-sm text-muted-foreground mb-1">Demo users available:</p>
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