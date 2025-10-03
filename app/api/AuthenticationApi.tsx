"use client";

export interface UserRegistrationRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roles?: string[];
  phoneNumber?: string;
  address?: string;
}

export interface UserResponse {
  id?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
  enabled?: boolean;
  createdTimestamp?: string;
  phoneNumber?: string;
  address?: string;
}

export interface AuthResponse {
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  username?: string;
  email?: string;
  roles?: string[];
  userId?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ApiError {
  message: string;
  status?: number;
  statusText?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const AUTH_BASE = `${API_BASE}/api/auth/api/auth`;

export class AuthenticationError extends Error {
  constructor(
    message: string,
    public status?: number,
    public statusText?: string
  ) {
    super(message);
    this.name = "AuthenticationError";
  }
}

// Cookie utility functions
const cookieManager = {
  setCookie: (name: string, value: string, days: number = 7) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict${process.env.NODE_ENV === 'production' ? ';Secure' : ''}`;
  },

  getCookie: (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  },

  deleteCookie: (name: string) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  },

  // Parse JWT to get expiration
  getTokenExpiry: (token: string | null): number => {
    if (!token) return 0;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000; // Convert to milliseconds
    } catch {
      return 0;
    }
  }
};

// Generic response handler
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

    try {
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } else {
        const textError = await response.text();
        if (textError) errorMessage = textError;
      }
    } catch {
      // fallback to default message
    }

    throw new AuthenticationError(errorMessage, response.status, response.statusText);
  }

  return response.json();
}

// ---------- API Requests (for auth endpoints only) ----------
async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${AUTH_BASE}${path}`, {
    ...options,
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: 'include', // Include cookies in requests
  });
  return handleResponse<T>(response);
}

export async function registerUser(payload: UserRegistrationRequest): Promise<UserResponse> {
  return apiRequest<UserResponse>("/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload: LoginRequest): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>("/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  // Store non-sensitive user info in cookies (not localStorage)
  if (response.username) cookieManager.setCookie('username', response.username);
  if (response.userId) cookieManager.setCookie('userId', response.userId);
  if (response.roles) cookieManager.setCookie('roles', JSON.stringify(response.roles));
  console.log("Login successful, user info stored in cookies", response);

  return response;
}

export async function refreshToken(): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/refresh", {
    method: "POST",
  });
}

export async function logoutUser(): Promise<void> {
  try {
    await apiRequest("/logout", {
      method: "POST",
    });
  } finally {
    // Clear all client-side storage
    cookieManager.deleteCookie('accessToken');
    cookieManager.deleteCookie('refreshToken');
    localStorage.clear();
  }
}

export async function getUserById(userId: string): Promise<UserResponse> {
  return apiRequest<UserResponse>(`/users/${userId}`);
}

export async function getUsersByRole(role: string): Promise<UserResponse[]> {
  return apiRequest<UserResponse[]>(`/users/role/${role}`);
}

// ---------- Token Manager (Updated for cookies) ----------
export const tokenManager = {
  getAccessToken: (): string | null => cookieManager.getCookie('accessToken'),
  getRefreshToken: (): string | null => cookieManager.getCookie('refreshToken'),
  getUsername: () => cookieManager.getCookie('username'),
  getUserId: () => cookieManager.getCookie('userId'),

  getRoles: (): string[] => {
    const rolesStr = cookieManager.getCookie('roles');
    if (!rolesStr) return [];
    try {
      return JSON.parse(rolesStr);
    } catch {
      return [];
    }
  },

  clearTokens: () => {
    cookieManager.deleteCookie('accessToken');
    cookieManager.deleteCookie('refreshToken');
    cookieManager.deleteCookie('username');
    cookieManager.deleteCookie('userId');
    cookieManager.deleteCookie('roles');
  },

  isTokenExpired: (): boolean => {
    const token = cookieManager.getCookie('accessToken');
    if (!token) return true;
    
    const expiry = cookieManager.getTokenExpiry(token);
    return Date.now() >= expiry;
  },

  isAuthenticated: (): boolean => {
    const token = cookieManager.getCookie('accessToken');
    const roles = tokenManager.getRoles();
    return !!token && !tokenManager.isTokenExpired() && Array.isArray(roles) && roles.length > 0;
  },

  hasRole: (role: string): boolean => {
    const roles = tokenManager.getRoles();
    return roles.includes(role) || roles.includes(role.toUpperCase());
  },
};

// ---------- Auth Interceptor (Simplified with cookies) ----------
export const authInterceptor = {
  async makeAuthenticatedRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    try {
      // Check authentication and refresh if needed
      if (!tokenManager.isAuthenticated()) {
        const refreshResponse = await refreshToken();
        if (refreshResponse.accessToken) {
          cookieManager.setCookie('accessToken', refreshResponse.accessToken, 1);
        }
        if (refreshResponse.refreshToken) {
          cookieManager.setCookie('refreshToken', refreshResponse.refreshToken, 7);
        }
      }

      const requestUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
      
      const response = await fetch(requestUrl, {
        ...options,
        credentials: 'include',
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          ...((options.headers as Record<string, string>) || {}),
        },
      });

      return handleResponse<T>(response);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        tokenManager.clearTokens();
      }
      throw error;
    }
  }
};

export default {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  getUserById,
  getUsersByRole,
  tokenManager,
  authInterceptor,
  AuthenticationError,
};