// Unified API Client with Integrated Auth Utilities
import { useRouter } from "next/navigation";

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

export const getApiBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem("authToken");
  if (!token) return false;
  return !isTokenExpired(token);
};

export const logout = (router?: ReturnType<typeof useRouter>): void => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("companyId");
  if (router) router.push("/");
};

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  if (!token || isTokenExpired(token)) {
    logout();
    return {};
  }
  return { Authorization: `Bearer ${token}` };
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

  if (response.status === 401) {
    logout();
    throw new Error("Unauthorized – you have been logged out.");
  }

  if (!response.ok) {
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

  logout,
  isTokenExpired
};
