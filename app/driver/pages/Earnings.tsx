import { useState, useEffect } from "react";

interface EarningsData {
  today: { amount: number; deliveries: number; distance: number };
  week: { amount: number; deliveries: number; distance: number };
  month: { amount: number; deliveries: number; distance: number };
}

const BASE_URL_KEY = "https://api-gateway-nine-orpin.vercel.app";

const Earnings = () => {
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
    }
  }, [driverId]);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${BASE_URL_KEY}/check-cookie`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Not authenticated");
      }

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
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL_KEY}/api/consolidations/api/deliveries/driver/${driverId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch earnings data");
      }

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
      (d) => new Date(d.createdTimestamp) >= todayStart
    );
    const weekDeliveries = completedDeliveries.filter(
      (d) => new Date(d.createdTimestamp) >= weekStart
    );
    const monthDeliveries = completedDeliveries.filter(
      (d) => new Date(d.createdTimestamp) >= monthStart
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

      // Earnings formula: $5 base per delivery + $0.45 per km
      const amount = periodDeliveries.length * 5 + totalDistance * 0.45;

      return {
        amount: Math.round(amount * 100) / 100,
        deliveries: periodDeliveries.length,
        distance: Math.round(totalDistance),
      };
    };

    return {
      today: calculatePeriodStats(todayDeliveries),
      week: calculatePeriodStats(weekDeliveries),
      month: calculatePeriodStats(monthDeliveries),
    };
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
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
      <div className="max-w-6xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading earnings data...</p>
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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Earnings & Payments
        </h2>
        <button
          onClick={fetchEarningsData}
          className="text-gray-400 hover:text-white transition-colors"
          title="Refresh data"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          {
            title: "Today",
            amount: `${earnings.today.amount.toFixed(2)}`,
            details: `${earnings.today.deliveries} deliveries • ${earnings.today.distance} km`,
          },
          {
            title: "This Week",
            amount: `${earnings.week.amount.toFixed(2)}`,
            details: `${earnings.week.deliveries} deliveries • ${earnings.week.distance} km`,
          },
          {
            title: "This Month",
            amount: `${earnings.month.amount.toFixed(2)}`,
            details: `${earnings.month.deliveries} deliveries • ${earnings.month.distance} km`,
          },
        ].map((earning, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 text-center hover:-translate-y-1 hover:border-blue-400 transition-all"
          >
            <h3 className="text-lg font-semibold text-white mb-2">{earning.title}</h3>
            <div className="text-2xl font-bold text-blue-400">{earning.amount}</div>
            <p className="text-gray-400 text-sm mt-2">{earning.details}</p>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Payment Breakdown</h3>
        <div className="space-y-4">
          {[
            { label: "Base Rate", value: "Rs. 5.00/delivery" },
            { label: "Distance Bonus", value: "Rs. 0.45/km" },
            {
              label: "Average per Delivery",
              value: `${
                earnings.today.deliveries > 0
                  ? (earnings.today.amount / earnings.today.deliveries).toFixed(2)
                  : "0.00"
              }`,
            },
            { label: "Total This Month", value: `${earnings.month.amount.toFixed(2)}` },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center text-gray-400 hover:text-white transition-colors"
            >
              <span>{item.label}</span>
              <span className="font-semibold">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Earnings Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <p className="text-white font-semibold">Daily Average</p>
              <p className="text-gray-400">
                Rs. 
                {earnings.month.deliveries > 0
                  ? (earnings.month.amount / 30).toFixed(2)
                  : "0.00"}{" "}
                per day
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="text-white font-semibold">Monthly Target</p>
              <p className="text-gray-400">
                {earnings.month.amount > 0
                  ? Math.round((earnings.month.amount / 5000) * 100)
                  : 0}
                % of Rs. 5,000 goal
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🚗</span>
            <div>
              <p className="text-white font-semibold">Efficiency</p>
              <p className="text-gray-400">
                Rs. 
                {earnings.week.distance > 0
                  ? (earnings.week.amount / earnings.week.distance).toFixed(2)
                  : "0.00"}{" "}
                per km
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">📦</span>
            <div>
              <p className="text-white font-semibold">Delivery Rate</p>
              <p className="text-gray-400">
                {earnings.week.deliveries > 0
                  ? Math.round(earnings.week.deliveries / 7)
                  : 0}{" "}
                deliveries/day
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earnings;
