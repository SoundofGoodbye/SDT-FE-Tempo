import { useState, useEffect } from "react";

export interface User {
  id: string;
  email: string;
  role: "Admin" | "Manager";
  companyId?: string;
  name: string;
}

// Mock user data - replace with actual authentication logic
const mockUser: User = {
  id: "1",
  email: "admin@example.com",
  role: "Admin",
  name: "John Admin",
};

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUser(mockUser);
      setLoading(false);
    }, 100);
  }, []);

  return { user, loading };
}
