"use client";
import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-gateway-nine-orpin.vercel.app";

const TrackShipments = () => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [parcelData, setParcelData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const trackParcel = async () => {
    if (!trackingNumber.trim()) {
      setError("Please enter a tracking number");
      return;
    }

    setLoading(true);
    setError("");
    setParcelData(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/parcels/tracking/${trackingNumber}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const result = await response.json();
        setParcelData(result.data);
      } else {
        setError("Parcel not found. Please check your tracking number.");
      }
    } catch (error) {
      console.error('Error tracking parcel:', error);
      setError("Error tracking parcel. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      created: "bg-gray-500",
      at_warehouse: "bg-yellow-500",
      consolidated: "bg-blue-500",
      in_transit: "bg-purple-500",
      out_for_delivery: "bg-orange-500",
      delivered: "bg-green-500",
      cancelled: "bg-red-500"
    };
    return colors[status] || "bg-gray-500";
  };

  const getStatusLabel = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getProgressPercentage = (status: string) => {
    const statusMap: Record<string, number> = {
      created: 20,
      at_warehouse: 40,
      consolidated: 60,
      in_transit: 80,
      out_for_delivery: 90,
      delivered: 100,
      cancelled: 0
    };
    return statusMap[status] || 0;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      trackParcel();
    }
  };

  return (
    <div className="text-white">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Track Your Shipment</h2>
        <p className="text-gray-400">Enter your tracking number to get real-time updates</p>
      </div>

      {/* Search Box */}
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
                '🔍 Track'
              )}
            </button>
          </div>
          {error && (
            <p className="mt-3 text-red-400 text-sm">{error}</p>
          )}
        </div>
      </div>

      {/* Tracking Results */}
      {parcelData && (
        <div className="space-y-6">
          {/* Status Overview */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">Tracking Number</p>
                <p className="text-white text-2xl font-mono font-bold">{parcelData.trackingNumber}</p>
              </div>
              <span className={`px-6 py-3 rounded-full text-lg font-medium ${getStatusColor(parcelData.status)} bg-opacity-20 text-white`}>
                {getStatusLabel(parcelData.status)}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">Delivery Progress</span>
                <span className="text-blue-400 text-sm font-semibold">{getProgressPercentage(parcelData.status)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${getProgressPercentage(parcelData.status)}%` }}
                ></div>
              </div>
            </div>

            {/* Estimated Delivery */}
            <div className="flex items-center gap-2 text-gray-400">
              <span>📅</span>
              <span>Created: {new Date(parcelData.createdTimeStamp).toLocaleString()}</span>
            </div>
          </div>

          {/* Shipment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sender */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6">
              <h3 className="text-blue-400 font-semibold mb-4 flex items-center gap-2">
                <span>📤</span> Sender Information
              </h3>
              <div className="space-y-2">
                <p className="text-white font-medium">{parcelData.sender?.name || 'N/A'}</p>
                <p className="text-gray-400 text-sm">{parcelData.sender?.phoneNumber || ''}</p>
                <p className="text-gray-400 text-sm">{parcelData.sender?.email || ''}</p>
                <p className="text-gray-400 text-sm mt-3">{parcelData.sender?.address || ''}</p>
              </div>
            </div>

            {/* Receiver */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6">
              <h3 className="text-green-400 font-semibold mb-4 flex items-center gap-2">
                <span>📥</span> Receiver Information
              </h3>
              <div className="space-y-2">
                <p className="text-white font-medium">{parcelData.receiver?.name || 'N/A'}</p>
                <p className="text-gray-400 text-sm">{parcelData.receiver?.phoneNumber || ''}</p>
                <p className="text-gray-400 text-sm">{parcelData.receiver?.email || ''}</p>
                <p className="text-gray-400 text-sm mt-3">{parcelData.receiver?.address || ''}</p>
              </div>
            </div>
          </div>

          {/* Package Details */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6">
            <h3 className="text-purple-400 font-semibold mb-4 flex items-center gap-2">
              <span>📦</span> Package Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-gray-400 text-sm mb-1">Weight</p>
                <p className="text-white font-medium text-lg">
                  {parcelData.weight?.value || 'N/A'} {parcelData.weight?.unit || ''}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Dimensions (L × W × H)</p>
                <p className="text-white font-medium text-lg">
                  {parcelData.dimensions?.length || 'N/A'} × {parcelData.dimensions?.width || 'N/A'} × {parcelData.dimensions?.height || 'N/A'} {parcelData.dimensions?.unit || ''}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-1">Status</p>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(parcelData.status)} bg-opacity-20 text-white inline-block`}>
                  {getStatusLabel(parcelData.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Tracking Timeline */}
          {parcelData.statusHistory && parcelData.statusHistory.length > 0 && (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6">
              <h3 className="text-yellow-400 font-semibold mb-6 flex items-center gap-2">
                <span>📍</span> Tracking Timeline
              </h3>
              <div className="space-y-4">
                {parcelData.statusHistory.map((history: any, index: number) => (
                  <div key={index} className="relative flex gap-4">
                    {/* Timeline Line */}
                    {index < parcelData.statusHistory.length - 1 && (
                      <div className="absolute left-4 top-10 w-0.5 h-full bg-gray-700"></div>
                    )}
                    
                    {/* Timeline Dot */}
                    <div className={`relative z-10 w-8 h-8 rounded-full ${getStatusColor(history.status)} flex items-center justify-center flex-shrink-0`}>
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-6">
                      <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(history.status)} bg-opacity-20 text-white`}>
                              {getStatusLabel(history.status)}
                            </span>
                            {history.location && (
                              <span className="text-gray-400 text-sm">📍 {history.location}</span>
                            )}
                          </div>
                        </div>
                        {history.note && (
                          <p className="text-white text-sm mb-2">{history.note}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>🕒 {new Date(history.timestamp).toLocaleString()}</span>
                          <span>• {history.service || 'Parcel Service'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Help Section */}
      {!parcelData && !loading && (
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