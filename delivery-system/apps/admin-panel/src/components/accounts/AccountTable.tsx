"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Edit,
  Trash2,
  Users,
  Shield,
  ShieldOff,
  Building2,
} from "lucide-react";
import { Account } from "@/types/company";
import { cn } from "@/lib/utils";

interface AccountTableProps {
  accounts: Account[];
  onEdit?: (account: Account) => void;
  onDelete?: (id: string) => void;
  onSuspend?: (id: string) => void;
  onReactivate?: (id: string) => void;
  userRole?: string | null;
}

export default function AccountTable({
  accounts,
  onEdit,
  onDelete,
  onSuspend,
  onReactivate,
  userRole,
}: AccountTableProps) {
  const formatLastActive = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays}d ago`;
      } else {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }
    }
  };

  const getRoleColor = (role: Account["role"]) => {
    switch (role) {
      case "Admin":
        return "destructive";
      case "Manager":
        return "default";
      case "Shop Assistant":
        return "secondary";
      case "Delivery":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: Account["status"]) => {
    switch (status) {
      case "Active":
        return "default";
      case "Suspended":
        return "destructive";
      default:
        return "outline";
    }
  };

  if (accounts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No accounts found</h3>
          <p className="text-muted-foreground text-center">
            No accounts match your current filters. Try adjusting your search or
            filter criteria.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-center">Role</TableHead>
                {userRole === "admin" && (
                  <TableHead className="text-center">Company</TableHead>
                )}
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Last Active</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    <div className="font-medium">{account.name}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {account.email}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getRoleColor(account.role)}>
                      {account.role}
                    </Badge>
                  </TableCell>
                  {userRole === "admin" && (
                    <TableCell className="text-center">
                      {account.companyName ? (
                        <div className="flex items-center justify-center gap-1">
                          <Building2 className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{account.companyName}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="text-center">
                    <Badge variant={getStatusColor(account.status)}>
                      {account.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {formatLastActive(account.lastActive)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(account)}
                          className="h-8 w-8 p-0"
                          title="Edit account"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {account.status === "Active" && onSuspend && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSuspend(account.id)}
                          className="h-8 w-8 p-0 text-orange-600 hover:text-orange-600"
                          title="Suspend account"
                        >
                          <ShieldOff className="h-4 w-4" />
                        </Button>
                      )}
                      {account.status === "Suspended" && onReactivate && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onReactivate(account.id)}
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-600"
                          title="Reactivate account"
                        >
                          <Shield className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && account.role !== "Admin" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(account.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          title="Delete account"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
