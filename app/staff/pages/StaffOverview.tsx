"use client";
import { useState, useEffect } from "react";
import { Package, CheckCircle, Warehouse, Archive } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-gateway-nine-orpin.vercel.app";

interface DashboardStats {
  pendingParcels: number;
  processedToday: number;
  activeWarehouses: number;
  consolidatedGroups: number;
  recentActivities: Activity[];
}

interface Activity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}

export default function StaffOverview({ userId, setActiveTab }: { userId?: string; setActiveTab?: (tab: string) => void }) {
  const [stats, setStats] = useState<DashboardStats>({
    pendingParcels: 0,
    processedToday: 0,
    activeWarehouses: 0,
    consolidatedGroups: 0,
    recentActivities: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    try {
      // Fetch parcels
      const parcelsRes = await fetch(`${API_BASE_URL}/api/parcels/api/parcels`, {
        credentials: 'include'
      });
      
      // Fetch warehouses
      const warehousesRes = await fetch(`${API_BASE_URL}/api/warehouses/warehouses`, {
        credentials: 'include'
      });
      
      // Fetch consolidations
      const consolidationsRes = await fetch(`${API_BASE_URL}/api/consolidations/api/consolidations`, {
        credentials: 'include'
      });

      if (parcelsRes.ok && warehousesRes.ok && consolidationsRes.ok) {
        const parcelsData = await parcelsRes.json();
        const warehousesData = await warehousesRes.json();
        const consolidationsData = await consolidationsRes.json();

        const parcels = parcelsData.data || parcelsData;
        const warehouses = warehousesData.data || warehousesData;
        const consolidations = consolidationsData || [];

        // Calculate stats
        const pendingParcels = parcels.filter((p: any) => 
          p.status === 'created' || p.status === 'at_warehouse'
        ).length;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const processedToday = parcels?.filter((p: any) => {
          const createdDate = new Date(p.createdTimeStamp);
          return createdDate >= today && 
            (p.status === 'consolidated' || p.status === 'in_transit');
        }).length;

        const activeWarehouses = warehouses.filter((w: any) => 
          w.status === 'active'
        ).length;

        const consolidatedGroups = consolidations.filter((c: any) => 
          c.status === 'consolidated' || c.status === 'pending'
        ).length;

        // Generate recent activities from parcels
        const recentActivities = parcels
          .sort((a: any, b: any) => 
            new Date(b.createdTimeStamp).getTime() - new Date(a.createdTimeStamp).getTime()
          )
          .slice(0, 3)
          .map((p: any) => ({
            id: p._id,
            type: 'parcel',
            message: `Parcel ${p.trackingNumber} ${p.status}`,
            timestamp: p.createdTimeStamp
          }));

        setStats({
          pendingParcels,
          processedToday,
          activeWarehouses,
          consolidatedGroups,
          recentActivities
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now.getTime() - time.getTime()) / 1000 / 60);
    
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff} minutes ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`;
    return `${Math.floor(diff / 1440)} days ago`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white mb-8">Staff Operations Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-400 text-sm font-medium">Pending Parcels</p>
            <div className="bg-blue-500/20 rounded-full w-10 h-10 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <h3 className="text-white text-4xl font-bold mb-2">{stats.pendingParcels}</h3>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-yellow-400">→</span>
            <span className="text-yellow-400">Awaiting processing</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-400 text-sm font-medium">Processed Today</p>
            <div className="bg-blue-500/20 rounded-full w-10 h-10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <h3 className="text-white text-4xl font-bold mb-2">{stats.processedToday}</h3>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-green-400">↗</span>
            <span className="text-green-400">Active processing</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-400 text-sm font-medium">Active Warehouses</p>
            <div className="bg-blue-500/20 rounded-full w-10 h-10 flex items-center justify-center">
              <Warehouse className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <h3 className="text-white text-4xl font-bold mb-2">{stats.activeWarehouses}</h3>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-green-400">↗</span>
            <span className="text-green-400">All operational</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-400 text-sm font-medium">Consolidated Groups</p>
            <div className="bg-blue-500/20 rounded-full w-10 h-10 flex items-center justify-center">
              <Archive className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <h3 className="text-white text-4xl font-bold mb-2">{stats.consolidatedGroups}</h3>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-green-400">↗</span>
            <span className="text-green-400">Ready for dispatch</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 mb-8">
        <h3 className="text-white text-xl font-semibold mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button onClick={() => setActiveTab && setActiveTab('parcels')} className="bg-gradient-to-r cursor-pointer from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all hover:-translate-y-1 shadow-lg shadow-blue-600/30">
            + New Shipment
          </button>
          <button onClick={() => setActiveTab && setActiveTab('warehouse')} className="bg-gray-700 cursor-pointer hover:bg-gray-600 border border-gray-600 text-gray-200 px-6 py-3 rounded-lg font-medium transition-all hover:-translate-y-1">
            Register Warehouse
          </button>
          <button 
            className="bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200 px-6 py-3 rounded-lg font-medium transition-all hover:-translate-y-1"
            onClick={fetchDashboardStats}
          >
            Refresh Data
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
        <h3 className="text-white text-xl font-semibold mb-6">Recent Activities</h3>
        <div className="space-y-4">
          {stats.recentActivities.length > 0 ? (
            stats.recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-4 bg-gray-900 border border-gray-700 rounded-lg">
                <div className="bg-blue-500/20 rounded-full w-10 h-10 flex items-center justify-center text-blue-400 text-lg">
                  📦
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{activity.message}</p>
                  <p className="text-gray-400 text-sm">{getTimeAgo(activity.timestamp)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              No recent activities
            </div>
          )}
        </div>
      </div>
    </div>
  );
}