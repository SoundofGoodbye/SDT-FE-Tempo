"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertThresholds } from "@/types/company-settings";
import { AlertTriangle, Clock, Package, TrendingDown } from "lucide-react";

interface AlertThresholdsFormProps {
  initialData: AlertThresholds;
  onSave: (data: AlertThresholds) => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
}

export default function AlertThresholdsForm({
                                              initialData,
                                              onSave,
                                              loading = false,
                                              disabled = false,
                                            }: AlertThresholdsFormProps) {
  const [formData, setFormData] = useState<AlertThresholds>(initialData);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: keyof AlertThresholds, value: number) => {
    if (disabled) return;
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    await onSave(formData);
    setHasChanges(false);
  };

  return (
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alert Thresholds
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                    htmlFor="lowAccuracyAlert"
                    className="flex items-center gap-2"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Low Accuracy Alert (%)
                </Label>
                <div className="relative">
                  <Input
                      id="lowAccuracyAlert"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.lowAccuracyAlert}
                      onChange={(e) =>
                          handleChange(
                              "lowAccuracyAlert",
                              parseInt(e.target.value) || 0,
                          )
                      }
                      className="w-full"
                      placeholder="90"
                      disabled={disabled}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  %
                </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Alert when accuracy drops below this percentage
                </p>
              </div>

              <div className="space-y-2">
                <Label
                    htmlFor="delayedDeliveryAlert"
                    className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Delayed Delivery Alert (min)
                </Label>
                <div className="relative">
                  <Input
                      id="delayedDeliveryAlert"
                      type="number"
                      min="0"
                      value={formData.delayedDeliveryAlert}
                      onChange={(e) =>
                          handleChange(
                              "delayedDeliveryAlert",
                              parseInt(e.target.value) || 0,
                          )
                      }
                      className="w-full"
                      placeholder="45"
                      disabled={disabled}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  min
                </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Alert when delivery exceeds this time
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                    htmlFor="lowStockAlert"
                    className="flex items-center gap-2"
                >
                  <Package className="h-4 w-4" />
                  Low Stock Alert (units)
                </Label>
                <Input
                    id="lowStockAlert"
                    type="number"
                    min="0"
                    value={formData.lowStockAlert}
                    onChange={(e) =>
                        handleChange("lowStockAlert", parseInt(e.target.value) || 0)
                    }
                    className="w-full"
                    placeholder="10"
                    disabled={disabled}
                />
                <p className="text-xs text-muted-foreground">
                  Alert when stock falls below this number
                </p>
              </div>

              <div className="space-y-2">
                <Label
                    htmlFor="revenueDropAlert"
                    className="flex items-center gap-2"
                >
                  <TrendingDown className="h-4 w-4" />
                  Revenue Drop Alert (%)
                </Label>
                <div className="relative">
                  <Input
                      id="revenueDropAlert"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.revenueDropAlert}
                      onChange={(e) =>
                          handleChange(
                              "revenueDropAlert",
                              parseInt(e.target.value) || 0,
                          )
                      }
                      className="w-full"
                      placeholder="20"
                      disabled={disabled}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  %
                </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Alert when daily revenue drops by this percentage
                </p>
              </div>
            </div>

            {!disabled && (
                <div className="flex justify-end">
                  <Button
                      type="submit"
                      disabled={!hasChanges || loading}
                      className="min-w-[100px]"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
            )}
          </form>
        </CardContent>
      </Card>
  );
}