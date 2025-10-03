"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DriverNavigation from "./components/DriverNavigation";
import DriverSidebar from "./components/DriverSidebar";

export default function DriverDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  
  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white text-xl">
        Loading...
      </div>
    );

  if (!user) return null;

  return (
    <div className="min-h-screen  bg-black text-white flex flex-col">
      {/* Header */}
      <DriverNavigation />

      <div className="flex flex-1">
        {/* Sidebar */}
        <DriverSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content */}
        <main className="p-6 flex-1 ml-[14vw] mt-[10vh] bg-black overflow-y-auto">
          {activeTab === "overview" && <DriverOverview isOnline={isOnline} />}
          {activeTab === "routes" && <MyRoutes />}
          {activeTab === "current" && <CurrentDeliveries />}
          {activeTab === "navigation" && <GPSNavigation />}
          {activeTab === "scanner" && <BarcodeScanner />}
          {activeTab === "earnings" && <Earnings />}
          {activeTab === "history" && <DeliveryHistory />}
          {activeTab === "analytics" && <PerformanceAnalytics />}
        </main>
      </div>
    </div>
  );
}

// ---------------- Driver Overview ----------------
function DriverOverview({ isOnline }: { isOnline: boolean }) {
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

// ---------------- My Routes ----------------
function MyRoutes() {
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

// ---------------- Current Deliveries ----------------
function CurrentDeliveries() {
  const [deliveries] = useState([
    { id: "SP2024089", recipient: "John Smith", address: "123 Main St, Downtown", phone: "+1 (555) 123-4567", status: "In Transit", priority: "High", timeWindow: "2:00 PM - 4:00 PM" },
    { id: "SP2024090", recipient: "Alice Johnson", address: "456 Oak Ave, Midtown", phone: "+1 (555) 987-6543", status: "Next", priority: "Medium", timeWindow: "4:00 PM - 6:00 PM" },
    { id: "SP2024091", recipient: "Bob Wilson", address: "789 Pine Rd, Uptown", phone: "+1 (555) 456-7890", status: "Pending", priority: "Low", timeWindow: "6:00 PM - 8:00 PM" },
  ]);

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-8">
        Current Deliveries
      </h2>
      <div className="space-y-6">
        {deliveries.map((d) => (
          <div
            key={d.id}
            className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 hover:-translate-y-1 hover:border-blue-400 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="text-blue-400 font-semibold">#{d.id}</div>
              <div className="flex gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    d.status === "In Transit"
                      ? "bg-purple-500/20 text-purple-400"
                      : d.status === "Next"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-amber-500/20 text-amber-400"
                  }`}
                >
                  {d.status}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    d.priority === "High"
                      ? "bg-red-500/20 text-red-400"
                      : d.priority === "Medium"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {d.priority}
                </span>
              </div>
            </div>
            <div className="space-y-2 text-gray-400">
              <div>👤 {d.recipient}</div>
              <div>📍 {d.address}</div>
              <div>📞 {d.phone}</div>
              <div>⏰ {d.timeWindow}</div>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 hover:-translate-y-1 transition-all">
                Navigate
              </button>
              <button className="bg-gray-600 text-gray-200 px-4 py-2 rounded-lg border border-gray-500 hover:bg-gray-500 hover:-translate-y-1 transition-all">
                Call Customer
              </button>
              <button className="bg-gray-600 text-gray-200 px-4 py-2 rounded-lg border border-gray-500 hover:bg-gray-500 hover:-translate-y-1 transition-all">
                Mark Delivered
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------- GPS Navigation ----------------
function GPSNavigation() {
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-8">
        GPS Navigation
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <h3 className="text-2xl font-semibold mb-2">🗺️ Live Navigation</h3>
            <p>Current: 100 Market St | Next: 123 Main St (2.3 km)</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Next Delivery</h3>
          <p className="text-gray-400 mb-4">John Smith • 123 Main St • ETA: 15 mins</p>
          <h3 className="text-lg font-semibold text-white mb-4">Directions</h3>
          <ol className="list-decimal list-inside text-gray-400 space-y-2">
            <li>Continue on Market St for 1.2 km</li>
            <li>Turn right onto Main St</li>
            <li>Destination on the right</li>
          </ol>
          <div className="flex gap-2 mt-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 hover:-translate-y-1 transition-all">
              Start Navigation
            </button>
            <button className="bg-gray-600 text-gray-200 px-4 py-2 rounded-lg border border-gray-500 hover:bg-gray-500 hover:-translate-y-1 transition-all">
              Recalculate Route
            </button>
            <button className="bg-gray-600 text-gray-200 px-4 py-2 rounded-lg border border-gray-500 hover:bg-gray-500 hover:-translate-y-1 transition-all">
              Report Traffic
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Barcode Scanner ----------------
function BarcodeScanner() {
  const [scannedCode, setScannedCode] = useState("");

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-8">
        Barcode Scanner
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 mb-6">
            <div className="text-center text-gray-400">
              <div className="text-4xl mb-2">📱</div>
              <h3 className="text-xl font-semibold text-white mb-2">Barcode Scanner</h3>
              <p className="mb-4">Position barcode within the frame</p>
              <div className="border-2 border-gray-500 rounded-lg h-40 flex items-center justify-center relative">
                <div className="bg-blue-500 h-1 w-full absolute top-1/2 transform -translate-y-1/2"></div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Manual Entry</h4>
            <input
              type="text"
              className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-blue-500 outline-none"
              placeholder="Enter barcode manually"
              value={scannedCode}
              onChange={(e) => setScannedCode(e.target.value)}
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 hover:-translate-y-1 transition-all mt-4">
              Submit
            </button>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Scans</h3>
          <div className="space-y-4">
            {[
              { code: "SP2024089", status: "✅ Delivered", time: "2:30 PM" },
              { code: "SP2024088", status: "✅ Delivered", time: "1:45 PM" },
              { code: "SP2024087", status: "✅ Delivered", time: "12:20 PM" },
            ].map((scan, idx) => (
              <div key={idx} className="flex justify-between text-gray-400">
                <span>{scan.code}</span>
                <span>{scan.status}</span>
                <span>{scan.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- Earnings ----------------
function Earnings() {
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-8">
        Earnings & Payments
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { title: "Today", amount: "$245.50", details: "12 deliveries • 156 km" },
          { title: "This Week", amount: "$1,234.75", details: "67 deliveries • 890 km" },
          { title: "This Month", amount: "$4,567.20", details: "286 deliveries • 3,456 km" },
        ].map((earning, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 text-center"
          >
            <h3 className="text-lg font-semibold text-white mb-2">{earning.title}</h3>
            <div className="text-2xl font-bold text-blue-400">{earning.amount}</div>
            <p className="text-gray-400 text-sm">{earning.details}</p>
          </div>
        ))}
      </div>
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Payment Breakdown</h3>
        <div className="space-y-4">
          {[
            { label: "Base Rate", value: "$15.00/hour" },
            { label: "Per Delivery", value: "$3.50/delivery" },
            { label: "Distance Bonus", value: "$0.45/km" },
            { label: "Performance Bonus", value: "+$25.00" },
          ].map((item, idx) => (
            <div key={idx} className="flex justify-between text-gray-400">
              <span>{item.label}</span>
              <span>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------- Delivery History ----------------
function DeliveryHistory() {
  const [history] = useState([
    { date: "2024-01-20", deliveries: 12, distance: "156 km", earnings: "$245.50", rating: 4.9 },
    { date: "2024-01-19", deliveries: 15, distance: "189 km", earnings: "$298.75", rating: 4.8 },
    { date: "2024-01-18", deliveries: 10, distance: "134 km", earnings: "$198.25", rating: 4.7 },
    { date: "2024-01-17", deliveries: 14, distance: "167 km", earnings: "$267.80", rating: 4.8 },
  ]);

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-8">
        Delivery History
      </h2>
      <div className="flex gap-4 mb-6">
        <select className="bg-gray-800 border border-gray-700 text-white p-2 rounded-lg focus:border-blue-500 outline-none">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>Last 3 Months</option>
        </select>
        <button className="bg-gray-600 text-gray-200 px-4 py-2 rounded-lg border border-gray-500 hover:bg-gray-500 hover:-translate-y-1 transition-all">
          Export Data
        </button>
      </div>
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-4 text-white font-semibold">Date</th>
              <th className="p-4 text-white font-semibold">Deliveries</th>
              <th className="p-4 text-white font-semibold">Distance</th>
              <th className="p-4 text-white font-semibold">Earnings</th>
              <th className="p-4 text-white font-semibold">Rating</th>
              <th className="p-4 text-white font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {history.map((day, index) => (
              <tr key={index} className="border-b border-gray-700 hover:bg-blue-500/5">
                <td className="p-4 text-blue-400">{day.date}</td>
                <td className="p-4 text-gray-400">{day.deliveries}</td>
                <td className="p-4 text-gray-400">{day.distance}</td>
                <td className="p-4 text-blue-400">{day.earnings}</td>
                <td className="p-4 text-gray-400">⭐ {day.rating}</td>
                <td className="p-4">
                  <button className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-all">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------- Performance Analytics ----------------
function PerformanceAnalytics() {
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