"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Account, AccountFormData } from "@/types/company";
import { Loader2 } from "lucide-react";
import { useCompanyList } from "@/hooks/useCompanyList";

interface AccountFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AccountFormData) => void;
  account?: Account | null;
  isLoading?: boolean;
  userRole?: string | null;
  assignedCompanyId?: string | null;
}

const initialFormData: AccountFormData = {
  name: "",
  email: "",
  role: "Shop Assistant",
  status: "Active",
  companyId: "",
};

export default function AccountFormModal({
  isOpen,
  onClose,
  onSubmit,
  account,
  isLoading = false,
  userRole,
  assignedCompanyId,
}: AccountFormModalProps) {
  const [formData, setFormData] = useState<AccountFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<AccountFormData>>({});
  const { allCompanies } = useCompanyList();

  const isEditing = !!account;
  const isManager = userRole === "manager";

  // Available roles based on user type
  const availableRoles = isManager
    ? ["Manager", "Shop Assistant", "Delivery"]
    : ["Admin", "Manager", "Shop Assistant", "Delivery"];

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name,
        email: account.email,
        role: account.role,
        status: account.status,
        companyId: account.companyId || "",
      });
    } else {
      const defaultFormData = { ...initialFormData };
      // For managers, pre-select their company
      if (isManager && assignedCompanyId) {
        defaultFormData.companyId = assignedCompanyId;
      }
      setFormData(defaultFormData);
    }
    setErrors({});
  }, [account, isOpen, isManager, assignedCompanyId]);

  const validateForm = (): boolean => {
    const newErrors: Partial<AccountFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Company is required for non-admin roles
    if (formData.role !== "Admin" && !formData.companyId) {
      newErrors.companyId = "Company is required for this role";
    }

    // Managers can only create users for their own company
    if (
      isManager &&
      assignedCompanyId &&
      formData.companyId !== assignedCompanyId
    ) {
      newErrors.companyId =
        "You can only create users for your assigned company";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = { ...formData };
      // Remove companyId for Admin role
      if (submitData.role === "Admin") {
        submitData.companyId = undefined;
      }
      onSubmit(submitData);
    }
  };

  const handleInputChange = (field: keyof AccountFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleRoleChange = (role: AccountFormData["role"]) => {
    const newFormData = { ...formData, role };
    // Clear company for Admin role
    if (role === "Admin") {
      newFormData.companyId = "";
    } else if (isManager && assignedCompanyId) {
      // Set manager's company for non-admin roles
      newFormData.companyId = assignedCompanyId;
    }
    setFormData(newFormData);

    // Clear company error if role is Admin
    if (role === "Admin" && errors.companyId) {
      setErrors((prev) => ({ ...prev, companyId: undefined }));
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Account" : "Add New Account"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the account information below."
              : "Fill in the details to add a new user account."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter full name"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="user@example.com"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value: AccountFormData["role"]) =>
                  handleRoleChange(value)
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: AccountFormData["status"]) =>
                  handleInputChange("status", value)
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.role !== "Admin" && (
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Select
                value={formData.companyId}
                onValueChange={(value) => handleInputChange("companyId", value)}
                disabled={isLoading || (isManager && !!assignedCompanyId)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {allCompanies
                    .filter((company) => {
                      // Managers can only select their assigned company
                      if (isManager && assignedCompanyId) {
                        return company.id === assignedCompanyId;
                      }
                      return true;
                    })
                    .map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.companyId && (
                <p className="text-sm text-destructive">{errors.companyId}</p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditing ? "Update Account" : "Add Account"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
