import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldX, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface ForbiddenPageProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
}

export default function ForbiddenPage({
  title = "Access Denied",
  description = "You don't have permission to access this page. Please contact your administrator if you believe this is an error.",
  showBackButton = true,
}: ForbiddenPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <ShieldX className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-destructive mb-2">
              403 - {title}
            </CardTitle>
            <CardDescription className="text-base">
              {description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {showBackButton && (
            <Link href="/insights">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
