import { useState, useEffect } from "react";
import { Navigation, MapPin, Package, Phone, AlertTriangle, Clock, TrendingUp, RefreshCw } from "lucide-react";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://api-gateway-nine-orpin.vercel.app";

interface Parcel {
  _id: string;
  trackingNumber: string;
  receiver?: {
    name: string;
    phoneNumber: string;
    address: string;
  };
}

interface Delivery {
  _id: string;
  consolidationId?: {
    _id: string;
    masterTrackingNumber?: string;
    referenceCode: string;
    parcels?: Parcel[];
  };
  status: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
    address: string;
    timestamp: string;
  };
  startTime?: string;
  estimatedDeliveryTime?: string;
}

const GPSNavigation = ({ userId, setActiveTab }: { userId?: string; setActiveTab?: (tab: string) => void }) => {
  const [activeDelivery, setActiveDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [currentPosition, setCurrentPosition] = useState<{lat: number; lng: number} | null>(null);
  const [trafficReported, setTrafficReported] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (driverId) {
      fetchActiveDelivery();
      const interval = setInterval(fetchActiveDelivery, 30000);
      return () => clearInterval(interval);
    }
  }, [driverId]);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/check-cookie`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Authentication failed");

      const data = await response.json();
      if (data.role === "Driver") {
        setDriverId(data.id);
      } else {
        setError("Access denied. Driver role required.");
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setError("Authentication failed");
      setLoading(false);
    }
  };

  const fetchActiveDelivery = async () => {
    if (!driverId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/consolidations/api/deliveries/driver/${driverId}`,
        { credentials: "include" }
      );

      if (!response.ok) throw new Error("Failed to fetch active delivery");

      const result = await response.json();

      if (result.success) {
        const inProgressDelivery = result.data.find(
          (d: Delivery) => d.status === "in_progress"
        );
        setActiveDelivery(inProgressDelivery || null);
      }
    } catch (err: any) {
      console.error("Error fetching active delivery:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startNavigation = () => {
    if (!activeDelivery) {
      alert("No active delivery to navigate to");
      return;
    }

    const parcels = activeDelivery.consolidationId?.parcels || [];
    if (parcels.length > 0 && parcels[0].receiver?.address) {
      const destination = encodeURIComponent(parcels[0].receiver.address);
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`,
        "_blank"
      );
    } else {
      alert("Destination address not available");
    }
  };

  const recalculateRoute = () => {
    if (!activeDelivery || !currentPosition) {
      alert("Unable to recalculate route");
      return;
    }

    const parcels = activeDelivery.consolidationId?.parcels || [];
    if (parcels.length > 0 && parcels[0].receiver?.address) {
      const origin = `${currentPosition.lat},${currentPosition.lng}`;
      const destination = encodeURIComponent(parcels[0].receiver.address);
      window.open(
        `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`,
        "_blank"
      );
    }
  };

  const reportTraffic = () => {
    const report = prompt("Please describe the traffic situation:");
    if (report) {
      setTrafficReported(true);
      setTimeout(() => setTrafficReported(false), 3000);
      alert("Traffic report submitted. Thank you!");
      console.log("Traffic report:", report);
    }
  };

  const callCustomer = () => {
    const parcels = activeDelivery?.consolidationId?.parcels || [];
    if (parcels.length > 0 && parcels[0].receiver?.phoneNumber) {
      window.location.href = `tel:${parcels[0].receiver.phoneNumber}`;
    } else {
      alert("Customer phone number not available");
    }
  };

  const getETA = () => {
    if (!activeDelivery?.estimatedDeliveryTime) return "N/A";
    
    const eta = new Date(activeDelivery.estimatedDeliveryTime);
    const now = new Date();
    const diffMinutes = Math.round((eta.getTime() - now.getTime()) / (1000 * 60));
    
    if (diffMinutes < 0) return "Overdue";
    if (diffMinutes < 60) return `${diffMinutes} mins`;
    return `${Math.round(diffMinutes / 60)} hrs`;
  };

  const getDirections = () => {
    const parcels = activeDelivery?.consolidationId?.parcels || [];
    if (parcels.length === 0 || !parcels[0].receiver?.address) {
      return ["No destination information available"];
    }

    // Simplified directions - in a real app, you'd use Google Directions API
    return [
      "Continue on current road",
      `Navigate to ${parcels[0].receiver.address}`,
      "Destination will be on your right",
    ];
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading navigation data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-6">
          <h3 className="text-red-400 font-semibold mb-2">Error</h3>
          <p className="text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!activeDelivery) {
    return (
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-8">
          GPS Navigation
        </h2>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-12 text-center">
          <Navigation className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            No Active Delivery
          </h3>
          <p className="text-gray-400 mb-6">
            Start a delivery to access GPS navigation
          </p>
          <button
            onClick={fetchActiveDelivery}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all"
          >
            Check for Deliveries
          </button>
        </div>
      </div>
    );
  }

  const parcels = activeDelivery.consolidationId?.parcels || [];
  const firstParcel = parcels[0];
  const directions = getDirections();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          GPS Navigation
        </h2>
        <button
          onClick={fetchActiveDelivery}
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Placeholder */}
        <div className="lg:col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center min-h-[500px]">
          <div className="text-center mb-6">
            <MapPin className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">Live Navigation</h3>
            {currentPosition && (
              <p className="text-gray-400 mb-2">
                Current: {currentPosition.lat.toFixed(4)}, {currentPosition.lng.toFixed(4)}
              </p>
            )}
            {firstParcel?.receiver?.address && (
              <p className="text-gray-300">
                Next: {firstParcel.receiver.address}
              </p>
            )}
          </div>

          {/* Interactive Map Placeholder */}
          <div className="w-full bg-gray-900/50 border border-gray-700 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center h-48 text-gray-500">
              <div className="text-center">
                <Navigation className="w-12 h-12 mx-auto mb-3 animate-pulse" />
                <p>Click "Start Navigation" to open Google Maps</p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 w-full">
            <div className="bg-gray-900/50 rounded-lg p-3 text-center">
              <Clock className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <div className="text-white font-semibold">{getETA()}</div>
              <div className="text-gray-500 text-xs">ETA</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3 text-center">
              <Package className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <div className="text-white font-semibold">{parcels.length}</div>
              <div className="text-gray-500 text-xs">Parcels</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-3 text-center">
              <TrendingUp className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <div className="text-white font-semibold">Active</div>
              <div className="text-gray-500 text-xs">Status</div>
            </div>
          </div>
        </div>

        {/* Delivery Info Sidebar */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-400" />
            Next Delivery
          </h3>

          {/* Customer Info */}
          {firstParcel?.receiver && (
            <div className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
              <div className="text-gray-400 text-sm mb-2">Customer</div>
              <div className="text-white font-semibold mb-1">
                {firstParcel.receiver.name || "Not provided"}
              </div>
              {firstParcel.receiver.phoneNumber && (
                <div className="text-gray-400 text-sm flex items-center gap-2">
                  <Phone className="w-3 h-3" />
                  {firstParcel.receiver.phoneNumber}
                </div>
              )}
            </div>
          )}

          {/* Delivery Details */}
          <div className="mb-6">
            <div className="text-gray-400 text-sm mb-2">Delivery ID</div>
            <div className="text-white font-mono text-sm">
              {activeDelivery.consolidationId?.masterTrackingNumber || 
               activeDelivery._id.slice(-8)}
            </div>
          </div>

          {/* Address */}
          {firstParcel?.receiver?.address && (
            <div className="mb-6">
              <div className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Destination
              </div>
              <div className="text-white text-sm bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                {firstParcel.receiver.address}
              </div>
            </div>
          )}

          {/* Directions */}
          <div className="mb-6">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Navigation className="w-4 h-4" />
              Directions
            </h4>
            <ol className="list-decimal list-inside text-gray-400 space-y-2 text-sm">
              {directions.map((direction, idx) => (
                <li key={idx}>{direction}</li>
              ))}
            </ol>
          </div>

          {/* Parcels List */}
          {parcels.length > 1 && (
            <div className="mb-6">
              <div className="text-gray-400 text-sm mb-2">
                Additional Parcels ({parcels.length - 1})
              </div>
              <div className="space-y-2">
                {parcels.slice(1, 3).map((parcel) => (
                  <div
                    key={parcel._id}
                    className="text-xs text-gray-500 bg-gray-900/30 p-2 rounded border border-gray-700"
                  >
                    {parcel.trackingNumber}
                  </div>
                ))}
                {parcels.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{parcels.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={startNavigation}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 font-medium"
            >
              <Navigation className="w-4 h-4" />
              Start Navigation
            </button>
            <button
              onClick={recalculateRoute}
              className="w-full bg-gray-600 text-gray-200 px-4 py-2 rounded-lg border border-gray-500 hover:bg-gray-500 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Recalculate Route
            </button>
            <button
              onClick={callCustomer}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Call Customer
            </button>
            <button
              onClick={reportTraffic}
              disabled={trafficReported}
              className="w-full bg-gray-600 text-gray-200 px-4 py-2 rounded-lg border border-gray-500 hover:bg-gray-500 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <AlertTriangle className="w-4 h-4" />
              {trafficReported ? "Report Submitted" : "Report Traffic"}
            </button>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/50 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="bg-blue-500/20 rounded-full p-2 flex-shrink-0">
            <Navigation className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h4 className="text-blue-300 font-semibold mb-1">Navigation Tips</h4>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Keep your phone charged and GPS enabled</li>
              <li>• Report any traffic delays immediately</li>
              <li>• Call the customer if you need clarification on the address</li>
              <li>• Update your location regularly for accurate tracking</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GPSNavigation;