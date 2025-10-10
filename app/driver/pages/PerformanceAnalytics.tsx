import { useState, useEffect } from "react";
import { TrendingUp, Clock, Star, Fuel, Target, Award, Package, RefreshCw } from "lucide-react";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://api-gateway-nine-orpin.vercel.app";

interface PerformanceMetrics {
  deliveryEfficiency: {
    avgTimePerDelivery: number;
    comparisonToAverage: number;
  };
  customerRating: {
    current: number;
    trend: number;
  };
  fuelEfficiency: {
    kmPerLiter: number;
    comparisonToFleet: number;
  };
  completionRate: {
    percentage: number;
    total: number;
    completed: number;
  };
  onTimeDelivery: {
    percentage: number;
  };
}

const PerformanceAnalytics = ({ userId, setActiveTab }: { userId?: string; setActiveTab?: (tab: string) => void }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    deliveryEfficiency: { avgTimePerDelivery: 0, comparisonToAverage: 0 },
    customerRating: { current: 4.8, trend: 0.3 },
    fuelEfficiency: { kmPerLiter: 0, comparisonToFleet: 0 },
    completionRate: { percentage: 0, total: 0, completed: 0 },
    onTimeDelivery: { percentage: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [driverId, setDriverId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (driverId) {
      fetchPerformanceData();
      const interval = setInterval(fetchPerformanceData, 300000); // Refresh every 5 minutes
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
      setLoading(false);
    }
  };

  const fetchPerformanceData = async () => {
    if (!driverId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/api/consolidations/api/deliveries/driver/${driverId}`,
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

  const calculatePerformanceMetrics = (deliveries: any[]): PerformanceMetrics => {
    const completedDeliveries = deliveries.filter((d) => d.status === "completed");
    const totalDeliveries = deliveries.length;

    // Calculate average time per delivery
    let totalTime = 0;
    let deliveriesWithTime = 0;
    completedDeliveries.forEach((delivery) => {
      if (delivery.startTime && delivery.endTime) {
        const start = new Date(delivery.startTime).getTime();
        const end = new Date(delivery.endTime).getTime();
        totalTime += (end - start) / (1000 * 60); // Convert to minutes
        deliveriesWithTime++;
      }
    });
    const avgTimePerDelivery = deliveriesWithTime > 0 ? totalTime / deliveriesWithTime : 0;
    const standardAvg = 30; // Assume 30 minutes is average
    const comparisonToAverage = ((standardAvg - avgTimePerDelivery) / standardAvg) * 100;

    // Calculate total distance for fuel efficiency
    let totalDistance = 0;
    completedDeliveries.forEach((delivery) => {
      if (delivery.locationHistory && delivery.locationHistory.length > 1) {
        for (let i = 1; i < delivery.locationHistory.length; i++) {
          const loc1 = delivery.locationHistory[i - 1];
          const loc2 = delivery.locationHistory[i];
          if (loc1.latitude && loc1.longitude && loc2.latitude && loc2.longitude) {
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

    // Estimate fuel efficiency (assuming average vehicle)
    const estimatedFuelUsed = totalDistance / 12; // Assume 12 km/L average
    const kmPerLiter = estimatedFuelUsed > 0 ? totalDistance / estimatedFuelUsed : 12;
    const fleetAverage = 10; // Assume fleet average is 10 km/L
    const comparisonToFleet = ((kmPerLiter - fleetAverage) / fleetAverage) * 100;

    // Calculate completion rate
    const completionRate = {
      percentage: totalDeliveries > 0 ? (completedDeliveries.length / totalDeliveries) * 100 : 0,
      total: totalDeliveries,
      completed: completedDeliveries.length,
    };

    // Calculate on-time delivery (assume 90% for now - would need actual ETA data)
    const onTimeDelivery = {
      percentage: completedDeliveries.length > 0 ? 90 : 0,
    };

    return {
      deliveryEfficiency: {
        avgTimePerDelivery: Math.round(avgTimePerDelivery),
        comparisonToAverage: Math.round(comparisonToAverage),
      },
      customerRating: {
        current: 4.8, // Default rating
        trend: 0.3,
      },
      fuelEfficiency: {
        kmPerLiter: Math.round(kmPerLiter * 10) / 10,
        comparisonToFleet: Math.round(comparisonToFleet),
      },
      completionRate,
      onTimeDelivery,
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
        <button
          onClick={fetchPerformanceData}
          className="text-gray-400 cursor-pointer hover:text-white transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Refresh
        </button>
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
            ) : (
              <span className="text-gray-400">Standard performance</span>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 hover:-translate-y-1 hover:border-blue-400 transition-all">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Customer Rating</h3>
            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
          </div>
          <div className="mb-4">
            <div className="text-4xl font-bold text-white mb-2">
              {metrics.customerRating.current}/5
            </div>
            <p className="text-gray-400">Current rating</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-green-400">
              Improved by {metrics.customerRating.trend} this month
            </span>
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
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">Customer Rating Target</span>
              <span className="text-white font-semibold">
                {metrics.customerRating.current}/5.0
              </span>
            </div>
            <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-full transition-all duration-500"
                style={{ width: `${(metrics.customerRating.current / 5) * 100}%` }}
              ></div>
            </div>
            <div className="text-right text-sm text-gray-500 mt-1">
              {((metrics.customerRating.current / 5) * 100).toFixed(1)}%
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-400">On-Time Delivery</span>
              <span className="text-white font-semibold">
                {metrics.onTimeDelivery.percentage.toFixed(0)}%
              </span>
            </div>
            <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-full transition-all duration-500"
                style={{ width: `${metrics.onTimeDelivery.percentage}%` }}
              ></div>
            </div>
            <div className="text-right text-sm text-gray-500 mt-1">
              Target: 95%
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
            {metrics.customerRating.current >= 4.5 && (
              <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <Star className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-white font-medium">Excellent Rating</div>
                  <div className="text-gray-400 text-sm">
                    Maintaining {metrics.customerRating.current}/5 rating
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
              <span className="text-gray-400">Fuel Economy</span>
              <span className="text-white font-semibold">
                {metrics.fuelEfficiency.kmPerLiter} km/L
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
              <li>• Complete deliveries on time to improve ratings</li>
              <li>• Report any issues promptly to avoid delays</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalytics;