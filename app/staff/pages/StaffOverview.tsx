


export default function StaffOverview() {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white mb-8">Staff Operations Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-400 text-sm font-medium">Pending Parcels</p>
            <div className="bg-blue-500/20 rounded-full w-10 h-10 flex items-center justify-center text-blue-400 text-xl">
              📦
            </div>
          </div>
          <h3 className="text-white text-4xl font-bold mb-2">247</h3>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-yellow-400">→</span>
            <span className="text-yellow-400">Awaiting processing</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-400 text-sm font-medium">Processed Today</p>
            <div className="bg-blue-500/20 rounded-full w-10 h-10 flex items-center justify-center text-blue-400 text-xl">
              ✅
            </div>
          </div>
          <h3 className="text-white text-4xl font-bold mb-2">156</h3>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-green-400">↗</span>
            <span className="text-green-400">+15% from yesterday</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-400 text-sm font-medium">Active Warehouses</p>
            <div className="bg-blue-500/20 rounded-full w-10 h-10 flex items-center justify-center text-blue-400 text-xl">
              🏭
            </div>
          </div>
          <h3 className="text-white text-4xl font-bold mb-2">8</h3>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-green-400">↗</span>
            <span className="text-green-400">All operational</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-400 text-sm font-medium">Consolidated Groups</p>
            <div className="bg-blue-500/20 rounded-full w-10 h-10 flex items-center justify-center text-blue-400 text-xl">
              📋
            </div>
          </div>
          <h3 className="text-white text-4xl font-bold mb-2">23</h3>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-green-400">↗</span>
            <span className="text-green-400">Ready for dispatch</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 mb-8">
        <h3 className="text-white text-xl font-semibold mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all hover:-translate-y-1 shadow-lg shadow-blue-600/30">
            Add New Parcel
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200 px-6 py-3 rounded-lg font-medium transition-all hover:-translate-y-1">
            Register Warehouse
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200 px-6 py-3 rounded-lg font-medium transition-all hover:-translate-y-1">
            Create Route
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200 px-6 py-3 rounded-lg font-medium transition-all hover:-translate-y-1">
            Generate Report
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
        <h3 className="text-white text-xl font-semibold mb-6">Recent Activities</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-gray-900 border border-gray-700 rounded-lg">
            <div className="bg-blue-500/20 rounded-full w-10 h-10 flex items-center justify-center text-blue-400 text-lg">
              📦
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">Parcel SP2024089 added to warehouse WH-001</p>
              <p className="text-gray-400 text-sm">5 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-gray-900 border border-gray-700 rounded-lg">
            <div className="bg-green-500/20 rounded-full w-10 h-10 flex items-center justify-center text-green-400 text-lg">
              📋
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">15 parcels consolidated for Zone-A delivery</p>
              <p className="text-gray-400 text-sm">12 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-gray-900 border border-gray-700 rounded-lg">
            <div className="bg-purple-500/20 rounded-full w-10 h-10 flex items-center justify-center text-purple-400 text-lg">
              🗺️
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">Route R-045 optimized for 8 destinations</p>
              <p className="text-gray-400 text-sm">25 minutes ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}