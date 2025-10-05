const PerformanceAnalytics = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-8">
        Performance Analytics
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { title: "Delivery Efficiency", chart: "📊", label: "Average: 12 min/delivery", insight: "15% faster than average driver" },
          { title: "Customer Rating Trend", chart: "📈", label: "Current: 4.8/5", insight: "Improved by 0.3 this month" },
          { title: "Fuel Efficiency", chart: "⛽", label: "8.5 L/100km", insight: "12% better than fleet average" },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 text-center hover:-translate-y-1 hover:border-blue-400 transition-all"
          >
            <h3 className="text-lg font-semibold text-white mb-4">{item.title}</h3>
            <div className="mb-4">
              <div className="text-4xl mb-2">{item.chart}</div>
              <p className="text-gray-400">{item.label}</p>
            </div>
            <p className="text-gray-400 text-sm">{item.insight}</p>
          </div>
        ))}
      </div>
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Performance Goals</h3>
        <div className="space-y-6">
          {[
            { name: "Daily Delivery Target", progress: "12/15", width: "80%" },
            { name: "Customer Rating", progress: "4.8/5.0", width: "96%" },
            { name: "On-Time Delivery", progress: "98%", width: "98%" },
          ].map((goal, idx) => (
            <div key={idx}>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">{goal.name}</span>
                <span className="text-white">{goal.progress}</span>
              </div>
              <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-500 h-full" style={{ width: goal.width }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


export default PerformanceAnalytics;