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
 * API client with methods for common HTTP operations
 */
const apiClient = {
  /**
   * Make a GET request to the API
   * @param endpoint - The API endpoint (without the base URL)
   * @returns Promise with the response data
   */
  get: async <T>(endpoint: string): Promise<T> => {
    try {
      const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

      // Get auth token from localStorage
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = {};

      // Add Authorization header if token exists
      if (token) {
        headers.Authorization = token;
      }

      const response = await fetch(url, {
        headers
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching from ${endpoint}:`, error);
      throw error;
    }
  },

  /**
   * Make a POST request to the API
   * @param endpoint - The API endpoint (without the base URL)
   * @param data - The data to send in the request body
   * @returns Promise with the response data
   */
  post: async <T>(endpoint: string, data?: any): Promise<T> => {
    try {
      const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

      // Get auth token from localStorage
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add Authorization header if token exists
      if (token) {
        headers.Authorization = token;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error posting to ${endpoint}:`, error);
      throw error;
    }
  },

  /**
   * Make a PUT request to the API
   * @param endpoint - The API endpoint (without the base URL)
   * @param data - The data to send in the request body
   * @returns Promise with the response data
   */
  put: async <T>(endpoint: string, data?: any): Promise<T> => {
    try {
      const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

      // Get auth token from localStorage
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add Authorization header if token exists
      if (token) {
        headers.Authorization = token;
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error putting to ${endpoint}:`, error);
      throw error;
    }
  },

  /**
   * Make a DELETE request to the API
   * @param endpoint - The API endpoint (without the base URL)
   * @returns Promise with the response data
   */
  delete: async <T>(endpoint: string): Promise<T> => {
    try {
      const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

      // Get auth token from localStorage
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = {};

      // Add Authorization header if token exists
      if (token) {
        headers.Authorization = token;
      }

      const response = await fetch(url, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error deleting from ${endpoint}:`, error);
      throw error;
    }
  },
};

export default apiClient;
