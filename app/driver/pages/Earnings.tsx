import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, Package, MapPin, Calendar, RefreshCw, Target, Clock, Award, Truck } from "lucide-react";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://api-gateway-nine-orpin.vercel.app";

interface EarningsData {
  today: { amount: number; deliveries: number; distance: number };
  week: { amount: number; deliveries: number; distance: number };
  month: { amount: number; deliveries: number; distance: number };
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
  weight?: {
    value: number;
    unit: string;
  };
  pricingId?: {
    _id: string;
    parcelType: string;
  };
  isUrgent?: boolean;
}

interface Consolidation {
  _id: string;
  masterTrackingNumber?: string;
  referenceCode: string;
  parcels?: Parcel[];
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
  status: string;
  priority: string;
  distance?: number;
  actualPickupTime?: string;
  actualDeliveryTime?: string;
  updatedTimestamp?: string;
  createdTimestamp: string;
  statusHistory?: any[];
}

interface RecentDelivery {
  deliveryNumber: string;
  itemCount: number;
  distance: number;
  earning: number;
  completedAt: string;
  priority: string;
}

const Earnings = ({ userId, setActiveTab }: { userId?: string; setActiveTab?: (tab: string) => void }) => {
  const [earnings, setEarnings] = useState<EarningsData>({
    today: { amount: 0, deliveries: 0, distance: 0 },
    week: { amount: 0, deliveries: 0, distance: 0 },
    month: { amount: 0, deliveries: 0, distance: 0 },
  });
  const [driverPricings, setDriverPricings] = useState<DriverPricing[]>([]);
  const [recentDeliveries, setRecentDeliveries] = useState<RecentDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (driverId) {
      fetchAllData();
      const interval = setInterval(fetchAllData, 60000); // Refresh every minute
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

  const fetchAllData = async () => {
    await Promise.all([fetchDriverPricings(), fetchEarningsData()]);
    setLastUpdate(new Date());
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
        console.log("💰 Driver pricings loaded:", data.data.length);
      }
    } catch (err: any) {
      console.error("Error fetching driver pricings:", err);
    }
  };

  const fetchEarningsData = async () => {
    if (!driverId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch deliveries from the deliveries endpoint
      const response = await fetch(
        `${API_BASE_URL}/api/parcels/api/deliveries/driver/${driverId}`,
        { credentials: "include" }
      );

      if (!response.ok) throw new Error("Failed to fetch deliveries");

      const result = await response.json();

      if (result.success) {
        const deliveries = result.data || [];
        
        console.log("📊 Total deliveries fetched:", deliveries.length);
        console.log("🚗 Current Driver ID:", driverId);
        
        const calculatedEarnings = calculateEarnings(deliveries);
        setEarnings(calculatedEarnings);
      }
    } catch (err: any) {
      console.error("Error fetching earnings data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDriverPricingForParcel = (parcelType: string): DriverPricing | null => {
    // Try exact match first
    let pricing = driverPricings.find(dp => dp.parcelType === parcelType);
    
    // If not found, try case-insensitive match
    if (!pricing) {
      pricing = driverPricings.find(dp => 
        dp.parcelType.toLowerCase() === parcelType.toLowerCase()
      );
    }
    
    // If still not found, use Standard as fallback
    if (!pricing) {
      console.warn(`⚠️ No driver pricing found for parcel type: ${parcelType}, using Standard`);
      pricing = driverPricings.find(dp => dp.parcelType === "Standard");
    }
    
    if (!pricing) {
      console.error(`❌ No driver pricing available at all!`);
    }
    
    return pricing || null;
  };

  const calculateEarnings = (deliveries: Delivery[]): EarningsData => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Filter only delivered deliveries assigned to this driver
    const completedDeliveries = deliveries.filter((d) => {
      const isDelivered = d.status === "delivered";
      const deliveryDriverId = typeof d.assignedDriver === 'string' 
        ? d.assignedDriver 
        : d.assignedDriver?._id;
      const isAssignedToMe = deliveryDriverId === driverId;
      return isDelivered && isAssignedToMe;
    });

    console.log("✅ Completed deliveries for this driver:", completedDeliveries.length);

    // Filter by time periods
    const todayDeliveries = completedDeliveries.filter(
      (d) => new Date(d.actualDeliveryTime || d.updatedTimestamp || d.createdTimestamp) >= todayStart
    );
    const weekDeliveries = completedDeliveries.filter(
      (d) => new Date(d.actualDeliveryTime || d.updatedTimestamp || d.createdTimestamp) >= weekStart
    );
    const monthDeliveries = completedDeliveries.filter(
      (d) => new Date(d.actualDeliveryTime || d.updatedTimestamp || d.createdTimestamp) >= monthStart
    );

    console.log("📅 Today:", todayDeliveries.length, "deliveries");
    console.log("📅 This week:", weekDeliveries.length, "deliveries");
    console.log("📅 This month:", monthDeliveries.length, "deliveries");

    // Calculate recent deliveries for display
    const recent: RecentDelivery[] = [];

    const calculatePeriodStats = (periodDeliveries: Delivery[]) => {
      let totalDistance = 0;
      let totalAmount = 0;
      let deliveryCount = 0;

      periodDeliveries.forEach((delivery) => {
        let deliveryDistance = 0;

        // Use distance from delivery if available
        if (delivery.distance && delivery.distance > 0) {
          deliveryDistance = delivery.distance;
        } else {
          // Calculate distance from location history
          if (delivery.statusHistory && delivery.statusHistory.length > 1) {
            const locations = delivery.statusHistory.filter(h => h.location?.latitude && h.location?.longitude);
            for (let i = 1; i < locations.length; i++) {
              const loc1 = locations[i - 1].location;
              const loc2 = locations[i].location;
              deliveryDistance += calculateDistance(
                loc1.latitude,
                loc1.longitude,
                loc2.latitude,
                loc2.longitude
              );
            }
          }
        }

        // If no location history and no distance, estimate based on delivery type
        if (deliveryDistance === 0) {
          // Estimate based on delivery type
          if (delivery.fromLocation.type === 'warehouse' && delivery.toLocation.type === 'warehouse') {
            deliveryDistance = 15; // Warehouse to warehouse
          } else if (delivery.fromLocation.type === 'warehouse' || delivery.toLocation.type === 'warehouse') {
            deliveryDistance = 8; // Warehouse to/from address
          } else {
            deliveryDistance = 5; // Address to address
          }
        }

        totalDistance += deliveryDistance;

        // Get items from delivery
        const items: Parcel[] = delivery.deliveryItemType === "consolidation"
          ? delivery.consolidation?.parcels || []
          : delivery.parcels || [];

        const distancePerItem = items.length > 0 ? deliveryDistance / items.length : deliveryDistance;
        let deliveryEarnings = 0;

        // Calculate earnings for each item
        items.forEach((item: Parcel) => {
          let parcelType = "Standard"; // Default
          
          if (item.pricingId) {
            if (typeof item.pricingId === 'string') {
              parcelType = "Standard";
            } else if (item.pricingId.parcelType) {
              parcelType = item.pricingId.parcelType;
            }
          }
          
          console.log(`📦 Processing item ${item.trackingNumber}, type: ${parcelType}`);
          
          const driverPricing = getDriverPricingForParcel(parcelType);

          if (driverPricing) {
            const weight = item.weight?.value || 0;
            
            let itemEarnings = driverPricing.driverBaseEarning;
            itemEarnings += distancePerItem * driverPricing.driverEarningPerKm;
            itemEarnings += weight * driverPricing.driverEarningPerKg;
            
            // Add urgent bonus based on delivery priority
            if (delivery.priority === "urgent" && driverPricing.urgentDeliveryBonus > 0) {
              itemEarnings += driverPricing.urgentDeliveryBonus;
              console.log(`🚨 Urgent bonus added: Rs. ${driverPricing.urgentDeliveryBonus}`);
            }

            totalAmount += itemEarnings;
            deliveryEarnings += itemEarnings;
            deliveryCount++;
            
            console.log(`💰 Item earnings - Base: Rs. ${driverPricing.driverBaseEarning}, Distance(${distancePerItem.toFixed(2)}km): Rs. ${(distancePerItem * driverPricing.driverEarningPerKm).toFixed(2)}, Weight(${weight}kg): Rs. ${(weight * driverPricing.driverEarningPerKg).toFixed(2)}, Total: Rs. ${itemEarnings.toFixed(2)}`);
          } else {
            console.warn(`⚠️ No pricing found for item ${item.trackingNumber} type ${parcelType}`);
          }
        });

        // Add to recent deliveries (only for week period to show in UI)
        if (periodDeliveries === weekDeliveries && recent.length < 10) {
          recent.push({
            deliveryNumber: delivery.deliveryNumber,
            itemCount: items.length,
            distance: deliveryDistance,
            earning: deliveryEarnings,
            completedAt: delivery.actualDeliveryTime || delivery.updatedTimestamp || delivery.createdTimestamp,
            priority: delivery.priority
          });
        }
      });

      console.log(`📊 Period total - Items: ${deliveryCount}, Amount: Rs. ${totalAmount.toFixed(2)}, Distance: ${totalDistance.toFixed(1)} km`);

      return {
        amount: Math.round(totalAmount * 100) / 100,
        deliveries: deliveryCount,
        distance: Math.round(totalDistance * 10) / 10,
      };
    };

    const result = {
      today: calculatePeriodStats(todayDeliveries),
      week: calculatePeriodStats(weekDeliveries),
      month: calculatePeriodStats(monthDeliveries),
    };

    // Sort recent deliveries by completion time (most recent first)
    recent.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    setRecentDeliveries(recent);

    return result;
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in km
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

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading earnings data...</p>
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
            onClick={fetchAllData}
            className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
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
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Earnings & Payments
          </h2>
          {lastUpdate && (
            <p className="text-gray-500 text-sm mt-1">
              Last updated: {formatRelativeTime(lastUpdate.toISOString())}
            </p>
          )}
        </div>
        <button
          onClick={fetchAllData}
          className="text-gray-400 cursor-pointer hover:text-white transition-colors flex items-center gap-2"
          title="Refresh data"
        >
          <RefreshCw className="w-5 h-5" />
          Refresh
        </button>
      </div>

      {/* Main Earning Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          {
            title: "Today",
            amount: earnings.today.amount.toFixed(2),
            details: `${earnings.today.deliveries} items • ${earnings.today.distance.toFixed(1)} km`,
            icon: Calendar,
            color: "from-blue-500 to-blue-600",
            bgGradient: "from-blue-900/20 to-gray-900"
          },
          {
            title: "This Week",
            amount: earnings.week.amount.toFixed(2),
            details: `${earnings.week.deliveries} items • ${earnings.week.distance.toFixed(1)} km`,
            icon: TrendingUp,
            color: "from-green-500 to-green-600",
            bgGradient: "from-green-900/20 to-gray-900"
          },
          {
            title: "This Month",
            amount: earnings.month.amount.toFixed(2),
            details: `${earnings.month.deliveries} items • ${earnings.month.distance.toFixed(1)} km`,
            icon: DollarSign,
            color: "from-purple-500 to-purple-600",
            bgGradient: "from-purple-900/20 to-gray-900"
          },
        ].map((earning, idx) => (
          <div
            key={idx}
            className={`bg-gradient-to-br ${earning.bgGradient} border border-gray-700 rounded-xl p-6 hover:-translate-y-1 hover:border-blue-400 transition-all`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 font-medium">{earning.title}</h3>
              <div className={`bg-gradient-to-r ${earning.color} rounded-full p-2`}>
                <earning.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              Rs. {earning.amount}
            </div>
            <p className="text-gray-400 text-sm">{earning.details}</p>
          </div>
        ))}
      </div>

      {/* Insights Grid */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          Earnings Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              <span className="text-gray-400 text-sm">Daily Average</span>
            </div>
            <div className="text-xl font-bold text-white">
              Rs.{" "}
              {earnings.month.deliveries > 0
                ? (earnings.month.amount / 30).toFixed(2)
                : "0.00"}
            </div>
            <div className="text-gray-500 text-xs mt-1">per day this month</div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-5 h-5 text-green-400" />
              <span className="text-gray-400 text-sm">Item Rate</span>
            </div>
            <div className="text-xl font-bold text-white">
              {earnings.week.deliveries > 0
                ? (earnings.week.deliveries / 7).toFixed(1)
                : "0"}
            </div>
            <div className="text-gray-500 text-xs mt-1">items per day</div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-400 text-sm">Efficiency</span>
            </div>
            <div className="text-xl font-bold text-white">
              Rs.{" "}
              {earnings.week.distance > 0
                ? (earnings.week.amount / earnings.week.distance).toFixed(2)
                : "0.00"}
            </div>
            <div className="text-gray-500 text-xs mt-1">per km this week</div>
          </div>

          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-5 h-5 text-purple-400" />
              <span className="text-gray-400 text-sm">Avg Per Item</span>
            </div>
            <div className="text-xl font-bold text-white">
              Rs.{" "}
              {earnings.week.deliveries > 0
                ? (earnings.week.amount / earnings.week.deliveries).toFixed(2)
                : "0.00"}
            </div>
            <div className="text-gray-500 text-xs mt-1">this week</div>
          </div>
        </div>
      </div>

      {/* Recent Deliveries */}
      {recentDeliveries.length > 0 && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-400" />
            Recent Completed Deliveries
          </h3>
          <div className="space-y-3">
            {recentDeliveries.slice(0, 5).map((delivery, idx) => (
              <div key={idx} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-blue-500 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-500/20 rounded-full p-2">
                      <Package className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">{delivery.deliveryNumber}</div>
                      <div className="text-gray-400 text-sm flex items-center gap-3 mt-1">
                        <span>{delivery.itemCount} item{delivery.itemCount !== 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span>{delivery.distance.toFixed(1)} km</span>
                        <span>•</span>
                        <span className={`${delivery.priority === 'urgent' ? 'text-red-400' : 'text-gray-400'}`}>
                          {delivery.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold">Rs. {delivery.earning.toFixed(2)}</div>
                    <div className="text-gray-500 text-xs mt-1">{formatRelativeTime(delivery.completedAt)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing Rates */}
      {driverPricings.length > 0 && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-400" />
            Your Earning Rates by Parcel Type
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {driverPricings.map((pricing) => (
              <div key={pricing._id} className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-blue-500 transition-all">
                <div className="text-blue-400 font-semibold mb-3">{pricing.parcelType}</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Base Earning:</span>
                    <span className="text-white font-semibold">Rs. {pricing.driverBaseEarning.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Per KM:</span>
                    <span className="text-white font-semibold">Rs. {pricing.driverEarningPerKm.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Per KG:</span>
                    <span className="text-white font-semibold">Rs. {pricing.driverEarningPerKg.toFixed(2)}</span>
                  </div>
                  {pricing.urgentDeliveryBonus > 0 && (
                    <div className="flex justify-between text-gray-400">
                      <span>Urgent Bonus:</span>
                      <span className="text-green-400 font-semibold">+Rs. {pricing.urgentDeliveryBonus.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-400 pt-2 border-t border-gray-700">
                    <span>Commission:</span>
                    <span className="text-yellow-400 font-semibold">{pricing.commissionPercentage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Information */}
      <div className="bg-blue-500/10 border border-blue-500/50 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="bg-blue-500/20 rounded-full p-2 flex-shrink-0">
            <DollarSign className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h4 className="text-blue-300 font-semibold mb-1">Payment Information</h4>
            <p className="text-gray-300 text-sm">
              Earnings are calculated in real-time based on completed deliveries using the pricing structure for each parcel type. 
              Your rates include base pay per item, distance-based earnings (per km), weight-based earnings (per kg), and urgent delivery bonuses when applicable. 
              Payments are processed weekly and deposited to your registered bank account. All amounts shown are updated automatically when you complete deliveries.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earnings;