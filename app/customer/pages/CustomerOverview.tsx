"use client";
import { useState, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-gateway-nine-orpin.vercel.app";

const CustomerOverview = () => {
  const [stats, setStats] = useState({
    totalParcels: 0,
    inTransit: 0,
    delivered: 0,
    pending: 0
  });
  const [recentParcels, setRecentParcels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch parcels data
      const response = await fetch(`${API_BASE_URL}/api/parcels`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        const parcels = data.data || [];
        
        // Calculate stats
        setStats({
          totalParcels: parcels.length,
          inTransit: parcels.filter((p: any) => p.status === 'in_transit').length,
          delivered: parcels.filter((p: any) => p.status === 'delivered').length,
          pending: parcels.filter((p: any) => p.status === 'created' || p.status === 'at_warehouse').length,
        });
        
        // Get recent parcels (last 5)
        setRecentParcels(parcels.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      created: "bg-gray-500",
      at_warehouse: "bg-yellow-500",
      consolidated: "bg-blue-500",
      in_transit: "bg-purple-500",
      out_for_delivery: "bg-orange-500",
      delivered: "bg-green-500",
      cancelled: "bg-red-500"
    };
    return colors[status] || "bg-gray-500";
  };

  const getStatusLabel = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="text-white">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Dashboard Overview</h2>
        <p className="text-gray-400">Welcome back! Here's your shipping summary</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 hover:border-blue-500 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">📦</div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Total Parcels</p>
              <p className="text-3xl font-bold text-white">{stats.totalParcels}</p>
            </div>
          </div>
          <div className="text-xs text-gray-500">All time shipments</div>
        </div>

        <div className="bg-gradient-to-br from-purple-900/30 to-gray-900 p-6 rounded-xl border border-purple-700 hover:border-purple-500 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">🚚</div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">In Transit</p>
              <p className="text-3xl font-bold text-purple-400">{stats.inTransit}</p>
            </div>
          </div>
          <div className="text-xs text-gray-500">Currently shipping</div>
        </div>

        <div className="bg-gradient-to-br from-green-900/30 to-gray-900 p-6 rounded-xl border border-green-700 hover:border-green-500 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">✅</div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Delivered</p>
              <p className="text-3xl font-bold text-green-400">{stats.delivered}</p>
            </div>
          </div>
          <div className="text-xs text-gray-500">Successfully delivered</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-900/30 to-gray-900 p-6 rounded-xl border border-yellow-700 hover:border-yellow-500 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">⏳</div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Pending</p>
              <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
            </div>
          </div>
          <div className="text-xs text-gray-500">Awaiting processing</div>
        </div>
      </div>

      {/* Recent Parcels */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Recent Parcels</h3>
          <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
            View All →
          </button>
        </div>

        {recentParcels.length > 0 ? (
          <div className="space-y-4">
            {recentParcels.map((parcel, index) => (
              <div 
                key={index}
                className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 hover:border-blue-500 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">📦</div>
                    <div>
                      <p className="text-white font-semibold">{parcel.trackingNumber}</p>
                      <p className="text-gray-400 text-sm">
                        {parcel.receiver?.name || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(parcel.status)} bg-opacity-20 text-white`}>
                      {getStatusLabel(parcel.status)}
                    </span>
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(parcel.createdTimeStamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">📭</div>
            <p>No parcels found</p>
            <p className="text-sm mt-2">Create your first shipment to get started</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-gradient-to-br from-blue-900/30 to-gray-900 p-6 rounded-xl border border-blue-700 hover:border-blue-500 transition-all cursor-pointer">
          <div className="text-4xl mb-3">➕</div>
          <h4 className="text-lg font-semibold text-white mb-2">Create New Shipment</h4>
          <p className="text-gray-400 text-sm">Start shipping your parcels</p>
        </div>

        <div className="bg-gradient-to-br from-purple-900/30 to-gray-900 p-6 rounded-xl border border-purple-700 hover:border-purple-500 transition-all cursor-pointer">
          <div className="text-4xl mb-3">🔍</div>
          <h4 className="text-lg font-semibold text-white mb-2">Track Shipment</h4>
          <p className="text-gray-400 text-sm">Monitor your parcel status</p>
        </div>

        <div className="bg-gradient-to-br from-green-900/30 to-gray-900 p-6 rounded-xl border border-green-700 hover:border-green-500 transition-all cursor-pointer">
          <div className="text-4xl mb-3">📋</div>
          <h4 className="text-lg font-semibold text-white mb-2">View History</h4>
          <p className="text-gray-400 text-sm">Check past shipments</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerOverview;