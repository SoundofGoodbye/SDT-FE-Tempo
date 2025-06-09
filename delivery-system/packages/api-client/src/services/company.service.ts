// delivery-system/packages/api-client/src/services/company.service.ts

import { apiClient, ApiResponse } from '../client';
import type {
    BaseListWrapper,
    CompanyResponse,
    CompanyExtended,
    CompanyCreateRequest,
    CompanyUpdateRequest,
    ListQueryParams
} from '@delivery-system/types';

export class CompanyService {
    private basePath = '/company';

    /**
     * Create a new company
     * @requires ROLE_ADMIN
     */
    async createCompany(data: CompanyCreateRequest): Promise<CompanyResponse> {
        return apiClient.post<CompanyResponse>(this.basePath, data);
    }

    /**
     * Get all companies (not deleted)
     * @requires ROLE_ADMIN
     * Note: BE currently doesn't support pagination/filtering - these params are for future use
     */
    async getAllCompanies(params?: ListQueryParams): Promise<CompanyExtended[]> {
        const response = await apiClient.get<ApiResponse<CompanyResponse[]>>(
            this.basePath,
            { params }
        );

        // Extract companies from payload
        const companies = response.payload || [];

        // Map to extended type (additional fields will be undefined until BE supports them)
        return companies.map(company => ({
            ...company,
            id: company.id,
            companyName: company.companyName,
            // These fields need BE support:
            email: undefined,
            phone: undefined,
            address: undefined,
            website: undefined,
            description: undefined,
            shopsCount: 0,
            usersCount: 0,
            productsCount: 0,
            revenue: 0,
            plan: 'Basic' as const,
            status: 'Active' as const,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }));
    }

    /**
     * Get a company by ID
     * @requires ROLE_ADMIN, ROLE_MANAGER, ROLE_DELIVERY_GUY
     */
    async getCompanyById(id: number): Promise<CompanyExtended> {
        const company = await apiClient.get<CompanyResponse>(`${this.basePath}/${id}`);

        // Map to extended type
        return {
            ...company,
            // Default values for missing fields
            email: undefined,
            phone: undefined,
            address: undefined,
            website: undefined,
            description: undefined,
            shopsCount: 0,
            usersCount: 0,
            productsCount: 0,
            revenue: 0,
            plan: 'Basic',
            status: 'Active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    /**
     * Update a company
     * @requires ROLE_ADMIN, ROLE_MANAGER
     */
    async updateCompany(id: number, data: CompanyUpdateRequest): Promise<CompanyResponse> {
        return apiClient.put<CompanyResponse>(`${this.basePath}/${id}`, data);
    }

    /**
     * Soft delete a company
     * @requires ROLE_ADMIN (based on missing PreAuthorize annotation, assuming ADMIN only)
     */
    async deleteCompany(id: number): Promise<void> {
        await apiClient.delete(`${this.basePath}/${id}`);
    }
}

// Export singleton instance
export const companyService = new CompanyService();