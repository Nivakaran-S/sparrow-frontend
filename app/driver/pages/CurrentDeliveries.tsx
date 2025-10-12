import { useState, useEffect } from "react";
import { Package, MapPin, Phone, Navigation, CheckCircle, Clock, Truck, AlertCircle } from "lucide-react";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://api-gateway-nine-orpin.vercel.app";

interface Location {
  type: string;
  warehouseId?: any;
  address?: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
}

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
  status?: string;
}

interface Consolidation {
  _id: string;
  masterTrackingNumber?: string;
  referenceCode: string;
  parcels?: Parcel[];
  status: string;
}

interface Delivery {
  _id: string;
  deliveryNumber: string;
  deliveryItemType: "parcel" | "consolidation";
  parcels?: Parcel[];
  consolidation?: Consolidation;
  assignedDriver: any;
  fromLocation: Location;
  toLocation: Location;
  deliveryType: string;
  status: "assigned" | "accepted" | "in_progress" | "picked_up" | "in_transit" | "near_destination" | "delivered" | "failed" | "cancelled";
  priority: string;
  estimatedPickupTime?: string;
  actualPickupTime?: string;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  deliveryInstructions?: string;
  notes?: string;
  createdTimestamp: string;
  updatedTimestamp?: string;
}

const CurrentDeliveries = ({ userId, setActiveTab }: { userId?: string; setActiveTab?: (tab: string) => void }) => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [driverId, setDriverId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (driverId) {
      fetchDeliveries();
      const interval = setInterval(fetchDeliveries, 30000);
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

  const fetchDeliveries = async () => {
    if (!driverId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/deliveries/api/deliveries/driver/${driverId}`,
        { credentials: "include" }
      );

      if (!response.ok) throw new Error("Failed to fetch deliveries");

      const result = await response.json();

      if (result.success) {
        // Filter only active deliveries (not delivered, failed, or cancelled)
        const activeDeliveries = result.data.filter(
          (d: Delivery) => !["delivered", "failed", "cancelled"].includes(d.status)
        );
        setDeliveries(activeDeliveries);
      }
    } catch (err: any) {
      console.error("Error fetching deliveries:", err);
      setError(err.message || "Failed to fetch deliveries");
    } finally {
      setLoading(false);
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

  const updateDeliveryStatus = async (deliveryId: string, status: string, note?: string) => {
    try {
      setUpdatingStatus(deliveryId);
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;

      const response = await fetch(
        `${API_BASE_URL}/api/deliveries/api/deliveries/${deliveryId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            status,
            note: note || `Status updated to ${status}`,
            location: {
              latitude,
              longitude,
              address: "Current Location"
            }
          }),
        }
      );

      if (!response.ok) throw new Error(`Failed to update status to ${status}`);

      const result = await response.json();

      if (result.success) {
        await fetchDeliveries();
        alert(`Delivery ${status.replace(/_/g, ' ')} successfully!`);
      }
    } catch (err: any) {
      console.error(`Error updating status to ${status}:`, err);
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const acceptDelivery = async (deliveryId: string) => {
    if (!confirm("Accept this delivery assignment?")) return;
    await updateDeliveryStatus(deliveryId, "accepted", "Driver accepted the delivery");
  };

  const startDelivery = async (deliveryId: string) => {
    if (!confirm("Start this delivery?")) return;
    await updateDeliveryStatus(deliveryId, "in_progress", "Driver started the delivery");
  };

  const pickupDelivery = async (deliveryId: string) => {
    if (!confirm("Confirm pickup of items?")) return;
    await updateDeliveryStatus(deliveryId, "picked_up", "Items picked up");
  };

  const markInTransit = async (deliveryId: string) => {
    await updateDeliveryStatus(deliveryId, "in_transit", "In transit to destination");
  };

  const markNearDestination = async (deliveryId: string) => {
    await updateDeliveryStatus(deliveryId, "near_destination", "Near destination");
  };

  const completeDelivery = async (deliveryId: string) => {
    const notes = prompt("Add delivery notes (optional):") || "";
    if (!confirm("Mark this delivery as delivered?")) return;
    
    await updateDeliveryStatus(
      deliveryId, 
      "delivered", 
      notes || "Delivery completed successfully"
    );
  };

  const openNavigation = (delivery: Delivery) => {
    let address = null;

    // Get destination address based on delivery type
    if (delivery.toLocation.type === "address") {
      address = delivery.toLocation.address;
    } else if (delivery.toLocation.warehouseId?.address) {
      // If it's a warehouse, try to get the address from the populated warehouse object
      const warehouse = delivery.toLocation.warehouseId;
      if (typeof warehouse === 'object' && warehouse.address) {
        address = typeof warehouse.address === 'string' 
          ? warehouse.address 
          : warehouse.address.street || warehouse.address.city;
      }
    }

    // Fallback: try to get address from parcels or consolidation
    if (!address) {
      if (delivery.deliveryItemType === "consolidation" && delivery.consolidation?.parcels?.[0]?.receiver?.address) {
        address = delivery.consolidation.parcels[0].receiver.address;
      } else if (delivery.deliveryItemType === "parcel" && delivery.parcels?.[0]?.receiver?.address) {
        address = delivery.parcels[0].receiver.address;
      }
    }

    if (address) {
      const encoded = encodeURIComponent(address);
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encoded}`, "_blank");
    } else {
      alert("No destination address available for navigation");
    }
  };

  const callCustomer = (delivery: Delivery) => {
    let phoneNumber = null;

    if (delivery.deliveryItemType === "consolidation" && delivery.consolidation?.parcels?.[0]?.receiver?.phoneNumber) {
      phoneNumber = delivery.consolidation.parcels[0].receiver.phoneNumber;
    } else if (delivery.deliveryItemType === "parcel" && delivery.parcels?.[0]?.receiver?.phoneNumber) {
      phoneNumber = delivery.parcels[0].receiver.phoneNumber;
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

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      assigned: "bg-blue-500/20 text-blue-400 border-blue-500/50",
      accepted: "bg-cyan-500/20 text-cyan-400 border-cyan-500/50",
      in_progress: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      picked_up: "bg-orange-500/20 text-orange-400 border-orange-500/50",
      in_transit: "bg-green-500/20 text-green-400 border-green-500/50",
      near_destination: "bg-purple-500/20 text-purple-400 border-purple-500/50",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400 border-gray-500/50";
  };

  const getNextAction = (delivery: Delivery) => {
    switch (delivery.status) {
      case "assigned":
        return (
          <button
            onClick={() => acceptDelivery(delivery._id)}
            disabled={updatingStatus === delivery._id}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            {updatingStatus === delivery._id ? "Processing..." : "Accept Delivery"}
          </button>
        );
      case "accepted":
        return (
          <button
            onClick={() => startDelivery(delivery._id)}
            disabled={updatingStatus === delivery._id}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            {updatingStatus === delivery._id ? "Starting..." : "Start Delivery"}
          </button>
        );
      case "in_progress":
        return (
          <button
            onClick={() => pickupDelivery(delivery._id)}
            disabled={updatingStatus === delivery._id}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            {updatingStatus === delivery._id ? "Confirming..." : "Confirm Pickup"}
          </button>
        );
      case "picked_up":
        return (
          <button
            onClick={() => markInTransit(delivery._id)}
            disabled={updatingStatus === delivery._id}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Truck className="w-4 h-4" />
            {updatingStatus === delivery._id ? "Updating..." : "Mark In Transit"}
          </button>
        );
      case "in_transit":
        return (
          <button
            onClick={() => markNearDestination(delivery._id)}
            disabled={updatingStatus === delivery._id}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            {updatingStatus === delivery._id ? "Updating..." : "Near Destination"}
          </button>
        );
      case "near_destination":
        return (
          <button
            onClick={() => completeDelivery(delivery._id)}
            disabled={updatingStatus === delivery._id}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            {updatingStatus === delivery._id ? "Completing..." : "Complete Delivery"}
          </button>
        );
      default:
        return null;
    }
  };

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

  if (deliveries.length === 0)
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
            onClick={fetchDeliveries}
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
            onClick={fetchDeliveries}
            className="text-gray-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <div className="text-gray-400">
            {deliveries.length} active {deliveries.length === 1 ? "delivery" : "deliveries"}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {deliveries.map((delivery) => {
          const items = delivery.deliveryItemType === "consolidation" 
            ? delivery.consolidation?.parcels || []
            : delivery.parcels || [];

          return (
            <div
              key={delivery._id}
              className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 hover:-translate-y-1 hover:border-blue-400 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-blue-400 font-semibold text-lg mb-1">
                    {delivery.deliveryNumber}
                  </div>
                  <div className="text-sm text-gray-500">
                    {delivery.deliveryItemType === "consolidation" 
                      ? `Consolidation: ${delivery.consolidation?.referenceCode || "N/A"}`
                      : `Parcel Delivery`}
                  </div>
                  <div className="text-xs text-purple-400 mt-1">
                    {formatStatus(delivery.deliveryType)}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(delivery.status)}`}>
                  {formatStatus(delivery.status)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <Package className="w-4 h-4" />
                  <span>{items.length} Item{items.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock className="w-4 h-4" />
                  {delivery.actualPickupTime ? (
                    <span>Picked up: {new Date(delivery.actualPickupTime).toLocaleTimeString()}</span>
                  ) : (
                    <span>Not picked up yet</span>
                  )}
                </div>
              </div>

              {items.length > 0 && (
                <div className="mb-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                  <h4 className="text-gray-300 font-medium mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Items in this delivery:
                  </h4>
                  <div className="space-y-2">
                    {items.slice(0, 3).map((item, idx) => (
                      <div key={item._id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-500">#{idx + 1}</span>
                          <span className="text-blue-400 font-mono">{item.trackingNumber}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          {item.receiver?.name && (
                            <span className="text-gray-400">{item.receiver.name}</span>
                          )}
                          {item.weight && (
                            <span className="text-gray-500">
                              {item.weight.value} {item.weight.unit}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {items.length > 3 && (
                      <div className="text-gray-500 text-sm">
                        +{items.length - 3} more items
                      </div>
                    )}
                  </div>
                </div>
              )}

              {delivery.toLocation && (
                <div className="mb-4 flex items-start gap-2 text-gray-400">
                  <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-300">Destination</div>
                    <div className="text-sm">
                      {delivery.toLocation.type === "address" 
                        ? delivery.toLocation.address || "Address not available"
                        : `Warehouse: ${delivery.toLocation.locationName || "Warehouse"}`}
                    </div>
                  </div>
                </div>
              )}

              {delivery.deliveryInstructions && (
                <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-yellow-400 font-medium text-sm mb-1">Special Instructions</div>
                      <div className="text-gray-300 text-sm">{delivery.deliveryInstructions}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {getNextAction(delivery)}

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
      </div>
    </div>
  );
};

export default CurrentDeliveries;