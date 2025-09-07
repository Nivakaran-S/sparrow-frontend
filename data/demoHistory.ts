// data/demoHistory.ts
export type StatusEvent = {
  time: string;       // ISO string
  status: string;     // e.g., "Dispatched", "In Transit"
  note?: string;
};

// Map parcelId -> history
export const demoHistory: Record<string, StatusEvent[]> = {
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
