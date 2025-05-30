"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { logout } from "../lib/authService";

interface LogoutButtonProps {
  className?: string;
}

/**
 * A button component that logs out the user when clicked
 */
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