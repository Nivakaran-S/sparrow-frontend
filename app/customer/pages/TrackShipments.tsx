"use client";
import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-gateway-nine-orpin.vercel.app";

type TrackingEvent = {
  status: string;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  timestamp: string;
  description?: string;
  service?: string;
  note?: string;
};

type TrackingData = {
  _id: string;
  trackingNumber: string;
  currentStatus: string;
  status?: string;
  currentLocation?: {
    latitude?: number;
    longitude?: number;
    address?: string;
    timestamp?: string;
  };
  estimatedDelivery?: string;
  actualDelivery?: string;
  events: TrackingEvent[];
  statusHistory?: TrackingEvent[];
  sender?: {
    name?: string;
    address?: string;
    phoneNumber?: string;
    email?: string;
  };
  receiver?: {
    name?: string;
    address?: string;
    phoneNumber?: string;
    email?: string;
  };
  parcelId?: any;
  consolidationId?: any;
  assignedDriver?: any;
  weight?: {
    value?: number;
    unit?: string;
  };
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  createdTimeStamp?: string;
  createdTimestamp?: string;
};

interface TrackShipmentsProps {
  setActiveTab?: (tab: string) => void;
}

const TrackShipments = ({ setActiveTab }: TrackShipmentsProps) => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const trackParcel = async () => {
    if (!trackingNumber.trim()) {
      setError("Please enter a tracking number");
      return;
    }

    setLoading(true);
    setError("");
    setTrackingData(null);

    try {
      const parcelResponse = await fetch(
        `${API_BASE_URL}/api/parcels/api/parcels/tracking/${trackingNumber.trim()}`,
        {
          credentials: 'include'
        }
      );

      if (!parcelResponse.ok) {
        if (parcelResponse.status === 404) {
          throw new Error("Tracking number not found. Please check and try again.");
        }
        throw new Error("Failed to fetch tracking information.");
      }

      const parcelResult = await parcelResponse.json();
      const parcelData = parcelResult.success ? parcelResult.data : parcelResult;

      console.log('Raw parcel data:', parcelData);

      if (!parcelData) {
        throw new Error("No tracking data available.");
      }

      const normalizedData: TrackingData = {
        _id: parcelData._id,
        trackingNumber: parcelData.trackingNumber,
        currentStatus: parcelData.status || 'created',
        status: parcelData.status || 'created',
        sender: parcelData.sender,
        receiver: parcelData.receiver,
        events: Array.isArray(parcelData.statusHistory) && parcelData.statusHistory.length > 0 
          ? parcelData.statusHistory 
          : [{
              status: parcelData.status || 'created',
              timestamp: parcelData.createdTimeStamp || parcelData.createdTimestamp || new Date().toISOString(),
              description: 'Parcel created',
              service: 'parcel-service'
            }],
        statusHistory: parcelData.statusHistory || [],
        parcelId: parcelData._id,
        consolidationId: parcelData.consolidationId,
        assignedDriver: parcelData.assignedDriver,
        weight: parcelData.weight,
        dimensions: parcelData.dimensions,
        estimatedDelivery: parcelData.estimatedDelivery,
        actualDelivery: parcelData.actualDelivery,
        createdTimeStamp: parcelData.createdTimeStamp,
        createdTimestamp: parcelData.createdTimestamp,
        currentLocation: parcelData.warehouseId ? {
          address: 'At warehouse'
        } : undefined
      };

      console.log('Normalized data:', normalizedData);

      setTrackingData(normalizedData);
    } catch (err: any) {
      console.error("Error tracking parcel:", err);
      setError(err.message || "Failed to track parcel. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      created: "bg-gray-500",
      at_warehouse: "bg-yellow-500",
      consolidated: "bg-blue-500",
      assigned_to_driver: "bg-indigo-500",
      in_transit: "bg-purple-500",
      out_for_delivery: "bg-orange-500",
      delivered: "bg-green-500",
      cancelled: "bg-red-500",
      received_at_warehouse: "bg-blue-500",
      delayed: "bg-orange-500",
      exception: "bg-red-500"
    };
    return colors[status?.toLowerCase()] || "bg-gray-500";
  };

  const getStatusLabel = (status: string) => {
    if (!status) return 'Unknown';
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getProgressPercentage = (status: string) => {
    const statusMap: Record<string, number> = {
      created: 15,
      at_warehouse: 30,
      consolidated: 45,
      assigned_to_driver: 60,
      in_transit: 75,
      out_for_delivery: 90,
      delivered: 100,
      cancelled: 0
    };
    return statusMap[status?.toLowerCase()] || 0;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      trackParcel();
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getCurrentStatus = () => {
    return trackingData?.currentStatus || trackingData?.status || 'unknown';
  };

  const getEvents = () => {
    if (trackingData?.events && trackingData.events.length > 0) {
      return trackingData.events;
    }
    if (trackingData?.statusHistory && trackingData.statusHistory.length > 0) {
      return trackingData.statusHistory;
    }
    return [];
  };

  return (
    <div className="text-white">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold mb-2">Track Your Shipment</h2>
          <p className="text-gray-400">Enter your tracking number to get real-time updates</p>
        </div>
        {setActiveTab && (
          <button
            onClick={() => setActiveTab('parcels')}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            ← View All Parcels
          </button>
        )}
      </div>

      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-8 mb-8">
        <div className="max-w-2xl mx-auto">
          <label className="block text-gray-400 text-sm font-medium mb-3">
            Tracking Number
          </label>
          <div className="flex gap-4">
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter tracking number (e.g., TRK12345678)"
              className="flex-1 px-6 py-4 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={trackParcel}
              disabled={loading}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  <span>Tracking...</span>
                </div>
              ) : (
                'Track'
              )}
            </button>
          </div>
          {error && (
            <p className="mt-3 text-red-400 text-sm">{error}</p>
          )}
        </div>
      </div>

      {trackingData && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">Tracking Number</p>
                <p className="text-white text-2xl font-mono font-bold">{trackingData.trackingNumber}</p>
              </div>
              <span className={`px-6 py-3 rounded-full text-lg font-medium ${getStatusColor(getCurrentStatus())} bg-opacity-20 text-white`}>
                {getStatusLabel(getCurrentStatus())}
              </span>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">Delivery Progress</span>
                <span className="text-blue-400 text-sm font-semibold">{getProgressPercentage(getCurrentStatus())}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${getProgressPercentage(getCurrentStatus())}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <span>📅</span>
                <span>Created: {formatDate(trackingData.createdTimeStamp || trackingData.createdTimestamp || '')}</span>
              </div>
              {trackingData.estimatedDelivery && (
                <div className="flex items-center gap-2">
                  <span>🎯</span>
                  <span>Est. Delivery: {formatDate(trackingData.estimatedDelivery)}</span>
                </div>
              )}
            </div>
          </div>

          {trackingData.currentLocation?.address && (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6">
              <h3 className="text-yellow-400 font-semibold mb-4 flex items-center gap-2">
                <span>📍</span> Current Location
              </h3>
              <p className="text-white font-semibold text-lg">{trackingData.currentLocation.address}</p>
              {trackingData.currentLocation.timestamp && (
                <p className="text-gray-400 text-sm mt-2">
                  Last updated: {formatDate(trackingData.currentLocation.timestamp)}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {trackingData.sender && trackingData.sender.name && (
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6">
                <h3 className="text-blue-400 font-semibold mb-4 flex items-center gap-2">
                  <span>📤</span> Sender Information
                </h3>
                <div className="space-y-2">
                  <p className="text-white font-medium">{trackingData.sender.name}</p>
                  {trackingData.sender.phoneNumber && (
                    <p className="text-gray-400 text-sm">{trackingData.sender.phoneNumber}</p>
                  )}
                  {trackingData.sender.email && (
                    <p className="text-gray-400 text-sm">{trackingData.sender.email}</p>
                  )}
                  {trackingData.sender.address && (
                    <p className="text-gray-400 text-sm mt-3">{trackingData.sender.address}</p>
                  )}
                </div>
              </div>
            )}

            {trackingData.receiver && trackingData.receiver.name && (
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6">
                <h3 className="text-green-400 font-semibold mb-4 flex items-center gap-2">
                  <span>📥</span> Receiver Information
                </h3>
                <div className="space-y-2">
                  <p className="text-white font-medium">{trackingData.receiver.name}</p>
                  {trackingData.receiver.phoneNumber && (
                    <p className="text-gray-400 text-sm">{trackingData.receiver.phoneNumber}</p>
                  )}
                  {trackingData.receiver.email && (
                    <p className="text-gray-400 text-sm">{trackingData.receiver.email}</p>
                  )}
                  {trackingData.receiver.address && (
                    <p className="text-gray-400 text-sm mt-3">{trackingData.receiver.address}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {trackingData.weight && (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6">
              <h3 className="text-purple-400 font-semibold mb-4 flex items-center gap-2">
                <span>📦</span> Package Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Weight</p>
                  <p className="text-white font-medium text-lg">
                    {trackingData.weight.value || 'N/A'} {trackingData.weight.unit || ''}
                  </p>
                </div>
                {trackingData.dimensions && (
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Dimensions (L × W × H)</p>
                    <p className="text-white font-medium text-lg">
                      {trackingData.dimensions.length || 'N/A'} × {trackingData.dimensions.width || 'N/A'} × {trackingData.dimensions.height || 'N/A'} {trackingData.dimensions.unit || ''}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-gray-400 text-sm mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(getCurrentStatus())} bg-opacity-20 text-white inline-block`}>
                    {getStatusLabel(getCurrentStatus())}
                  </span>
                </div>
              </div>
            </div>
          )}

          {trackingData.actualDelivery && (
            <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 rounded-xl border border-green-500/30 p-6">
              <p className="text-green-400 text-sm mb-2">✓ Delivered On</p>
              <p className="text-white font-semibold text-xl">{formatDate(trackingData.actualDelivery)}</p>
            </div>
          )}

          {getEvents().length > 0 ? (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6">
              <h3 className="text-yellow-400 font-semibold mb-6 flex items-center gap-2">
                <span>📍</span> Tracking Timeline
              </h3>
              <div className="space-y-4">
                {getEvents()
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((event: any, index: number) => (
                    <div key={index} className="relative flex gap-4">
                      {index < getEvents().length - 1 && (
                        <div className="absolute left-4 top-10 w-0.5 h-full bg-gray-700"></div>
                      )}
                      
                      <div className={`relative z-10 w-8 h-8 rounded-full ${getStatusColor(event.status)} flex items-center justify-center flex-shrink-0`}>
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>

                      <div className="flex-1 pb-6">
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)} bg-opacity-20 text-white`}>
                                {getStatusLabel(event.status)}
                              </span>
                              {event.location?.address && (
                                <span className="text-gray-400 text-sm">📍 {event.location.address}</span>
                              )}
                            </div>
                          </div>
                          {(event.note || event.description) && (
                            <p className="text-white text-sm mb-2">{event.note || event.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>🕒 {formatDate(event.timestamp)}</span>
                            {event.service && <span>• {event.service}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-8 text-center">
              <p className="text-gray-400">No tracking history available yet</p>
            </div>
          )}

          {(trackingData.consolidationId || trackingData.assignedDriver) && (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6">
              <h3 className="text-gray-400 font-semibold mb-3">Additional Information</h3>
              <div className="space-y-2 text-sm text-gray-400">
                {trackingData.consolidationId && (
                  <p className="flex items-center gap-2">
                    <span>📦</span> Part of consolidated shipment
                  </p>
                )}
                {trackingData.assignedDriver && (
                  <p className="flex items-center gap-2">
                    <span>🚚</span> Driver assigned
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {!trackingData && !loading && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-8 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-white mb-2">Track Your Package</h3>
          <p className="text-gray-400 mb-4">Enter your tracking number above to see real-time updates</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto">
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="text-3xl mb-2">📦</div>
              <p className="text-sm text-gray-400">Real-time tracking</p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="text-3xl mb-2">📍</div>
              <p className="text-sm text-gray-400">Location updates</p>
            </div>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <div className="text-3xl mb-2">🔔</div>
              <p className="text-sm text-gray-400">Instant notifications</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackShipments;