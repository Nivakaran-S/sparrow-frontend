// lib/api.ts - API Utility Functions

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-gateway-nine-orpin.vercel.app";

interface FetchOptions extends RequestInit {
  credentials?: RequestCredentials;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: FetchOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: response.statusText }));
    throw new ApiError(response.status, errorData.message || errorData.error || 'API request failed');
  }

  return response.json();
}

// Parcel API
export const parcelApi = {
  getAll: () => fetchApi<any>('/api/parcels'),
  
  getById: (id: string) => fetchApi<any>(`/api/parcels/${id}`),
  
  getByTrackingNumber: (trackingNumber: string) => 
    fetchApi<any>(`/api/parcels/tracking/${trackingNumber}`),
  
  create: (data: any) => 
    fetchApi<any>('/api/parcels', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: any) => 
    fetchApi<any>(`/api/parcels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  updateStatus: (id: string, statusData: any) => 
    fetchApi<any>(`/api/parcels/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(statusData),
    }),
  
  delete: (id: string) => 
    fetchApi<any>(`/api/parcels/${id}`, {
      method: 'DELETE',
    }),
};

// Warehouse API
export const warehouseApi = {
  getAll: () => fetchApi<any>('/api/warehouses'),
  
  getById: (id: string) => fetchApi<any>(`/api/warehouses/${id}`),
  
  create: (data: any) => 
    fetchApi<any>('/api/warehouses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: any) => 
    fetchApi<any>(`/api/warehouses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  updateStatus: (id: string, status: string) => 
    fetchApi<any>(`/api/warehouses/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  
  delete: (id: string) => 
    fetchApi<any>(`/api/warehouses/${id}`, {
      method: 'DELETE',
    }),
};

// Consolidation API
export const consolidationApi = {
  getAll: () => fetchApi<any>('/api/consolidations'),
  
  getById: (id: string) => fetchApi<any>(`/api/consolidations/id/${id}`),
  
  getByReference: (referenceCode: string) => 
    fetchApi<any>(`/api/consolidations/reference/${referenceCode}`),
  
  create: (data: any) => 
    fetchApi<any>('/api/consolidations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  updateStatus: (id: string, statusData: any) => 
    fetchApi<any>(`/api/consolidations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(statusData),
    }),
  
  addParcel: (id: string, parcelId: string) => 
    fetchApi<any>(`/api/consolidations/${id}/parcels`, {
      method: 'POST',
      body: JSON.stringify({ parcelId }),
    }),
  
  removeParcel: (id: string, parcelId: string) => 
    fetchApi<any>(`/api/consolidations/${id}/parcels/${parcelId}`, {
      method: 'DELETE',
    }),
  
  delete: (id: string) => 
    fetchApi<any>(`/api/consolidations/${id}`, {
      method: 'DELETE',
    }),
};

// Address API
export const addressApi = {
  getAll: () => fetchApi<any>('/api/warehouses/addresses'),
  
  getById: (id: string) => fetchApi<any>(`/api/warehouses/addresses/${id}`),
  
  create: (data: any) => 
    fetchApi<any>('/api/warehouses/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: any) => 
    fetchApi<any>(`/api/warehouses/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  delete: (id: string) => 
    fetchApi<any>(`/api/warehouses/addresses/${id}`, {
      method: 'DELETE',
    }),
};

// User API
export const userApi = {
  getAll: (params?: { role?: string; limit?: number; skip?: number }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    return fetchApi<any>(`/api/users?${queryParams}`);
  },
  
  getStats: () => fetchApi<any>('/api/users/stats'),
  
  getStaff: (id: string) => fetchApi<any>(`/api/users/staff/${id}`),
  
  getCustomer: (id: string) => fetchApi<any>(`/api/users/customer/${id}`),
  
  getDriver: (id: string) => fetchApi<any>(`/api/users/driver/${id}`),
};

// Auth API
export const authApi = {
  checkCookie: () => fetchApi<any>('/check-cookie'),
  
  logout: () => 
    fetchApi<any>('/logout', {
      method: 'POST',
    }),
};

// Export all APIs
export const api = {
  parcels: parcelApi,
  warehouses: warehouseApi,
  consolidations: consolidationApi,
  addresses: addressApi,
  users: userApi,
  auth: authApi,
};

export default api;