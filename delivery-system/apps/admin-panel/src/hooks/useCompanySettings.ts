import { useState, useEffect } from "react";
import {
  CompanySettings,
  CompanySettingsFormData,
} from "@/types/company-settings";

// Mock data for company settings
const mockSettings: CompanySettings = {
  id: "1",
  companyId: "company-1",
  businessRules: {
    deliveryStartTime: "09:00",
    deliveryEndTime: "22:00",
    orderCutoffTime: "21:30",
    minOrderValue: 10.0,
    deliveryRadius: 5,
  },
  alertThresholds: {
    lowAccuracyAlert: 90,
    delayedDeliveryAlert: 45,
    lowStockAlert: 10,
    revenueDropAlert: 20,
  },
  integrationSettings: {
    webhookUrl: "",
    analyticsExportEnabled: false,
    apiAccessEnabled: false,
  },
  updatedAt: new Date().toISOString(),
};

export function useCompanySettings(companyId: string) {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        setSettings(mockSettings);
      } catch (err) {
        setError("Failed to load company settings");
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchSettings();
    }
  }, [companyId]);

  return { settings, loading, error };
}

export function useUpdateCompanySettings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateSettings = async (
    companyId: string,
    data: CompanySettingsFormData,
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Updating settings for company:", companyId, data);

      return true;
    } catch (err) {
      setError("Failed to update company settings");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { updateSettings, loading, error };
}
