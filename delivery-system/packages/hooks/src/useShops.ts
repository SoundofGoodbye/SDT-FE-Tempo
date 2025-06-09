// delivery-system/packages/hooks/src/useShops.ts
import { useState, useEffect, useCallback } from 'react';
import { shopService } from '@delivery-system/api-client';
import type { ShopResponse } from '@delivery-system/types';

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

            const shopsData = await shopService.getAllShopsByCompany(companyId);

            // The service already returns ShopExtended[], but we only need the base fields
            const mappedShops: Shop[] = shopsData.map(shop => ({
                id: shop.id,
                shopName: shop.shopName,
                locationId: shop.locationId,
                companyId: shop.companyId
            }));

            setShops(mappedShops);
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