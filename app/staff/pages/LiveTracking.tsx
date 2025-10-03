'use client'
import { useState, useMemo, useEffect } from "react";
import { useLiveParcels } from "../components/useLiveParcels";
import LiveMap from "../components/LiveMap";
import StatusTimeline from "../components/StatusTimeline";

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


export default function LiveTracking() {
  const { parcels, source } = useLiveParcels();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState<string>("All");

  const cityGroups = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of parcels) {
      const key = p.city ?? "Unknown";
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    const rows = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    return rows;
  }, [parcels]);

  const filteredParcels = useMemo(() => {
    if (cityFilter === "All") return parcels;
    return parcels.filter(p => (p.city ?? "Unknown") === cityFilter);
  }, [parcels, cityFilter]);

  useEffect(() => {
    if (filteredParcels.length === 0) { setSelectedId(null); return; }
    if (!selectedId || !filteredParcels.some(p => p.id === selectedId)) {
      setSelectedId(filteredParcels[0].id);
    }
  }, [filteredParcels, selectedId]);

  const selectedHistory = selectedId ? (demoHistory[selectedId] ?? []) : [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">Live Tracking</h2>
        <p className="text-gray-400 mt-1">Real-time parcel location and status monitoring</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 ">
            <LiveMap
              parcels={filteredParcels as any}
              selectedId={selectedId}
              onSelect={(id) => setSelectedId(id)}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-blue-400 text-lg font-semibold">
                Active Deliveries ({source})
              </h3>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="px-2 py-1 bg-gray-900 border border-gray-600 rounded text-white text-xs focus:border-blue-500 focus:outline-none"
              >
                <option value="All">All Cities</option>
                {cityGroups.map(([city]) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 mb-4">
              <div className="text-xs text-gray-400 mb-2">Consolidation by City</div>
              <button
                onClick={() => setCityFilter("All")}
                className={`w-full p-2 text-left rounded transition-colors ${
                  cityFilter === "All" 
                    ? "bg-blue-500/20 border border-blue-500/30 text-blue-400" 
                    : "bg-gray-900 border border-gray-700 text-gray-300 hover:bg-gray-800"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">All Cities</span>
                  <span className="text-xs">Count: {parcels.length}</span>
                </div>
              </button>
              {cityGroups.map(([city, count]) => (
                <button
                  key={city}
                  onClick={() => setCityFilter(city)}
                  className={`w-full p-2 text-left rounded transition-colors ${
                    cityFilter === city 
                      ? "bg-blue-500/20 border border-blue-500/30 text-blue-400" 
                      : "bg-gray-900 border border-gray-700 text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{city}</span>
                    <span className="text-xs">Count: {count}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filteredParcels.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`w-full p-3 text-left rounded transition-colors ${
                    p.id === selectedId
                      ? "bg-blue-500/20 border border-blue-500/30"
                      : "bg-gray-900 border border-gray-700 hover:bg-gray-800"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm font-medium ${
                      p.id === selectedId ? "text-blue-400" : "text-white"
                    }`}>
                      {p.code}
                    </span>
                    <span className="text-xs text-gray-400">Status: {p.status}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    City: {p.city ?? "—"} • ETA: {p.eta ?? "—"}
                  </div>
                </button>
              ))}
              {filteredParcels.length === 0 && (
                <div className="text-center py-4 text-gray-400 text-sm">
                  No parcels in this city.
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
            <h4 className="text-blue-400 text-lg font-semibold mb-4">
              Status History {selectedId ? `(${selectedId})` : ""}
            </h4>
            <div className="max-h-60 overflow-y-auto">
              <StatusTimeline events={selectedHistory} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}