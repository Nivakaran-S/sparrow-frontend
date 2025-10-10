import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, Package, MapPin, Calendar, RefreshCw, Target } from "lucide-react";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://api-gateway-nine-orpin.vercel.app";

interface EarningsData {
  today: { amount: number; deliveries: number; distance: number };
  week: { amount: number; deliveries: number; distance: number };
  month: { amount: number; deliveries: number; distance: number };
}

const Earnings = ({ userId, setActiveTab }: { userId?: string; setActiveTab?: (tab: string) => void }) => {
  const [earnings, setEarnings] = useState<EarningsData>({
    today: { amount: 0, deliveries: 0, distance: 0 },
    week: { amount: 0, deliveries: 0, distance: 0 },
    month: { amount: 0, deliveries: 0, distance: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [driverId, setDriverId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (driverId) {
      fetchEarningsData();
      const interval = setInterval(fetchEarningsData, 300000); // Refresh every 5 minutes
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

  const fetchEarningsData = async () => {
    if (!driverId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/api/consolidations/api/deliveries/driver/${driverId}`,
        { credentials: "include" }
      );

      if (!response.ok) throw new Error("Failed to fetch earnings data");

      const data = await response.json();

      if (data.success) {
        const deliveries = data.data;
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

  const calculateEarnings = (deliveries: any[]): EarningsData => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const completedDeliveries = deliveries.filter((d) => d.status === "completed");

    const todayDeliveries = completedDeliveries.filter(
      (d) => new Date(d.endTime || d.createdTimestamp) >= todayStart
    );
    const weekDeliveries = completedDeliveries.filter(
      (d) => new Date(d.endTime || d.createdTimestamp) >= weekStart
    );
    const monthDeliveries = completedDeliveries.filter(
      (d) => new Date(d.endTime || d.createdTimestamp) >= monthStart
    );

    const calculatePeriodStats = (periodDeliveries: any[]) => {
      let totalDistance = 0;

      periodDeliveries.forEach((delivery) => {
        if (delivery.locationHistory && delivery.locationHistory.length > 1) {
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
        }
      });

      // Earnings formula: Rs. 500 base per delivery + Rs. 45 per km
      const amount = periodDeliveries.length * 500 + totalDistance * 45;

      return {
        amount: Math.round(amount * 100) / 100,
        deliveries: periodDeliveries.length,
        distance: Math.round(totalDistance * 10) / 10,
      };
    };

    return {
      today: calculatePeriodStats(todayDeliveries),
      week: calculatePeriodStats(weekDeliveries),
      month: calculatePeriodStats(monthDeliveries),
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
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;
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
            onClick={fetchEarningsData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const monthlyGoal = 50000;
  const monthlyProgress = (earnings.month.amount / monthlyGoal) * 100;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Earnings & Payments
        </h2>
        <button
          onClick={fetchEarningsData}
          className="text-gray-400 cursor-pointer hover:text-white transition-colors flex items-center gap-2"
          title="Refresh data"
        >
          <RefreshCw className="w-5 h-5" />
          Refresh
        </button>
      </div>

      {/* Main Earnings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          {
            title: "Today",
            amount: earnings.today.amount.toFixed(2),
            details: `${earnings.today.deliveries} deliveries • ${earnings.today.distance.toFixed(1)} km`,
            icon: Calendar,
            color: "from-blue-500 to-blue-600",
          },
          {
            title: "This Week",
            amount: earnings.week.amount.toFixed(2),
            details: `${earnings.week.deliveries} deliveries • ${earnings.week.distance.toFixed(1)} km`,
            icon: TrendingUp,
            color: "from-green-500 to-green-600",
          },
          {
            title: "This Month",
            amount: earnings.month.amount.toFixed(2),
            details: `${earnings.month.deliveries} deliveries • ${earnings.month.distance.toFixed(1)} km`,
            icon: DollarSign,
            color: "from-purple-500 to-purple-600",
          },
        ].map((earning, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 hover:-translate-y-1 hover:border-blue-400 transition-all"
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

      {/* Payment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-400" />
            Payment Breakdown
          </h3>
          <div className="space-y-4">
            {[
              { label: "Base Rate per Delivery", value: "Rs. 500.00" },
              { label: "Distance Bonus per km", value: "Rs. 45.00" },
              {
                label: "Average per Delivery",
                value:
                  earnings.month.deliveries > 0
                    ? `Rs. ${(earnings.month.amount / earnings.month.deliveries).toFixed(2)}`
                    : "Rs. 0.00",
              },
              { label: "Total This Month", value: `Rs. ${earnings.month.amount.toFixed(2)}` },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center text-gray-400 hover:text-white transition-colors p-3 bg-gray-900/50 rounded-lg"
              >
                <span>{item.label}</span>
                <span className="font-semibold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Goal Progress */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-yellow-400" />
            Monthly Goal Progress
          </h3>
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400">Target: Rs. {monthlyGoal.toLocaleString()}</span>
              <span className="text-white font-semibold">{monthlyProgress.toFixed(1)}%</span>
            </div>
            <div className="bg-gray-700 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-full transition-all duration-500"
                style={{ width: `${Math.min(monthlyProgress, 100)}%` }}
              ></div>
            </div>
            <div className="text-center mt-4">
              <div className="text-2xl font-bold text-white mb-1">
                Rs. {(monthlyGoal - earnings.month.amount).toFixed(2)}
              </div>
              <div className="text-gray-400 text-sm">Remaining to reach goal</div>
            </div>
          </div>
        </div>
      </div>

      {/* Earnings Insights */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
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
              <span className="text-gray-400 text-sm">Delivery Rate</span>
            </div>
            <div className="text-xl font-bold text-white">
              {earnings.week.deliveries > 0
                ? (earnings.week.deliveries / 7).toFixed(1)
                : "0"}
            </div>
            <div className="text-gray-500 text-xs mt-1">deliveries per day</div>
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
              <TrendingUp className="w-5 h-5 text-purple-400" />
              <span className="text-gray-400 text-sm">Weekly Growth</span>
            </div>
            <div className="text-xl font-bold text-white">
              {earnings.week.deliveries > 0 && earnings.today.deliveries > 0
                ? `+${((earnings.today.deliveries / (earnings.week.deliveries / 7)) * 100 - 100).toFixed(0)}%`
                : "N/A"}
            </div>
            <div className="text-gray-500 text-xs mt-1">vs weekly average</div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-6 bg-blue-500/10 border border-blue-500/50 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="bg-blue-500/20 rounded-full p-2 flex-shrink-0">
            <DollarSign className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h4 className="text-blue-300 font-semibold mb-1">Payment Information</h4>
            <p className="text-gray-300 text-sm">
              Earnings are calculated based on completed deliveries. Base rate of Rs. 500 per delivery plus Rs. 45 per kilometer traveled. 
              Payments are processed weekly and deposited to your registered bank account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earnings;