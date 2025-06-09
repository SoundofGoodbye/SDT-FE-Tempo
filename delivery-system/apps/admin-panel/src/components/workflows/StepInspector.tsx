//delivery-system/apps/admin-panel/src/components/workflows/StepInspector.tsx
"use client";

import { useState, useEffect } from "react";
import { WorkflowStepUI, WorkflowStepMeta } from "@delivery-system/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepInspectorProps {
  step: WorkflowStepUI | null;
  onSave: (stepId: number, updates: Partial<WorkflowStepUI>) => void;
  onRealTimeUpdate?: (stepId: number, updates: Partial<WorkflowStepUI>) => void;
  loading?: boolean;
  className?: string;
}

const colorOptions = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#10b981" },
  { name: "Yellow", value: "#f59e0b" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Red", value: "#ef4444" },
  { name: "Pink", value: "#ec4899" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Teal", value: "#14b8a6" },
];

export default function StepInspector({
                                        step,
                                        onSave,
                                        onRealTimeUpdate,
                                        loading = false,
                                        className,
                                      }: StepInspectorProps) {
  const [formData, setFormData] = useState<{
    customName?: string;
    meta?: WorkflowStepMeta;
  }>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (step) {
      setFormData({
        customName: step.customName,
        meta: { ...step.meta },
      });
      setHasChanges(false);
    }
  }, [step]);

  const handleInputChange = (field: string, value: any) => {
    if (field === "customName") {
      setFormData((prev) => ({ ...prev, customName: value }));
      setHasChanges(true);

      // Real-time update for step name
      if (onRealTimeUpdate && step) {
        onRealTimeUpdate(step.id, { customName: value });
      }
    }
  };

  const handleColorChange = (color: string) => {
    setFormData((prev) => ({
      ...prev,
      meta: {
        ...prev.meta!,
        color,
      },
    }));
    setHasChanges(true);
  };

  const handleNotificationChange = (
      type: "shopAssistant" | "customerSms",
      checked: boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      meta: {
        ...prev.meta!,
        notifications: {
          ...prev.meta!.notifications!,
          [type]: checked,
        },
      },
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (step && hasChanges) {
      onSave(step.id, formData);
      setHasChanges(false);
    }
  };

  if (!step) {
    return (
        <Card className={cn("bg-white", className)}>
          <CardContent className="p-6 text-center text-muted-foreground">
            <p>Select a workflow step to edit its properties</p>
          </CardContent>
        </Card>
    );
  }

  const isFirstStep = step.order === 0;
  const stepStats = step.meta.stats || { avgTime: 0, successRate: 100 };

  return (
      <Card className={cn("bg-white", className)}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Step Inspector</span>
            {hasChanges && (
                <Button
                    onClick={handleSave}
                    disabled={loading}
                    size="sm"
                    className="ml-2"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{step.stepKey}</Badge>
              <Badge variant="secondary">Order: {step.order}</Badge>
            </div>
          </div>

          {/* Step Name */}
          <div className="space-y-2">
            <Label htmlFor="step-name">Step Name</Label>
            <Input
                id="step-name"
                value={formData.customName || ""}
                onChange={(e) => handleInputChange("customName", e.target.value)}
                placeholder="Enter step name"
                maxLength={50}
            />
            {isFirstStep && (
                <p className="text-xs text-muted-foreground">
                  This is the initial step in the workflow
                </p>
            )}
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label>Badge Color</Label>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map((color) => (
                  <button
                      key={color.value}
                      className={cn(
                          "w-8 h-8 rounded-full border-2 transition-all",
                          formData.meta?.color === color.value
                              ? "border-gray-900 scale-110"
                              : "border-gray-200 hover:border-gray-400",
                      )}
                      style={{ backgroundColor: color.value }}
                      onClick={() => handleColorChange(color.value)}
                      title={color.name}
                  />
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-3">
            <Label>Notifications</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                    id="shop-assistant"
                    checked={formData.meta?.notifications?.shopAssistant || false}
                    onCheckedChange={(checked) =>
                        handleNotificationChange("shopAssistant", checked as boolean)
                    }
                />
                <Label htmlFor="shop-assistant" className="text-sm">
                  Notify Shop Assistant
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                    id="customer-sms"
                    checked={formData.meta?.notifications?.customerSms || false}
                    onCheckedChange={(checked) =>
                        handleNotificationChange("customerSms", checked as boolean)
                    }
                />
                <Label htmlFor="customer-sms" className="text-sm">
                  Send Customer SMS
                </Label>
              </div>
            </div>
          </div>

          {/* Stats (Read-only) */}
          <div className="space-y-3">
            <Label>Performance Stats</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Avg Time</span>
                </div>
                <div className="text-lg font-bold">{stepStats.avgTime} min</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Success Rate</span>
                </div>
                <div className="text-lg font-bold">{stepStats.successRate}%</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Performance stats are calculated from historical data
            </p>
          </div>

          {/* Save Button */}
          {hasChanges && (
              <Button onClick={handleSave} disabled={loading} className="w-full">
                {loading ? "Saving..." : "Save Changes"}
              </Button>
          )}
        </CardContent>
      </Card>
  );
}