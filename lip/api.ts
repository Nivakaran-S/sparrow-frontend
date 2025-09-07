const BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

export async function api<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { ...opts, cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status} ${res.statusText}: ${path}\n${text}`);
  }
  return res.json();
}
