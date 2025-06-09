//delivery-system/apps/admin-panel/src/components/shops/ShopFormModal.tsx
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
import { Shop, ShopFormData } from "@/types/company";
import { Loader2 } from "lucide-react";

interface ShopFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ShopFormData) => void;
  shop?: Shop | null;
  isLoading?: boolean;
}

const initialFormData: ShopFormData = {
  name: "",
  address: "",
  status: "Active",
};

export default function ShopFormModal({
  isOpen,
  onClose,
  onSubmit,
  shop,
  isLoading = false,
}: ShopFormModalProps) {
  const [formData, setFormData] = useState<ShopFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<ShopFormData>>({});

  const isEditing = !!shop;

  useEffect(() => {
    if (shop) {
      setFormData({
        name: shop.name,
        address: shop.address,
        status: shop.status,
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [shop, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ShopFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Shop name is required";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof ShopFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
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
          <DialogTitle>{isEditing ? "Edit Shop" : "Add New Shop"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the shop information below."
              : "Fill in the details to add a new shop location."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Shop Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Enter shop name"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="123 Main St, City, State 12345"
              disabled={isLoading}
            />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: "Active" | "Inactive") =>
                handleInputChange("status", value)
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
              {isEditing ? "Update Shop" : "Add Shop"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
