"use client";

import { useState } from "react";
import { ChevronDown, User, Settings, RotateCcw, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UserDropdownProps {
  onLogout: () => void;
  isCollapsed?: boolean;
}

export default function UserDropdown({
  onLogout,
  isCollapsed = false,
}: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Mock user data - in a real app this would come from useUser() or session context
  const user = {
    name: "Martin Atanasov",
    email: "martinatanasov@musala",
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=martin`,
  };

  const handleSetStatus = () => {
    // Stub for Set Status functionality
    console.log("Set Status clicked");
  };

  const handleEditProfile = () => {
    // Stub for Edit Profile functionality
    console.log("Edit Profile clicked");
  };

  const handlePreferences = () => {
    // Stub for Preferences functionality
    console.log("Preferences clicked");
  };

  const handleSwitchAccount = () => {
    // Stub for Switch Account functionality
    console.log("Switch Account clicked");
  };

  if (isCollapsed) {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-full p-0 hover:bg-accent"
            title={user.name}
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSetStatus}>
            <User className="mr-2 h-4 w-4" />
            <span>Set Status</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEditProfile}>
            <User className="mr-2 h-4 w-4" />
            <span>Edit Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePreferences}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Preferences</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSwitchAccount}>
            <RotateCcw className="mr-2 h-4 w-4" />
            <span>Switch Account</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={onLogout}
            className="text-red-600 focus:text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start px-3 py-2 h-auto hover:bg-accent",
            "flex items-center gap-3",
          )}
        >
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full flex-shrink-0"
          />
          <div className="flex-1 text-left min-w-0">
            <div className="text-sm font-medium truncate">{user.name}</div>
            <div className="text-xs text-muted-foreground truncate">
              {user.email}
            </div>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform duration-200 flex-shrink-0",
              isOpen && "rotate-180",
            )}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSetStatus}>
          <User className="mr-2 h-4 w-4" />
          <span>Set Status</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEditProfile}>
          <User className="mr-2 h-4 w-4" />
          <span>Edit Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePreferences}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Preferences</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSwitchAccount}>
          <RotateCcw className="mr-2 h-4 w-4" />
          <span>Switch Account</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onLogout}
          className="text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
