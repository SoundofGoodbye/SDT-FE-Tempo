"use client";

import { useEffect, useState } from "react";
import {
  useCompanySettings,
  useUpdateCompanySettings,
} from "@/hooks/useCompanySettings";
import { useUser } from "@/hooks/useUser";
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

export default function SettingsPage() {
  const { user, loading: userLoading } = useUser();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);

  const { settings, loading: settingsLoading } = useCompanySettings(
    companyId || "",
  );
  const { updateSettings, loading: updateLoading } = useUpdateCompanySettings();

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const assignedCompanyId =
      localStorage.getItem("assignedCompanyId") || "company-1";
    setUserRole(role);
    setCompanyId(assignedCompanyId);
  }, []);

  // Show loading state
  if (userLoading || settingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if user is a manager
  if (userRole !== "manager") {
    return (
      <ForbiddenPage
        title="Manager Access Required"
        description="This settings page is only accessible to Managers. Please contact your administrator if you need access to these settings."
      />
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load settings</p>
        </div>
      </div>
    );
  }

  const handleBusinessRulesSave = async (data: BusinessRules) => {
    if (!companyId) return;
    await updateSettings(companyId, {
      businessRules: data,
      alertThresholds: settings.alertThresholds,
      integrationSettings: settings.integrationSettings,
    });
  };

  const handleAlertThresholdsSave = async (data: AlertThresholds) => {
    if (!companyId) return;
    await updateSettings(companyId, {
      businessRules: settings.businessRules,
      alertThresholds: data,
      integrationSettings: settings.integrationSettings,
    });
  };

  const handleIntegrationSettingsSave = async (
    data: IntegrationSettingsType,
  ) => {
    if (!companyId) return;
    await updateSettings(companyId, {
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
            Configure business rules, alert thresholds, and integration settings
            for your company.
          </p>
        </div>

        <div className="space-y-8">
          <BusinessRulesForm
            initialData={settings.businessRules}
            onSave={handleBusinessRulesSave}
            loading={updateLoading}
          />

          <AlertThresholdsForm
            initialData={settings.alertThresholds}
            onSave={handleAlertThresholdsSave}
            loading={updateLoading}
          />

          <IntegrationSettings
            initialData={settings.integrationSettings}
            onSave={handleIntegrationSettingsSave}
            loading={updateLoading}
          />
        </div>
      </div>
    </div>
  );
}
