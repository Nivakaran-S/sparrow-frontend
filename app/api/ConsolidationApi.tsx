
"use client";

export type ParcelStatus = "RECEIVED" | "PROCESSING" | "CONSOLIDATED" | "SHIPPED" | "DELIVERED";
export type ConsolidationStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "SHIPPED";

export interface Parcel {
  id?: string;
  trackingNumber: string;
  customerId: string;
  weight: number;
  volume: number;
  origin: string;
  destination: string;
  status?: ParcelStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface ConsolidatedParcel {
  id?: string;
  consolidationId: string;
  parcelIds: string[];
  customerId: string;
  totalWeight: number;
  totalVolume: number;
  origin: string;
  destination: string;
  status?: ConsolidationStatus;
  createdAt?: string;
  updatedAt?: string;
}

const API_BASE = "http://localhost:8080/api";

// ---------- Parcel APIs ----------
export async function getAllParcels(): Promise<Parcel[]> {
  const res = await fetch(`${API_BASE}/parcels`);
  if (!res.ok) throw new Error("Failed to fetch parcels");
  return res.json();
}

export async function createParcel(parcel: Parcel): Promise<Parcel> {
  const res = await fetch(`${API_BASE}/parcels`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parcel),
  });
  if (!res.ok) throw new Error("Failed to create parcel");
  return res.json();
}

export async function getParcelById(id: string): Promise<Parcel> {
  const res = await fetch(`${API_BASE}/parcels/${id}`);
  if (!res.ok) throw new Error("Failed to fetch parcel");
  return res.json();
}

export async function deleteParcel(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/parcels/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete parcel");
}

export async function updateParcelStatus(id: string, status: ParcelStatus): Promise<Parcel> {
  const res = await fetch(`${API_BASE}/parcels/${id}/status/${status}`, { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to update parcel status");
  return res.json();
}

export async function getParcelsByStatus(status: ParcelStatus): Promise<Parcel[]> {
  const res = await fetch(`${API_BASE}/parcels/status/${status}`);
  if (!res.ok) throw new Error("Failed to fetch parcels by status");
  return res.json();
}

export async function getParcelsByCustomerId(customerId: string): Promise<Parcel[]> {
  const res = await fetch(`${API_BASE}/parcels/customer/${customerId}`);
  if (!res.ok) throw new Error("Failed to fetch parcels by customerId");
  return res.json();
}

// ---------- Consolidation APIs ----------
export async function getAllConsolidations(): Promise<ConsolidatedParcel[]> {
  const res = await fetch(`${API_BASE}/consolidations`);
  if (!res.ok) throw new Error("Failed to fetch consolidations");
  return res.json();
}

export async function createConsolidation(customerId: string, parcelIds: string[]): Promise<ConsolidatedParcel> {
  const res = await fetch(`${API_BASE}/consolidations?customerId=${customerId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parcelIds),
  });
  if (!res.ok) throw new Error("Failed to create consolidation");
  return res.json();
}

export async function updateConsolidationStatus(id: string, status: ConsolidationStatus): Promise<ConsolidatedParcel> {
  const res = await fetch(`${API_BASE}/consolidations/${id}/status/${status}`, { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to update consolidation status");
  return res.json();
}

export async function getConsolidationsByCustomerId(customerId: string): Promise<ConsolidatedParcel[]> {
  const res = await fetch(`${API_BASE}/consolidations/customer/${customerId}`);
  if (!res.ok) throw new Error("Failed to fetch consolidations by customerId");
  return res.json();
}
