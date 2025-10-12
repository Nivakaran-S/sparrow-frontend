import { useState, useEffect } from "react";
import { Package, Calendar, MapPin, DollarSign, Star, Download, TrendingUp, Clock, Truck } from "lucide-react";

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
  status: string;
  priority: string;
  estimatedPickupTime?: string;
  actualPickupTime?: string;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  deliveryInstructions?: string;
  notes?: string;
  createdTimestamp: string;
  updatedTimestamp?: string;
  statusHistory?: any[];
}

interface DriverPricing {
  _id: string;
  parcelType: string;
  driverBaseEarning: number;
  driverEarningPerKm: number;
  driverEarningPerKg: number;
  urgentDeliveryBonus: number;
  commissionPercentage: number;
  isActive: boolean;
}

interface DailyStats {
  date: string;
  deliveries: number;
  distance: number;
  earnings: number;
  avgRating: number;
  deliveryData: Delivery[];
}

const DeliveryHistory = ({ userId, setActiveTab }: { userId?: string; setActiveTab?: (tab: string) => void }) => {
  const [history, setHistory] = useState<DailyStats[]>([]);
  const [driverPricings, setDriverPricings] = useState<DriverPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState("7");
  const [selectedDay, setSelectedDay] = useState<DailyStats | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (driverId) {
      fetchAllData();
    }
  }, [driverId, timeFilter]);

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

  const fetchAllData = async () => {
    await Promise.all([fetchDriverPricings(), fetchDeliveryHistory()]);
  };

  const fetchDriverPricings = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/pricing/api/pricing-driver?isActive=true`,
        { credentials: "include" }
      );

      if (!response.ok) throw new Error("Failed to fetch driver pricing");

      const data = await response.json();

      if (data.success) {
        setDriverPricings(data.data || []);
      }
    } catch (err: any) {
      console.error("Error fetching driver pricings:", err);
    }
  };

  const fetchDeliveryHistory = async () => {
    if (!driverId) return;

    try {
      setLoading(true);
      
      const response = await fetch(
        `${API_BASE_URL}/api/deliveries/api/deliveries/driver/${driverId}`,
        { credentials: "include" }
      );

      if (!response.ok) throw new Error("Failed to fetch delivery history");

      const result = await response.json();

      if (result.success) {
        const deliveries = result.data || [];

        console.log("📊 Total deliveries fetched:", deliveries.length);
        console.log("🚗 Current Driver ID:", driverId);

        // Filter only completed deliveries for this driver
        const completedDeliveries = deliveries.filter((d: Delivery) => {
          const isDelivered = d.status === "delivered";
          const deliveryDriverId = typeof d.assignedDriver === 'string' 
            ? d.assignedDriver 
            : d.assignedDriver?._id;
          const driverIdMatch = deliveryDriverId === driverId;
          
          if (isDelivered && driverIdMatch) {
            console.log("✅ Completed delivery:", d.deliveryNumber, "Driver:", deliveryDriverId);
          }
          
          return isDelivered && driverIdMatch;
        });

        console.log("✅ Total completed deliveries for this driver:", completedDeliveries.length);
        
        const dailyStats = processDeliveryHistory(completedDeliveries);
        setHistory(dailyStats);
      }
    } catch (err: any) {
      console.error("Error fetching delivery history:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDriverPricingForParcel = (parcelType: string): DriverPricing | null => {
    return driverPricings.find(dp => dp.parcelType === parcelType) || null;
  };

  const processDeliveryHistory = (deliveries: Delivery[]): DailyStats[] => {
    const now = new Date();
    const daysAgo = parseInt(timeFilter);
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    // Filter deliveries within date range
    const filteredDeliveries = deliveries.filter((d) => {
      const deliveryDate = new Date(d.actualDeliveryTime || d.updatedTimestamp || d.createdTimestamp);
      return deliveryDate >= startDate;
    });

    console.log(`📅 Deliveries in last ${daysAgo} days:`, filteredDeliveries.length);

    // Group deliveries by date
    const groupedByDate: Record<string, Delivery[]> = {};

    filteredDeliveries.forEach((delivery) => {
      const deliveryDate = new Date(delivery.actualDeliveryTime || delivery.updatedTimestamp || delivery.createdTimestamp);
      const dateKey = deliveryDate.toLocaleDateString();
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = [];
      }
      groupedByDate[dateKey].push(delivery);
    });

    // Calculate stats for each day
    return Object.entries(groupedByDate)
      .map(([date, dayDeliveries]) => {
        let totalDistance = 0;
        let totalEarnings = 0;
        const totalDeliveryCount = dayDeliveries.length;

        dayDeliveries.forEach((delivery) => {
          // Estimate distance (simplified calculation)
          let deliveryDistance = 5; // Default 5 km per delivery

          // If we have location history, calculate actual distance
          if (delivery.statusHistory && delivery.statusHistory.length > 1) {
            deliveryDistance = 0;
            for (let i = 1; i < delivery.statusHistory.length; i++) {
              const loc1 = delivery.statusHistory[i - 1].location;
              const loc2 = delivery.statusHistory[i].location;
              if (loc1?.latitude && loc1?.longitude && loc2?.latitude && loc2?.longitude) {
                deliveryDistance += calculateDistance(
                  loc1.latitude,
                  loc1.longitude,
                  loc2.latitude,
                  loc2.longitude
                );
              }
            }
            if (deliveryDistance === 0) deliveryDistance = 5; // Fallback
          }

          totalDistance += deliveryDistance;

          // Calculate earnings based on items
          const items = delivery.deliveryItemType === "consolidation"
            ? delivery.consolidation?.parcels || []
            : delivery.parcels || [];

          const distancePerItem = items.length > 0 ? deliveryDistance / items.length : deliveryDistance;

          items.forEach((item: Parcel) => {
            const pricingType = item.pricingId?.parcelType || "Standard";
            const driverPricing = getDriverPricingForParcel(pricingType);

            if (driverPricing) {
              const weight = item.weight?.value || 0;
              
              let itemEarnings = driverPricing.driverBaseEarning;
              itemEarnings += distancePerItem * driverPricing.driverEarningPerKm;
              itemEarnings += weight * driverPricing.driverEarningPerKg;
              
              // Check if urgent (priority is urgent)
              if (delivery.priority === "urgent" && driverPricing.urgentDeliveryBonus > 0) {
                itemEarnings += driverPricing.urgentDeliveryBonus;
              }

              totalEarnings += itemEarnings;
            }
          });
        });

        return {
          date,
          deliveries: totalDeliveryCount,
          distance: Math.round(totalDistance * 10) / 10,
          earnings: Math.round(totalEarnings * 100) / 100,
          avgRating: 4.8, // Default rating
          deliveryData: dayDeliveries,
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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

  const exportData = () => {
    const csvContent = [
      ["Date", "Deliveries", "Distance (km)", "Earnings (Rs.)", "Avg Rating"],
      ...history.map((day) => [
        day.date,
        day.deliveries,
        day.distance,
        day.earnings,
        day.avgRating
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `delivery-history-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const getTotalStats = () => {
    return {
      totalDeliveries: history.reduce((sum, day) => sum + day.deliveries, 0),
      totalDistance: history.reduce((sum, day) => sum + day.distance, 0),
      totalEarnings: history.reduce((sum, day) => sum + day.earnings, 0),
      avgRating: history.length > 0
        ? history.reduce((sum, day) => sum + day.avgRating, 0) / history.length
        : 0,
    };
  };

  const formatStatus = (status: string): string =>
    status
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const calculateDeliveryDuration = (delivery: Delivery): string => {
    if (delivery.actualPickupTime && delivery.actualDeliveryTime) {
      const start = new Date(delivery.actualPickupTime).getTime();
      const end = new Date(delivery.actualDeliveryTime).getTime();
      const minutes = Math.round((end - start) / (1000 * 60));
      
      if (minutes < 60) {
        return `${minutes} min`;
      } else {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
      }
    }
    return "N/A";
  };

  if (loading) {
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

  const totalStats = getTotalStats();

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-8">
        Delivery History
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-5 h-5 text-blue-400" />
            <span className="text-gray-400 text-sm">Total Deliveries</span>
          </div>
          <div className="text-2xl font-bold text-white">{totalStats.totalDeliveries}</div>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <MapPin className="w-5 h-5 text-green-400" />
            <span className="text-gray-400 text-sm">Total Distance</span>
          </div>
          <div className="text-2xl font-bold text-white">{totalStats.totalDistance.toFixed(1)} km</div>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-yellow-400" />
            <span className="text-gray-400 text-sm">Total Earnings</span>
          </div>
          <div className="text-2xl font-bold text-white">Rs. {totalStats.totalEarnings.toFixed(2)}</div>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <Star className="w-5 h-5 text-purple-400" />
            <span className="text-gray-400 text-sm">Avg Rating</span>
          </div>
          <div className="text-2xl font-bold text-white">{totalStats.avgRating.toFixed(1)}/5</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg focus:border-blue-500 outline-none"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 3 Months</option>
        </select>
        <button
          onClick={exportData}
          disabled={history.length === 0}
          className="bg-gray-600 text-gray-200 cursor-pointer px-4 py-2 rounded-lg border border-gray-500 hover:bg-gray-500 hover:-translate-y-1 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          Export Data
        </button>
      </div>

      {/* History Table */}
      {history.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">No Delivery History</h3>
          <p className="text-gray-400">No completed deliveries found in the selected period.</p>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-700">
                <th className="p-4 text-white font-semibold">Date</th>
                <th className="p-4 text-white font-semibold">Deliveries</th>
                <th className="p-4 text-white font-semibold">Distance</th>
                <th className="p-4 text-white font-semibold">Earnings</th>
                <th className="p-4 text-white font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.map((day, index) => (
                <tr key={index} className="border-b border-gray-700 hover:bg-blue-500/5 transition-colors">
                  <td className="p-4 text-blue-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {day.date}
                    </div>
                  </td>
                  <td className="p-4 text-gray-400">{day.deliveries}</td>
                  <td className="p-4 text-gray-400">{day.distance} km</td>
                  <td className="p-4 text-green-400 font-semibold">Rs. {day.earnings.toFixed(2)}</td>
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedDay(day)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-all text-sm cursor-pointer"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDay(null)}>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">
                Deliveries on {selectedDay.date}
              </h3>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-gray-400 hover:text-white transition-colors text-3xl cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Total Deliveries</div>
                <div className="text-white text-xl font-semibold">{selectedDay.deliveries}</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Total Distance</div>
                <div className="text-white text-xl font-semibold">{selectedDay.distance} km</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Earnings</div>
                <div className="text-white text-xl font-semibold">Rs. {selectedDay.earnings.toFixed(2)}</div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="text-gray-400 text-sm mb-1">Avg Rating</div>
                <div className="text-white text-xl font-semibold">{selectedDay.avgRating}/5</div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-white font-semibold mb-3">Delivery Details</h4>
              
              {selectedDay.deliveryData.map((delivery, idx) => {
                const items = delivery.deliveryItemType === "consolidation"
                  ? delivery.consolidation?.parcels || []
                  : delivery.parcels || [];

                return (
                  <div
                    key={delivery._id}
                    className="bg-gray-900/50 border border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-blue-400 font-semibold">
                          {delivery.deliveryNumber}
                        </div>
                        <div className="text-gray-500 text-sm">
                          {delivery.deliveryItemType === "consolidation"
                            ? `Consolidation: ${delivery.consolidation?.referenceCode || "N/A"}`
                            : "Parcel Delivery"}
                        </div>
                      </div>
                      <span className="text-green-400 text-sm bg-green-500/10 px-2 py-1 rounded">
                        Delivered
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                      <div className="text-gray-400">
                        Items: <span className="text-white">{items.length}</span>
                      </div>
                      <div className="text-gray-400">
                        Duration: <span className="text-white">{calculateDeliveryDuration(delivery)}</span>
                      </div>
                    </div>

                    {delivery.toLocation && (
                      <div className="text-gray-400 text-sm mb-2">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {delivery.toLocation.type === "address"
                          ? delivery.toLocation.address || "Address"
                          : `Warehouse: ${delivery.toLocation.locationName || "N/A"}`}
                      </div>
                    )}

                    {items.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-gray-700">
                        <div className="text-gray-400 text-xs mb-1">Items in this delivery:</div>
                        <div className="space-y-1">
                          {items.slice(0, 2).map((item) => (
                            <div key={item._id} className="text-xs text-gray-500">
                              • {item.trackingNumber}
                              {item.weight && ` (${item.weight.value} ${item.weight.unit})`}
                            </div>
                          ))}
                          {items.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{items.length - 2} more items
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {delivery.notes && (
                      <div className="text-gray-400 text-sm mt-2 italic bg-blue-500/10 p-2 rounded">
                        Note: {delivery.notes}
                      </div>
                    )}
                  </div>
                );
              })}

              {selectedDay.deliveryData.length === 0 && (
                <div className="text-gray-400 text-center py-8">No delivery details available</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryHistory;