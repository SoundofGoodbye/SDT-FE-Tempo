"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BusinessRules } from "@/types/company-settings";
import { Clock, DollarSign, MapPin } from "lucide-react";

interface BusinessRulesFormProps {
  initialData: BusinessRules;
  onSave: (data: BusinessRules) => Promise<void>;
  loading?: boolean;
}

export default function BusinessRulesForm({
  initialData,
  onSave,
  loading = false,
}: BusinessRulesFormProps) {
  const [formData, setFormData] = useState<BusinessRules>(initialData);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: keyof BusinessRules, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    setHasChanges(false);
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Business Rules
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryStartTime">Delivery Start Time</Label>
              <Input
                id="deliveryStartTime"
                type="time"
                value={formData.deliveryStartTime}
                onChange={(e) =>
                  handleChange("deliveryStartTime", e.target.value)
                }
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryEndTime">Delivery End Time</Label>
              <Input
                id="deliveryEndTime"
                type="time"
                value={formData.deliveryEndTime}
                onChange={(e) =>
                  handleChange("deliveryEndTime", e.target.value)
                }
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="orderCutoffTime">Order Cutoff Time</Label>
            <Input
              id="orderCutoffTime"
              type="time"
              value={formData.orderCutoffTime}
              onChange={(e) => handleChange("orderCutoffTime", e.target.value)}
              className="w-full md:w-1/2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="minOrderValue"
                className="flex items-center gap-2"
              >
                <DollarSign className="h-4 w-4" />
                Minimum Order Value
              </Label>
              <Input
                id="minOrderValue"
                type="number"
                step="0.01"
                min="0"
                value={formData.minOrderValue}
                onChange={(e) =>
                  handleChange("minOrderValue", parseFloat(e.target.value) || 0)
                }
                className="w-full"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="deliveryRadius"
                className="flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" />
                Delivery Radius (km)
              </Label>
              <Input
                id="deliveryRadius"
                type="number"
                min="0"
                value={formData.deliveryRadius}
                onChange={(e) =>
                  handleChange("deliveryRadius", parseInt(e.target.value) || 0)
                }
                className="w-full"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!hasChanges || loading}
              className="min-w-[100px]"
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
