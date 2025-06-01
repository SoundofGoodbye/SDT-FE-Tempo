import { useRouter } from "next/navigation";

/**
 * Function to check if JWT token is expired
 * @param token JWT token to check
 * @returns boolean indicating if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    // Get the payload part of the JWT token (second part)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    
    // Check if token has expiry claim
    if (!payload.exp) return false;
    
    // Convert exp to milliseconds and compare with current time
    const expiryTime = payload.exp * 1000; // exp is in seconds
    return Date.now() >= expiryTime;
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return true; // If there's an error parsing the token, consider it expired
  }
};

/**
 * Function to log out the user
 * @param router Next.js router instance
 */
export const logout = (router: ReturnType<typeof useRouter>): void => {
  // Remove all auth-related items from localStorage
  localStorage.removeItem("authToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("companyId");
  
  // Redirect to login page
  router.push("/");
};

/**
 * Function to check if user is authenticated
 * @returns boolean indicating if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem("authToken");
  if (!token) return false;
  
  return !isTokenExpired(token);
};

/**
 * Get the user's role from the JWT token in localStorage
 * @returns {string | null} The user's role (e.g., 'ADMIN', 'MANAGER'), or null if not found
 */
export const getUserRole = (): string | null => {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('authToken');
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    // The role may be in payload.roleModel.name or payload.role or similar
    if (payload.roleModel && payload.roleModel.name) {
      return payload.roleModel.name;
    }
    if (payload.role) {
      return payload.role;
    }
    // Sometimes roles are in an array
    if (payload.roles && Array.isArray(payload.roles) && payload.roles.length > 0) {
      if (typeof payload.roles[0] === 'string') return payload.roles[0];
      if (payload.roles[0].name) return payload.roles[0].name;
    }
    return null;
  } catch (error) {
    return null;
  }
};