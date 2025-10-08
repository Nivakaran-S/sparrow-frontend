import { useState, useEffect } from "react";

const BASE_URL_KEY = "https://api-gateway-nine-orpin.vercel.app";

const MyRoutes = () => {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [driverId, setDriverId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (driverId) {
      fetchRoutes();
    }
  }, [driverId]);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${BASE_URL_KEY}/check-cookie`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Not authenticated");
      }

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
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${BASE_URL_KEY}/api/consolidations/api/deliveries/driver/${driverId}`,
        { credentials: "include" }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch routes");
      }

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

  const processDeliveriesIntoRoutes = (deliveries: any[]) => {
    const routeMap = new Map();

    deliveries.forEach((delivery) => {
      if (!delivery.consolidationId) return;

      const consolidationId =
        delivery.consolidationId._id || delivery.consolidationId;

      if (!routeMap.has(consolidationId)) {
        routeMap.set(consolidationId, {
          id: delivery._id.slice(-6).toUpperCase(),
          consolidationId,
          name: `Route ${delivery._id.slice(-6).toUpperCase()}`,
          stops: 1,
          distance: calculateDeliveryDistance(delivery),
          estimated: estimateTime(delivery),
          status: getRouteStatus(delivery.status),
          priority: "Medium",
          delivery,
          startTime: delivery.startTime,
          endTime: delivery.endTime,
        });
      } else {
        const route = routeMap.get(consolidationId);
        route.stops += 1;
        route.distance += calculateDeliveryDistance(delivery);
      }
    });

    return Array.from(routeMap.values());
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
      return hours > 0 ? `${hours.toFixed(1)} hrs` : "N/A";
    }

    return "N/A";
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500/20 text-green-400";
      case "Scheduled":
        return "bg-gray-500/20 text-gray-400";
      case "Completed":
        return "bg-blue-500/20 text-blue-400";
      default:
        return "bg-amber-500/20 text-amber-400";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-500/20 text-red-400";
      case "Medium":
        return "bg-yellow-500/20 text-yellow-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const handleViewRoute = (route: any) => {
    console.log("View route:", route);
    // You can navigate to a detailed route view here
  };

  const handleNavigate = (route: any) => {
    const delivery = route.delivery;
    if (delivery.consolidationId?.receiver?.address) {
      const address = encodeURIComponent(
        delivery.consolidationId.receiver.address
      );
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${address}`,
        "_blank"
      );
    } else if (
      delivery.currentLocation?.latitude &&
      delivery.currentLocation?.longitude
    ) {
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

  const handleReportIssue = async (route: any) => {
    const issue = prompt("Please describe the issue:");
    if (!issue) return;

    try {
      // You could call an endpoint for issue reporting later
      alert("Issue reported successfully! Our team will look into it.");
      console.log("Issue reported for route:", route.id, "Issue:", issue);
    } catch (err: any) {
      console.error("Error reporting issue:", err);
      alert("Failed to report issue. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading routes...</p>
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
          className="text-gray-400 hover:text-white transition-colors"
          title="Refresh routes"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {routes.length === 0 ? (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 text-center">
          <p className="text-gray-400 mb-4">
            No routes available at the moment
          </p>
          <button
            onClick={fetchRoutes}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
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
                  <h3 className="text-blue-400 font-semibold">{route.id}</h3>
                  <h4 className="text-lg font-semibold text-white">
                    {route.name}
                  </h4>
                  {route.startTime && (
                    <p className="text-gray-500 text-sm mt-1">
                      Started:{" "}
                      {new Date(route.startTime).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      route.status
                    )}`}
                  >
                    {route.status}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
                      route.priority
                    )}`}
                  >
                    {route.priority}
                  </span>
                </div>
              </div>

              <div className="flex gap-4 mb-4 text-gray-400">
                <div>📍 {route.stops} stop{route.stops !== 1 ? "s" : ""}</div>
                <div>🛣️ {route.distance} km</div>
                <div>⏱️ {route.estimated}</div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleViewRoute(route)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 hover:-translate-y-1 transition-all"
                >
                  View Route
                </button>
                <button
                  onClick={() => handleNavigate(route)}
                  className="bg-gray-600 text-gray-200 px-4 py-2 rounded-lg border border-gray-500 hover:bg-gray-500 hover:-translate-y-1 transition-all"
                >
                  Navigate
                </button>
                <button
                  onClick={() => handleReportIssue(route)}
                  className="bg-gray-600 text-gray-200 px-4 py-2 rounded-lg border border-gray-500 hover:bg-gray-500 hover:-translate-y-1 transition-all"
                >
                  Report Issue
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
