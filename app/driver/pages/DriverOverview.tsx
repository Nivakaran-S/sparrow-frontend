import { useState, useEffect } from 'react';
import { Package, MapPin, DollarSign, Star, TrendingUp, Clock, Truck, Navigation, Phone, AlertCircle, Warehouse } from 'lucide-react';

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

const DriverOverview = ({ userId, setActiveTab }: { userId?: string; setActiveTab?: (tab: string) => void }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [driverPricings, setDriverPricings] = useState<DriverPricing[]>([]);
  const [stats, setStats] = useState({
    todayDeliveries: 0,
    distanceTraveled: 0,
    todayEarnings: 0,
    weeklyDeliveries: 0,
    monthlyDeliveries: 0,
    successRate: 0,
    avgTimePerStop: 0,
  });
  const [currentDelivery, setCurrentDelivery] = useState<Delivery | null>(null);
  const [activeDeliveries, setActiveDeliveries] = useState<Delivery[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (driverId) {
      fetchAllData();
      const interval = setInterval(fetchAllData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [driverId]);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/check-cookie`, {
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

  const fetchAllData = async () => {
    await Promise.all([fetchDriverPricings(), fetchDriverData()]);
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

  const fetchDriverData = async () => {
    if (!driverId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch deliveries for this driver
      const deliveriesResponse = await fetch(
        `${API_BASE_URL}/api/parcels/api/deliveries/driver/${driverId}`,
        { credentials: 'include' }
      );

      if (!deliveriesResponse.ok) {
        throw new Error('Failed to fetch deliveries');
      }

      const deliveriesData = await deliveriesResponse.json();
      const allDeliveries = deliveriesData.success ? deliveriesData.data : [];

      // Filter active deliveries (not delivered, failed, or cancelled)
      const active = allDeliveries.filter(
        (d: Delivery) => !["delivered", "failed", "cancelled"].includes(d.status)
      );
      setActiveDeliveries(active);

      // Set the first active delivery as current
      const current = active.find(
        (d: Delivery) => ["in_progress", "picked_up", "in_transit"].includes(d.status)
      ) || active[0];
      setCurrentDelivery(current || null);

      // Calculate stats
      calculateStats(allDeliveries);
    } catch (err: any) {
      console.error('Error fetching driver data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (allDeliveries: Delivery[]) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Filter deliveries by date
    const todayDeliveries = allDeliveries.filter(
      (d) => new Date(d.createdTimestamp) >= todayStart && d.status === "delivered"
    );
    const weekDeliveries = allDeliveries.filter(
      (d) => new Date(d.createdTimestamp) >= weekStart && d.status === "delivered"
    );
    const monthDeliveries = allDeliveries.filter(
      (d) => new Date(d.createdTimestamp) >= monthStart && d.status === "delivered"
    );

    // Calculate distance traveled today
    let totalDistance = 0;
    todayDeliveries.forEach((delivery) => {
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
    if (totalDistance === 0 && todayDeliveries.length > 0) {
      totalDistance = todayDeliveries.length * 5;
    }

    // Calculate earnings for today
    let todayEarnings = 0;
    todayDeliveries.forEach((delivery) => {
      const items = delivery.deliveryItemType === "consolidation"
        ? delivery.consolidation?.parcels || []
        : delivery.parcels || [];

      const deliveryDistance = totalDistance / todayDeliveries.length;

      items.forEach((item: Parcel) => {
        const pricingType = item.pricingId?.parcelType || "Standard";
        const driverPricing = getDriverPricingForParcel(pricingType);

        if (driverPricing) {
          const weight = item.weight?.value || 0;
          
          let itemEarnings = driverPricing.driverBaseEarning;
          itemEarnings += (deliveryDistance / items.length) * driverPricing.driverEarningPerKm;
          itemEarnings += weight * driverPricing.driverEarningPerKg;
          
          if (delivery.priority === "urgent" && driverPricing.urgentDeliveryBonus > 0) {
            itemEarnings += driverPricing.urgentDeliveryBonus;
          }

          todayEarnings += itemEarnings;
        }
      });
    });

    // Calculate success rate and average time
    const completedDeliveries = allDeliveries.filter((d) => d.status === "delivered");
    const successRate =
      allDeliveries.length > 0
        ? (completedDeliveries.length / allDeliveries.length) * 100
        : 0;

    let totalTime = 0;
    let countWithTime = 0;
    completedDeliveries.forEach((delivery) => {
      if (delivery.actualPickupTime && delivery.actualDeliveryTime) {
        const start = new Date(delivery.actualPickupTime).getTime();
        const end = new Date(delivery.actualDeliveryTime).getTime();
        totalTime += (end - start) / (1000 * 60);
        countWithTime++;
      }
    });
    const avgTime = countWithTime > 0 ? totalTime / countWithTime : 0;

    setStats({
      todayDeliveries: todayDeliveries.length,
      distanceTraveled: Math.round(totalDistance * 10) / 10,
      todayEarnings: Math.round(todayEarnings * 100) / 100,
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

  const getDeliveryProgress = (delivery: Delivery) => {
    const items = delivery.deliveryItemType === "consolidation"
      ? delivery.consolidation?.parcels || []
      : delivery.parcels || [];
    
    const total = items.length;
    
    // Estimate completion based on status
    let completed = 0;
    switch (delivery.status) {
      case "assigned":
      case "accepted":
        completed = 0;
        break;
      case "in_progress":
        completed = Math.floor(total * 0.2);
        break;
      case "picked_up":
        completed = Math.floor(total * 0.4);
        break;
      case "in_transit":
        completed = Math.floor(total * 0.7);
        break;
      case "near_destination":
        completed = Math.floor(total * 0.9);
        break;
      default:
        completed = 0;
    }
    
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    return { completed, total, percentage };
  };

  const formatStatus = (status: string): string =>
    status
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const getDestinationAddress = (delivery: Delivery): string | null => {
    if (delivery.toLocation.type === "address" && delivery.toLocation.address) {
      return delivery.toLocation.address;
    }
    
    if (delivery.toLocation.type === "warehouse" && delivery.toLocation.warehouseId) {
      const warehouse = delivery.toLocation.warehouseId;
      if (typeof warehouse === 'object') {
        if (warehouse.name) return warehouse.name;
        if (warehouse.address) {
          if (typeof warehouse.address === 'string') {
            return warehouse.address;
          }
        }
      }
    }

    const items = delivery.deliveryItemType === "consolidation" 
      ? delivery.consolidation?.parcels || []
      : delivery.parcels || [];

    if (items[0]?.receiver?.address) {
      return items[0].receiver.address;
    }

    return delivery.toLocation.locationName || null;
  };

  const openNavigation = (delivery: Delivery) => {
    const address = getDestinationAddress(delivery);
    if (address) {
      const encoded = encodeURIComponent(address);
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encoded}`, "_blank");
    } else {
      alert("No destination address available for navigation");
    }
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
            onClick={fetchAllData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all cursor-pointer"
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
          Driver Dashboard
        </h2>
        <div className="flex items-center gap-4">
          <button
            onClick={fetchAllData}
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
          <div className="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-400">
            Status: Active
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-4 flex items-center gap-4 hover:-translate-y-1 hover:border-blue-400 hover:shadow-lg transition-all">
          <div className="bg-blue-500/20 rounded-full w-12 h-12 flex items-center justify-center">
            <Package className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{stats.todayDeliveries}</h3>
            <p className="text-gray-400 text-sm">Today's Deliveries</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-4 flex items-center gap-4 hover:-translate-y-1 hover:border-blue-400 hover:shadow-lg transition-all">
          <div className="bg-green-500/20 rounded-full w-12 h-12 flex items-center justify-center">
            <MapPin className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{stats.distanceTraveled} km</h3>
            <p className="text-gray-400 text-sm">Distance Traveled</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-4 flex items-center gap-4 hover:-translate-y-1 hover:border-blue-400 hover:shadow-lg transition-all">
          <div className="bg-yellow-500/20 rounded-full w-12 h-12 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Rs. {stats.todayEarnings}</h3>
            <p className="text-gray-400 text-sm">Today's Earnings</p>
          </div>
        </div>

      </div>

      {/* Current Delivery */}
      {currentDelivery ? (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Current Delivery</h3>
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-blue-400 mb-2">
                  {currentDelivery.deliveryNumber}
                </h4>
                <p className="text-gray-400 mb-1">
                  Type: {currentDelivery.deliveryItemType === "consolidation" ? "Consolidation" : "Parcel Delivery"}
                </p>
                <p className="text-gray-400 mb-1">
                  Status: <span className="text-white">{formatStatus(currentDelivery.status)}</span>
                </p>
                <p className="text-gray-400">
                  Priority: <span className="text-yellow-400">{currentDelivery.priority.toUpperCase()}</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 hover:-translate-y-1 transition-all cursor-pointer"
                  onClick={() => setActiveTab && setActiveTab('Current Deliveries')}
                >
                  View Details
                </button>
                <button
                  className="bg-gray-600 text-gray-200 px-4 py-2 rounded-lg border border-gray-500 hover:bg-gray-500 hover:-translate-y-1 transition-all cursor-pointer"
                  onClick={() => openNavigation(currentDelivery)}
                >
                  Navigate
                </button>
              </div>
            </div>

            {(() => {
              const progress = getDeliveryProgress(currentDelivery);
              return (
                <div className="mt-4">
                  <div className="flex justify-between text-gray-400 mb-2 text-sm">
                    <span>Progress</span>
                    <span>{progress.completed} of {progress.total} items</span>
                  </div>
                  <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500"
                      style={{ width: `${progress.percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      ) : activeDeliveries.length > 0 ? (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Pending Deliveries</h3>
          <p className="text-gray-400 mb-4">
            You have {activeDeliveries.length} delivery assignment(s) waiting to be started.
          </p>
          <button
            onClick={() => setActiveTab && setActiveTab('Current Deliveries')}
            className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
          >
            View Deliveries
          </button>
        </div>
      ) : (
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 mb-8 text-center">
          <Truck className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 mb-4">No active delivery at the moment</p>
          <button
            onClick={fetchAllData}
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
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center hover:border-blue-400 transition-all">
            <span className="text-gray-400 block mb-1">This Week</span>
            <span className="text-white font-semibold text-lg">{stats.weeklyDeliveries} deliveries</span>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center hover:border-blue-400 transition-all">
            <span className="text-gray-400 block mb-1">This Month</span>
            <span className="text-white font-semibold text-lg">{stats.monthlyDeliveries} deliveries</span>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center hover:border-blue-400 transition-all">
            <span className="text-gray-400 block mb-1">Success Rate</span>
            <span className="text-white font-semibold text-lg">{stats.successRate}%</span>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center hover:border-blue-400 transition-all">
            <span className="text-gray-400 block mb-1">Average Time</span>
            <span className="text-white font-semibold text-lg">{stats.avgTimePerStop} min/delivery</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverOverview;