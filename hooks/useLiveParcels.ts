"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { demoParcels } from "@/data/demoParcels";

export type LiveParcel = {
  id: string;
  code: string;
  lat: number;
  lng: number;
  status: string;
  eta?: string;
  city?: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

export function useLiveParcels(pollMs = 10_000) {
  const [parcels, setParcels] = useState<LiveParcel[]>([]);
  const [source, setSource] = useState<"live" | "demo" | "none">("none");
  const timer = useRef<number | null>(null);

  // Helper to fetch once
  async function fetchOnce() {
    if (!API_BASE) throw new Error("API base missing");
    const res = await fetch(`${API_BASE}/api/parcels/live`, { cache: "no-store" });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = (await res.json()) as any[];

    // Map to our LiveParcel shape (adjust if your field names differ)
    const mapped: LiveParcel[] = data.map((p: any) => ({
      id: p.id ?? p.code,
      code: p.code ?? p.id,
      lat: Number(p.lat),
      lng: Number(p.lng),
      status: String(p.status ?? "Unknown"),
      eta: p.eta ?? undefined,
      city: p.city ?? undefined,
    })).filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng));

    setParcels(mapped);
    setSource("live");
  }

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      try {
        await fetchOnce();                               // try live
      } catch {
        if (cancelled) return;
        setParcels(demoParcels);                         // fallback
        setSource("demo");
      }

      // set up polling (only if we’re in “live” mode)
      timer.current = window.setInterval(async () => {
        try {
          await fetchOnce();
        } catch {
          // if live fetch fails later, stay with whatever we had
        }
      }, pollMs) as unknown as number;
    };

    start();

    return () => {
      cancelled = true;
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [pollMs]);

  // If live returned empty array, keep demo so the UI is not blank
  const effective = useMemo<LiveParcel[]>(() => {
    if (source === "live" && parcels.length > 0) return parcels;
    if (source === "live" && parcels.length === 0) return demoParcels;
    if (source === "demo") return demoParcels;
    return [];
  }, [parcels, source]);

  return { parcels: effective, source };
}
