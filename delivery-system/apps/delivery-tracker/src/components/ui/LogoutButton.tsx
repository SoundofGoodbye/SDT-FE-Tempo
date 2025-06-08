// delivery-system/apps/delivery-tracker/src/components/ui/LogoutButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { LogoutButton as BaseLogoutButton } from "@delivery-system/ui-components";

interface LogoutButtonProps {
    className?: string;
    showAllSessionsOption?: boolean;
}

export function LogoutButton(props: LogoutButtonProps) {
    const router = useRouter();

    const handleNavigate = (path: string) => {
        router.push(path);
    };

    return <BaseLogoutButton {...props} onNavigate={handleNavigate} />;
}