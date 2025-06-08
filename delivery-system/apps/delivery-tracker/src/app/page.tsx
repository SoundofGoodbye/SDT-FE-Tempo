"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from '@delivery-system/api-client';
import { LoginForm } from "@delivery-system/ui-components";

export default function Home() {
    const router = useRouter();

    // Check if user is already authenticated
    useEffect(() => {
        if (isAuthenticated()) {
            router.push("/dashboard");
        }
    }, [router]);

    // Navigation callback for LoginForm
    const handleNavigate = (path: string) => {
        router.push(path);
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 bg-background">
            <div className="w-full max-w-7xl">
                <LoginForm onNavigate={handleNavigate} />

                <footer className="mt-12 pt-4 border-t text-center text-sm text-muted-foreground">
                    <p>© {new Date().getFullYear()} SimpleDeliveryTracker</p>
                </footer>
            </div>
        </main>
    );
}