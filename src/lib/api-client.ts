/**
 * API Client for making HTTP requests to the backend
 */

// Base URL for all API requests
// const API_BASE_URL = 'https://d1g2sw6cm9x9y3.cloudfront.net';
const API_BASE_URL = 'http://localhost:8080';

/**
 * Generic type for API responses
 */
export interface ApiResponse<T> {
  message: string;
  count?: number;
  payload: T;
}

/**
 * Options for API requests
 */
export interface RequestOptions {
  responseType?: 'json' | 'blob' | 'text';
  headers?: Record<string, string>;
}

/**
 * Response type for blob requests
 */
export interface BlobResponse {
  data: Blob;
  headers: Record<string, string>;
}

/**
 * API client with methods for common HTTP operations
 */
const apiClient = {
  /**
   * Make a GET request to the API
   * @param endpoint - The API endpoint (without the base URL)
   * @param options - Request options including responseType
   * @returns Promise with the response data
   */

  get: async <T>(endpoint: string, options?: RequestOptions): Promise<T | null> => {
    try {
      const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

      // Get auth token from localStorage
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = {
        ...options?.headers,
      };

      // Add Authorization header with Bearer token if token exists
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        headers
      });

      if (response.status === 404) {
        // Не логвай като грешка, просто върни null
        return null;
      }

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      // Handle different response types
      const responseType = options?.responseType || 'json';

      if (responseType === 'blob') {
        const blob = await response.blob();
        const responseHeaders: Record<string, string> = {};

        // Extract headers
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });

        return {
          data: blob,
          headers: responseHeaders
        } as T;
      } else if (responseType === 'text') {
        return await response.text() as T;
      } else {
        // Only try to parse as JSON if content-type indicates JSON
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          return await response.json();
        } else {
          // If not JSON, return as text
          return await response.text() as T;
        }
      }
    } catch (error) {
      // Логвай само неочаквани грешки
      console.error(`Error fetching from ${endpoint}:`, error);
      throw error;
    }
  },

  /**
   * Make a POST request to the API
   * @param endpoint - The API endpoint (without the base URL)
   * @param data - The data to send in the request body
   * @param options - Request options including responseType
   * @returns Promise with the response data
   */
  post: async <T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> => {
    try {
      const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

      // Get auth token from localStorage
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options?.headers,
      };

      // Add Authorization header with Bearer token if token exists
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      // Handle different response types
      const responseType = options?.responseType || 'json';

      if (responseType === 'blob') {
        const blob = await response.blob();
        const responseHeaders: Record<string, string> = {};

        // Extract headers
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });

        return {
          data: blob,
          headers: responseHeaders
        } as T;
      } else if (responseType === 'text') {
        return await response.text() as T;
      } else {
        // Only try to parse as JSON if content-type indicates JSON
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          return await response.json();
        } else {
          // If not JSON, return as text
          return await response.text() as T;
        }
      }
    } catch (error) {
      console.error(`Error posting to ${endpoint}:`, error);
      throw error;
    }
  },

  /**
   * Make a PUT request to the API
   * @param endpoint - The API endpoint (without the base URL)
   * @param data - The data to send in the request body
   * @param options - Request options including responseType
   * @returns Promise with the response data
   */
  put: async <T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> => {
    try {
      const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

      // Get auth token from localStorage
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options?.headers,
      };

      // Add Authorization header with Bearer token if token exists
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      // Handle different response types
      const responseType = options?.responseType || 'json';

      if (responseType === 'blob') {
        const blob = await response.blob();
        const responseHeaders: Record<string, string> = {};

        // Extract headers
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });

        return {
          data: blob,
          headers: responseHeaders
        } as T;
      } else if (responseType === 'text') {
        return await response.text() as T;
      } else {
        // Only try to parse as JSON if content-type indicates JSON
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          return await response.json();
        } else {
          // If not JSON, return as text
          return await response.text() as T;
        }
      }
    } catch (error) {
      console.error(`Error putting to ${endpoint}:`, error);
      throw error;
    }
  },

  /**
   * Make a DELETE request to the API
   * @param endpoint - The API endpoint (without the base URL)
   * @param options - Request options including responseType
   * @returns Promise with the response data
   */
  delete: async <T>(endpoint: string, options?: RequestOptions): Promise<T> => {
    try {
      const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

      // Get auth token from localStorage
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = {
        ...options?.headers,
      };

      // Add Authorization header with Bearer token if token exists
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      // Handle different response types
      const responseType = options?.responseType || 'json';

      if (responseType === 'blob') {
        const blob = await response.blob();
        const responseHeaders: Record<string, string> = {};

        // Extract headers
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });

        return {
          data: blob,
          headers: responseHeaders
        } as T;
      } else if (responseType === 'text') {
        return await response.text() as T;
      } else {
        return await response.json();
      }
    } catch (error) {
      console.error(`Error deleting from ${endpoint}:`, error);
      throw error;
    }
  },
};

export default apiClient;
