import { useState, useEffect } from "react";
import { Package, MapPin, CheckCircle, XCircle, Ban, Clock, Truck, Warehouse, AlertCircle } from "lucide-react";

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
  sender?: {
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

interface StatusHistoryItem {
  status: string;
  timestamp: string;
  note?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
}

interface Delivery {
  _id: string;
  deliveryNumber: string;
  deliveryItemType: "parcel" | "consolidation";
  parcels?: Parcel[];
  consolidation?: Consolidation;
  assignedDriver: {
    _id: string;
    userName: string;
    entityId: string;
  };
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
  statusHistory?: StatusHistoryItem[];
  createdTimestamp: string;
  updatedTimestamp?: string;
}

const DeliveryHistory = ({ userId }: { userId?: string }) => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "delivered" | "failed" | "cancelled">("all");
  const [expandedDelivery, setExpandedDelivery] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (driverId) {
      fetchDeliveryHistory();
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

  const fetchDeliveryHistory = async () => {
    if (!driverId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/api/parcels/api/deliveries/driver/${driverId}`,
        { credentials: "include" }
      );

      if (!response.ok) throw new Error("Failed to fetch deliveries");

      const result = await response.json();

      if (result.success) {
        // Filter only completed deliveries
        const completedDeliveries = result.data.filter(
          (d: Delivery) => ["delivered", "failed", "cancelled"].includes(d.status)
        );
        // Sort by most recent first
        completedDeliveries.sort((a: Delivery, b: Delivery) => 
          new Date(b.updatedTimestamp || b.createdTimestamp).getTime() - 
          new Date(a.updatedTimestamp || a.createdTimestamp).getTime()
        );
        setDeliveries(completedDeliveries);
      }
    } catch (err: any) {
      console.error("Error fetching delivery history:", err);
      setError(err.message || "Failed to fetch delivery history");
    } finally {
      setLoading(false);
    }
  };

  const formatStatus = (status: string): string =>
    status
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      delivered: "bg-green-500/20 text-green-400 border-green-500/50",
      failed: "bg-red-500/20 text-red-400 border-red-500/50",
      cancelled: "bg-gray-500/20 text-gray-400 border-gray-500/50",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400 border-gray-500/50";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-400" />;
      case "cancelled":
        return <Ban className="w-5 h-5 text-gray-400" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: string): string => {
    const colors: Record<string, string> = {
      low: "bg-gray-500/20 text-gray-400 border-gray-500/50",
      normal: "bg-blue-500/20 text-blue-400 border-blue-500/50",
      high: "bg-red-500/20 text-red-400 border-red-500/50",
      urgent: "bg-red-600/20 text-red-500 border-red-600/50",
    };
    return colors[priority] || "bg-gray-500/20 text-gray-400 border-gray-500/50";
  };

  const formatDeliveryType = (type: string): string => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' → ');
  };

  const formatDateTime = (dateString?: string): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (dateString?: string): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleTimeString();
  };

  const toggleDeliveryDetails = (deliveryId: string) => {
    setExpandedDelivery(expandedDelivery === deliveryId ? null : deliveryId);
  };

  const filteredDeliveries = deliveries.filter(d => 
    filter === "all" ? true : d.status === filter
  );

  const getDeliveryStats = () => {
    const delivered = deliveries.filter(d => d.status === "delivered").length;
    const failed = deliveries.filter(d => d.status === "failed").length;
    const cancelled = deliveries.filter(d => d.status === "cancelled").length;
    return { delivered, failed, cancelled, total: deliveries.length };
  };

  const stats = getDeliveryStats();

  if (loading)
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <div className="text-gray-400 text-lg">Loading delivery history...</div>
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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Delivery History
        </h2>
        <button
          onClick={fetchDeliveryHistory}
          className="text-gray-400 hover:text-white transition-colors"
          title="Refresh"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-2">Total Deliveries</div>
          <div className="text-3xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-gradient-to-br from-green-900/20 to-gray-900 border border-green-500/30 rounded-xl p-6">
          <div className="text-green-400 text-sm mb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Delivered
          </div>
          <div className="text-3xl font-bold text-green-400">{stats.delivered}</div>
        </div>
        <div className="bg-gradient-to-br from-red-900/20 to-gray-900 border border-red-500/30 rounded-xl p-6">
          <div className="text-red-400 text-sm mb-2 flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            Failed
          </div>
          <div className="text-3xl font-bold text-red-400">{stats.failed}</div>
        </div>
        <div className="bg-gradient-to-br from-gray-700/20 to-gray-900 border border-gray-500/30 rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-2 flex items-center gap-2">
            <Ban className="w-4 h-4" />
            Cancelled
          </div>
          <div className="text-3xl font-bold text-gray-400">{stats.cancelled}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg transition-all ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          All ({stats.total})
        </button>
        <button
          onClick={() => setFilter("delivered")}
          className={`px-4 py-2 rounded-lg transition-all ${
            filter === "delivered"
              ? "bg-green-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Delivered ({stats.delivered})
        </button>
        <button
          onClick={() => setFilter("failed")}
          className={`px-4 py-2 rounded-lg transition-all ${
            filter === "failed"
              ? "bg-red-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Failed ({stats.failed})
        </button>
        <button
          onClick={() => setFilter("cancelled")}
          className={`px-4 py-2 rounded-lg transition-all ${
            filter === "cancelled"
              ? "bg-gray-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Cancelled ({stats.cancelled})
        </button>
      </div>

      {filteredDeliveries.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-12 text-center">
          <Truck className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            No {filter !== "all" ? formatStatus(filter) : ""} Deliveries Found
          </h3>
          <p className="text-gray-400">
            {filter === "all" 
              ? "You haven't completed any deliveries yet."
              : `You don't have any ${filter} deliveries.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDeliveries.map((delivery) => {
            const items = delivery.deliveryItemType === "consolidation" 
              ? delivery.consolidation?.parcels || []
              : delivery.parcels || [];
            const isExpanded = expandedDelivery === delivery._id;

            return (
              <div
                key={delivery._id}
                className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 hover:-translate-y-1 hover:border-blue-400 transition-all"
              >
                {/* Header Section */}
                <div 
                  className="flex justify-between items-start cursor-pointer"
                  onClick={() => toggleDeliveryDetails(delivery._id)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(delivery.status)}
                      <div className="text-blue-400 font-semibold text-lg">
                        {delivery.deliveryNumber}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(delivery.status)}`}>
                        {formatStatus(delivery.status)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      {delivery.deliveryItemType === "consolidation" 
                        ? `Consolidation: ${delivery.consolidation?.referenceCode || "N/A"}`
                        : `Parcel Delivery (${items.length} item${items.length !== 1 ? 's' : ''})`}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/30">
                        {formatDeliveryType(delivery.deliveryType)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded border font-medium ${getPriorityColor(delivery.priority)}`}>
                        {delivery.priority.toUpperCase()} PRIORITY
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400 mb-1">
                      {formatDate(delivery.actualDeliveryTime || delivery.updatedTimestamp)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTime(delivery.actualDeliveryTime || delivery.updatedTimestamp)}
                    </div>
                    <div className="mt-2">
                      <svg 
                        className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-6 pt-6 border-t border-gray-700 space-y-4">
                    {/* Route Information */}
                    <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                      <h4 className="text-gray-300 font-medium mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Route Information
                      </h4>
                      <div className="space-y-3">
                        {/* From Location */}
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 mb-1">FROM</div>
                            <div className="text-gray-300">
                              {delivery.fromLocation.type === "warehouse" ? (
                                <div className="flex items-center gap-2">
                                  <Warehouse className="w-4 h-4 text-green-400" />
                                  <span>{delivery.fromLocation.locationName || "Warehouse"}</span>
                                </div>
                              ) : (
                                <div>{delivery.fromLocation.address || delivery.fromLocation.locationName || "Pickup Address"}</div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* To Location */}
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 mb-1">TO</div>
                            <div className="text-gray-300">
                              {delivery.toLocation.type === "warehouse" ? (
                                <div className="flex items-center gap-2">
                                  <Warehouse className="w-4 h-4 text-red-400" />
                                  <span>{delivery.toLocation.locationName || "Warehouse"}</span>
                                </div>
                              ) : (
                                <div>{delivery.toLocation.address || delivery.toLocation.locationName || "Delivery Address"}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                      <h4 className="text-gray-300 font-medium mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Timeline
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Pickup Time</div>
                          <div className="text-gray-300 text-sm">
                            {delivery.actualPickupTime ? formatDateTime(delivery.actualPickupTime) : "N/A"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Delivery Time</div>
                          <div className="text-gray-300 text-sm">
                            {delivery.actualDeliveryTime ? formatDateTime(delivery.actualDeliveryTime) : formatDateTime(delivery.updatedTimestamp)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Items List */}
                    {items.length > 0 && (
                      <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                        <h4 className="text-gray-300 font-medium mb-3 flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          Items ({items.length}):
                        </h4>
                        <div className="space-y-2">
                          {items.map((item, idx) => (
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
                        </div>
                      </div>
                    )}

                    {/* Instructions and Notes */}
                    {(delivery.deliveryInstructions || delivery.notes) && (
                      <div className="space-y-3">
                        {delivery.deliveryInstructions && (
                          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="text-yellow-400 font-medium text-sm mb-1">Instructions</div>
                                <div className="text-gray-300 text-sm">{delivery.deliveryInstructions}</div>
                              </div>
                            </div>
                          </div>
                        )}
                        {delivery.notes && (
                          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="text-blue-400 font-medium text-sm mb-1">Notes</div>
                                <div className="text-gray-300 text-sm">{delivery.notes}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Status History */}
                    {delivery.statusHistory && delivery.statusHistory.length > 0 && (
                      <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                        <h4 className="text-gray-300 font-medium mb-3">Status History</h4>
                        <div className="space-y-3">
                          {delivery.statusHistory.slice().reverse().map((history, idx) => (
                            <div key={idx} className="flex items-start gap-3 text-sm">
                              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-gray-300 font-medium">{formatStatus(history.status)}</span>
                                  <span className="text-gray-500 text-xs">{formatDateTime(history.timestamp)}</span>
                                </div>
                                {history.note && (
                                  <div className="text-gray-400 text-xs">{history.note}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DeliveryHistory;