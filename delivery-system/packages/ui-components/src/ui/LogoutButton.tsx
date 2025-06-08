//delivery-system/packages/ui-components/src/ui/LogoutButton.tsx
"use client";

import React, { useState } from "react";
import { Button } from "./button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./dropdown-menu";
import { LogOut, LogOutIcon } from "lucide-react";
import { logout, logoutAllSessions, NavigationCallback } from '@delivery-system/api-client';

interface LogoutButtonProps {
    className?: string;
    showAllSessionsOption?: boolean;
    onNavigate?: NavigationCallback; // Navigation callback
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
                                                              className,
                                                              showAllSessionsOption = true,
                                                              onNavigate
                                                          }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        setIsLoading(true);
        await logout(onNavigate);
        setIsLoading(false);
    };

    const handleLogoutAll = async () => {
        setIsLoading(true);
        await logoutAllSessions(onNavigate);
        setIsLoading(false);
    };

    if (!showAllSessionsOption) {
        return (
            <Button
                variant="outline"
                onClick={handleLogout}
                className={className}
                disabled={isLoading}
            >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    className={className}
                    disabled={isLoading}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuItem onClick={handleLogout}>
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    Logout this device
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogoutAll} className="text-destructive">
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    Logout all devices
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};