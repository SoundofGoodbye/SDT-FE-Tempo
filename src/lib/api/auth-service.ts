import { useRouter } from "next/navigation";

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

export const getApiBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081";
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

  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  return { accessToken, refreshToken };
};

export const getUserRoles = (): string[] => {
  if (typeof window === 'undefined') return [];

  const rolesStr = localStorage.getItem("userRoles");
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

  const shopId = localStorage.getItem("shopId");
  return shopId ? parseInt(shopId) : null;
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

export const storeAuthData = (authData: AuthResponse) => {
  localStorage.setItem("accessToken", authData.accessToken);
  localStorage.setItem("refreshToken", authData.refreshToken);
  localStorage.setItem("userId", authData.userId.toString());
  localStorage.setItem("userEmail", authData.email);
  localStorage.setItem("userRoles", JSON.stringify(authData.roles));
  localStorage.setItem("companyId", authData.companyId.toString());

  if (authData.shopId) {
    localStorage.setItem("shopId", authData.shopId.toString());
  }

  // For backward compatibility
  localStorage.setItem("authToken", authData.accessToken);
};

export const clearAuthData = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userRoles");
  localStorage.removeItem("companyId");
  localStorage.removeItem("shopId");
  localStorage.removeItem("authToken"); // backward compatibility
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
  storeAuthData(authData);

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

    // Update stored tokens
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("authToken", data.accessToken); // backward compatibility

    // Update other data if provided
    if (data.userId) localStorage.setItem("userId", data.userId.toString());
    if (data.email) localStorage.setItem("userEmail", data.email);
    if (data.roles) localStorage.setItem("userRoles", JSON.stringify(data.roles));
    if (data.companyId) localStorage.setItem("companyId", data.companyId.toString());
    if (data.shopId) localStorage.setItem("shopId", data.shopId.toString());

    return data.accessToken;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
}

export const logout = async (router?: ReturnType<typeof useRouter>): Promise<void> => {
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

  // Clear local storage
  clearAuthData();

  // Redirect to login
  if (router) {
    router.push("/");
  } else if (typeof window !== 'undefined') {
    window.location.href = "/";
  }
};

export const logoutAllSessions = async (router?: ReturnType<typeof useRouter>): Promise<void> => {
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

  // Clear local storage and redirect
  clearAuthData();

  if (router) {
    router.push("/");
  } else if (typeof window !== 'undefined') {
    window.location.href = "/";
  }
};