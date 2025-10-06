import { useState, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-gateway-nine-orpin.vercel.app";

type KPIData = {
  deliveryPerformance: number;
  avgDeliveryTime: number;
  customerSatisfaction: number;
  costPerDelivery: number;
  activeParcels: number;
  inTransit: number;
  deliveredToday: number;
  delayed: number;
};

const KPIMonitoring = () => {
  const [kpiData, setKpiData] = useState<KPIData>({
    deliveryPerformance: 0,
    avgDeliveryTime: 0,
    customerSatisfaction: 4.7,
    costPerDelivery: 12.50,
    activeParcels: 0,
    inTransit: 0,
    deliveredToday: 0,
    delayed: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("30days");

  useEffect(() => {
    fetchKPIData();
  }, [timeRange]);

  const fetchKPIData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all parcels
      const parcelsRes = await fetch(`${API_BASE_URL}/api/parcels/api/parcels`, {
        credentials: 'include',
      });
      
      if (parcelsRes.ok) {
        const parcelsData = await parcelsRes.json();
        const parcels = parcelsData.data || [];
        
        // Calculate delivery performance
        const deliveredParcels = parcels.filter((p: any) => p.status === 'delivered').length;
        const totalParcels = parcels.length || 1;
        const deliveryPerformance = (deliveredParcels / totalParcels) * 100;
        
        // Calculate parcels in different states
        const inTransit = parcels.filter((p: any) => p.status === 'in_transit').length;
        const activeParcels = parcels.filter((p: any) => 
          ['created', 'at_warehouse', 'consolidated', 'in_transit', 'out_for_delivery'].includes(p.status)
        ).length;
        
        // Calculate delivered today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deliveredToday = parcels.filter((p: any) => {
          if (p.status !== 'delivered') return false;
          const statusHistory = p.statusHistory || [];
          const deliveredStatus = statusHistory.find((h: any) => h.status === 'delivered');
          if (!deliveredStatus) return false;
          const deliveredDate = new Date(deliveredStatus.timestamp);
          return deliveredDate >= today;
        }).length;
        
        // Calculate average delivery time (simplified - you may need more complex logic)
        const deliveredParcelsWithTime = parcels.filter((p: any) => {
          return p.status === 'delivered' && p.statusHistory && p.statusHistory.length > 1;
        });
        
        let totalDays = 0;
        deliveredParcelsWithTime.forEach((p: any) => {
          const created = new Date(p.createdTimeStamp);
          const delivered = p.statusHistory.find((h: any) => h.status === 'delivered');
          if (delivered) {
            const deliveredDate = new Date(delivered.timestamp);
            const days = (deliveredDate.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
            totalDays += days;
          }
        });
        
        const avgDeliveryTime = deliveredParcelsWithTime.length > 0 
          ? totalDays / deliveredParcelsWithTime.length 
          : 0;
        
        setKpiData({
          deliveryPerformance: parseFloat(deliveryPerformance.toFixed(1)),
          avgDeliveryTime: parseFloat(avgDeliveryTime.toFixed(1)),
          customerSatisfaction: 4.7, // This would come from a customer feedback system
          costPerDelivery: 12.50, // This would come from financial data
          activeParcels,
          inTransit,
          deliveredToday,
          delayed: 0 // This would require tracking expected vs actual delivery dates
        });
      } else {
        setError("Failed to fetch parcel data");
      }
    } catch (error) {
      console.error("Error fetching KPI data:", error);
      setError("Failed to load KPI data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-gray-400">Loading KPI data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-red-400 mb-4">{error}</p>
        <button 
          onClick={fetchKPIData}
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
        <div>
          <h2 className="text-3xl font-bold text-white">KPI Monitoring</h2>
          <p className="text-gray-400 mt-1">Track key performance indicators across the system</p>
        </div>
        <div className="flex gap-4">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="365days">Last Year</option>
          </select>
          <button 
            onClick={fetchKPIData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 text-center transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/15">
          <h3 className="text-blue-400 text-lg font-semibold mb-4">Delivery Performance</h3>
          <div className="text-white text-4xl font-bold mb-2">{kpiData.deliveryPerformance}%</div>
          <div className="flex items-center justify-center gap-1 text-sm">
            <span className={kpiData.deliveryPerformance > 95 ? "text-green-400" : "text-yellow-400"}>
              {kpiData.deliveryPerformance > 95 ? "↗" : "→"}
            </span>
            <p className={kpiData.deliveryPerformance > 95 ? "text-green-400" : "text-yellow-400"}>
              {kpiData.deliveryPerformance > 95 ? "Excellent" : "Good"}
            </p>
          </div>
          <div className="mt-4 bg-gray-900 rounded-full h-2 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                kpiData.deliveryPerformance > 95 ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-yellow-500 to-yellow-600'
              }`}
              style={{ width: `${kpiData.deliveryPerformance}%` }}
            ></div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 text-center transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/15">
          <h3 className="text-blue-400 text-lg font-semibold mb-4">Average Delivery Time</h3>
          <div className="text-white text-4xl font-bold mb-2">
            {kpiData.avgDeliveryTime > 0 ? `${kpiData.avgDeliveryTime} days` : 'N/A'}
          </div>
          <div className="flex items-center justify-center gap-1 text-sm">
            <span className="text-green-400">↘</span>
            <p className="text-green-400">Target: 2.0 days</p>
          </div>
          <p className="text-gray-400 text-xs mt-4">
            {kpiData.avgDeliveryTime > 0 
              ? kpiData.avgDeliveryTime <= 2 
                ? 'Meeting target ✓' 
                : `${(kpiData.avgDeliveryTime - 2).toFixed(1)} days above target`
              : 'Insufficient data'
            }
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 text-center transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/15">
          <h3 className="text-blue-400 text-lg font-semibold mb-4">Customer Satisfaction</h3>
          <div className="text-white text-4xl font-bold mb-2">{kpiData.customerSatisfaction}/5</div>
          <div className="flex items-center justify-center gap-1 text-sm">
            <span className="text-green-400">↗</span>
            <p className="text-green-400">Trending up</p>
          </div>
          <div className="flex justify-center gap-1 mt-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className={star <= Math.floor(kpiData.customerSatisfaction) ? "text-yellow-400 text-xl" : "text-gray-600 text-xl"}>
                ⭐
              </span>
            ))}
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 text-center transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/15">
          <h3 className="text-blue-400 text-lg font-semibold mb-4">Cost per Delivery</h3>
          <div className="text-white text-4xl font-bold mb-2">Rs. {kpiData.costPerDelivery.toFixed(2)}</div>
          <div className="flex items-center justify-center gap-1 text-sm">
            <span className="text-gray-400">→</span>
            <p className="text-gray-400">Stable</p>
          </div>
          <p className="text-gray-400 text-xs mt-4">Target: Rs. 11.00</p>
        </div>
      </div>

      {/* Operational Metrics */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
        <h3 className="text-white text-lg font-semibold mb-6">Real-time Operational Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Active Parcels</div>
            <div className="text-2xl font-bold text-white">{kpiData.activeParcels.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">All non-delivered</div>
          </div>
          <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">In Transit</div>
            <div className="text-2xl font-bold text-yellow-400">{kpiData.inTransit.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">Currently moving</div>
          </div>
          <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Delivered Today</div>
            <div className="text-2xl font-bold text-green-400">{kpiData.deliveredToday.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">Last 24 hours</div>
          </div>
          <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
            <div className="text-sm text-gray-400 mb-1">Delayed</div>
            <div className="text-2xl font-bold text-red-400">{kpiData.delayed}</div>
            <div className="text-xs text-gray-500 mt-1">Past expected time</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KPIMonitoring;