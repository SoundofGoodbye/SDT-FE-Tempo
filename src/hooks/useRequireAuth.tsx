import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isAuthenticated, logout } from "@/lib/api/auth-service";

export function useRequireAuth() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined" && !isAuthenticated()) {
      logout(router);
    }
  }, [router]);
}
