import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-gateway-nine-orpin.vercel.app";

type Stats = {
  totalUsers: number;
  totalParcels: number;
  activeWarehouses: number;
  totalConsolidations: number;
  activeDeliveries: number;
  pendingRequests: number;
  usersByRole: {
    admin: number;
    staff: number;
    customer: number;
    driver: number;
  };
  parcelsByStatus: {
    created: number;
    at_warehouse: number;
    consolidated: number;
    in_transit: number;
    delivered: number;
  };
  consolidationsByStatus: {
    pending: number;
    consolidated: number;
    in_transit: number;
    delivered: number;
  };
};

const AdminOverview = ({setActiveTab }: { setActiveTab?: (tab: string) => void }) => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalParcels: 0,
    activeWarehouses: 0,
    totalConsolidations: 0,
    activeDeliveries: 0,
    pendingRequests: 0,
    usersByRole: {
      admin: 0,
      staff: 0,
      customer: 0,
      driver: 0
    },
    parcelsByStatus: {
      created: 0,
      at_warehouse: 0,
      consolidated: 0,
      in_transit: 0,
      delivered: 0
    },
    consolidationsByStatus: {
      pending: 0,
      consolidated: 0,
      in_transit: 0,
      delivered: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all data in parallel
      const [
        userStatsRes,
        parcelsRes,
        warehousesRes,
        consolidationsRes,
        deliveriesRes,
        requestsRes
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/api/users/users/stats`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/parcels/api/parcels`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/warehouses/warehouses/active`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/consolidations/api/consolidations`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/deliveries/api/deliveries/active`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/api/consolidations/api/requests/pending-count`, { credentials: 'include' })
      ]);

      let userStatsData = null;
      let parcelsData = null;
      let warehousesData = null;
      let consolidationsData = null;
      let deliveriesData = null;
      let requestsData = null;

      if (userStatsRes.ok) {
        const result = await userStatsRes.json();
        userStatsData = result.data;
      }

      if (parcelsRes.ok) {
        parcelsData = await parcelsRes.json();
      }

      if (warehousesRes.ok) {
        warehousesData = await warehousesRes.json();
      }

      if (consolidationsRes.ok) {
        consolidationsData = await consolidationsRes.json();
      }

      if (deliveriesRes.ok) {
        deliveriesData = await deliveriesRes.json();
      }

      if (requestsRes.ok) {
        requestsData = await requestsRes.json();
      }

      // Calculate parcel statistics
      const parcelsByStatus = {
        created: 0,
        at_warehouse: 0,
        consolidated: 0,
        in_transit: 0,
        delivered: 0
      };

      if (parcelsData?.data) {
        parcelsData.data.forEach((parcel: any) => {
          if (parcelsByStatus.hasOwnProperty(parcel.status)) {
            parcelsByStatus[parcel.status as keyof typeof parcelsByStatus]++;
          }
        });
      }

      // Calculate consolidation statistics
      const consolidationsByStatus = {
        pending: 0,
        consolidated: 0,
        in_transit: 0,
        delivered: 0
      };

      if (Array.isArray(consolidationsData)) {
        consolidationsData.forEach((consolidation: any) => {
          if (consolidationsByStatus.hasOwnProperty(consolidation.status)) {
            consolidationsByStatus[consolidation.status as keyof typeof consolidationsByStatus]++;
          }
        });
      }

      setStats({
        totalUsers: userStatsData?.total || 0,
        totalParcels: parcelsData?.count || 0,
        activeWarehouses: warehousesData?.count || 0,
        totalConsolidations: Array.isArray(consolidationsData) ? consolidationsData.length : 0,
        activeDeliveries: deliveriesData?.count || 0,
        pendingRequests: requestsData?.count || 0,
        usersByRole: {
          admin: userStatsData?.admin || 0,
          staff: userStatsData?.staff || 0,
          customer: userStatsData?.customer || 0,
          driver: userStatsData?.driver || 0
        },
        parcelsByStatus,
        consolidationsByStatus
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      setError("Failed to load statistics. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-gray-400">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-red-400 mb-4">{error}</p>
        <button 
          onClick={fetchStats}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white mb-8">System Overview</h2>
        <button 
          onClick={fetchStats}
          className="px-4 cursor-pointer py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200 rounded-lg font-medium transition-all hover:-translate-y-1"
        >
          Refresh
        </button>
      </div>
      
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers.toLocaleString()} 
          icon="👥" 
          change={`${stats.usersByRole.customer} customers`}
          positive 
        />
        <StatCard 
          title="Total Parcels" 
          value={stats.totalParcels.toLocaleString()} 
          icon="📦" 
          change={`${stats.parcelsByStatus.in_transit} in transit`}
          positive 
        />
        <StatCard 
          title="Active Warehouses" 
          value={stats.activeWarehouses.toString()} 
          icon="🏢" 
          change="All operational" 
          positive 
        />
        <StatCard 
          title="Active Deliveries" 
          value={stats.activeDeliveries.toString()} 
          icon="🚚" 
          change={stats.activeDeliveries > 0 ? "In progress" : "None active"} 
          positive={stats.activeDeliveries > 0} 
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard 
          title="Total Consolidations" 
          value={stats.totalConsolidations.toString()} 
          icon="📋" 
          change={`${stats.consolidationsByStatus.pending} pending`}
          positive={stats.consolidationsByStatus.pending === 0} 
        />
        <StatCard 
          title="Pending Requests" 
          value={stats.pendingRequests.toString()} 
          icon="⏳" 
          change={stats.pendingRequests > 0 ? "Needs attention" : "All processed"} 
          positive={stats.pendingRequests === 0} 
        />
      </div>

      {/* User Distribution */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
        <h3 className="text-white text-xl font-semibold mb-6">User Distribution by Role</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Admins</div>
            <div className="text-2xl font-bold text-red-400">{stats.usersByRole.admin}</div>
          </div>
          <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Staff</div>
            <div className="text-2xl font-bold text-purple-400">{stats.usersByRole.staff}</div>
          </div>
          <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Customers</div>
            <div className="text-2xl font-bold text-blue-400">{stats.usersByRole.customer}</div>
          </div>
          <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Drivers</div>
            <div className="text-2xl font-bold text-yellow-400">{stats.usersByRole.driver}</div>
          </div>
        </div>
      </div>

      {/* Parcel Status Distribution */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
        <h3 className="text-white text-xl font-semibold mb-6">Parcel Status Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Created</div>
            <div className="text-2xl font-bold text-gray-400">{stats.parcelsByStatus.created}</div>
          </div>
          <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">At Warehouse</div>
            <div className="text-2xl font-bold text-blue-400">{stats.parcelsByStatus.at_warehouse}</div>
          </div>
          <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Consolidated</div>
            <div className="text-2xl font-bold text-purple-400">{stats.parcelsByStatus.consolidated}</div>
          </div>
          <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">In Transit</div>
            <div className="text-2xl font-bold text-yellow-400">{stats.parcelsByStatus.in_transit}</div>
          </div>
          <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Delivered</div>
            <div className="text-2xl font-bold text-green-400">{stats.parcelsByStatus.delivered}</div>
          </div>
        </div>
      </div>

      {/* Consolidation Status Distribution */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
        <h3 className="text-white text-xl font-semibold mb-6">Consolidation Status Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Pending</div>
            <div className="text-2xl font-bold text-yellow-400">{stats.consolidationsByStatus.pending}</div>
          </div>
          <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Consolidated</div>
            <div className="text-2xl font-bold text-blue-400">{stats.consolidationsByStatus.consolidated}</div>
          </div>
          <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">In Transit</div>
            <div className="text-2xl font-bold text-purple-400">{stats.consolidationsByStatus.in_transit}</div>
          </div>
          <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Delivered</div>
            <div className="text-2xl font-bold text-green-400">{stats.consolidationsByStatus.delivered}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOverview;