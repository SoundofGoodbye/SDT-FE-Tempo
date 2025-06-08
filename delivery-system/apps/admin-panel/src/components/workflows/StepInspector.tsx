"use client";

import { useState, useEffect } from "react";
import { WorkflowStep } from "@/types/workflow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepInspectorProps {
  step: WorkflowStep | null;
  onSave: (stepId: string, updates: Partial<WorkflowStep>) => void;
  onRealTimeUpdate?: (stepId: string, updates: Partial<WorkflowStep>) => void;
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
  const [formData, setFormData] = useState<Partial<WorkflowStep>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (step) {
      setFormData({
        name: step.name,
        color: step.color,
        notifications: { ...step.notifications },
      });
      setHasChanges(false);
    }
  }, [step]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);

    // Real-time update for step name
    if (field === "name" && onRealTimeUpdate && step) {
      onRealTimeUpdate(step.id, { [field]: value });
    }
  };

  const handleNotificationChange = (
    type: "shopAssistant" | "customerSms",
    checked: boolean,
  ) => {
    setFormData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: checked,
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

  const isStartOrEnd = step.id === "start" || step.id === "end";

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
        {/* Step Name */}
        <div className="space-y-2">
          <Label htmlFor="step-name">Step Name</Label>
          <Input
            id="step-name"
            value={formData.name || ""}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Enter step name"
          />
          {isStartOrEnd && (
            <p className="text-xs text-muted-foreground">
              {step.id === "start" ? "Initial step" : "Final step"} - can be
              renamed
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
                  formData.color === color.value
                    ? "border-gray-900 scale-110"
                    : "border-gray-200 hover:border-gray-400",
                )}
                style={{ backgroundColor: color.value }}
                onClick={() => handleInputChange("color", color.value)}
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
                checked={formData.notifications?.shopAssistant || false}
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
                checked={formData.notifications?.customerSms || false}
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
              <div className="text-lg font-bold">{step.stats.avgTime} min</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Success Rate</span>
              </div>
              <div className="text-lg font-bold">{step.stats.successRate}%</div>
            </div>
          </div>
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
