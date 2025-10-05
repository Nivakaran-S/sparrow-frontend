

const KPIMonitoring = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">KPI Monitoring</h2>
        <p className="text-gray-400 mt-1">Track key performance indicators across the system</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 text-center transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/15">
          <h3 className="text-blue-400 text-lg font-semibold mb-4">Delivery Performance</h3>
          <div className="text-white text-4xl font-bold mb-2">98.5%</div>
          <div className="flex items-center justify-center gap-1 text-sm">
            <span className="text-green-400">↗</span>
            <p className="text-green-400">2.3% from last month</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 text-center transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/15">
          <h3 className="text-blue-400 text-lg font-semibold mb-4">Average Delivery Time</h3>
          <div className="text-white text-4xl font-bold mb-2">2.4 days</div>
          <div className="flex items-center justify-center gap-1 text-sm">
            <span className="text-green-400">↘</span>
            <p className="text-green-400">0.3 days improved</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 text-center transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/15">
          <h3 className="text-blue-400 text-lg font-semibold mb-4">Customer Satisfaction</h3>
          <div className="text-white text-4xl font-bold mb-2">4.7/5</div>
          <div className="flex items-center justify-center gap-1 text-sm">
            <span className="text-green-400">↗</span>
            <p className="text-green-400">0.2 from last month</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 text-center transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/15">
          <h3 className="text-blue-400 text-lg font-semibold mb-4">Cost per Delivery</h3>
          <div className="text-white text-4xl font-bold mb-2">$12.50</div>
          <div className="flex items-center justify-center gap-1 text-sm">
            <span className="text-red-400">↗</span>
            <p className="text-red-400">$0.80 increased</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KPIMonitoring