"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminNavigation from "./components/AdminNavigation";
import Sidebar from "./components/Sidebar";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // useEffect(() => {
  //     const checkAuth = async () => {
  //       try {
  //         // Check if user is authenticated
  //         if (!tokenManager.isAuthenticated()) {
  //           router.push("/login");
  //           return;
  //         }
  
  //         // Check if user has staff role
  //         if (!tokenManager.hasRole("ADMIN")) {
  //           router.push("/login");
  //           return;
  //         }
  
  //         // Get user info from token manager
  //         const userId = tokenManager.getUserId();
  //         const username = tokenManager.getUsername();
  //         const roles = tokenManager.getRoles();
          
  //         if (userId && username) {
  //           setUser({
  //             id: userId,
  //             name: username,
  //             email: "", // You might want to fetch this from API if needed
  //             role: roles.includes("ADMIN") ? "ADMIN" : ""
  //           });
  //         }
  //       } catch (error) {
  //         console.error("Authentication error:", error);
      
  //         router.push("/login");
  //       } finally {
  //         setIsLoading(false);
  //       }
  //     };
  
  //     checkAuth();
  //   }, []);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white text-xl">
      Loading...
    </div>
  );

  //if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <AdminNavigation />

      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content */}
        <main className="flex-1 p-8 ml-[18vw] mt-[10vh] overflow-y-auto bg-black">
          {activeTab === 'overview' && <AdminOverview />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'roles' && <RoleManagement />}
          {activeTab === 'kpis' && <KPIMonitoring />}
          {activeTab === 'reports' && <Reports />}
          {activeTab === 'settings' && <SystemSettings />}
        </main>
      </div>
    </div>
  );
}


// -------------------- COMPONENTS -------------------- //

function AdminOverview() {
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

// StatCard helper
function StatCard({ title, value, icon, change, positive = true }: any) {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <div className="bg-blue-500/20 rounded-full w-10 h-10 flex items-center justify-center text-blue-400 text-xl">{icon}</div>
      </div>
      <h3 className="text-white text-4xl font-bold mb-2">{value}</h3>
      <div className="flex items-center gap-1 text-sm">
        <span className={positive ? "text-green-400" : "text-red-400"}>{positive ? "↗" : "↘"}</span>
        <span className={positive ? "text-green-400" : "text-red-400"}>{change}</span>
      </div>
    </div>
  );
}


// User Management Component
function UserManagement() {
  const [users] = useState([
    { id: 1, name: 'John Admin', email: 'admin@sparrow.com', role: 'ADMIN', status: 'Active' },
    { id: 2, name: 'Sarah Staff', email: 'staff@sparrow.com', role: 'STAFF', status: 'Active' },
    { id: 3, name: 'Alice Customer', email: 'customer@sparrow.com', role: 'CUSTOMER', status: 'Active' },
    { id: 4, name: 'Bob Driver', email: 'driver@sparrow.com', role: 'DRIVER', status: 'Active' },
  ]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">User Management</h2>
          <p className="text-gray-400 mt-1">Manage system users and their permissions</p>
        </div>
        <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all hover:-translate-y-1 shadow-lg shadow-blue-600/30">
          Add New User
        </button>
      </div>
      
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-white text-lg font-semibold">All Users</h3>
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="Search users..." 
              className="px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
            />
            <select className="px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none">
              <option>All Roles</option>
              <option>Admin</option>
              <option>Staff</option>
              <option>Customer</option>
              <option>Driver</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-900">
                <th className="text-white px-6 py-4 text-left font-semibold text-sm">Name</th>
                <th className="text-white px-6 py-4 text-left font-semibold text-sm">Email</th>
                <th className="text-white px-6 py-4 text-left font-semibold text-sm">Role</th>
                <th className="text-white px-6 py-4 text-left font-semibold text-sm">Status</th>
                <th className="text-white px-6 py-4 text-left font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} className={`border-b border-gray-700 hover:bg-blue-500/5 transition-colors ${index === users.length - 1 ? 'border-b-0' : ''}`}>
                  <td className="px-6 py-4 text-gray-300 text-sm">{user.name}</td>
                  <td className="px-6 py-4 text-gray-300 text-sm">{user.email}</td>
                  <td className="px-6 py-4 text-gray-300 text-sm">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium border border-blue-500/30">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300 text-sm">
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold uppercase tracking-wider border border-green-500/30">
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300 text-sm">
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors">
                        Edit
                      </button>
                      <button className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Role Management Component
function RoleManagement() {
  const [roles] = useState([
    { 
      id: 1, 
      name: 'Admin', 
      permissions: ['User Management', 'System Settings', 'Reports', 'KPI Access'],
      users: 2 
    },
    { 
      id: 2, 
      name: 'Staff', 
      permissions: ['Parcel Management', 'Warehouse Management', 'Route Planning'],
      users: 15 
    },
    { 
      id: 3, 
      name: 'Customer', 
      permissions: ['Track Parcels', 'View Costs', 'Request Delivery'],
      users: 1200 
    },
    { 
      id: 4, 
      name: 'Driver', 
      permissions: ['View Routes', 'Update Delivery Status', 'Access GPS'],
      users: 30 
    },
  ]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Role Management</h2>
          <p className="text-gray-400 mt-1">Configure user roles and permissions</p>
        </div>
        <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all hover:-translate-y-1 shadow-lg shadow-blue-600/30">
          Create New Role
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roles.map(role => (
          <div key={role.id} className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/15">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-blue-400 text-xl font-semibold">{role.name}</h3>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium border border-blue-500/30">
                {role.users} users
              </span>
            </div>
            
            <div className="mb-6">
              <h4 className="text-white text-sm font-medium mb-3">Permissions:</h4>
              <div className="space-y-2">
                {role.permissions.map((permission, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300 text-sm">{permission}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors">
                Edit Role
              </button>
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200 rounded-lg text-xs font-medium transition-colors">
                View Users
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// KPI Monitoring Component
function KPIMonitoring() {
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

// Reports Component
function Reports() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">Reports & Analytics</h2>
        <p className="text-gray-400 mt-1">Generate and download comprehensive system reports</p>
      </div>
      
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
          <select className="px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none">
            <option>Last 30 Days</option>
            <option>Last 3 Months</option>
            <option>Last Year</option>
          </select>
          <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg font-medium transition-all hover:-translate-y-1 shadow-lg shadow-blue-600/30">
            Generate Report
            </button>
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
            <h3 className="text-white font-semibold mb-2">Financial Summary</h3>
            <p className="text-gray-400 text-sm mb-4">Revenue and cost analysis</p>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors">
              Download
            </button>
          </div>
          
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 transition-all hover:border-blue-500">
            <h3 className="text-white font-semibold mb-2">Performance Analytics</h3>
            <p className="text-gray-400 text-sm mb-4">KPI trends and insights</p>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors">
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// System Settings Component
function SystemSettings() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">System Settings</h2>
        <p className="text-gray-400 mt-1">Configure system-wide settings and preferences</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
          <h3 className="text-blue-400 text-lg font-semibold mb-6">General Settings</h3>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium">System Name</label>
              <input 
                type="text" 
                defaultValue="Sparrow Logistics" 
                className="px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium">Default Timezone</label>
              <select className="px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none">
                <option>UTC+0</option>
                <option>UTC+5:30</option>
                <option>UTC-5</option>
                <option>UTC+8</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium">Language</label>
              <select className="px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
          <h3 className="text-blue-400 text-lg font-semibold mb-6">Security Settings</h3>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium">Password Policy</label>
              <select className="px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none">
                <option>Strong (8+ chars, mixed case, numbers, symbols)</option>
                <option>Medium (6+ chars, mixed case, numbers)</option>
                <option>Basic (6+ chars)</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium">Session Timeout (minutes)</label>
              <input 
                type="number" 
                defaultValue="60" 
                className="px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium">Two-Factor Authentication</label>
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="2fa" 
                  className="w-4 h-4 bg-gray-900 border border-gray-600 rounded focus:border-blue-500"
                />
                <label htmlFor="2fa" className="text-gray-300 text-sm">Enable for all users</label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
          <h3 className="text-blue-400 text-lg font-semibold mb-6">Notification Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">Email Notifications</p>
                <p className="text-gray-400 text-xs">System alerts via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">SMS Notifications</p>
                <p className="text-gray-400 text-xs">Critical alerts via SMS</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">Push Notifications</p>
                <p className="text-gray-400 text-xs">Real-time browser notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
          <h3 className="text-blue-400 text-lg font-semibold mb-6">System Maintenance</h3>
          <div className="space-y-4">
            <button className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
              Run System Backup
            </button>
            <button className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors">
              Clear Cache
            </button>
            <button className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
              Generate System Report
            </button>
            <button className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
              Reset System Logs
            </button>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
        <button className="px-6 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200 rounded-lg font-medium transition-colors">
          Cancel Changes
        </button>
        <button className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all hover:-translate-y-1 shadow-lg shadow-green-600/30">
          Save Settings
        </button>
      </div>
    </div>
  );
}