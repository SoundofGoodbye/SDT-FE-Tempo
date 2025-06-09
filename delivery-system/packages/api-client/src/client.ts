// delivery-system/packages/api-client/src/client.ts
import { getApiBaseUrl, isTokenExpired, refreshAccessToken, logout, getStoredTokens } from "./services";

export interface ApiResponse<T> {
  message: string;
  count?: number;
  payload: T;
}

export interface RequestOptions {
  responseType?: 'json' | 'blob' | 'text';
  headers?: Record<string, string>;
  skipAuth?: boolean;
  params?: Record<string, any>;
}

export interface BlobResponse {
  data: Blob;
  headers: Record<string, string>;
}

// Track ongoing refresh to prevent multiple simultaneous refresh attempts
let refreshPromise: Promise<string | null> | null = null;

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { accessToken, refreshToken } = getStoredTokens() || {};

  if (!accessToken && !refreshToken) {
    return {};
  }

  // If access token is expired but we have a refresh token, try to refresh
  if (accessToken && isTokenExpired(accessToken) && refreshToken) {
    // If a refresh is already in progress, wait for it
    if (refreshPromise) {
      const newToken = await refreshPromise;
      return newToken ? { Authorization: `Bearer ${newToken}` } : {};
    }

    // Start a new refresh
    refreshPromise = refreshAccessToken();
    const newToken = await refreshPromise;
    refreshPromise = null;

    if (newToken) {
      return { Authorization: `Bearer ${newToken}` };
    } else {
      // Refresh failed, logout
      logout();
      return {};
    }
  }

  // Access token is still valid
  if (accessToken) {
    return { Authorization: `Bearer ${accessToken}` };
  }

  return {};
}

function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
}

async function request<T>(
    endpoint: string,
    options: RequestInit = {},
    extra?: RequestOptions
): Promise<T> {
  // Build URL with query params if provided
  let url = `${getApiBaseUrl()}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  if (extra?.params) {
    const queryString = buildQueryString(extra.params);
    if (queryString) {
      url += `${url.includes('?') ? '&' : '?'}${queryString}`;
    }
  }

  // Get auth headers unless explicitly skipped
  const authHeaders = extra?.skipAuth ? {} : await getAuthHeaders();

  // Check if body is FormData
  const isFormData = options.body instanceof FormData;

  // Build headers
  const headers: Record<string, string> = {
    ...authHeaders,
    ...(extra?.headers || {})
  };

  // Only add Content-Type if not FormData (browser sets it automatically for FormData with boundary)
  if (!isFormData && options.body) {
    headers['Content-Type'] = 'application/json';
  }

  // Merge in any additional headers from options
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  let response = await fetch(url, { ...options, headers });

  // Handle 401 Unauthorized
  if (response.status === 401 && !extra?.skipAuth) {
    const { refreshToken } = getStoredTokens() || {};

    if (refreshToken && !refreshPromise) {
      // Try to refresh the token
      refreshPromise = refreshAccessToken();
      const newToken = await refreshPromise;
      refreshPromise = null;

      if (newToken) {
        // Retry the request with the new token
        headers.Authorization = `Bearer ${newToken}`;
        response = await fetch(url, { ...options, headers });
      }
    }

    // If still unauthorized after refresh attempt, logout
    if (response.status === 401) {
      logout();
      throw new Error("Session expired. Please login again.");
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.message || `API request failed: ${response.statusText}`;
    console.error(`API error [${options.method || 'GET'} ${endpoint}]:`, response.status, errorMessage);
    throw new Error(errorMessage);
  }

  const type = extra?.responseType || 'json';
  const contentType = response.headers.get('content-type') || '';

  if (type === 'blob') {
    const blob = await response.blob();
    const headerMap: Record<string, string> = {};
    response.headers.forEach((value, key) => (headerMap[key] = value));
    return { data: blob, headers: headerMap } as T;
  }

  if (type === 'text') {
    return (await response.text()) as T;
  }

  // default: JSON if possible, fallback to text
  if (contentType.includes('application/json')) {
    return await response.json();
  }

  return (await response.text()) as T;
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
      request<T>(endpoint, { method: "GET" }, options),

  post: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
      request<T>(endpoint, {
        method: "POST",
        body: data ? JSON.stringify(data) : undefined
      }, options),

  put: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
      request<T>(endpoint, {
        method: "PUT",
        body: data ? JSON.stringify(data) : undefined
      }, options),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
      request<T>(endpoint, { method: "DELETE" }, options),

  // New method specifically for FormData uploads
  postForm: <T>(endpoint: string, formData: FormData, options?: RequestOptions) =>
      request<T>(endpoint, {
        method: "POST",
        body: formData
      }, options),

  // Additional form methods if needed in the future
  putForm: <T>(endpoint: string, formData: FormData, options?: RequestOptions) =>
      request<T>(endpoint, {
        method: "PUT",
        body: formData
      }, options),
};