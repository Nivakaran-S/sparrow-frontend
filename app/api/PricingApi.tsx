// pricingApi.tsx
"use client";

export interface PriceCategory {
  id?: string;
  name: string;
  description?: string;
  basePrice: number;
  pricePerKg: number;
  pricePerCubicCm: number;
  active?: boolean;
}

const API_BASE = "http://localhost:8080/api/pricing";

// ---------- Pricing APIs ----------
export async function getAllCategories(): Promise<PriceCategory[]> {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function getActiveCategories(): Promise<PriceCategory[]> {
  const res = await fetch(`${API_BASE}/categories/active`);
  if (!res.ok) throw new Error("Failed to fetch active categories");
  return res.json();
}

export async function getCategoryById(id: string): Promise<PriceCategory> {
  const res = await fetch(`${API_BASE}/categories/${id}`);
  if (!res.ok) throw new Error("Failed to fetch category by ID");
  return res.json();
}

export async function createCategory(
  payload: PriceCategory
): Promise<PriceCategory> {
  const res = await fetch(`${API_BASE}/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create category");
  return res.json();
}

export async function updateCategory(
  id: string,
  payload: PriceCategory
): Promise<PriceCategory> {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update category");
  return res.json();
}

export async function deleteCategory(id: string): Promise<Record<string, any>> {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete category");
  return res.json();
}

export async function calculatePrice(
  categoryId: string,
  weight: number,
  volume: number
): Promise<number> {
  const res = await fetch(
    `${API_BASE}/calculate?categoryId=${encodeURIComponent(
      categoryId
    )}&weight=${weight}&volume=${volume}`,
    { method: "POST" }
  );
  if (!res.ok) throw new Error("Failed to calculate price");
  return res.json();
}
