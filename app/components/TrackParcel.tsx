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
  };
  receiver?: {
    name?: string;
    address?: string;
    phoneNumber?: string;
  };
  parcelId?: any;
  consolidationId?: any;
  assignedDriver?: any;
  weight?: {
    value?: number;
    unit?: string;
  };
  dimensions?: any;
};

export default function TrackParcel() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleTrack = async () => {
    if (!trackingNumber.trim()) {
      setError("Please enter a tracking number");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setTrackingData(null);

      // Try to get parcel directly to see actual data
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

      console.log('Raw parcel data:', parcelData); // Debug log

      if (!parcelData) {
        throw new Error("No tracking data available.");
      }

      // Transform parcel data to tracking format with proper handling
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
              timestamp: parcelData.createdTimeStamp || new Date().toISOString(),
              description: 'Parcel created',
              service: 'parcel-service'
            }],
        statusHistory: parcelData.statusHistory || [],
        parcelId: parcelData._id,
        consolidationId: parcelData.consolidationId,
        assignedDriver: parcelData.assignedDriver,
        weight: parcelData.weight,
        dimensions: parcelData.dimensions,
        currentLocation: parcelData.warehouseId ? {
          address: 'At warehouse'
        } : undefined
      };

      console.log('Normalized data:', normalizedData); // Debug log

      setTrackingData(normalizedData);
      setShowResults(true);
    } catch (err: any) {
      console.error("Error tracking parcel:", err);
      setError(err.message || "Failed to track parcel. Please try again.");
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTrack();
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

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'created': 'bg-gray-500',
      'at_warehouse': 'bg-blue-500',
      'consolidated': 'bg-purple-500',
      'assigned_to_driver': 'bg-indigo-500',
      'in_transit': 'bg-yellow-500',
      'out_for_delivery': 'bg-orange-500',
      'delivered': 'bg-green-500',
      'cancelled': 'bg-red-500',
      'received_at_warehouse': 'bg-blue-500',
      'delayed': 'bg-orange-500',
      'exception': 'bg-red-500'
    };
    return statusColors[status?.toLowerCase()] || 'bg-gray-500';
  };

  const formatStatus = (status: string) => {
    if (!status) return 'Unknown';
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleReset = () => {
    setTrackingNumber("");
    setTrackingData(null);
    setShowResults(false);
    setError(null);
  };

  return (
    <section className="min-h-[50vh] flex items-center justify-center w-[100%] bg-gradient-to-b from-[#111111] to-[#000000] py-16" id="tracking">
      <div className="text-center w-full max-w-4xl px-4">
        <h2 className="text-[2.5rem] font-bold text-[#fff]">Track Your Package</h2>
        <p className="text-[#fff] text-[20px]">Enter your tracking number to get real-time updates</p>
        <div className="h-[20px]"></div>
        
        <div className="flex flex-col md:flex-col gap-4 justify-center items-center">
          <input 
            type="text" 
            placeholder="Enter tracking number" 
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className="flex-1 max-w-[500px] px-6 border-2 border-[#333333] rounded-xl text-base outline-none transition-colors duration-300 h-[6vh] py-[15px] bg-[#1a1a1a] text-white placeholder-gray-500 focus:border-[#FFA00A] disabled:opacity-50"
          />
          <p>Try: TRK51990963AAMT</p>
          <button 
            onClick={handleTrack}
            disabled={loading}
            className="track-button px-8 py-3 bg-[#FFA00A] text-black rounded-xl font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(255,160,10,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Tracking...' : 'Track Now'}
          </button>
        </div>

        {showResults && (
          <div className="mt-4">
            <button 
              onClick={handleReset}
              className="text-[#FFA00A] hover:underline text-sm"
            >
              ← Track another package
            </button>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-900/30 border border-red-500 rounded-xl max-w-2xl mx-auto">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {showResults && trackingData && (
          <div className="mt-8 bg-gradient-to-br from-[#1a1a1a] to-[#111111] border border-[#333333] rounded-xl p-6 text-left max-w-3xl mx-auto">
            {/* Header Info */}
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-[#333333]">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Tracking: {trackingData.trackingNumber}</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(trackingData.currentStatus)}`}>
                    {formatStatus(trackingData.currentStatus)}
                  </span>
                </div>
              </div>
              {trackingData.weight && (
                <div className="text-right">
                  <p className="text-gray-400 text-xs">Weight</p>
                  <p className="text-white font-semibold">
                    {trackingData.weight.value} {trackingData.weight.unit}
                  </p>
                </div>
              )}
            </div>

            {/* Current Location */}
            {trackingData.currentLocation?.address && (
              <div className="mb-6 p-4 bg-[#222222] rounded-lg border border-[#333333]">
                <p className="text-gray-400 text-sm mb-1">Current Location</p>
                <p className="text-white font-semibold">{trackingData.currentLocation.address}</p>
                {trackingData.currentLocation.timestamp && (
                  <p className="text-gray-400 text-xs mt-1">
                    Last updated: {formatDate(trackingData.currentLocation.timestamp)}
                  </p>
                )}
              </div>
            )}

            {/* Sender & Receiver Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {trackingData.sender && trackingData.sender.name && (
                <div className="p-4 bg-[#222222] rounded-lg border border-[#333333]">
                  <p className="text-gray-400 text-sm mb-2">Sender</p>
                  <p className="text-white font-semibold">{trackingData.sender.name}</p>
                  {trackingData.sender.address && (
                    <p className="text-gray-300 text-sm mt-1">{trackingData.sender.address}</p>
                  )}
                  {trackingData.sender.phoneNumber && (
                    <p className="text-gray-300 text-sm mt-1">📱 {trackingData.sender.phoneNumber}</p>
                  )}
                </div>
              )}
              {trackingData.receiver && trackingData.receiver.name && (
                <div className="p-4 bg-[#222222] rounded-lg border border-[#333333]">
                  <p className="text-gray-400 text-sm mb-2">Receiver</p>
                  <p className="text-white font-semibold">{trackingData.receiver.name}</p>
                  {trackingData.receiver.address && (
                    <p className="text-gray-300 text-sm mt-1">{trackingData.receiver.address}</p>
                  )}
                  {trackingData.receiver.phoneNumber && (
                    <p className="text-gray-300 text-sm mt-1">📱 {trackingData.receiver.phoneNumber}</p>
                  )}
                </div>
              )}
            </div>

            {/* Estimated Delivery */}
            {trackingData.estimatedDelivery && (
              <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <p className="text-blue-400 text-sm">Estimated Delivery</p>
                <p className="text-white font-semibold text-lg">{formatDate(trackingData.estimatedDelivery)}</p>
              </div>
            )}

            {/* Actual Delivery */}
            {trackingData.actualDelivery && (
              <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                <p className="text-green-400 text-sm">✓ Delivered On</p>
                <p className="text-white font-semibold text-lg">{formatDate(trackingData.actualDelivery)}</p>
              </div>
            )}

            {/* Tracking Events Timeline */}
            {trackingData.events && trackingData.events.length > 0 ? (
              <div>
                <h4 className="text-lg font-bold text-white mb-4">Tracking History</h4>
                <div className="space-y-4">
                  {trackingData.events
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((event, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(event.status)}`}></div>
                          {index < trackingData.events.length - 1 && (
                            <div className="w-0.5 h-full bg-[#333333] mt-1"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-white font-semibold">{formatStatus(event.status)}</p>
                              {(event.description || event.note) && (
                                <p className="text-gray-400 text-sm mt-1">{event.description || event.note}</p>
                              )}
                              {event.location?.address && (
                                <p className="text-gray-400 text-sm mt-1">📍 {event.location.address}</p>
                              )}
                              {event.service && (
                                <p className="text-gray-500 text-xs mt-1">Service: {event.service}</p>
                              )}
                            </div>
                            <p className="text-gray-400 text-xs whitespace-nowrap ml-4">
                              {formatDate(event.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No tracking history available yet</p>
              </div>
            )}

            {/* Additional Info */}
            {(trackingData.consolidationId || trackingData.assignedDriver) && (
              <div className="mt-6 pt-4 border-t border-[#333333]">
                <p className="text-gray-400 text-xs">
                  {trackingData.consolidationId && (
                    <span className="block">📦 Part of consolidated shipment</span>
                  )}
                  {trackingData.assignedDriver && (
                    <span className="block mt-1">🚚 Driver assigned</span>
                  )}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}