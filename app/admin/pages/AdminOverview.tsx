import StatCard from "../components/StatCard";


const AdminOverview = () => {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white mb-8">System Overview</h2>
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <StatCard title="Total Users" value="1,247" icon="👥" change="+12% from last month" positive />
        {/* Total Parcels */}
        <StatCard title="Total Parcels" value="8,456" icon="📦" change="+8% from last month" positive />
        {/* Active Drivers */}
        <StatCard title="Active Drivers" value="89" icon="🚚" change="+5% from last month" positive />
        {/* Revenue */}
        <StatCard title="Revenue" value="$45,231" icon="💰" change="-3% from last month" positive={false} />
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
        <h3 className="text-white text-xl font-semibold mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all hover:-translate-y-1 shadow-lg shadow-blue-600/30">
            Create New User
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200 px-6 py-3 rounded-lg font-medium transition-all hover:-translate-y-1">
            Generate Report
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200 px-6 py-3 rounded-lg font-medium transition-all hover:-translate-y-1">
            System Backup
          </button>
          <button className="bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200 px-6 py-3 rounded-lg font-medium transition-all hover:-translate-y-1">
            Send Announcement
          </button>
        </div>
      </div>
    </div>
  );
}


export default AdminOverview