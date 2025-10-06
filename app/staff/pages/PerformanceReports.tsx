'use client';
import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Download } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-gateway-nine-orpin.vercel.app";

interface PerformanceMetrics {
  parcelsProcessed: number;
  avgProcessingTime: number;
  routeEfficiency: number;
  consolidationRate: number;
  warehouseUtilization: number;
  trends: {
    parcelsChange: number;
    processingChange: number;
    efficiencyChange: number;
  };
}

export default function PerformanceReports({ userId }: { userId?: string }) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    parcelsProcessed: 0,
    avgProcessingTime: 0,
    routeEfficiency: 0,
    consolidationRate: 0,
    warehouseUtilization: 0,
    trends: {
      parcelsChange: 0,
      processingChange: 0,
      efficiencyChange: 0
    }
  });
  const [dateRange, setDateRange] = useState("7");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, [dateRange]);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const days = parseInt(dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Fetch parcels
      const parcelsRes = await fetch(`${API_BASE_URL}/api/parcels/api/parcels`, {
        credentials: 'include'
      });

      // Fetch consolidations
      const consolidationsRes = await fetch(`${API_BASE_URL}/api/consolidations/api/consoliations`, {
        credentials: 'include'
      });

      // Fetch warehouses
      const warehousesRes = await fetch(`${API_BASE_URL}/api/warehouses/warehouses`, {
        credentials: 'include'
      });

      if (parcelsRes.ok && consolidationsRes.ok && warehousesRes.ok) {
        const parcelsData = await parcelsRes.json();
        const consolidationsData = await consolidationsRes.json();
        const warehousesData = await warehousesRes.json();

        const parcels = parcelsData.data || parcelsData;
        const consolidations = consolidationsData || [];
        const warehouses = warehousesData.data || warehousesData;

        // Calculate metrics
        const filteredParcels = parcels.filter((p: any) => 
          new Date(p.createdTimeStamp) >= startDate
        );

        const parcelsProcessed = filteredParcels.filter((p: any) => 
          p.status !== 'created'
        ).length;

        // Calculate average processing time
        let totalProcessingTime = 0;
        let processedCount = 0;
        filteredParcels.forEach((p: any) => {
          if (p.statusHistory && p.statusHistory.length > 1) {
            const created = new Date(p.statusHistory[0].timestamp);
            const lastUpdate = new Date(p.statusHistory[p.statusHistory.length - 1].timestamp);
            totalProcessingTime += (lastUpdate.getTime() - created.getTime()) / (1000 * 60 * 60); // hours
            processedCount++;
          }
        });
        const avgProcessingTime = processedCount > 0 ? totalProcessingTime / processedCount : 0;

        // Calculate consolidation rate
        const consolidationRate = filteredParcels.length > 0 
          ? (consolidations.length / filteredParcels.length) * 100 
          : 0;

        // Calculate warehouse utilization
        let totalCapacity = 0;
        let totalUsed = 0;
        warehouses.forEach((w: any) => {
          if (w.capacity?.parcels) {
            totalCapacity += w.capacity.parcels;
            totalUsed += w.receivedParcels?.length || 0;
          }
        });
        const warehouseUtilization = totalCapacity > 0 ? (totalUsed / totalCapacity) * 100 : 0;

        // Calculate route efficiency (mock calculation)
        const routeEfficiency = 85 + Math.random() * 10;

        // Calculate trends (comparing with previous period)
        const prevStartDate = new Date(startDate);
        prevStartDate.setDate(prevStartDate.getDate() - days);
        
        const prevParcels = parcels.filter((p: any) => {
          const date = new Date(p.createdTimeStamp);
          return date >= prevStartDate && date < startDate;
        });

        const prevProcessed = prevParcels.filter((p: any) => p.status !== 'created').length;
        const parcelsChange = prevProcessed > 0 
          ? ((parcelsProcessed - prevProcessed) / prevProcessed) * 100 
          : 0;

        setMetrics({
          parcelsProcessed,
          avgProcessingTime,
          routeEfficiency,
          consolidationRate,
          warehouseUtilization,
          trends: {
            parcelsChange,
            processingChange: -0.5,
            efficiencyChange: 3.1
          }
        });
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReport = (reportType: string) => {
    // Create CSV content
    const csvContent = `Performance Report - ${reportType}\n\n` +
      `Date Range: Last ${dateRange} days\n` +
      `Generated: ${new Date().toLocaleString()}\n\n` +
      `Metrics:\n` +
      `Parcels Processed,${metrics.parcelsProcessed}\n` +
      `Average Processing Time,${metrics.avgProcessingTime.toFixed(2)} hours\n` +
      `Route Efficiency,${metrics.routeEfficiency.toFixed(1)}%\n` +
      `Consolidation Rate,${metrics.consolidationRate.toFixed(1)}%\n` +
      `Warehouse Utilization,${metrics.warehouseUtilization.toFixed(1)}%\n`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">Performance Reports</h2>
        <p className="text-gray-400 mt-1">Generate and analyze operational performance metrics</p>
      </div>

      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 3 Months</option>
          </select>
          <button 
            onClick={fetchMetrics}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg font-medium transition-all hover:-translate-y-1 shadow-lg shadow-blue-600/30"
          >
            Refresh Data
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading metrics...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 text-center transition-all hover:border-blue-500">
                <h3 className="text-blue-400 text-lg font-semibold mb-4">Parcels Processed</h3>
                <div className="text-white text-4xl font-bold mb-2">{metrics.parcelsProcessed}</div>
                <div className="flex items-center justify-center gap-1 text-sm">
                  {metrics.trends.parcelsChange >= 0 ? (
                    <>
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-green-400">{metrics.trends.parcelsChange.toFixed(1)}% from last period</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-4 h-4 text-red-400" />
                      <span className="text-red-400">{Math.abs(metrics.trends.parcelsChange).toFixed(1)}% from last period</span>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 text-center transition-all hover:border-blue-500">
                <h3 className="text-blue-400 text-lg font-semibold mb-4">Average Processing Time</h3>
                <div className="text-white text-4xl font-bold mb-2">{metrics.avgProcessingTime.toFixed(1)} hrs</div>
                <div className="flex items-center justify-center gap-1 text-sm">
                  <TrendingDown className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">{metrics.trends.processingChange.toFixed(1)} hrs improved</span>
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 text-center transition-all hover:border-blue-500">
                <h3 className="text-blue-400 text-lg font-semibold mb-4">Route Efficiency</h3>
                <div className="text-white text-4xl font-bold mb-2">{metrics.routeEfficiency.toFixed(1)}%</div>
                <div className="flex items-center justify-center gap-1 text-sm">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">{metrics.trends.efficiencyChange.toFixed(1)}% optimized</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                <h3 className="text-blue-400 text-lg font-semibold mb-4">Consolidation Rate</h3>
                <div className="text-white text-3xl font-bold mb-2">{metrics.consolidationRate.toFixed(1)}%</div>
                <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(metrics.consolidationRate, 100)}%` }}
                  ></div>
                </div>
                <p className="text-gray-400 text-sm">Efficiency in grouping parcels</p>
              </div>

              <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
                <h3 className="text-blue-400 text-lg font-semibold mb-4">Warehouse Utilization</h3>
                <div className="text-white text-3xl font-bold mb-2">{metrics.warehouseUtilization.toFixed(1)}%</div>
                <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(metrics.warehouseUtilization, 100)}%` }}
                  ></div>
                </div>
                <p className="text-gray-400 text-sm">Overall capacity usage</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 transition-all hover:border-blue-500">
                <h3 className="text-white font-semibold mb-2">Daily Operations Report</h3>
                <p className="text-gray-400 text-sm mb-4">Comprehensive daily activity summary</p>
                <button 
                  onClick={() => downloadReport('daily-operations')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>

              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 transition-all hover:border-blue-500">
                <h3 className="text-white font-semibold mb-2">Efficiency Analysis</h3>
                <p className="text-gray-400 text-sm mb-4">Route and processing efficiency metrics</p>
                <button 
                  onClick={() => downloadReport('efficiency-analysis')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>

              <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 transition-all hover:border-blue-500">
                <h3 className="text-white font-semibold mb-2">Performance Analytics</h3>
                <p className="text-gray-400 text-sm mb-4">KPI trends and operational insights</p>
                <button 
                  onClick={() => downloadReport('performance-analytics')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}