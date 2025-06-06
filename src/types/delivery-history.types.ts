export interface DeliveryHistoryRecord {
    date: string;
    shopId: string;
    versionCount: number;
    lastStepName: string;
}

export interface DeliveryHistorySummary {
    totalDeliveries: number;
    uniqueShops: number;
    uniqueDays: number;
    dateRangeStart: string;
    dateRangeEnd: string;
}

export interface PagedDeliveryHistoryResponse {
    content: DeliveryHistoryRecord[];
    pageNumber: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
    summary: DeliveryHistorySummary;
}

export interface DeliveryHistoryFilters {
    page?: number;
    size?: number;
    sort?: string;
    shopIds?: number[];
    locationId?: number;
    dateFrom?: string;
    dateTo?: string;
    month?: number;
    year?: number;
    useDefaultDateRange?: boolean;
}

export interface LocationInfo {
    id: number;
    cityName: string;
    companyId: number;
}