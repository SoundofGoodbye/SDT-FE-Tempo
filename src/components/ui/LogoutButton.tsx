"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, LogOutIcon } from "lucide-react";
import { logout, logoutAllSessions } from "@/lib/api/auth-service";

interface LogoutButtonProps {
    className?: string;
    showAllSessionsOption?: boolean;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
                                                       className,
                                                       showAllSessionsOption = true
                                                   }) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogout = async () => {
        setIsLoading(true);
        await logout(router);
        setIsLoading(false);
    };

    const handleLogoutAll = async () => {
        setIsLoading(true);
        await logoutAllSessions(router);
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

export default LogoutButton;