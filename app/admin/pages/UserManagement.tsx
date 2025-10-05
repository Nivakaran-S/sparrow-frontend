import { useState, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-gateway-nine-orpin.vercel.app";

type User = {
  _id: string;
  userName: string;
  role: string;
  entityId: string;
  createdTimestamp: string;
  details?: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    gender: string;
  };
};

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    admin: 0,
    staff: 0,
    customer: 0,
    driver: 0
  });

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [roleFilter]);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/users/stats`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = roleFilter === "all" 
        ? `${API_BASE_URL}/api/users/users`
        : `${API_BASE_URL}/api/users/users?role=${roleFilter}`;
        
      const response = await fetch(url, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      } else {
        setError("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to fetch users. Please try again.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = Array.isArray(users) ? users.filter(user => {
    const matchesSearch = user.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.details?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.details?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.details?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) : [];

  const getRoleBadgeColor = (role: string) => {
    switch(role) {
      case "Admin": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "Staff": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "Driver": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Customer": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"?`)) return;
    
    try {
      // Implement delete user API call when endpoint is available
      alert("User deletion endpoint not yet implemented in backend");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-gray-400">Loading users...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-red-400 mb-4">{error}</p>
        <button 
          onClick={fetchUsers}
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
          <h2 className="text-3xl font-bold text-white">User Management</h2>
          <p className="text-gray-400 mt-1">Manage system users and their permissions</p>
        </div>
        <button 
          onClick={fetchUsers}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all hover:-translate-y-1 shadow-lg shadow-blue-600/30"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-4">
          <div className="text-gray-400 text-sm mb-1">Total Users</div>
          <div className="text-2xl font-bold text-white">{stats.total}</div>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-4">
          <div className="text-gray-400 text-sm mb-1">Admins</div>
          <div className="text-2xl font-bold text-red-400">{stats.admin}</div>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-4">
          <div className="text-gray-400 text-sm mb-1">Staff</div>
          <div className="text-2xl font-bold text-purple-400">{stats.staff}</div>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-4">
          <div className="text-gray-400 text-sm mb-1">Customers</div>
          <div className="text-2xl font-bold text-blue-400">{stats.customer}</div>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-4">
          <div className="text-gray-400 text-sm mb-1">Drivers</div>
          <div className="text-2xl font-bold text-yellow-400">{stats.driver}</div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-white text-lg font-semibold">All Users ({filteredUsers.length})</h3>
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
            />
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Staff">Staff</option>
              <option value="Customer">Customer</option>
              <option value="Driver">Driver</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-900">
                <th className="text-white px-6 py-4 text-left font-semibold text-sm">Name</th>
                <th className="text-white px-6 py-4 text-left font-semibold text-sm">Username</th>
                <th className="text-white px-6 py-4 text-left font-semibold text-sm">Email</th>
                <th className="text-white px-6 py-4 text-left font-semibold text-sm">Phone</th>
                <th className="text-white px-6 py-4 text-left font-semibold text-sm">Role</th>
                <th className="text-white px-6 py-4 text-left font-semibold text-sm">Created</th>
                <th className="text-white px-6 py-4 text-left font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={user._id} className={`border-b border-gray-700 hover:bg-blue-500/5 transition-colors ${index === filteredUsers.length - 1 ? 'border-b-0' : ''}`}>
                  <td className="px-6 py-4 text-gray-300 text-sm">
                    {user.details?.firstName && user.details?.lastName 
                      ? `${user.details.firstName} ${user.details.lastName}` 
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-gray-300 text-sm">{user.userName}</td>
                  <td className="px-6 py-4 text-gray-300 text-sm">{user.details?.email || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-300 text-sm">{user.details?.phoneNumber || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-300 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300 text-sm">
                    {new Date(user.createdTimestamp).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-gray-300 text-sm">
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors">
                        View
                      </button>
                      {user.role !== 'Admin' && (
                        <button 
                          onClick={() => handleDeleteUser(user._id, user.userName)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    No users found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;