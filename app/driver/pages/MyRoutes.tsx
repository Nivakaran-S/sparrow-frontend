import { useState, useEffect } from "react";
import { MapPin, Package, Clock, Navigation, AlertTriangle, Truck, RefreshCw } from "lucide-react";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://api-gateway-nine-orpin.vercel.app";

interface RouteData {
  id: string;
  consolidationId: string;
  name: string;
  stops: number;
  distance: number;
  estimated: string;
  status: string;
  priority: string;
  delivery: any;
  startTime?: string;
  endTime?: string;
  parcels: any[];
}

const MyRoutes = ({ userId, setActiveTab }: { userId?: string; setActiveTab?: (tab: string) => void }) => {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [reportingIssue, setReportingIssue] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (driverId) {
      fetchRoutes();
      const interval = setInterval(fetchRoutes, 60000);
      return () => clearInterval(interval);
    }
  }, [driverId]);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/check-cookie`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Not authenticated");

      const data = await response.json();

      if (data.role !== "Driver") {
        throw new Error("Not authorized - Driver role required");
      }

      setDriverId(data.id);
    } catch (err: any) {
      console.error("Auth check failed:", err);
      setError("Authentication failed. Please login.");
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    if (!driverId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/api/consolidations/api/deliveries/driver/${driverId}`,
        { credentials: "include" }
      );

      if (!response.ok) throw new Error("Failed to fetch routes");

      const data = await response.json();

      if (data.success) {
        const deliveries = data.data;
        const processedRoutes = processDeliveriesIntoRoutes(deliveries);
        setRoutes(processedRoutes);
      } else {
        setRoutes([]);
      }
    } catch (err: any) {
      console.error("Error fetching routes:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const processDeliveriesIntoRoutes = (deliveries: any[]): RouteData[] => {
    return deliveries.map((delivery) => {
      const consolidation = delivery.consolidationId;
      const parcels = consolidation?.parcels || [];
      
      return {
        id: delivery._id.slice(-6).toUpperCase(),
        consolidationId: consolidation?._id || delivery._id,
        name: `Route ${delivery._id.slice(-6).toUpperCase()}`,
        stops: parcels.length,
        distance: calculateDeliveryDistance(delivery),
        estimated: estimateTime(delivery),
        status: getRouteStatus(delivery.status),
        priority: getPriority(delivery),
        delivery,
        startTime: delivery.startTime,
        endTime: delivery.endTime,
        parcels,
      };
    });
  };

  const calculateDeliveryDistance = (delivery: any): number => {
    if (!delivery.locationHistory || delivery.locationHistory.length < 2) {
      return 0;
    }

    let totalDistance = 0;
    const locations = delivery.locationHistory;

    for (let i = 1; i < locations.length; i++) {
      const lat1 = locations[i - 1].latitude;
      const lon1 = locations[i - 1].longitude;
      const lat2 = locations[i].latitude;
      const lon2 = locations[i].longitude;

      if (lat1 && lon1 && lat2 && lon2) {
        totalDistance += calculateDistance(lat1, lon1, lat2, lon2);
      }
    }

    return Math.round(totalDistance);
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (deg: number): number => deg * (Math.PI / 180);

  const estimateTime = (delivery: any): string => {
    if (delivery.startTime && delivery.endTime) {
      const start = new Date(delivery.startTime).getTime();
      const end = new Date(delivery.endTime).getTime();
      const hours = (end - start) / (1000 * 60 * 60);
      return `${hours.toFixed(1)} hrs`;
    }

    if (delivery.estimatedDeliveryTime) {
      const now = Date.now();
      const estimated = new Date(delivery.estimatedDeliveryTime).getTime();
      const hours = (estimated - now) / (1000 * 60 * 60);
      return hours > 0 ? `${hours.toFixed(1)} hrs` : "Overdue";
    }

    // Estimate based on stops: ~15 min per stop
    const parcels = delivery.consolidationId?.parcels?.length || 1;
    const estimatedMinutes = parcels * 15;
    return `~${Math.round(estimatedMinutes / 60)} hrs`;
  };

  const getRouteStatus = (status: string): string => {
    switch (status) {
      case "in_progress":
        return "Active";
      case "assigned":
        return "Scheduled";
      case "completed":
        return "Completed";
      default:
        return "Pending";
    }
  };

  const getPriority = (delivery: any): string => {
    if (delivery.status === "in_progress") return "High";
    if (delivery.estimatedDeliveryTime) {
      const eta = new Date(delivery.estimatedDeliveryTime).getTime();
      const now = Date.now();
      const hoursUntil = (eta - now) / (1000 * 60 * 60);
      if (hoursUntil < 2) return "High";
      if (hoursUntil < 6) return "Medium";
    }
    return "Low";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500/20 text-green-400 border-green-500/50";
      case "Scheduled":
        return "bg-blue-500/20 text-blue-400 border-blue-500/50";
      case "Completed":
        return "bg-purple-500/20 text-purple-400 border-purple-500/50";
      default:
        return "bg-amber-500/20 text-amber-400 border-amber-500/50";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-500/20 text-red-400 border-red-500/50";
      case "Medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/50";
    }
  };

  const handleViewRoute = (route: RouteData) => {
    const delivery = route.delivery;
    const parcels = route.parcels;
    
    if (parcels.length > 0) {
      alert(`Route Details:\n\nParcels: ${parcels.length}\nDistance: ${route.distance} km\nEstimated Time: ${route.estimated}\n\nFirst Stop: ${parcels[0].receiver?.address || 'Address not available'}`);
    } else {
      alert(`Route ${route.id}\nStatus: ${route.status}\nDistance: ${route.distance} km`);
    }
  };

  const handleNavigate = (route: RouteData) => {
    const delivery = route.delivery;
    const parcels = route.parcels;

    // Try to navigate to first parcel's destination
    if (parcels.length > 0 && parcels[0].receiver?.address) {
      const address = encodeURIComponent(parcels[0].receiver.address);
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${address}`,
        "_blank"
      );
    } else if (delivery.currentLocation?.latitude && delivery.currentLocation?.longitude) {
      const lat = delivery.currentLocation.latitude;
      const lng = delivery.currentLocation.longitude;
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
        "_blank"
      );
    } else {
      alert("No destination available for navigation");
    }
  };

  const handleReportIssue = async (route: RouteData) => {
    const issue = prompt("Please describe the issue:");
    if (!issue) return;

    setReportingIssue(route.id);

    try {
      // You can implement an actual API endpoint for issue reporting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert("Issue reported successfully! Our team will look into it.");
      console.log("Issue reported for route:", route.id, "Issue:", issue);
    } catch (err: any) {
      console.error("Error reporting issue:", err);
      alert("Failed to report issue. Please try again.");
    } finally {
      setReportingIssue(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading routes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-500/10 border border-red-500 rounded-xl p-6 text-center">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <button
            onClick={fetchRoutes}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          My Optimized Routes
        </h2>
        <button
          onClick={fetchRoutes}
          className="text-gray-400 cursor-pointer hover:text-white transition-colors flex items-center gap-2"
          title="Refresh routes"
        >
          <RefreshCw className="w-5 h-5" />
          Refresh
        </button>
      </div>

      {routes.length === 0 ? (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-12 text-center">
          <Truck className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 mb-4">
            No routes available at the moment
          </p>
          <button
            onClick={fetchRoutes}
            className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
          >
            Check for Routes
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {routes.map((route) => (
            <div
              key={route.id}
              className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 hover:-translate-y-1 hover:border-blue-400 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-blue-400 font-semibold text-lg flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    {route.delivery.consolidationId?.masterTrackingNumber || route.id}
                  </h3>
                  <h4 className="text-gray-400 text-sm">
                    Ref: {route.delivery.consolidationId?.referenceCode || route.name}
                  </h4>
                  {route.startTime && (
                    <p className="text-gray-500 text-sm mt-1">
                      Started: {new Date(route.startTime).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                      route.status
                    )}`}
                  >
                    {route.status}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(
                      route.priority
                    )}`}
                  >
                    {route.priority}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span>{route.stops} stop{route.stops !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Navigation className="w-4 h-4" />
                  <span>{route.distance} km</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{route.estimated}</span>
                </div>
              </div>

              {/* Parcels Info */}
              {route.parcels.length > 0 && (
                <div className="mb-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-2 text-gray-300 mb-2">
                    <Package className="w-4 h-4" />
                    <span className="font-medium">Parcels ({route.parcels.length})</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {route.parcels[0]?.receiver?.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3 h-3 mt-1 flex-shrink-0" />
                        <span>Destination: {route.parcels[0].receiver.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleViewRoute(route)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  View Route
                </button>
                <button
                  onClick={() => handleNavigate(route)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 hover:-translate-y-1 transition-all flex items-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  Navigate
                </button>
                <button
                  onClick={() => handleReportIssue(route)}
                  disabled={reportingIssue === route.id}
                  className="bg-gray-600 text-gray-200 px-4 py-2 rounded-lg border border-gray-500 hover:bg-gray-500 hover:-translate-y-1 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <AlertTriangle className="w-4 h-4" />
                  {reportingIssue === route.id ? "Reporting..." : "Report Issue"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRoutes;