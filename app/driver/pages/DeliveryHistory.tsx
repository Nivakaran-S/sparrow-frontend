import { useState, useEffect } from "react";
import { Package, Calendar, MapPin, DollarSign, Star, Download, TrendingUp } from "lucide-react";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://api-gateway-nine-orpin.vercel.app";

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

interface Delivery {
  _id: string;
  driverId: any;
  consolidationId?: {
    referenceCode: string;
    masterTrackingNumber?: string;
    parcels?: any[];
  };
  status: string;
  startTime?: string;
  endTime?: string;
  startLocation?: any;
  endLocation?: any;
  locationHistory?: any[];
  notes?: string;
  createdTimestamp: string;
  updatedTimestamp?: string;
  actualDeliveryTime?: string;
}

interface DailyStats {
  date: string;
  deliveries: number;
  distance: number;
  earnings: number;
  avgRating: number;
  deliveryData: Delivery[];
  parcelData?: any[];
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
      
      // Fetch consolidation deliveries
      const deliveriesResponse = await fetch(
        `${API_BASE_URL}/api/consolidations/api/deliveries/driver/${driverId}`,
        { credentials: "include" }
      );

      if (!deliveriesResponse.ok) throw new Error("Failed to fetch delivery history");

      const deliveriesResult = await deliveriesResponse.json();

      // Fetch individual parcels
      const parcelsResponse = await fetch(
        `${API_BASE_URL}/api/parcels/api/parcels/driver/${driverId}`,
        { credentials: "include" }
      );

      if (!parcelsResponse.ok) throw new Error("Failed to fetch parcels");

      const parcelsResult = await parcelsResponse.json();

      if (deliveriesResult.success && parcelsResult.success) {
        const deliveries = deliveriesResult.data || [];
        const parcels = parcelsResult.data || [];

        console.log("📊 Total consolidation deliveries fetched:", deliveries.length);
        console.log("📦 Total parcels fetched:", parcels.length);
        console.log("🚗 Current Driver ID:", driverId);

        // Filter completed consolidation deliveries for this driver
        const completedDeliveries = deliveries.filter((d: Delivery) => {
          const isCompleted = d.status === "completed";
          // Handle both string and object driverId
          const deliveryDriverId = typeof d.driverId === 'string' ? d.driverId : d.driverId?._id;
          const driverIdMatch = deliveryDriverId === driverId;
          
          if (isCompleted && driverIdMatch) {
            console.log("✅ Completed consolidation delivery:", d._id, "Driver:", deliveryDriverId);
          }
          
          return isCompleted && driverIdMatch;
        });

        // Filter delivered parcels for this driver
        const deliveredParcels = parcels.filter((p: any) => {
          const isDelivered = p.status === "delivered";
          // Handle both string and object assignedDriver
          const parcelDriverId = typeof p.assignedDriver === 'string' ? p.assignedDriver : p.assignedDriver?._id;
          const driverIdMatch = parcelDriverId === driverId;
          
          if (isDelivered && driverIdMatch) {
            console.log("✅ Delivered parcel:", p.trackingNumber, "Driver:", parcelDriverId);
          }
          
          return isDelivered && driverIdMatch;
        });

        console.log("✅ Total completed consolidation deliveries for this driver:", completedDeliveries.length);
        console.log("✅ Total delivered individual parcels for this driver:", deliveredParcels.length);
        
        const dailyStats = processDeliveryHistory(completedDeliveries, deliveredParcels);
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

  const processDeliveryHistory = (deliveries: Delivery[], parcels: any[]): DailyStats[] => {
    const now = new Date();
    const daysAgo = parseInt(timeFilter);
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    // Filter consolidation deliveries within date range
    const filteredDeliveries = deliveries.filter((d) => {
      const deliveryDate = new Date(d.endTime || d.actualDeliveryTime || d.updatedTimestamp || d.createdTimestamp);
      return deliveryDate >= startDate;
    });

    // Filter individual parcels within date range
    const filteredParcels = parcels.filter((p) => {
      const deliveryDate = p.statusHistory?.find((h: any) => h.status === "delivered")?.timestamp;
      return deliveryDate ? new Date(deliveryDate) >= startDate : false;
    });

    console.log(`📅 Consolidation deliveries in last ${daysAgo} days:`, filteredDeliveries.length);
    console.log(`📅 Individual parcels in last ${daysAgo} days:`, filteredParcels.length);

    // Group consolidation deliveries by date
    const groupedByDate: Record<string, { deliveries: Delivery[], parcels: any[] }> = {};

    filteredDeliveries.forEach((delivery) => {
      const deliveryDate = new Date(delivery.endTime || delivery.actualDeliveryTime || delivery.updatedTimestamp || delivery.createdTimestamp);
      const dateKey = deliveryDate.toLocaleDateString();
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = { deliveries: [], parcels: [] };
      }
      groupedByDate[dateKey].deliveries.push(delivery);
    });

    // Group individual parcels by date
    filteredParcels.forEach((parcel) => {
      const deliveryDate = parcel.statusHistory?.find((h: any) => h.status === "delivered")?.timestamp;
      if (deliveryDate) {
        const dateKey = new Date(deliveryDate).toLocaleDateString();
        if (!groupedByDate[dateKey]) {
          groupedByDate[dateKey] = { deliveries: [], parcels: [] };
        }
        groupedByDate[dateKey].parcels.push(parcel);
      }
    });

    // Calculate stats for each day
    return Object.entries(groupedByDate)
      .map(([date, data]) => {
        const { deliveries: dayDeliveries, parcels: dayParcels } = data;
        let totalDistance = 0;
        let totalEarnings = 0;
        let totalDeliveryCount = 0;

        // Calculate from consolidation deliveries
        dayDeliveries.forEach((delivery) => {
          let deliveryDistance = 0;

          // Calculate distance from location history
          if (delivery.locationHistory && delivery.locationHistory.length > 1) {
            for (let i = 1; i < delivery.locationHistory.length; i++) {
              const loc1 = delivery.locationHistory[i - 1];
              const loc2 = delivery.locationHistory[i];
              if (loc1.latitude && loc1.longitude && loc2.latitude && loc2.longitude) {
                deliveryDistance += calculateDistance(
                  loc1.latitude,
                  loc1.longitude,
                  loc2.latitude,
                  loc2.longitude
                );
              }
            }
          }

          totalDistance += deliveryDistance;

          // Calculate earnings for this consolidation delivery
          const consolidation = delivery.consolidationId;
          if (consolidation?.parcels && consolidation.parcels.length > 0) {
            const distancePerParcel = deliveryDistance / consolidation.parcels.length;
            
            consolidation.parcels.forEach((parcel: any) => {
              const pricingType = parcel.pricingId?.parcelType || "Standard";
              const driverPricing = getDriverPricingForParcel(pricingType);

              if (driverPricing) {
                const weight = parcel.weight?.value || 0;
                
                let parcelEarnings = driverPricing.driverBaseEarning;
                parcelEarnings += distancePerParcel * driverPricing.driverEarningPerKm;
                parcelEarnings += weight * driverPricing.driverEarningPerKg;
                
                if (parcel.isUrgent && driverPricing.urgentDeliveryBonus > 0) {
                  parcelEarnings += driverPricing.urgentDeliveryBonus;
                }

                totalEarnings += parcelEarnings;
                totalDeliveryCount++;
              }
            });
          }
        });

        // Calculate from individual parcels
        dayParcels.forEach((parcel) => {
          const pricingType = parcel.pricingId?.parcelType || "Standard";
          const driverPricing = getDriverPricingForParcel(pricingType);

          if (driverPricing) {
            const weight = parcel.weight?.value || 0;
            const estimatedDistance = 5; // 5 km average for individual parcels
            
            let parcelEarnings = driverPricing.driverBaseEarning;
            parcelEarnings += estimatedDistance * driverPricing.driverEarningPerKm;
            parcelEarnings += weight * driverPricing.driverEarningPerKg;
            
            if (parcel.isUrgent && driverPricing.urgentDeliveryBonus > 0) {
              parcelEarnings += driverPricing.urgentDeliveryBonus;
            }

            totalEarnings += parcelEarnings;
            totalDistance += estimatedDistance;
            totalDeliveryCount++;
          }
        });

        return {
          date,
          deliveries: totalDeliveryCount,
          distance: Math.round(totalDistance * 10) / 10,
          earnings: Math.round(totalEarnings * 100) / 100,
          avgRating: 0,
          deliveryData: dayDeliveries,
          parcelData: dayParcels,
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
      ["Date", "Deliveries", "Distance (km)", "Earnings (Rs.)"],
      ...history.map((day) => [
        day.date,
        day.deliveries,
        day.distance,
        day.earnings,
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
              
              {/* Consolidation Deliveries */}
              {selectedDay.deliveryData.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-gray-400 text-sm mb-2">Consolidation Deliveries ({selectedDay.deliveryData.length})</h5>
                  {selectedDay.deliveryData.map((delivery, idx) => (
                    <div
                      key={delivery._id}
                      className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 mb-2"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-blue-400 font-semibold">
                            {delivery.consolidationId?.masterTrackingNumber || `DEL-${delivery._id.slice(-6)}`}
                          </div>
                          <div className="text-gray-500 text-sm">
                            Ref: {delivery.consolidationId?.referenceCode || "N/A"}
                          </div>
                        </div>
                        <span className="text-green-400 text-sm bg-green-500/10 px-2 py-1 rounded">Completed</span>
                      </div>
                      <div className="text-gray-400 text-sm mb-2">
                        Parcels: {delivery.consolidationId?.parcels?.length || 0}
                      </div>
                      {delivery.startTime && delivery.endTime && (
                        <div className="text-gray-400 text-sm">
                          Duration:{" "}
                          {Math.round(
                            (new Date(delivery.endTime).getTime() -
                              new Date(delivery.startTime).getTime()) /
                              (1000 * 60)
                          )}{" "}
                          minutes
                        </div>
                      )}
                      {delivery.notes && (
                        <div className="text-gray-400 text-sm mt-2 italic bg-blue-500/10 p-2 rounded">
                          Note: {delivery.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Individual Parcels */}
              {selectedDay.parcelData && selectedDay.parcelData.length > 0 && (
                <div>
                  <h5 className="text-gray-400 text-sm mb-2">Individual Parcels ({selectedDay.parcelData.length})</h5>
                  {selectedDay.parcelData.map((parcel, idx) => (
                    <div
                      key={parcel._id}
                      className="bg-gray-900/50 border border-green-700 rounded-lg p-4 mb-2"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-green-400 font-semibold">
                            {parcel.trackingNumber}
                          </div>
                          <div className="text-gray-500 text-sm">
                            Type: {parcel.pricingId?.parcelType || "Standard"}
                          </div>
                        </div>
                        <span className="text-green-400 text-sm bg-green-500/10 px-2 py-1 rounded">Delivered</span>
                      </div>
                      {parcel.receiver?.name && (
                        <div className="text-gray-400 text-sm">
                          Receiver: {parcel.receiver.name}
                        </div>
                      )}
                      {parcel.weight && (
                        <div className="text-gray-400 text-sm">
                          Weight: {parcel.weight.value} {parcel.weight.unit}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {selectedDay.deliveryData.length === 0 && (!selectedDay.parcelData || selectedDay.parcelData.length === 0) && (
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