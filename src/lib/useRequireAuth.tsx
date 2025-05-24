import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isAuthenticated, logout } from "./authService";

export function useRequireAuth() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== 'undefined' && !isAuthenticated()) {
      logout(router);
    }
  }, [router]);
}
