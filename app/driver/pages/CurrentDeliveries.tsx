import { useState, useEffect } from "react";
import { Package, MapPin, Phone, Navigation, CheckCircle, Clock, Truck } from "lucide-react";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://api-gateway-nine-orpin.vercel.app";

interface Parcel {
  _id: string;
  trackingNumber: string;
  receiver?: {
    name: string;
    phoneNumber: string;
    address: string;
  };
  weight?: {
    value: number;
    unit: string;
  };
  pricingId?: {
    _id: string;
    parcelType: string;
  };
}

interface Consolidation {
  _id: string;
  masterTrackingNumber?: string;
  referenceCode: string;
  parcels?: Parcel[];
  status: string;
  assignedDriver?: string;
}

interface Delivery {
  _id: string;
  consolidationId?: Consolidation;
  driverId: string;
  status: "assigned" | "in_progress" | "completed" | "cancelled";
  startTime?: Date | string;
  endTime?: Date | string;
  estimatedDeliveryTime?: Date | string;
  actualDeliveryTime?: Date | string;
  notes?: string;
  createdTimestamp: Date | string;
}

const CurrentDeliveries = ({ userId, setActiveTab }: { userId?: string; setActiveTab?: (tab: string) => void }) => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [driverId, setDriverId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (driverId) {
      fetchAllData();
      const interval = setInterval(fetchAllData, 30000);
      return () => clearInterval(interval);
    }
  }, [driverId]);

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

  const fetchAllData = async () => {
    if (!driverId) return;

    try {
      setLoading(true);
      await Promise.all([fetchDeliveries(), fetchAssignedParcels()]);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveries = async () => {
    if (!driverId) return;

    const response = await fetch(
      `${API_BASE_URL}/api/consolidations/api/deliveries/driver/${driverId}?status=assigned&status=in_progress`,
      { credentials: "include" }
    );

    if (!response.ok) throw new Error("Failed to fetch deliveries");

    const result = await response.json();

    if (result.success) {
      const activeDeliveries = result.data.filter(
        (d: Delivery) => d.status === "assigned" || d.status === "in_progress"
      );
      setDeliveries(activeDeliveries);
    }
  };

  const fetchAssignedParcels = async () => {
    if (!driverId) return;

    const response = await fetch(
      `${API_BASE_URL}/api/parcels/api/parcels/driver/${driverId}`,
      { credentials: "include" }
    );

    if (!response.ok) throw new Error("Failed to fetch assigned parcels");

    const result = await response.json();

    if (result.success) {
      // Filter only active parcels (not delivered or cancelled)
      const activeParcels = result.data.filter(
        (p: Parcel) => !["delivered", "cancelled"].includes((p as any).status)
      );
      setParcels(activeParcels);
    }
  };

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      }
    });
  };

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

      const result = await response.json();

      if (result.success) {
        await fetchAllData();
        alert("Delivery started successfully!");
      }
    } catch (err: any) {
      console.error("Error starting delivery:", err);
      alert("Failed to start delivery: " + err.message);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const updateLocation = async (deliveryId: string): Promise<void> => {
    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;

      const response = await fetch(
        `${API_BASE_URL}/api/consolidations/api/deliveries/${deliveryId}/location`,
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
      await fetchAllData();
    } catch (err: any) {
      console.error("Error updating location:", err);
      alert("Failed to update location: " + err.message);
    }
  };

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

      const result = await response.json();

      if (result.success) {
        await fetchAllData();
        alert("Delivery completed successfully!");
      }
    } catch (err: any) {
      console.error("Error completing delivery:", err);
      alert("Failed to complete delivery: " + err.message);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const markParcelDelivered = async (parcelId: string): Promise<void> => {
    if (!confirm("Are you sure you want to mark this parcel as delivered?")) return;

    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;

      const response = await fetch(
        `${API_BASE_URL}/api/parcels/api/parcels/${parcelId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            status: "delivered",
            location: `${latitude},${longitude}`,
            note: "Delivered by driver"
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update parcel status");

      alert("Parcel marked as delivered!");
      await fetchAllData();
    } catch (err: any) {
      console.error("Error updating parcel:", err);
      alert("Failed to update parcel: " + err.message);
    }
  };

  const openNavigation = (delivery?: Delivery, parcel?: Parcel): void => {
    let address = null;

    if (delivery) {
      const consolidation = delivery.consolidationId;
      if (consolidation?.parcels && consolidation.parcels.length > 0) {
        address = consolidation.parcels[0].receiver?.address;
      }
    } else if (parcel) {
      address = parcel.receiver?.address;
    }

    if (address) {
      const encoded = encodeURIComponent(address);
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encoded}`, "_blank");
    } else {
      alert("No destination address available for navigation");
    }
  };

  const callCustomer = (delivery?: Delivery, parcel?: Parcel): void => {
    let phoneNumber = null;

    if (delivery) {
      const consolidation = delivery.consolidationId;
      if (consolidation?.parcels && consolidation.parcels.length > 0) {
        phoneNumber = consolidation.parcels[0].receiver?.phoneNumber;
      }
    } else if (parcel) {
      phoneNumber = parcel.receiver?.phoneNumber;
    }

    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      alert("Customer contact number not available");
    }
  };

  const formatStatus = (status: string): string =>
    status
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  if (loading)
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <div className="text-gray-400 text-lg">Loading deliveries...</div>
          </div>
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

  const totalActiveItems = deliveries.length + parcels.length;

  if (totalActiveItems === 0)
    return (
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-8">
          Current Deliveries
        </h2>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-12 text-center">
          <Truck className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            No Active Deliveries
          </h3>
          <p className="text-gray-400">
            You don't have any deliveries assigned at the moment.
          </p>
          <button
            onClick={fetchAllData}
            className="mt-4 bg-blue-600 cursor-pointer text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all"
          >
            Refresh
          </button>
        </div>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Current Deliveries
        </h2>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchAllData}
            className="text-gray-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <div className="text-gray-400">
            {totalActiveItems} active {totalActiveItems === 1 ? "item" : "items"}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Consolidation Deliveries */}
        {deliveries.map((delivery) => {
          const consolidation = delivery.consolidationId;
          const isUpdating = updatingStatus === delivery._id;
          const consolidationParcels = consolidation?.parcels || [];

          return (
            <div
              key={delivery._id}
              className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 hover:-translate-y-1 hover:border-blue-400 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-blue-400 font-semibold text-lg mb-1">
                    {consolidation?.masterTrackingNumber || `CON-${delivery._id.slice(-6)}`}
                  </div>
                  <div className="text-sm text-gray-500">
                    Ref: {consolidation?.referenceCode || "N/A"}
                  </div>
                  <div className="text-xs text-purple-400 mt-1">Consolidation Delivery</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  delivery.status === "in_progress" 
                    ? "bg-green-500/20 text-green-400 border-green-500/50"
                    : "bg-blue-500/20 text-blue-400 border-blue-500/50"
                }`}>
                  {formatStatus(delivery.status)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <Package className="w-4 h-4" />
                  <span>{consolidationParcels.length} Parcel{consolidationParcels.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock className="w-4 h-4" />
                  {delivery.startTime ? (
                    <span>Started: {new Date(delivery.startTime).toLocaleTimeString()}</span>
                  ) : (
                    <span>Not started</span>
                  )}
                </div>
              </div>

              {consolidationParcels.length > 0 && (
                <div className="mb-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                  <h4 className="text-gray-300 font-medium mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Parcels in this consolidation:
                  </h4>
                  <div className="space-y-2">
                    {consolidationParcels.map((parcel, idx) => (
                      <div key={parcel._id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500">#{idx + 1}</span>
                          <span className="text-blue-400 font-mono">{parcel.trackingNumber}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          {parcel.receiver?.name && (
                            <span className="text-gray-400">{parcel.receiver.name}</span>
                          )}
                          {parcel.weight && (
                            <span className="text-gray-500">
                              {parcel.weight.value} {parcel.weight.unit}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {consolidationParcels.length > 0 && consolidationParcels[0].receiver?.address && (
                <div className="mb-4 flex items-start gap-2 text-gray-400">
                  <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-300">Destination</div>
                    <div className="text-sm">{consolidationParcels[0].receiver.address}</div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {delivery.status === "assigned" && (
                  <button
                    onClick={() => startDelivery(delivery._id)}
                    disabled={isUpdating}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {isUpdating ? "Starting..." : "Start Delivery"}
                  </button>
                )}

                {delivery.status === "in_progress" && (
                  <>
                    <button
                      onClick={() => updateLocation(delivery._id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4" />
                      Update Location
                    </button>
                    <button
                      onClick={() => completeDelivery(delivery._id)}
                      disabled={isUpdating}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {isUpdating ? "Completing..." : "Mark Delivered"}
                    </button>
                  </>
                )}

                <button
                  onClick={() => openNavigation(delivery)}
                  className="bg-gray-600 text-gray-200 px-4 py-2 rounded-lg border border-gray-500 hover:bg-gray-500 hover:-translate-y-1 transition-all flex items-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  Navigate
                </button>

                <button
                  onClick={() => callCustomer(delivery)}
                  className="bg-gray-600 text-gray-200 px-4 py-2 rounded-lg border border-gray-500 hover:bg-gray-500 hover:-translate-y-1 transition-all flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Call Customer
                </button>
              </div>
            </div>
          );
        })}

        {/* Individual Parcels */}
        {parcels.map((parcel) => (
          <div
            key={parcel._id}
            className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 hover:-translate-y-1 hover:border-green-400 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-green-400 font-semibold text-lg mb-1">
                  {parcel.trackingNumber}
                </div>
                <div className="text-sm text-gray-500">
                  Type: {parcel.pricingId?.parcelType || "Standard"}
                </div>
                <div className="text-xs text-green-400 mt-1">Individual Parcel</div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-amber-500/20 text-amber-400 border-amber-500/50">
                Assigned
              </span>
            </div>

            {parcel.receiver && (
              <div className="mb-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <h4 className="text-gray-300 font-medium mb-2">Receiver Details</h4>
                <div className="space-y-1 text-sm">
                  {parcel.receiver.name && (
                    <div className="text-gray-400">Name: <span className="text-white">{parcel.receiver.name}</span></div>
                  )}
                  {parcel.receiver.phoneNumber && (
                    <div className="text-gray-400">Phone: <span className="text-white">{parcel.receiver.phoneNumber}</span></div>
                  )}
                  {parcel.receiver.address && (
                    <div className="text-gray-400">Address: <span className="text-white">{parcel.receiver.address}</span></div>
                  )}
                </div>
              </div>
            )}

            {parcel.weight && (
              <div className="mb-4 text-sm text-gray-400">
                Weight: <span className="text-white">{parcel.weight.value} {parcel.weight.unit}</span>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => markParcelDelivered(parcel._id)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 hover:-translate-y-1 transition-all flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Mark Delivered
              </button>

              <button
                onClick={() => openNavigation(undefined, parcel)}
                className="bg-gray-600 text-gray-200 px-4 py-2 rounded-lg border border-gray-500 hover:bg-gray-500 hover:-translate-y-1 transition-all flex items-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                Navigate
              </button>

              <button
                onClick={() => callCustomer(undefined, parcel)}
                className="bg-gray-600 text-gray-200 px-4 py-2 rounded-lg border border-gray-500 hover:bg-gray-500 hover:-translate-y-1 transition-all flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Call Customer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurrentDeliveries;