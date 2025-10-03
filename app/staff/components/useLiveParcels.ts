"use client";
import { useEffect, useMemo, useRef, useState } from "react";



type DemoParcel = {
  id: string;
  code: string;
  city: string;
  lat: number;
  lng: number;
  status: string;
  eta?: string;
};

const demoParcels: DemoParcel[] = [
  { id: "SP2024001", code: "SP2024001", city: "New York",     lat: 40.7128, lng: -74.0060, status: "Pending",     eta: "—" },
  { id: "SP2024002", code: "SP2024002", city: "Los Angeles",  lat: 34.0522, lng: -118.2437, status: "Processing", eta: "—" },
  { id: "SP2024003", code: "SP2024003", city: "Chicago",      lat: 41.8781, lng: -87.6298,  status: "Ready",      eta: "—" },
  { id: "SP2024004", code: "SP2024004", city: "Houston",      lat: 29.7604, lng: -95.3698,  status: "In Transit", eta: "—" },
];


// data/demoHistory.ts
export type StatusEvent = {
  time: string;       // ISO string
  status: string;     // e.g., "Dispatched", "In Transit"
  note?: string;
};

// Map parcelId -> history
const demoHistory: Record<string, StatusEvent[]> = {
  SP2024001: [
    { time: "2025-09-03T07:40:00Z", status: "Dispatched", note: "Left origin facility" },
    { time: "2025-09-03T12:15:00Z", status: "In Transit", note: "On route to hub" },
    { time: "2025-09-03T18:30:00Z", status: "Processing", note: "Scanned at NY hub" },
  ],
  SP2024002: [
    { time: "2025-09-03T06:05:00Z", status: "Dispatched", note: "Left origin facility" },
    { time: "2025-09-03T11:20:00Z", status: "In Transit" },
    { time: "2025-09-03T19:10:00Z", status: "Ready", note: "Out for handoff at LA DC" },
  ],
  SP2024003: [
    { time: "2025-09-02T09:00:00Z", status: "Dispatched" },
    { time: "2025-09-02T15:30:00Z", status: "In Transit" },
    { time: "2025-09-03T10:00:00Z", status: "Processing", note: "Arrived at Chicago hub" },
  ],
  SP2024004: [
    { time: "2025-09-02T08:10:00Z", status: "Dispatched" },
    { time: "2025-09-02T13:45:00Z", status: "In Transit" },
    { time: "2025-09-03T09:25:00Z", status: "In Transit", note: "Approaching Houston" },
  ],
};


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
