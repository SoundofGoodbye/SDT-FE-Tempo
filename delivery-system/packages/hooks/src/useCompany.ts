// delivery-system/packages/hooks/src/useCompany.ts
import { useState, useEffect, useCallback } from 'react';
import { companyService } from '@delivery-system/api-client';
import type { CompanyExtended } from '@delivery-system/types/';

export interface UseCompanyResult {
    company: CompanyExtended | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useCompany(companyId?: number | string): UseCompanyResult {
    const [company, setCompany] = useState<CompanyExtended | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCompany = useCallback(async () => {
        if (!companyId) {
            setCompany(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const id = typeof companyId === 'string' ? parseInt(companyId) : companyId;
            const companyData = await companyService.getCompanyById(id);

            setCompany(companyData);
        } catch (err: any) {
            console.error('Failed to fetch company:', err);
            setError('Failed to load company details');
            setCompany(null);
        } finally {
            setLoading(false);
        }
    }, [companyId]);

    useEffect(() => {
        fetchCompany();
    }, [fetchCompany]);

    return {
        company,
        loading,
        error,
        refetch: fetchCompany
    };
}