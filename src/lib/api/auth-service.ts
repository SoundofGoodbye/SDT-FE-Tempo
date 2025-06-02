// src/lib/api/auth-service.ts
export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081";
}

// Parse JWT and return payload, or null if invalid
export function parseJwt(token: string): Record<string, any> | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch (e) {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true;
  return Date.now() >= payload.exp * 1000;
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("authToken");
  return !!token && !isTokenExpired(token);
}

export function logout(router: any) {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("companyId");
  if (router) router.push("/");
}

// **Production-ready login** (no hardcoding)
// Returns {accessToken, ...userInfo} on success or throws error
export async function login({ email, password }: { email: string, password: string }) {
  const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Authentication failed");
  }

  const data = await response.json();
  if (!data.accessToken) {
    throw new Error("No token in response");
  }
  localStorage.setItem("authToken", data.accessToken);
  // Optionally store userId, companyId, roles, etc. if present
  if (data.userId) localStorage.setItem("userId", data.userId);
  if (data.companyId) localStorage.setItem("companyId", String(data.companyId));
  return data;
}
