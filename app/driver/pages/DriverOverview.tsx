import { useState, useEffect } from 'react';

const BASE_URL_KEY = "https://api-gateway-nine-orpin.vercel.app";

const DriverOverview = ({ userId, setActiveTab }: { userId?: string; setActiveTab?: (tab: string) => void }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    todayDeliveries: 0,
    distanceTraveled: 0,
    todayEarnings: 0,
    rating: 0,
    weeklyDeliveries: 0,
    monthlyDeliveries: 0,
    successRate: 0,
    avgTimePerStop: 0,
  });
  const [currentDelivery, setCurrentDelivery] = useState<any>(null);
  const [deliveries, setDeliveries] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (driverId) {
      fetchDriverData();
    }
  }, [driverId]);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${BASE_URL_KEY}/check-cookie`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Not authenticated');
      }

      const data = await response.json();

      if (data.role !== 'Driver') {
        throw new Error('Not authorized - Driver role required');
      }

      setDriverId(data.id);
    } catch (err: any) {
      console.error('Auth check failed:', err);
      setError('Authentication failed. Please login.');
      setLoading(false);
    }
  };

  const fetchDriverData = async () => {
    try {
      setLoading(true);
      setError(null);

      const deliveriesResponse = await fetch(
        `${BASE_URL_KEY}/api/consolidations/api/deliveries/driver/${driverId}`,
        { credentials: 'include' }
      );

      if (!deliveriesResponse.ok) {
        throw new Error('Failed to fetch deliveries');
      }

      const deliveriesData = await deliveriesResponse.json();
      const allDeliveries = deliveriesData.success ? deliveriesData.data : [];
      setDeliveries(allDeliveries);

      const activeDelivery = allDeliveries.find(
        (d: any) => d.status === 'in_progress' || d.status === 'assigned'
      );
      setCurrentDelivery(activeDelivery);

      calculateStats(allDeliveries);
    } catch (err: any) {
      console.error('Error fetching driver data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (allDeliveries: any[]) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayDeliveries = allDeliveries.filter(
      (d) => new Date(d.createdTimestamp) >= todayStart
    );
    const weekDeliveries = allDeliveries.filter(
      (d) => new Date(d.createdTimestamp) >= weekStart
    );
    const monthDeliveries = allDeliveries.filter(
      (d) => new Date(d.createdTimestamp) >= monthStart
    );

    let totalDistance = 0;
    todayDeliveries.forEach((delivery) => {
      if (delivery.locationHistory && delivery.locationHistory.length > 1) {
        const locations = delivery.locationHistory;
        for (let i = 1; i < locations.length; i++) {
          const lat1 = locations[i - 1].latitude;
          const lon1 = locations[i - 1].longitude;
          const lat2 = locations[i].latitude;
          const lon2 = locations[i].longitude;

          if (lat1 && lon1 && lat2 && lon2) {
            const distance = calculateDistance(lat1, lon1, lat2, lon2);
            totalDistance += distance;
          }
        }
      }
    });

    const completedDeliveries = allDeliveries.filter(
      (d) => d.status === 'completed'
    );
    const successRate =
      allDeliveries.length > 0
        ? (completedDeliveries.length / allDeliveries.length) * 100
        : 0;

    let totalTime = 0;
    let countWithTime = 0;
    completedDeliveries.forEach((delivery) => {
      if (delivery.startTime && delivery.endTime) {
        const start = new Date(delivery.startTime).getTime();
        const end = new Date(delivery.endTime).getTime();
        totalTime += (end - start) / (1000 * 60);
        countWithTime++;
      }
    });
    const avgTime = countWithTime > 0 ? totalTime / countWithTime : 0;

    const todayEarnings = todayDeliveries.length * 5 + totalDistance * 0.5;

    setStats({
      todayDeliveries: todayDeliveries.length,
      distanceTraveled: Math.round(totalDistance),
      todayEarnings: Math.round(todayEarnings),
      rating: 4.8,
      weeklyDeliveries: weekDeliveries.length,
      monthlyDeliveries: monthDeliveries.length,
      successRate: Math.round(successRate * 10) / 10,
      avgTimePerStop: Math.round(avgTime),
    });
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
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (deg: number): number => {
    return deg * (Math.PI / 180);
  };

  const getDeliveryProgress = () => {
    if (!currentDelivery || !currentDelivery.consolidationId)
      return { completed: 0, total: 0, percentage: 0 };

    const total = 8;
    const completed = currentDelivery.locationHistory?.length || 0;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return { completed, total, percentage };
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading driver data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-red-500/10 border border-red-500 rounded-xl p-6 text-center">
          <p className="text-red-400 mb-4">Error loading data: {error}</p>
          <button
            onClick={fetchDriverData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const progress = getDeliveryProgress();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Driver Dashboard
        </h2>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchDriverData}
            className="text-gray-400 cursor-pointer hover:text-white transition-colors"
            title="Refresh data"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              isOnline
                ? 'bg-green-500/20 text-green-400'
                : 'bg-gray-500/20 text-gray-400'
            }`}
          >
            Status: {isOnline ? 'Online & Ready' : 'Offline'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { icon: '📦', value: stats.todayDeliveries, label: "Today's Deliveries" },
          { icon: '🛣️', value: `${stats.distanceTraveled} km`, label: 'Distance Traveled' },
          { icon: '💰', value: `Rs. ${stats.todayEarnings}`, label: "Today's Earnings" },
          { icon: '⭐', value: `${stats.rating}/5`, label: 'Rating' },
        ].map((metric, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-4 flex items-center gap-4 hover:-translate-y-1 hover:border-blue-400 hover:shadow-lg transition-all"
          >
            <div className="bg-blue-500/20 rounded-full w-12 h-12 flex items-center justify-center text-2xl">
              {metric.icon}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{metric.value}</h3>
              <p className="text-gray-400 text-sm">{metric.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Current Route */}
      {currentDelivery ? (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Current Delivery</h3>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-blue-400">
                Delivery #{currentDelivery._id.slice(-6)}
              </h4>
              <p className="text-gray-400">
                {progress.total} stops • Status: {currentDelivery.status.replace('_', ' ')}
              </p>
              {currentDelivery.startTime && (
                <p className="text-gray-500 text-sm mt-1">
                  Started: {new Date(currentDelivery.startTime).toLocaleTimeString()}
                </p>
              )}
              <div className="mt-4">
                <div className="text-gray-400 mb-2">
                  Progress: {progress.completed} of {progress.total} stops completed
                </div>
                <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full transition-all duration-500"
                    style={{ width: `${progress.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 hover:-translate-y-1 transition-all"
                onClick={() =>
                  (window.location.href = `/driver/deliveries/${currentDelivery._id}`)
                }
              >
                View Details
              </button>
              {currentDelivery.currentLocation && (
                <button
                  className="bg-gray-600 text-gray-200 px-4 py-2 rounded-lg border border-gray-500 hover:bg-gray-500 hover:-translate-y-1 transition-all"
                  onClick={() => {
                    const { latitude, longitude } = currentDelivery.currentLocation;
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
                      '_blank'
                    );
                  }}
                >
                  Navigate
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 mb-8 text-center">
          <p className="text-gray-400 mb-4">No active delivery at the moment</p>
          <button
            onClick={fetchDriverData}
            className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
          >
            Check for New Deliveries
          </button>
        </div>
      )}

      {/* Quick Stats */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Quick Stats</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'This Week', value: `${stats.weeklyDeliveries} deliveries` },
            { label: 'This Month', value: `${stats.monthlyDeliveries} deliveries` },
            { label: 'Success Rate', value: `${stats.successRate}%` },
            { label: 'Average Time', value: `${stats.avgTimePerStop} min/stop` },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center hover:border-blue-400 transition-all"
            >
              <span className="text-gray-400 block mb-1">{stat.label}</span>
              <span className="text-white font-semibold text-lg">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DriverOverview;
