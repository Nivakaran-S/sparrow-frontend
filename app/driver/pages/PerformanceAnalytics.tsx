import { useState, useEffect } from "react";
import { TrendingUp, Clock, Star, Target, Award, Package, RefreshCw, MapPin, DollarSign } from "lucide-react";

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
}

interface Delivery {
  _id: string;
  deliveryNumber: string;
  deliveryItemType: "parcel" | "consolidation";
  parcels?: Parcel[];
  consolidation?: Consolidation;
  assignedDriver: any;
  fromLocation: any;
  toLocation: any;
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

interface PerformanceMetrics {
  deliveryEfficiency: {
    avgTimePerDelivery: number;
    comparisonToAverage: number;
  };
  distanceMetrics: {
    totalDistance: number;
    avgDistancePerDelivery: number;
  };
  completionRate: {
    percentage: number;
    total: number;
    completed: number;
  };
  onTimeDelivery: {
    percentage: number;
    onTime: number;
    total: number;
  };
  earningsMetrics: {
    totalEarnings: number;
    avgEarningsPerDelivery: number;
  };
}

const PerformanceAnalytics = ({ userId, setActiveTab }: { userId?: string; setActiveTab?: (tab: string) => void }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    deliveryEfficiency: { avgTimePerDelivery: 0, comparisonToAverage: 0 },
    distanceMetrics: { totalDistance: 0, avgDistancePerDelivery: 0 },
    completionRate: { percentage: 0, total: 0, completed: 0 },
    onTimeDelivery: { percentage: 0, onTime: 0, total: 0 },
    earningsMetrics: { totalEarnings: 0, avgEarningsPerDelivery: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [driverPricings, setDriverPricings] = useState<DriverPricing[]>([]);
  const [timeFilter, setTimeFilter] = useState("30"); // Default to 30 days

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
    await Promise.all([fetchDriverPricings(), fetchPerformanceData()]);
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

  const getDriverPricingForParcel = (parcelType: string): DriverPricing | null => {
    return driverPricings.find(dp => dp.parcelType === parcelType) || null;
  };

  const fetchPerformanceData = async () => {
    if (!driverId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/api/parcels/api/deliveries/driver/${driverId}`,
        { credentials: "include" }
      );

      if (!response.ok) throw new Error("Failed to fetch performance data");

      const result = await response.json();

      if (result.success) {
        const deliveries = result.data;
        const calculatedMetrics = calculatePerformanceMetrics(deliveries);
        setMetrics(calculatedMetrics);
      }
    } catch (err: any) {
      console.error("Error fetching performance data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculatePerformanceMetrics = (deliveries: Delivery[]): PerformanceMetrics => {
    const now = new Date();
    const daysAgo = parseInt(timeFilter);
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    // Filter deliveries within date range
    const filteredDeliveries = deliveries.filter((d) => {
      const deliveryDate = new Date(d.createdTimestamp);
      return deliveryDate >= startDate;
    });

    const completedDeliveries = filteredDeliveries.filter((d) => d.status === "delivered");
    const totalDeliveries = filteredDeliveries.length;

    // Calculate average time per delivery
    let totalTime = 0;
    let deliveriesWithTime = 0;
    completedDeliveries.forEach((delivery) => {
      if (delivery.actualPickupTime && delivery.actualDeliveryTime) {
        const start = new Date(delivery.actualPickupTime).getTime();
        const end = new Date(delivery.actualDeliveryTime).getTime();
        totalTime += (end - start) / (1000 * 60); // Convert to minutes
        deliveriesWithTime++;
      }
    });
    const avgTimePerDelivery = deliveriesWithTime > 0 ? totalTime / deliveriesWithTime : 0;
    const standardAvg = 30; // Assume 30 minutes is average
    const comparisonToAverage = avgTimePerDelivery > 0 
      ? ((standardAvg - avgTimePerDelivery) / standardAvg) * 100 
      : 0;

    // Calculate total distance
    let totalDistance = 0;
    completedDeliveries.forEach((delivery) => {
      if (delivery.statusHistory && delivery.statusHistory.length > 1) {
        for (let i = 1; i < delivery.statusHistory.length; i++) {
          const loc1 = delivery.statusHistory[i - 1].location;
          const loc2 = delivery.statusHistory[i].location;
          if (loc1?.latitude && loc1?.longitude && loc2?.latitude && loc2?.longitude) {
            totalDistance += calculateDistance(
              loc1.latitude,
              loc1.longitude,
              loc2.latitude,
              loc2.longitude
            );
          }
        }
      }
    });

    // If no location history, estimate 5km per delivery
    if (totalDistance === 0 && completedDeliveries.length > 0) {
      totalDistance = completedDeliveries.length * 5;
    }

    const avgDistancePerDelivery = completedDeliveries.length > 0 
      ? totalDistance / completedDeliveries.length 
      : 0;

    // Calculate earnings
    let totalEarnings = 0;
    completedDeliveries.forEach((delivery) => {
      const items = delivery.deliveryItemType === "consolidation"
        ? delivery.consolidation?.parcels || []
        : delivery.parcels || [];

      const deliveryDistance = totalDistance / completedDeliveries.length;
      const distancePerItem = items.length > 0 ? deliveryDistance / items.length : deliveryDistance;

      items.forEach((item: Parcel) => {
        const pricingType = item.pricingId?.parcelType || "Standard";
        const driverPricing = getDriverPricingForParcel(pricingType);

        if (driverPricing) {
          const weight = item.weight?.value || 0;
          
          let itemEarnings = driverPricing.driverBaseEarning;
          itemEarnings += distancePerItem * driverPricing.driverEarningPerKm;
          itemEarnings += weight * driverPricing.driverEarningPerKg;
          
          if (delivery.priority === "urgent" && driverPricing.urgentDeliveryBonus > 0) {
            itemEarnings += driverPricing.urgentDeliveryBonus;
          }

          totalEarnings += itemEarnings;
        }
      });
    });

    const avgEarningsPerDelivery = completedDeliveries.length > 0
      ? totalEarnings / completedDeliveries.length
      : 0;

    // Calculate completion rate
    const completionRate = {
      percentage: totalDeliveries > 0 ? (completedDeliveries.length / totalDeliveries) * 100 : 0,
      total: totalDeliveries,
      completed: completedDeliveries.length,
    };

    // Calculate on-time delivery
    let onTimeCount = 0;
    completedDeliveries.forEach((delivery) => {
      if (delivery.estimatedDeliveryTime && delivery.actualDeliveryTime) {
        const estimated = new Date(delivery.estimatedDeliveryTime).getTime();
        const actual = new Date(delivery.actualDeliveryTime).getTime();
        if (actual <= estimated) {
          onTimeCount++;
        }
      } else {
        // If no ETA, assume on-time for completed deliveries
        onTimeCount++;
      }
    });

    const onTimeDelivery = {
      percentage: completedDeliveries.length > 0 
        ? (onTimeCount / completedDeliveries.length) * 100 
        : 0,
      onTime: onTimeCount,
      total: completedDeliveries.length,
    };

    return {
      deliveryEfficiency: {
        avgTimePerDelivery: Math.round(avgTimePerDelivery),
        comparisonToAverage: Math.round(comparisonToAverage * 10) / 10,
      },
      distanceMetrics: {
        totalDistance: Math.round(totalDistance * 10) / 10,
        avgDistancePerDelivery: Math.round(avgDistancePerDelivery * 10) / 10,
      },
      completionRate,
      onTimeDelivery,
      earningsMetrics: {
        totalEarnings: Math.round(totalEarnings * 100) / 100,
        avgEarningsPerDelivery: Math.round(avgEarningsPerDelivery * 100) / 100,
      },
    };
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
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (deg: number): number => deg * (Math.PI / 180);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading performance data...</p>
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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Performance Analytics
        </h2>
        <div className="flex items-center gap-4">
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
            onClick={fetchAllData}
            className="text-gray-400 cursor-pointer hover:text-white transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Performance Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 hover:-translate-y-1 hover:border-blue-400 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Delivery Efficiency</h3>
            <Clock className="w-6 h-6 text-blue-400" />
          </div>
          <div className="mb-4">
            <div className="text-4xl font-bold text-white mb-2">
              {metrics.deliveryEfficiency.avgTimePerDelivery} min
            </div>
            <p className="text-gray-400">Average per delivery</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            {metrics.deliveryEfficiency.comparisonToAverage > 0 ? (
              <>
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span className="text-green-400">
                  {metrics.deliveryEfficiency.comparisonToAverage}% faster than average
                </span>
              </>
            ) : metrics.deliveryEfficiency.comparisonToAverage < 0 ? (
              <span className="text-yellow-400">
                {Math.abs(metrics.deliveryEfficiency.comparisonToAverage)}% slower than average
              </span>
            ) : (
              <span className="text-gray-400">Standard performance</span>
            )}
          </div>
        </div>

    

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 hover:-translate-y-1 hover:border-blue-400 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Distance Traveled</h3>
            <MapPin className="w-6 h-6 text-green-400" />
          </div>
          <div className="mb-4">
            <div className="text-4xl font-bold text-white mb-2">
              {metrics.distanceMetrics.totalDistance} km
            </div>
            <p className="text-gray-400">Total distance</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">
              Avg: {metrics.distanceMetrics.avgDistancePerDelivery} km per delivery
            </span>
          </div>
        </div>
      </div>

      {/* Earnings Card */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-yellow-400" />
            Earnings Overview
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-gray-400 text-sm mb-2">Total Earnings</div>
            <div className="text-3xl font-bold text-white">
              Rs. {metrics.earningsMetrics.totalEarnings.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-sm mb-2">Average per Delivery</div>
            <div className="text-3xl font-bold text-white">
              Rs. {metrics.earningsMetrics.avgEarningsPerDelivery.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Goals */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-400" />
          Performance Goals
        </h3>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Completion Rate</span>
              <span className="text-white font-semibold">
                {metrics.completionRate.completed}/{metrics.completionRate.total}
              </span>
            </div>
            <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500"
                style={{ width: `${metrics.completionRate.percentage}%` }}
              ></div>
            </div>
            <div className="text-right text-sm text-gray-500 mt-1">
              {metrics.completionRate.percentage.toFixed(1)}%
            </div>
          </div>

          <div>

           
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">On-Time Delivery</span>
              <span className="text-white font-semibold">
                {metrics.onTimeDelivery.onTime}/{metrics.onTimeDelivery.total}
              </span>
            </div>
            <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-full transition-all duration-500"
                style={{ width: `${metrics.onTimeDelivery.percentage}%` }}
              ></div>
            </div>
            <div className="text-right text-sm text-gray-500 mt-1">
              {metrics.onTimeDelivery.percentage.toFixed(1)}% (Target: 95%)
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            Achievements
          </h3>
          <div className="space-y-3">
            {metrics.completionRate.percentage >= 90 && (
              <div className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <Award className="w-5 h-5 text-yellow-400" />
                <div>
                  <div className="text-white font-medium">High Completion Rate</div>
                  <div className="text-gray-400 text-sm">
                    Achieved {metrics.completionRate.percentage.toFixed(0)}% completion
                  </div>
                </div>
              </div>
            )}
          
            {metrics.deliveryEfficiency.comparisonToAverage > 10 && (
              <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-white font-medium">Speed Champion</div>
                  <div className="text-gray-400 text-sm">
                    {metrics.deliveryEfficiency.comparisonToAverage}% faster than average
                  </div>
                </div>
              </div>
            )}
            {metrics.onTimeDelivery.percentage >= 95 && (
              <div className="flex items-center gap-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <Clock className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="text-white font-medium">Punctuality Master</div>
                  <div className="text-gray-400 text-sm">
                    {metrics.onTimeDelivery.percentage.toFixed(0)}% on-time delivery
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-400" />
            Key Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
              <span className="text-gray-400">Total Deliveries</span>
              <span className="text-white font-semibold">{metrics.completionRate.total}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
              <span className="text-gray-400">Completed</span>
              <span className="text-green-400 font-semibold">{metrics.completionRate.completed}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
              <span className="text-gray-400">Avg Time/Delivery</span>
              <span className="text-white font-semibold">
                {metrics.deliveryEfficiency.avgTimePerDelivery} min
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
              <span className="text-gray-400">Total Distance</span>
              <span className="text-white font-semibold">
                {metrics.distanceMetrics.totalDistance} km
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
              <span className="text-gray-400">Total Earnings</span>
              <span className="text-yellow-400 font-semibold">
                Rs. {metrics.earningsMetrics.totalEarnings.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-6 bg-purple-500/10 border border-purple-500/50 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="bg-purple-500/20 rounded-full p-2 flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h4 className="text-purple-300 font-semibold mb-1">Performance Tips</h4>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Maintain consistent communication with customers</li>
              <li>• Plan your routes efficiently to save time and fuel</li>
              <li>• Report any issues promptly to avoid delays</li>
              <li>• Update delivery status regularly for better tracking</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalytics;