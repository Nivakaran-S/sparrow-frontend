import { useState, useEffect } from "react";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "https://api-gateway-nine-orpin.vercel.app";

interface Location {
  latitude: number;
  longitude: number;
  address: string;
  timestamp?: Date | string;
}

interface Consolidation {
  _id: string;
  masterTrackingNumber?: string;
  referenceCode: string;
  parcels?: any[];
  status: string;
  statusHistory?: any[];
}

interface Delivery {
  _id: string;
  consolidationId?: Consolidation;
  driverId: string;
  status: "assigned" | "in_progress" | "completed" | "cancelled";
  startTime?: Date | string;
  endTime?: Date | string;
  startLocation?: Location;
  endLocation?: Location;
  currentLocation?: Location;
  locationHistory?: Location[];
  estimatedDeliveryTime?: Date | string;
  actualDeliveryTime?: Date | string;
  notes?: string;
  createdTimestamp: Date | string;
  updatedTimestamp: Date | string;
}

interface ApiResponse {
  success: boolean;
  count?: number;
  data: Delivery[];
  message?: string;
}

const CurrentDeliveries = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [driverId, setDriverId] = useState<string | null>(null);

  // --- Auth check to get Driver ID ---
  useEffect(() => {
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
      }
    };

    checkAuth();
  }, []);

  // --- Fetch Deliveries assigned to driver ---
  useEffect(() => {
    if (!driverId) return;

    const fetchDeliveries = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/api/consolidations/api/deliveries/driver/${driverId}`,
          { credentials: "include" }
        );

        if (!response.ok) throw new Error("Failed to fetch deliveries");

        const result: ApiResponse = await response.json();

        if (result.success) {
          const activeDeliveries = result.data.filter(
            (d) => d.status === "assigned" || d.status === "in_progress"
          );
          setDeliveries(activeDeliveries);
        }
      } catch (err: any) {
        console.error("Error fetching deliveries:", err);
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();

    const interval = setInterval(fetchDeliveries, 30000);
    return () => clearInterval(interval);
  }, [driverId]);

  // --- Helper to get current position ---
  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
        });
      }
    });
  };

  // --- Start Delivery ---
  const startDelivery = async (deliveryId: string): Promise<void> => {
    try {
      setUpdatingStatus(deliveryId);
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;

      const response = await fetch(
        `${API_BASE_URL}/api/consolidations/api/deliveries/${deliveryId}/start`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            latitude,
            longitude,
            address: "Current Location",
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to start delivery");

      const result: { success: boolean; data: Delivery } = await response.json();

      if (result.success) {
        setDeliveries((prev) =>
          prev.map((d) => (d._id === deliveryId ? result.data : d))
        );
      }
    } catch (err: any) {
      console.error("Error starting delivery:", err);
      alert("Failed to start delivery: " + err.message);
    } finally {
      setUpdatingStatus(null);
    }
  };

  // --- Update Location ---
  const updateLocation = async (deliveryId: string): Promise<void> => {
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;

      const response = await fetch(
        `${API_BASE_URL}api/consolidations/api/deliveries/${deliveryId}/location`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            latitude,
            longitude,
            address: "Updated Location",
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update location");
      alert("Location updated successfully");
    } catch (err: any) {
      console.error("Error updating location:", err);
      alert("Failed to update location: " + err.message);
    }
  };

  // --- Complete Delivery ---
  const completeDelivery = async (deliveryId: string): Promise<void> => {
    try {
      setUpdatingStatus(deliveryId);
      const notes = prompt("Add delivery notes (optional):") || "";

      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;

      const response = await fetch(
        `${API_BASE_URL}/api/consolidations/api/deliveries/${deliveryId}/end`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            latitude,
            longitude,
            address: "Delivery Location",
            notes,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to complete delivery");

      const result: { success: boolean; data: Delivery } = await response.json();

      if (result.success) {
        setDeliveries((prev) => prev.filter((d) => d._id !== deliveryId));
        alert("Delivery completed successfully!");
      }
    } catch (err: any) {
      console.error("Error completing delivery:", err);
      alert("Failed to complete delivery: " + err.message);
    } finally {
      setUpdatingStatus(null);
    }
  };

  // --- Navigation ---
  const openNavigation = (delivery: Delivery): void => {
    const consolidation = delivery.consolidationId;
    const address = consolidation?.referenceCode || "destination";
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      address
    )}`;
    window.open(mapsUrl, "_blank");
  };

  // --- Placeholder for call feature ---
  const callCustomer = (): void => {
    alert("Customer contact feature coming soon.");
  };

  // --- Helpers ---
  const getPriorityLevel = (delivery: Delivery): "High" | "Medium" | "Low" => {
    const status = delivery.consolidationId?.status;
    if (status === "in_transit") return "High";
    if (status === "assigned_to_driver") return "Medium";
    return "Low";
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "in_progress":
        return "bg-purple-500/20 text-purple-400";
      case "assigned":
        return "bg-blue-500/20 text-blue-400";
      default:
        return "bg-amber-500/20 text-amber-400";
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case "High":
        return "bg-red-500/20 text-red-400";
      case "Medium":
        return "bg-yellow-500/20 text-yellow-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const formatStatus = (status: string): string =>
    status
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  // --- UI States ---
  if (loading)
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400 text-lg">Loading deliveries...</div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-6">
          <h3 className="text-red-400 font-semibold mb-2">Error</h3>
          <p className="text-gray-300">{error}</p>
        </div>
      </div>
    );

  if (deliveries.length === 0)
    return (
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-8">
          Current Deliveries
        </h2>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            No Active Deliveries
          </h3>
          <p className="text-gray-400">
            You don't have any deliveries assigned at the moment.
          </p>
        </div>
      </div>
    );

  // --- Render Deliveries ---
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Current Deliveries
        </h2>
        <div className="text-gray-400">
          {deliveries.length} active{" "}
          {deliveries.length === 1 ? "delivery" : "deliveries"}
        </div>
      </div>

      <div className="space-y-6">
        {deliveries.map((delivery) => {
          const consolidation = delivery.consolidationId;
          const priority = getPriorityLevel(delivery);
          const isUpdating = updatingStatus === delivery._id;

          return (
            <div
              key={delivery._id}
              className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 hover:-translate-y-1 hover:border-blue-400 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-blue-400 font-semibold mb-1">
                    {consolidation?.masterTrackingNumber || delivery._id}
                  </div>
                  <div className="text-sm text-gray-500">
                    Ref: {consolidation?.referenceCode || "N/A"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      delivery.status
                    )}`}
                  >
                    {formatStatus(delivery.status)}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
                      priority
                    )}`}
                  >
                    {priority}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-gray-400 mb-4">
                <div>
                  📦 Parcels: {consolidation?.parcels?.length || 0}
                </div>
                <div>
                  📍 Status:{" "}
                  {consolidation?.status
                    ? formatStatus(consolidation.status)
                    : "N/A"}
                </div>
                {delivery.currentLocation?.timestamp && (
                  <div>
                    🗺️ Last Updated:{" "}
                    {new Date(
                      delivery.currentLocation.timestamp
                    ).toLocaleTimeString()}
                  </div>
                )}
                {delivery.startTime && (
                  <div>
                    ⏰ Started:{" "}
                    {new Date(delivery.startTime).toLocaleString()}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {delivery.status === "assigned" && (
                  <button
                    onClick={() => startDelivery(delivery._id)}
                    disabled={isUpdating}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? "Starting..." : "Start Delivery"}
                  </button>
                )}

                {delivery.status === "in_progress" && (
                  <>
                    <button
                      onClick={() => updateLocation(delivery._id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 hover:-translate-y-1 transition-all"
                    >
                      Update Location
                    </button>
                    <button
                      onClick={() => completeDelivery(delivery._id)}
                      disabled={isUpdating}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? "Completing..." : "Mark Delivered"}
                    </button>
                  </>
                )}

                <button
                  onClick={() => openNavigation(delivery)}
                  className="bg-gray-600 text-gray-200 px-4 py-2 rounded-lg border border-gray-500 hover:bg-gray-500 hover:-translate-y-1 transition-all"
                >
                  Navigate
                </button>

                <button
                  onClick={() => callCustomer()}
                  className="bg-gray-600 text-gray-200 px-4 py-2 rounded-lg border border-gray-500 hover:bg-gray-500 hover:-translate-y-1 transition-all"
                >
                  Call Customer
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CurrentDeliveries;
