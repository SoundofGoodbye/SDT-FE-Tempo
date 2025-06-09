export interface Template {
  id: string;
  name: string;
  format: "Excel" | "CSV";
  type: "Products" | "Product Details";
  fields: string[];
  lastUsed: string | null;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExportTemplate {
  id: string;
  name: string;
  format: "CSV" | "Excel" | "PDF";
  fields: string[];
  schedule: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateFormData {
  name: string;
  format: "Excel" | "CSV";
  type: "Products" | "Product Details";
  fields: string[];
  companyId: string;
}

export interface ExportTemplateFormData {
  name: string;
  format: "CSV" | "Excel" | "PDF";
  fields: string[];
  schedule: string;
  companyId: string;
}
