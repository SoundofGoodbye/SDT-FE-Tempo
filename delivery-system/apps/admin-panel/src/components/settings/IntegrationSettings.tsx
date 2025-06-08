"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { IntegrationSettings as IntegrationSettingsType } from "@/types/company-settings";
import { Webhook, BarChart3, Key, ExternalLink } from "lucide-react";

interface IntegrationSettingsProps {
  initialData: IntegrationSettingsType;
  onSave: (data: IntegrationSettingsType) => Promise<void>;
  loading?: boolean;
}

export default function IntegrationSettings({
  initialData,
  onSave,
  loading = false,
}: IntegrationSettingsProps) {
  const [formData, setFormData] =
    useState<IntegrationSettingsType>(initialData);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (
    field: keyof IntegrationSettingsType,
    value: string | boolean,
  ) => {
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
          <ExternalLink className="h-5 w-5" />
          Integration Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhookUrl" className="flex items-center gap-2">
                <Webhook className="h-4 w-4" />
                Webhook URL
              </Label>
              <Input
                id="webhookUrl"
                type="url"
                value={formData.webhookUrl}
                onChange={(e) => handleChange("webhookUrl", e.target.value)}
                className="w-full"
                placeholder="https://your-domain.com/webhook"
              />
              <p className="text-xs text-muted-foreground">
                URL to receive real-time notifications about orders, deliveries,
                and alerts
              </p>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <BarChart3 className="h-4 w-4" />
                  Analytics Export
                </Label>
                <p className="text-xs text-muted-foreground">
                  Enable automated export of analytics data to external systems
                </p>
              </div>
              <Switch
                checked={formData.analyticsExportEnabled}
                onCheckedChange={(checked) =>
                  handleChange("analyticsExportEnabled", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Key className="h-4 w-4" />
                  API Access
                </Label>
                <p className="text-xs text-muted-foreground">
                  Allow third-party applications to access your data via API
                </p>
              </div>
              <Switch
                checked={formData.apiAccessEnabled}
                onCheckedChange={(checked) =>
                  handleChange("apiAccessEnabled", checked)
                }
              />
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Coming Soon</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Third-party logistics integrations</li>
              <li>• Payment gateway configurations</li>
              <li>• Custom notification channels</li>
              <li>• Advanced API rate limiting</li>
            </ul>
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
