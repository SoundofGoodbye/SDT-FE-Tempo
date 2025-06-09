// delivery-system/packages/api-client/src/services/auth.service.ts
import { cookieUtils, authCookies } from "@delivery-system/utils";
import { ROLES, PERMISSIONS, ROLE_PERMISSIONS, type Role, type Permission } from "../../../auth";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userId: number;
  email: string;
  roles: string[];
  companyId: number;
  shopId?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userId: number;
  email: string;
  roles: string[];
  companyId: number;
  shopId?: number;
}

// Navigation callback type
export type NavigationCallback = (path: string) => void;

export const getApiBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "hui";
};

// Export permissions for use in apps
export { ROLES, PERMISSIONS, type Role, type Permission };

// Check if user has specific permission
export const hasPermission = (permission: Permission): boolean => {
  const roles = getUserRoles();

  for (const role of roles) {
    const permissions = ROLE_PERMISSIONS[role as Role];
    if (permissions && permissions.includes(permission)) {
      return true;
    }
  }

  return false;
};

// Check if user has any of the permissions
export const hasAnyPermission = (permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(permission));
};

// Check if user has all permissions
export const hasAllPermissions = (permissions: Permission[]): boolean => {
  return permissions.every(permission => hasPermission(permission));
};

// Get all permissions for current user
export const getUserPermissions = (): Permission[] => {
  const roles = getUserRoles();
  const permissions = new Set<Permission>();

  for (const role of roles) {
    const rolePermissions = ROLE_PERMISSIONS[role as Role];
    if (rolePermissions) {
      rolePermissions.forEach(p => permissions.add(p));
    }
  }

  return Array.from(permissions);
};

export const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = atob(base64);
    return JSON.parse(payload);
  } catch (e) {
    console.error("Invalid JWT:", e);
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = parseJwt(token);
    if (!payload || !payload.exp) return true;
    // Add 30 second buffer to account for clock skew
    return Date.now() >= (payload.exp * 1000 - 30000);
  } catch {
    return true;
  }
};

export const getStoredTokens = () => {
  if (typeof window === 'undefined') return null;

  const accessToken = cookieUtils.get(authCookies.ACCESS_TOKEN);
  const refreshToken = cookieUtils.get(authCookies.REFRESH_TOKEN);

  return { accessToken, refreshToken };
};

export const getUserRoles = (): string[] => {
  if (typeof window === 'undefined') return [];

  const rolesStr = cookieUtils.get(authCookies.USER_ROLES);
  if (!rolesStr) return [];

  try {
    return JSON.parse(rolesStr);
  } catch {
    return [];
  }
};

export const hasRole = (role: string): boolean => {
  const roles = getUserRoles();
  return roles.includes(role);
};

export const getShopId = (): number | null => {
  if (typeof window === 'undefined') return null;

  const shopId = cookieUtils.get(authCookies.SHOP_ID);
  return shopId ? parseInt(shopId) : null;
};

export const getUserEmail = (): string | null => {
  if (typeof window === 'undefined') return null;

  return cookieUtils.get(authCookies.USER_EMAIL) || null;
};

export const getUserId = (): number | null => {
  if (typeof window === 'undefined') return null;

  const userId = cookieUtils.get(authCookies.USER_ID);
  return userId ? parseInt(userId) : null;
};

export const getCompanyId = (): number | null => {
  if (typeof window === 'undefined') return null;

  const companyId = cookieUtils.get(authCookies.COMPANY_ID);
  return companyId ? parseInt(companyId) : null;
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;

  const { accessToken, refreshToken } = getStoredTokens() || {};

  // If we have a valid access token, we're authenticated
  if (accessToken && !isTokenExpired(accessToken)) {
    return true;
  }

  // If we have a refresh token, we can potentially refresh
  // This will be handled by the auth interceptor
  return !!refreshToken;
};

export const storeAuthData = (authData: AuthResponse, rememberMe: boolean = false) => {
  authCookies.setSecure(authCookies.ACCESS_TOKEN, authData.accessToken, rememberMe);
  authCookies.setSecure(authCookies.REFRESH_TOKEN, authData.refreshToken, rememberMe);
  authCookies.setSecure(authCookies.USER_ID, authData.userId.toString(), rememberMe);
  authCookies.setSecure(authCookies.USER_EMAIL, authData.email, rememberMe);
  authCookies.setSecure(authCookies.USER_ROLES, JSON.stringify(authData.roles), rememberMe);
  authCookies.setSecure(authCookies.COMPANY_ID, authData.companyId.toString(), rememberMe);

  if (authData.shopId) {
    authCookies.setSecure(authCookies.SHOP_ID, authData.shopId.toString(), rememberMe);
  }

  // For backward compatibility
  authCookies.setSecure(authCookies.AUTH_TOKEN, authData.accessToken, rememberMe);
};

export const clearAuthData = () => {
  authCookies.clearAll();
};

export async function login(request: LoginRequest): Promise<AuthResponse> {
  const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: request.email,
      password: request.password,
      rememberMe: request.rememberMe || false
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Authentication failed");
  }

  const authData = await response.json();
  storeAuthData(authData, request.rememberMe || false);

  return authData;
}

export async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = getStoredTokens() || {};

  if (!refreshToken) {
    console.error("No refresh token available");
    return null;
  }

  try {
    const response = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      console.error("Failed to refresh token:", response.status);
      return null;
    }

    const data: RefreshResponse = await response.json();

    // Determine if user had remember me enabled by checking cookie expiry
    const rememberMe = !!cookieUtils.get(authCookies.REFRESH_TOKEN);

    // Update stored tokens
    authCookies.setSecure(authCookies.ACCESS_TOKEN, data.accessToken, rememberMe);
    authCookies.setSecure(authCookies.AUTH_TOKEN, data.accessToken, rememberMe); // backward compatibility

    // Update other data if provided
    if (data.userId) authCookies.setSecure(authCookies.USER_ID, data.userId.toString(), rememberMe);
    if (data.email) authCookies.setSecure(authCookies.USER_EMAIL, data.email, rememberMe);
    if (data.roles) authCookies.setSecure(authCookies.USER_ROLES, JSON.stringify(data.roles), rememberMe);
    if (data.companyId) authCookies.setSecure(authCookies.COMPANY_ID, data.companyId.toString(), rememberMe);
    if (data.shopId) authCookies.setSecure(authCookies.SHOP_ID, data.shopId.toString(), rememberMe);

    return data.accessToken;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
}

export const logout = async (navigate?: NavigationCallback): Promise<void> => {
  const { refreshToken } = getStoredTokens() || {};

  // Attempt to logout on the server (revoke refresh token)
  if (refreshToken) {
    try {
      await fetch(`${getApiBaseUrl()}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
    } catch (error) {
      console.error("Error during server logout:", error);
    }
  }

  // Clear cookies
  clearAuthData();

  // Navigate to login using callback
  if (navigate) {
    navigate("/");
  } else if (typeof window !== 'undefined') {
    window.location.href = "/";
  }
};

export const logoutAllSessions = async (navigate?: NavigationCallback): Promise<void> => {
  const { accessToken } = getStoredTokens() || {};

  if (accessToken) {
    try {
      await fetch(`${getApiBaseUrl()}/auth/logout-all`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
      });
    } catch (error) {
      console.error("Error during logout all sessions:", error);
    }
  }

  // Clear cookies and redirect
  clearAuthData();

  if (navigate) {
    navigate("/");
  } else if (typeof window !== 'undefined') {
    window.location.href = "/";
  }
};