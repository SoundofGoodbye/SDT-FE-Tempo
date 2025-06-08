import { useState, useEffect, useMemo } from "react";
import { Template } from "@/types/template";

// Mock template data
const mockTemplates: Template[] = [
  {
    id: "1",
    name: "Product Import Template",
    format: "Excel",
    type: "Products",
    fields: ["name", "sku", "price", "category"],
    lastUsed: "2024-01-15",
    companyId: "company-1",
    createdAt: "2024-01-01",
    updatedAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Product Details CSV",
    format: "CSV",
    type: "Product Details",
    fields: ["description", "specifications", "images"],
    lastUsed: "2024-01-10",
    companyId: "company-1",
    createdAt: "2024-01-05",
    updatedAt: "2024-01-10",
  },
  {
    id: "3",
    name: "Bulk Product Import",
    format: "Excel",
    type: "Products",
    fields: ["name", "sku", "price", "category", "stock"],
    lastUsed: null,
    companyId: "company-2",
    createdAt: "2024-01-08",
    updatedAt: "2024-01-08",
  },
];

export function useTemplateList(companyId?: string) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filteredTemplates = useMemo(() => {
    if (!companyId) return [];
    return mockTemplates.filter((template) => template.companyId === companyId);
  }, [companyId]);

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setTemplates(filteredTemplates);
      setLoading(false);
    }, 500);
  }, [filteredTemplates]);

  const deleteTemplate = (templateId: string) => {
    setTemplates((prev) =>
      prev.filter((template) => template.id !== templateId),
    );
  };

  const addTemplate = (templateData: Partial<Template>) => {
    const newTemplate: Template = {
      id: `temp-${Date.now()}`,
      name: templateData.name || "New Template",
      format: templateData.format || "Excel",
      type: templateData.type || "Products",
      fields: templateData.fields || [],
      lastUsed: null,
      companyId: templateData.companyId || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTemplates((prev) => [...prev, newTemplate]);
  };

  const updateTemplate = (templateData: Partial<Template>) => {
    setTemplates((prev) =>
      prev.map((template) =>
        template.id === templateData.id
          ? {
              ...template,
              ...templateData,
              updatedAt: new Date().toISOString(),
            }
          : template,
      ),
    );
  };

  return {
    templates,
    loading,
    error,
    deleteTemplate,
    addTemplate,
    updateTemplate,
  };
}
