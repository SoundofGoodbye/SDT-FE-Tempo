// apps/admin-panel/src/hooks/useAuth.ts
import { useRouter } from "next/navigation";
import { useAuth as useAuthBase } from "@delivery-system/hooks";

// Re-export everything from the base hook
export * from "@delivery-system/hooks";

// Wrapper that provides Next.js navigation
export function useAuth() {
    const router = useRouter();
    return useAuthBase({ navigate: (path) => router.push(path) });
}