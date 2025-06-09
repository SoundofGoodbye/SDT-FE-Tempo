"use client";

import {
  useCompanySettings,
  useUpdateCompanySettings,
} from "@/hooks/useCompanySettings";
import { useAuth, PERMISSIONS } from "@/hooks/useAuth";
import BusinessRulesForm from "@/components/settings/BusinessRulesForm";
import AlertThresholdsForm from "@/components/settings/AlertThresholdsForm";
import IntegrationSettings from "@/components/settings/IntegrationSettings";
import ForbiddenPage from "@/components/system/ForbiddenPage";
import {
  BusinessRules,
  AlertThresholds,
  IntegrationSettings as IntegrationSettingsType,
} from "@/types/company-settings";
import { Settings } from "lucide-react";
import { getCompanyId } from "@delivery-system/api-client";

export default function SettingsPage() {
  // Use the new auth hook
  const { can } = useAuth();
  const userCompanyId = getCompanyId();

  const { settings, loading: settingsLoading } = useCompanySettings(
      userCompanyId?.toString() || "",
  );
  const { updateSettings, loading: updateLoading } = useUpdateCompanySettings();

  // Check permissions
  const canViewSettings = can(PERMISSIONS.SETTINGS_VIEW);
  const canEditSettings = can(PERMISSIONS.SETTINGS_EDIT);

  // Show loading state for settings only
  if (settingsLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );
  }

  // Check if user has permission to view settings
  if (!canViewSettings) {
    return (
        <ForbiddenPage
            title="Settings Access Denied"
            description="You don't have permission to view company settings. Please contact your administrator if you need access."
        />
    );
  }

  if (!settings || !userCompanyId) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center">
            <p className="text-muted-foreground">Failed to load settings</p>
          </div>
        </div>
    );
  }

  const handleBusinessRulesSave = async (data: BusinessRules) => {
    if (!canEditSettings) return;

    await updateSettings(userCompanyId.toString(), {
      businessRules: data,
      alertThresholds: settings.alertThresholds,
      integrationSettings: settings.integrationSettings,
    });
  };

  const handleAlertThresholdsSave = async (data: AlertThresholds) => {
    if (!canEditSettings) return;

    await updateSettings(userCompanyId.toString(), {
      businessRules: settings.businessRules,
      alertThresholds: data,
      integrationSettings: settings.integrationSettings,
    });
  };

  const handleIntegrationSettingsSave = async (
      data: IntegrationSettingsType,
  ) => {
    if (!canEditSettings) return;

    await updateSettings(userCompanyId.toString(), {
      businessRules: settings.businessRules,
      alertThresholds: settings.alertThresholds,
      integrationSettings: data,
    });
  };

  return (
      <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Settings className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-gray-900">
                Company Settings
              </h1>
            </div>
            <p className="text-gray-600">
              {canEditSettings
                  ? "Configure business rules, alert thresholds, and integration settings for your company."
                  : "View your company's business rules, alert thresholds, and integration settings."}
            </p>
          </div>

          <div className="space-y-8">
            <BusinessRulesForm
                initialData={settings.businessRules}
                onSave={handleBusinessRulesSave}
                loading={updateLoading}
                disabled={!canEditSettings}
            />

            <AlertThresholdsForm
                initialData={settings.alertThresholds}
                onSave={handleAlertThresholdsSave}
                loading={updateLoading}
                disabled={!canEditSettings}
            />

            <IntegrationSettings
                initialData={settings.integrationSettings}
                onSave={handleIntegrationSettingsSave}
                loading={updateLoading}
                disabled={!canEditSettings}
            />
          </div>
        </div>
      </div>
  );
}