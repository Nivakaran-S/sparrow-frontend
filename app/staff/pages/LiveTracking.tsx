'use client'
import { useState, useMemo, useEffect } from "react";
import LiveMap from "../components/LiveMap";
import StatusTimeline from "../components/StatusTimeline";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-gateway-nine-orpin.vercel.app/api/parcels";

type Tracking = {
  _id: string;
  trackingNumber: string;
  status: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
    address: string;
    timestamp: string;
  };
  sender: {
    name: string;
    address: string;
  };
  receiver: {
    name: string;
    address: string;
  };
  events: Array<{
    status: string;
    timestamp: string;
    description?: string;
    location?: {
      address: string;
    };
  }>;
  driver?: {
    userName: string;
    entityId: string;
  };
  lastUpdate?: string;
};

type MapParcel = {
  id: string;
  code: string;
  city: string;
  lat: number;
  lng: number;
  status: string;
  eta?: string;
};

export type StatusEvent = {
  time: string;
  status: string;
  note?: string;
};

// Helper function to extract city from address
const extractCity = (address: string): string => {
  if (!address) return "Unknown";
  const parts = address.split(',').map(s => s.trim());
  return parts.length >= 2 ? parts[parts.length - 2] : parts[0] || "Unknown";
};

// Helper to get coordinates from address
const getCoordinatesFromCity = (city: string): { lat: number; lng: number } => {
  const cityCoords: Record<string, { lat: number; lng: number }> = {
    "New York": { lat: 40.7128, lng: -74.0060 },
    "Los Angeles": { lat: 34.0522, lng: -118.2437 },
    "Chicago": { lat: 41.8781, lng: -87.6298 },
    "Houston": { lat: 29.7604, lng: -95.3698 },
    "Phoenix": { lat: 33.4484, lng: -112.0740 },
    "Philadelphia": { lat: 39.9526, lng: -75.1652 },
    "San Antonio": { lat: 29.4241, lng: -98.4936 },
    "San Diego": { lat: 32.7157, lng: -117.1611 },
    "Dallas": { lat: 32.7767, lng: -96.7970 },
    "San Jose": { lat: 37.3382, lng: -121.8863 },
  };
  return cityCoords[city] || { lat: 40.7128, lng: -74.0060 };
};

export default function LiveTracking() {
  const [trackings, setTrackings] = useState<Tracking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [cityFilter, setCityFilter] = useState<string>("All");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Fetch active trackings with location
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/tracking/active-with-location`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setTrackings(data.data || []);
        setLastRefresh(new Date());
      } else {
        console.error('Failed to fetch tracking data');
      }
    } catch (error) {
      console.error('Error fetching live tracking data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, []);

  // Transform trackings to map format
  const mapParcels: MapParcel[] = useMemo(() => {
    return trackings.map(tracking => {
      let lat = 40.7128;
      let lng = -74.0060;
      let city = "Unknown";

      if (tracking.currentLocation) {
        lat = tracking.currentLocation.latitude;
        lng = tracking.currentLocation.longitude;
        city = extractCity(tracking.currentLocation.address);
      } else if (tracking.receiver?.address) {
        city = extractCity(tracking.receiver.address);
        const coords = getCoordinatesFromCity(city);
        lat = coords.lat;
        lng = coords.lng;
      }

      return {
        id: tracking._id,
        code: tracking.trackingNumber,
        city,
        lat,
        lng,
        status: tracking.status,
        eta: tracking.lastUpdate 
          ? new Date(tracking.lastUpdate).toLocaleString()
          : "—"
      };
    });
  }, [trackings]);

  const cityGroups = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of mapParcels) {
      const key = p.city ?? "Unknown";
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    const rows = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    return rows;
  }, [mapParcels]);

  const filteredParcels = useMemo(() => {
    if (cityFilter === "All") return mapParcels;
    return mapParcels.filter(p => (p.city ?? "Unknown") === cityFilter);
  }, [mapParcels, cityFilter]);

  useEffect(() => {
    if (filteredParcels.length === 0) { 
      setSelectedId(null); 
      return; 
    }
    if (!selectedId || !filteredParcels.some(p => p.id === selectedId)) {
      setSelectedId(filteredParcels[0].id);
    }
  }, [filteredParcels, selectedId]);

  // Get status history for selected tracking
  const selectedHistory: StatusEvent[] = useMemo(() => {
    if (!selectedId) return [];
    
    const tracking = trackings.find(t => t._id === selectedId);
    if (!tracking) return [];

    return tracking.events.map(event => ({
      time: event.timestamp,
      status: event.status,
      note: event.description || event.location?.address || undefined
    }));
  }, [selectedId, trackings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-white text-xl">Loading live tracking data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Live Tracking</h2>
          <p className="text-gray-400 mt-1">Real-time parcel location and status monitoring</p>
          <p className="text-gray-500 text-xs mt-1">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {mapParcels.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-12 text-center">
          <div className="text-gray-400 text-lg">No active deliveries at the moment</div>
          <p className="text-gray-500 text-sm mt-2">Parcels in transit will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
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
                  Active Deliveries ({mapParcels.length})
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
                    <span className="text-xs">Count: {mapParcels.length}</span>
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
                      <span className="text-xs text-gray-400 capitalize">
                        {p.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400">
                      City: {p.city ?? "—"} • Last Update: {p.eta ?? "—"}
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
                Status History {selectedId ? `(${filteredParcels.find(p => p.id === selectedId)?.code})` : ""}
              </h4>
              <div className="max-h-60 overflow-y-auto">
                {selectedHistory.length > 0 ? (
                  <StatusTimeline events={selectedHistory} />
                ) : (
                  <div className="text-center py-4 text-gray-400 text-sm">
                    Select a parcel to view its status history
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}