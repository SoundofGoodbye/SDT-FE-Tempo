// delivery-system/apps/delivery-tracker/src/hooks/useRequireAuth.ts
import { useRouter, usePathname } from "next/navigation";
import { useRequireAuth as useRequireAuthBase } from "@delivery-system/hooks";

export function useRequireAuth() {
    const router = useRouter();
    const pathname = usePathname();

    const navigate = (path: string) => {
        router.push(path);
    };

    return useRequireAuthBase({
        navigate,
        currentPath: pathname,
    });
}