const DriverOverview = ({ isOnline }: { isOnline: boolean }) => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Driver Dashboard
        </h2>
        <div
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            isOnline ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
          }`}
        >
          Status: {isOnline ? "Online & Ready" : "Offline"}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { icon: "📦", value: "12", label: "Today's Deliveries" },
          { icon: "🛣️", value: "156 km", label: "Distance Traveled" },
          { icon: "💰", value: "$245", label: "Today's Earnings" },
          { icon: "⭐", value: "4.8/5", label: "Rating" },
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
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">Current Route</h3>
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-lg font-semibold text-blue-400">Route R-045</h4>
            <p className="text-gray-400">8 stops • Est. 3.5 hours • 45 km</p>
            <div className="mt-4">
              <div className="text-gray-400 mb-2">Progress: 3 of 8 stops completed</div>
              <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-500 h-full" style={{ width: "37.5%" }}></div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 hover:-translate-y-1 transition-all">
              View Details
            </button>
            <button className="bg-gray-600 text-gray-200 px-4 py-2 rounded-lg border border-gray-500 hover:bg-gray-500 hover:-translate-y-1 transition-all">
              Navigate
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Quick Stats</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "This Week", value: "67 deliveries" },
            { label: "This Month", value: "286 deliveries" },
            { label: "Success Rate", value: "98.5%" },
            { label: "Average Time", value: "12 min/stop" },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center"
            >
              <span className="text-gray-400 block">{stat.label}</span>
              <span className="text-white font-semibold">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DriverOverview