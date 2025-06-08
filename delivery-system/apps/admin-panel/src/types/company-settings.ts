export interface BusinessRules {
  deliveryStartTime: string;
  deliveryEndTime: string;
  orderCutoffTime: string;
  minOrderValue: number;
  deliveryRadius: number;
}

export interface AlertThresholds {
  lowAccuracyAlert: number;
  delayedDeliveryAlert: number;
  lowStockAlert: number;
  revenueDropAlert: number;
}

export interface IntegrationSettings {
  webhookUrl: string;
  analyticsExportEnabled: boolean;
  apiAccessEnabled: boolean;
}

export interface CompanySettings {
  id: string;
  companyId: string;
  businessRules: BusinessRules;
  alertThresholds: AlertThresholds;
  integrationSettings: IntegrationSettings;
  updatedAt: string;
}

export interface CompanySettingsFormData {
  businessRules: BusinessRules;
  alertThresholds: AlertThresholds;
  integrationSettings: IntegrationSettings;
}
