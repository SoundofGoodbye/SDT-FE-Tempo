import { getApiBaseUrl } from "./auth-service";

export interface ApiResponse<T> {
  message: string;
  count?: number;
  payload: T;
}

export interface RequestOptions {
  responseType?: 'json' | 'blob' | 'text';
  headers?: Record<string, string>;
}

export interface BlobResponse {
  data: Blob;
  headers: Record<string, string>;
}

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(
    endpoint: string,
    options: RequestInit = {},
    extra?: RequestOptions
): Promise<T> {
  const url = `${getApiBaseUrl()}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...getAuthHeaders(),
    ...(extra?.headers || {})
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    console.error(`API error [${options.method || 'GET'} ${endpoint}]:`, response.status, response.statusText);
    throw new Error(`API request failed: ${response.statusText}`);
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
      request<T>(endpoint, { method: "POST", body: data ? JSON.stringify(data) : undefined }, options),

  put: <T>(endpoint: string, data?: any, options?: RequestOptions) =>
      request<T>(endpoint, { method: "PUT", body: data ? JSON.stringify(data) : undefined }, options),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
      request<T>(endpoint, { method: "DELETE" }, options),
};
