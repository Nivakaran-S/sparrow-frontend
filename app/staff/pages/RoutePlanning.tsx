

export default function RoutePlanning({ userId, setActiveTab }: { userId?: string; setActiveTab?: (tab: string) => void }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">Route Planning</h2>
        <p className="text-gray-400 mt-1">Optimize delivery routes for maximum efficiency</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
          <h3 className="text-blue-400 text-lg font-semibold mb-6">Create New Route</h3>
          <form className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Route Name</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                placeholder="Enter route name" 
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Starting Point</label>
              <select className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none">
                <option>Central Warehouse</option>
                <option>North Warehouse</option>
                <option>South Warehouse</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Destinations</label>
              <textarea 
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none h-24 resize-none"
                placeholder="Enter destinations (one per line)"
              ></textarea>
            </div>
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-lg font-medium transition-all hover:-translate-y-1 shadow-lg shadow-blue-600/30"
            >
              Optimize Route
            </button>
          </form>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
          <h3 className="text-blue-400 text-lg font-semibold mb-6">Active Routes</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-white font-medium">Route R-001</h4>
                <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium border border-green-500/30">
                  In Progress
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-3">8 stops • 45 km • Est. 3.5 hours</p>
              <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors">
                View Details
              </button>
            </div>
            <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-white font-medium">Route R-002</h4>
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium border border-yellow-500/30">
                  Planned
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-3">5 stops • 32 km • Est. 2.8 hours</p>
              <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
