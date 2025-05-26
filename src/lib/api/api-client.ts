import { getApiBaseUrl } from "./auth-service";

export interface ApiResponse<T> {
  message: string;
  count?: number;
  payload: T;
}

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${getApiBaseUrl()}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...getAuthHeaders(),
  };
  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }
  return await response.json();
}

export const apiClient = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: "GET" }),
  post: <T>(endpoint: string, data?: any) => request<T>(endpoint, { method: "POST", body: data ? JSON.stringify(data) : undefined }),
  put: <T>(endpoint: string, data?: any) => request<T>(endpoint, { method: "PUT", body: data ? JSON.stringify(data) : undefined }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
};
