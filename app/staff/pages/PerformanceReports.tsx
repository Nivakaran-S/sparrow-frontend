

export default function PerformanceReports() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">Performance Reports</h2>
        <p className="text-gray-400 mt-1">Generate and analyze operational performance metrics</p>
      </div>

      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <select className="px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 3 Months</option>
          </select>
          <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg font-medium transition-all hover:-translate-y-1 shadow-lg shadow-blue-600/30">
            Generate Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 text-center transition-all hover:border-blue-500">
            <h3 className="text-blue-400 text-lg font-semibold mb-4">Parcels Processed</h3>
            <div className="text-white text-4xl font-bold mb-2">1,247</div>
            <div className="flex items-center justify-center gap-1 text-sm">
              <span className="text-green-400">↗</span>
              <p className="text-green-400">12% from last week</p>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 text-center transition-all hover:border-blue-500">
            <h3 className="text-blue-400 text-lg font-semibold mb-4">Average Processing Time</h3>
            <div className="text-white text-4xl font-bold mb-2">2.3 hrs</div>
            <div className="flex items-center justify-center gap-1 text-sm">
              <span className="text-green-400">↘</span>
              <p className="text-green-400">0.5 hrs improved</p>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 text-center transition-all hover:border-blue-500">
            <h3 className="text-blue-400 text-lg font-semibold mb-4">Route Efficiency</h3>
            <div className="text-white text-4xl font-bold mb-2">94.2%</div>
            <div className="flex items-center justify-center gap-1 text-sm">
              <span className="text-green-400">↗</span>
              <p className="text-green-400">3.1% optimized</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 transition-all hover:border-blue-500">
            <h3 className="text-white font-semibold mb-2">Daily Operations Report</h3>
            <p className="text-gray-400 text-sm mb-4">Comprehensive daily activity summary</p>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors">
              Download
            </button>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 transition-all hover:border-blue-500">
            <h3 className="text-white font-semibold mb-2">Efficiency Analysis</h3>
            <p className="text-gray-400 text-sm mb-4">Route and processing efficiency metrics</p>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors">
              Download
            </button>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 transition-all hover:border-blue-500">
            <h3 className="text-white font-semibold mb-2">Performance Analytics</h3>
            <p className="text-gray-400 text-sm mb-4">KPI trends and operational insights</p>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors">
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}