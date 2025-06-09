// delivery-system/packages/hooks/src/useShops.ts
import { useState, useEffect, useCallback } from 'react';
import { apiClient, ApiResponse } from '@delivery-system/api-client';

export interface Shop {
    id: number;
    shopName: string;
    locationId: number;
    companyId: number;
}

export interface UseShopsResult {
    shops: Shop[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useShops(companyId?: number): UseShopsResult {
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchShops = useCallback(async () => {
        if (!companyId || companyId === 0) {
            setShops([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const data = await apiClient.get<ApiResponse<Shop[]>>(
                `company/${companyId}/shop`
            );

            // Extract shops from payload and ensure it's always an array
            const shopsData = data?.payload || [];
            setShops(Array.isArray(shopsData) ? shopsData : []);
        } catch (err: any) {
            console.error('Failed to fetch shops:', err);
            setError('Failed to load shop locations');
            setShops([]);
        } finally {
            setLoading(false);
        }
    }, [companyId]);

    useEffect(() => {
        fetchShops();
    }, [fetchShops]);

    return {
        shops,
        loading,
        error,
        refetch: fetchShops
    };
}