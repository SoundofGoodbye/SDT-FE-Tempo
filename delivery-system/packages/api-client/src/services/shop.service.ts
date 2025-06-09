// delivery-system/packages/api-client/src/services/shop.service.ts

import { apiClient, ApiResponse } from '../client';
import type {
    BaseListWrapper,
    ShopResponse,
    ShopExtended,
    ShopCreateRequest,
    ShopUpdateRequest,
    ListQueryParams
} from '@delivery-system/types';

export class ShopService {
    /**
     * Create a new shop for a company
     * @requires ROLE_ADMIN, ROLE_MANAGER
     */
    async createShop(companyId: number, data: ShopCreateRequest): Promise<ShopResponse> {
        return apiClient.post<ShopResponse>(`/company/${companyId}/shop`, data);
    }

    /**
     * Get all shops for a company
     * @requires ROLE_ADMIN, ROLE_MANAGER, ROLE_DELIVERY_GUY
     * Note: BE currently doesn't support pagination/filtering
     */
    async getAllShopsByCompany(companyId: number, params?: ListQueryParams): Promise<ShopExtended[]> {
        const response = await apiClient.get<ApiResponse<ShopResponse[]>>(
            `/company/${companyId}/shop`,
            { params }
        );

        // Extract shops from payload
        const shops = response.payload || [];

        // Map to extended type
        return shops.map(shop => ({
            ...shop,
            // These fields need BE support:
            address: undefined,
            status: 'Active' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }));
    }

    /**
     * Get a shop by ID
     * @requires ROLE_ADMIN, ROLE_MANAGER, ROLE_DELIVERY_GUY
     */
    async getShopById(companyId: number, shopId: number): Promise<ShopExtended> {
        const shop = await apiClient.get<ShopResponse>(
            `/company/${companyId}/shop/${shopId}`
        );

        return {
            ...shop,
            address: undefined,
            status: 'Active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    /**
     * Get all shops for a company and location
     * @requires ROLE_ADMIN, ROLE_MANAGER, ROLE_DELIVERY_GUY
     */
    async getAllShopsByCompanyAndLocation(
        companyId: number,
        locationId: number,
        params?: ListQueryParams
    ): Promise<ShopExtended[]> {
        const response = await apiClient.get<ApiResponse<ShopResponse[]>>(
            `/company/${companyId}/location/${locationId}/shop`,
            { params }
        );

        const shops = response.payload || [];

        return shops.map(shop => ({
            ...shop,
            address: undefined,
            status: 'Active' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }));
    }

    /**
     * Update a shop
     * @requires ROLE_ADMIN, ROLE_MANAGER
     */
    async updateShop(
        companyId: number,
        shopId: number,
        data: ShopUpdateRequest
    ): Promise<ShopResponse> {
        return apiClient.put<ShopResponse>(
            `/company/${companyId}/shop/${shopId}`,
            data
        );
    }

    /**
     * Delete a shop (hard delete)
     * @requires ROLE_ADMIN, ROLE_MANAGER
     */
    async deleteShop(companyId: number, shopId: number): Promise<boolean> {
        const response = await apiClient.delete<boolean>(
            `/company/${companyId}/shop/${shopId}`
        );
        return response || true;
    }
}

// Export singleton instance
export const shopService = new ShopService();