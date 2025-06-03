import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isTokenExpired, logout } from "@/lib/api/auth-service";

export function useRequireAuth() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken");
      if (!token || isTokenExpired(token)) {
        logout(router);
      }
    }
  }, [router]);
}
