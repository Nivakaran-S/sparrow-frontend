"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LiveMap from "@/components/LiveMap";
import { demoParcels } from "@/data/demoParcels";
import { demoHistory } from "@/data/demoHistory";
import StatusTimeline from "@/components/StatusTimeline";
import { useLiveParcels } from "@/hooks/useLiveParcels";
import StaffNavigation from "./components/StaffNavigation";
import StaffSidebar from "./components/StaffSidebar";

export default function StaffDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== "staff") {
        router.push("/login");
        return;
      }
      setUser(parsedUser);
    } else {
      router.push("/login");
    }
  }, [router]);

  if (!user) return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white text-xl">
      Loading...
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <StaffNavigation/>

      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <StaffSidebar activeTab={activeTab} setActiveTab={setActiveTab}/>

        {/* Main Content */}
        <main className="flex-1 p-8 ml-[18vw] mt-[10vh] overflow-y-auto bg-black">
          {activeTab === "overview" && <StaffOverview />}
          {activeTab === "parcels" && <ParcelManagement />}
          {activeTab === "warehouse" && <WarehouseManagement />}
          {activeTab === "consolidation" && <ParcelConsolidation />}
          {activeTab === "routes" && <RoutePlanning />}
          {activeTab === "tracking" && <LiveTracking />}
          {activeTab === "reports" && <PerformanceReports />}
        </main>
      </div>
    </div>
  );
}

// Staff Overview Component
function StaffOverview() {
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

// Parcel Management Component
function ParcelManagement() {
  const [parcels] = useState([
    {
      id: "SP2024001",
      sender: "John Doe",
      recipient: "Alice Smith",
      destination: "New York",
      status: "Pending",
      weight: "2.5kg",
    },
    {
      id: "SP2024002",
      sender: "Bob Wilson",
      recipient: "Carol Johnson",
      destination: "Los Angeles",
      status: "Processing",
      weight: "1.8kg",
    },
    {
      id: "SP2024003",
      sender: "David Brown",
      recipient: "Eva Davis",
      destination: "Chicago",
      status: "Ready",
      weight: "3.2kg",
    },
    {
      id: "SP2024004",
      sender: "Frank Miller",
      recipient: "Grace Lee",
      destination: "Houston",
      status: "In Transit",
      weight: "1.1kg",
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Parcel Management</h2>
          <p className="text-gray-400 mt-1">Manage and track all parcel operations</p>
        </div>
        <button 
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all hover:-translate-y-1 shadow-lg shadow-blue-600/30"
          onClick={() => setShowAddForm(true)}
        >
          Add New Parcel
        </button>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-white text-xl font-semibold mb-6">Add New Parcel</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Sender Name</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Enter sender name" 
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Recipient Name</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Enter recipient name" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Destination</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Enter destination" 
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Weight</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Enter weight" 
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200 rounded-lg font-medium transition-colors"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all"
                >
                  Add Parcel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-white text-lg font-semibold">All Parcels</h3>
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="Search parcels..." 
              className="px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
            />
            <select className="px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none">
              <option>All Status</option>
              <option>Pending</option>
              <option>Processing</option>
              <option>Ready</option>
              <option>In Transit</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-900">
                <th className="text-white px-6 py-4 text-left font-semibold text-sm">Parcel ID</th>
                <th className="text-white px-6 py-4 text-left font-semibold text-sm">Sender</th>
                <th className="text-white px-6 py-4 text-left font-semibold text-sm">Recipient</th>
                <th className="text-white px-6 py-4 text-left font-semibold text-sm">Destination</th>
                <th className="text-white px-6 py-4 text-left font-semibold text-sm">Weight</th>
                <th className="text-white px-6 py-4 text-left font-semibold text-sm">Status</th>
                <th className="text-white px-6 py-4 text-left font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {parcels.map((parcel, index) => (
                <tr key={parcel.id} className={`border-b border-gray-700 hover:bg-blue-500/5 transition-colors ${index === parcels.length - 1 ? 'border-b-0' : ''}`}>
                  <td className="px-6 py-4 text-blue-400 font-medium text-sm">{parcel.id}</td>
                  <td className="px-6 py-4 text-gray-300 text-sm">{parcel.sender}</td>
                  <td className="px-6 py-4 text-gray-300 text-sm">{parcel.recipient}</td>
                  <td className="px-6 py-4 text-gray-300 text-sm">{parcel.destination}</td>
                  <td className="px-6 py-4 text-gray-300 text-sm">{parcel.weight}</td>
                  <td className="px-6 py-4 text-gray-300 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      parcel.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      parcel.status === 'Processing' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      parcel.status === 'Ready' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      'bg-purple-500/20 text-purple-400 border-purple-500/30'
                    }`}>
                      {parcel.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300 text-sm">
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors">
                        Edit
                      </button>
                      <button className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors">
                        Track
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

// Warehouse Management Component
function WarehouseManagement() {
  const [warehouses] = useState([
    {
      id: "WH-001",
      name: "Central Warehouse",
      location: "Downtown",
      capacity: 1000,
      occupied: 785,
      status: "Active",
    },
    {
      id: "WH-002",
      name: "North Warehouse",
      location: "North District",
      capacity: 800,
      occupied: 450,
      status: "Active",
    },
    {
      id: "WH-003",
      name: "South Warehouse",
      location: "South District",
      capacity: 600,
      occupied: 590,
      status: "Nearly Full",
    },
  ]);

  const [showRegisterForm, setShowRegisterForm] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Warehouse Management</h2>
          <p className="text-gray-400 mt-1">Monitor and manage warehouse operations</p>
        </div>
        <button 
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all hover:-translate-y-1 shadow-lg shadow-blue-600/30"
          onClick={() => setShowRegisterForm(true)}
        >
          Register New Warehouse
        </button>
      </div>

      {showRegisterForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-white text-xl font-semibold mb-6">Register New Warehouse</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Warehouse Name</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Enter warehouse name" 
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Location</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Enter location" 
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Capacity</label>
                <input 
                  type="number" 
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Enter capacity" 
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200 rounded-lg font-medium transition-colors"
                  onClick={() => setShowRegisterForm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all"
                >
                  Register Warehouse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {warehouses.map((warehouse) => (
          <div key={warehouse.id} className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/15">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-blue-400 text-xl font-semibold">{warehouse.name}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
                warehouse.status === 'Active' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
              }`}>
                {warehouse.status}
              </span>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-400 text-sm mb-3 flex items-center gap-2">
                <span>📍</span>
                {warehouse.location}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Capacity</span>
                  <span className="text-white font-medium">{warehouse.occupied}/{warehouse.capacity}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${(warehouse.occupied / warehouse.capacity) * 100}%`,
                    }}
                  ></div>
                </div>
                <div className="text-right text-xs text-gray-400">
                  {Math.round((warehouse.occupied / warehouse.capacity) * 100)}% occupied
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors">
                View Details
              </button>
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200 rounded-lg text-xs font-medium transition-colors">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Parcel Consolidation Component
function ParcelConsolidation() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">Parcel Consolidation</h2>
        <p className="text-gray-400 mt-1">Group parcels by destination for efficient delivery</p>
      </div>

      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <div className="flex items-center gap-2">
            <label className="text-gray-400 text-sm font-medium">Group by Location:</label>
            <select className="px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none">
              <option>All Locations</option>
              <option>New York</option>
              <option>Los Angeles</option>
              <option>Chicago</option>
            </select>
          </div>
          <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg font-medium transition-all hover:-translate-y-1 shadow-lg shadow-blue-600/30">
            Auto Consolidate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/15">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-500/20 rounded-full w-10 h-10 flex items-center justify-center text-blue-400 text-lg">
              📍
            </div>
            <h3 className="text-blue-400 text-xl font-semibold">New York Zone</h3>
          </div>
          <p className="text-gray-400 mb-4">12 parcels • Total weight: 15.8kg</p>
          <div className="space-y-2 mb-6">
            <div className="flex items-center justify-between p-2 bg-gray-900 border border-gray-700 rounded text-sm">
              <span className="text-gray-300">SP2024001</span>
              <span className="text-gray-400">2.5kg</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-900 border border-gray-700 rounded text-sm">
              <span className="text-gray-300">SP2024005</span>
              <span className="text-gray-400">1.8kg</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-900 border border-gray-700 rounded text-sm">
              <span className="text-gray-300">SP2024012</span>
              <span className="text-gray-400">3.2kg</span>
            </div>
            <div className="text-center p-2 text-gray-400 text-sm">+9 more parcels</div>
          </div>
          <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            Create Route
          </button>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/15">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-500/20 rounded-full w-10 h-10 flex items-center justify-center text-green-400 text-lg">
              📍
            </div>
            <h3 className="text-blue-400 text-xl font-semibold">Chicago Zone</h3>
          </div>
          <p className="text-gray-400 mb-4">8 parcels • Total weight: 11.2kg</p>
          <div className="space-y-2 mb-6">
            <div className="flex items-center justify-between p-2 bg-gray-900 border border-gray-700 rounded text-sm">
              <span className="text-gray-300">SP2024003</span>
              <span className="text-gray-400">3.2kg</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-900 border border-gray-700 rounded text-sm">
              <span className="text-gray-300">SP2024008</span>
              <span className="text-gray-400">2.1kg</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-900 border border-gray-700 rounded text-sm">
              <span className="text-gray-300">SP2024015</span>
              <span className="text-gray-400">1.9kg</span>
            </div>
            <div className="text-center p-2 text-gray-400 text-sm">+5 more parcels</div>
          </div>
          <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            Create Route
          </button>
        </div>
      </div>
    </div>
  );
}

// Route Planning Component
function RoutePlanning() {
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

// Live Tracking Component
function LiveTracking() {
  const { parcels, source } = useLiveParcels();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [cityFilter, setCityFilter] = React.useState<string>("All");

  const cityGroups = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const p of parcels) {
      const key = p.city ?? "Unknown";
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    const rows = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    return rows;
  }, [parcels]);

  const filteredParcels = React.useMemo(() => {
    if (cityFilter === "All") return parcels;
    return parcels.filter(p => (p.city ?? "Unknown") === cityFilter);
  }, [parcels, cityFilter]);

  React.useEffect(() => {
    if (filteredParcels.length === 0) { setSelectedId(null); return; }
    if (!selectedId || !filteredParcels.some(p => p.id === selectedId)) {
      setSelectedId(filteredParcels[0].id);
    }
  }, [filteredParcels, selectedId]);

  const { demoHistory } = require("@/data/demoHistory");
  const selectedHistory = selectedId ? (demoHistory[selectedId] ?? []) : [];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">Live Tracking</h2>
        <p className="text-gray-400 mt-1">Real-time parcel location and status monitoring</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 ">
            <LiveMap
              parcels={filteredParcels as any}
              selectedId={selectedId}
              onSelect={(id) => setSelectedId(id)}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-blue-400 text-lg font-semibold">
                Active Deliveries ({source})
              </h3>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="px-2 py-1 bg-gray-900 border border-gray-600 rounded text-white text-xs focus:border-blue-500 focus:outline-none"
              >
                <option value="All">All Cities</option>
                {cityGroups.map(([city]) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2 mb-4">
              <div className="text-xs text-gray-400 mb-2">Consolidation by City</div>
              <button
                onClick={() => setCityFilter("All")}
                className={`w-full p-2 text-left rounded transition-colors ${
                  cityFilter === "All" 
                    ? "bg-blue-500/20 border border-blue-500/30 text-blue-400" 
                    : "bg-gray-900 border border-gray-700 text-gray-300 hover:bg-gray-800"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">All Cities</span>
                  <span className="text-xs">Count: {parcels.length}</span>
                </div>
              </button>
              {cityGroups.map(([city, count]) => (
                <button
                  key={city}
                  onClick={() => setCityFilter(city)}
                  className={`w-full p-2 text-left rounded transition-colors ${
                    cityFilter === city 
                      ? "bg-blue-500/20 border border-blue-500/30 text-blue-400" 
                      : "bg-gray-900 border border-gray-700 text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{city}</span>
                    <span className="text-xs">Count: {count}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filteredParcels.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`w-full p-3 text-left rounded transition-colors ${
                    p.id === selectedId
                      ? "bg-blue-500/20 border border-blue-500/30"
                      : "bg-gray-900 border border-gray-700 hover:bg-gray-800"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm font-medium ${
                      p.id === selectedId ? "text-blue-400" : "text-white"
                    }`}>
                      {p.code}
                    </span>
                    <span className="text-xs text-gray-400">Status: {p.status}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    City: {p.city ?? "—"} • ETA: {p.eta ?? "—"}
                  </div>
                </button>
              ))}
              {filteredParcels.length === 0 && (
                <div className="text-center py-4 text-gray-400 text-sm">
                  No parcels in this city.
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
            <h4 className="text-blue-400 text-lg font-semibold mb-4">
              Status History {selectedId ? `(${selectedId})` : ""}
            </h4>
            <div className="max-h-60 overflow-y-auto">
              <StatusTimeline events={selectedHistory} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Performance Reports Component
function PerformanceReports() {
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