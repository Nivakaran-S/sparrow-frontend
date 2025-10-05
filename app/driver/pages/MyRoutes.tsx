
import { useState } from "react";

const MyRoutes = () => {
  const [routes] = useState([
    { id: "R-045", name: "Downtown Route", stops: 8, distance: "45 km", estimated: "3.5 hrs", status: "Active", priority: "High" },
    { id: "R-046", name: "Suburb Route", stops: 12, distance: "67 km", estimated: "4.2 hrs", status: "Scheduled", priority: "Medium" },
    { id: "R-044", name: "Express Route", stops: 5, distance: "28 km", estimated: "2.1 hrs", status: "Completed", priority: "High" },
  ]);

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-8">
        My Optimized Routes
      </h2>
      <div className="space-y-6">
        {routes.map((route) => (
          <div
            key={route.id}
            className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 hover:-translate-y-1 hover:border-blue-400 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-blue-400 font-semibold">{route.id}</h3>
                <h4 className="text-lg font-semibold text-white">{route.name}</h4>
              </div>
              <div className="flex gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    route.status === "Active"
                      ? "bg-green-500/20 text-green-400"
                      : route.status === "Scheduled"
                      ? "bg-gray-500/20 text-gray-400"
                      : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  {route.status}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    route.priority === "High"
                      ? "bg-red-500/20 text-red-400"
                      : route.priority === "Medium"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {route.priority}
                </span>
              </div>
            </div>
            <div className="flex gap-4 mb-4 text-gray-400">
              <div>📍 {route.stops} stops</div>
              <div>🛣️ {route.distance}</div>
              <div>⏱️ {route.estimated}</div>
            </div>
            <div className="flex gap-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 hover:-translate-y-1 transition-all">
                View Route
              </button>
              <button className="bg-gray-600 text-gray-200 px-4 py-2 rounded-lg border border-gray-500 hover:bg-gray-500 hover:-translate-y-1 transition-all">
                Navigate
              </button>
              <button className="bg-gray-600 text-gray-200 px-4 py-2 rounded-lg border border-gray-500 hover:bg-gray-500 hover:-translate-y-1 transition-all">
                Report Issue
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyRoutes;