// paymentApi.tsx
"use client";

export interface Payment {
  id?: string;
  parcelId: string;
  userId: string;
  amount: number;
  currency?: string;
  paymentMethod: string;
  paymentStatus?: string;
  transactionId?: string;
  createdAt?: string; // ISO date-time
  updatedAt?: string; // ISO date-time
  receiptUrl?: string;
  qrCodeUrl?: string;
}

const API_BASE = "http://localhost:8080/api/payments";

// ---------- Payment APIs ----------
export async function getAllPayments(): Promise<Payment[]> {
  const res = await fetch(`${API_BASE}`);
  if (!res.ok) throw new Error("Failed to fetch payments");
  return res.json();
}

export async function createPayment(payload: Payment): Promise<Payment> {
  const res = await fetch(`${API_BASE}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create payment");
  return res.json();
}

export async function getPaymentById(id: string): Promise<Payment> {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch payment by ID");
  return res.json();
}

export async function getPaymentsByUserId(userId: string): Promise<Payment[]> {
  const res = await fetch(`${API_BASE}/user/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch payments by user ID");
  return res.json();
}

export async function updatePaymentStatus(
  id: string,
  status: string
): Promise<Payment> {
  const res = await fetch(`${API_BASE}/${id}/status?status=${encodeURIComponent(status)}`, {
    method: "PUT",
  });
  if (!res.ok) throw new Error("Failed to update payment status");
  return res.json();
}

export async function processPayment(id: string): Promise<Payment> {
  const res = await fetch(`${API_BASE}/${id}/process`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to process payment");
  return res.json();
}

export async function downloadReceipt(id: string): Promise<Blob> {
  const res = await fetch(`${API_BASE}/${id}/receipt`);
  if (!res.ok) throw new Error("Failed to download receipt");
  return res.blob();
}
