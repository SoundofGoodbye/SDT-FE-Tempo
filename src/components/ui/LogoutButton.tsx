"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "./button";
import { logout } from "@/lib/api/auth-service";

interface LogoutButtonProps {
  className?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ className }) => {
  const router = useRouter();

  const handleLogout = () => {
    logout(router);
  };

  return (
      <Button
          variant="outline"
          onClick={handleLogout}
          className={className}
      >
        Logout
      </Button>
  );
};

export default LogoutButton;
