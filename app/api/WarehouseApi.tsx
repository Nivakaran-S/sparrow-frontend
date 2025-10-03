"use client";

import { authInterceptor, AuthenticationError } from '../api/AuthenticationApi';

export type WarehouseStatus = "ACTIVE" | "INACTIVE" | "MAINTENANCE" | "FULL";

export interface Location {
  latitude?: number;
  longitude?: number;
}

export interface Warehouse {
  id?: string;
  warehouseCode: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  capacity: number;
  currentUtilization: number;
  supportedParcelTypes?: string[];
  availableServices?: string[];
  status?: WarehouseStatus;
  createdAt?: string;
  updatedAt?: string;
  location?: Location;
}

// Use the same API_BASE pattern as your auth API
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const WAREHOUSE_BASE = `${API_BASE}/api/warehouses`;

// Helper function for warehouse API requests with authentication
async function warehouseApiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    // Use your existing authInterceptor for automatic token refresh
    return await authInterceptor.makeAuthenticatedRequest<T>(
      `${WAREHOUSE_BASE}${path}`,
      {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      }
    );
  } catch (error) {
    if (error instanceof AuthenticationError) {
      // Redirect to login for auth errors
      // Note: We can't clear HTTP-only cookies from client-side
      // The server should handle cookie invalidation
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error("Authentication required. Please login again.");
    }
    throw error;
  }
}

// ---------- Warehouse APIs ----------
export async function getAllWarehouses(): Promise<Warehouse[]> {
  return warehouseApiRequest<Warehouse[]>("/");
}

export async function createWarehouse(warehouse: Warehouse): Promise<Warehouse> {
  return warehouseApiRequest<Warehouse>("/", {
    method: "POST",
    body: JSON.stringify(warehouse),
  });
}

export async function getWarehouseById(id: string): Promise<Warehouse> {
  return warehouseApiRequest<Warehouse>(`/${id}`);
}

export async function getWarehouseByCode(warehouseCode: string): Promise<Warehouse> {
  return warehouseApiRequest<Warehouse>(`/code/${warehouseCode}`);
}

export async function getWarehousesByCity(city: string): Promise<Warehouse[]> {
  return warehouseApiRequest<Warehouse[]>(`/city/${city}`);
}

export async function getWarehousesByStatus(status: WarehouseStatus): Promise<Warehouse[]> {
  return warehouseApiRequest<Warehouse[]>(`/status/${status}`);
}

export async function updateWarehouseStatus(id: string, status: WarehouseStatus): Promise<Warehouse> {
  return warehouseApiRequest<Warehouse>(`/${id}/status/${status}`, {
    method: "PATCH",
  });
}

export async function updateWarehouseCapacity(id: string, utilization: number): Promise<Warehouse> {
  return warehouseApiRequest<Warehouse>(`/${id}/capacity?utilization=${utilization}`, {
    method: "PATCH",
  });
}

export async function findAvailableWarehouses(
  requiredCapacity?: number,
  city?: string
): Promise<Warehouse[]> {
  const params = new URLSearchParams();
  if (requiredCapacity !== undefined) params.append("requiredCapacity", requiredCapacity.toString());
  if (city) params.append("city", city);

  return warehouseApiRequest<Warehouse[]>(`/available?${params.toString()}`);
}



export default {
  getAllWarehouses,
  createWarehouse,
  getWarehouseById,
  getWarehouseByCode,
  getWarehousesByCity,
  getWarehousesByStatus,
  updateWarehouseStatus,
  updateWarehouseCapacity,
  findAvailableWarehouses
};