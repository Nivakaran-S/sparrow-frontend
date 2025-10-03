'use client'
import { useState } from "react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const StaffSidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div>
      <nav className="w-64 fixed h-[93vh] z-[99] top-[9vh] bg-gradient-to-b from-gray-900 to-gray-950 border-r border-gray-700 p-0 overflow-y-auto">
        <div className="pt-6">
          {/* Operations Section */}
          <div className="px-6 mb-3">
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-3">
              Operations
            </h3>
            <div className="space-y-1">
              <button
                className={`w-full flex cursor-pointer items-center rounded-[10px] gap-3 px-5 py-3 text-left transition-all border-l-4 ${
                  activeTab === "overview"
                    ? "bg-gray-800 text-blue-400 border-l-blue-400"
                    : "text-gray-300 border-l-transparent hover:bg-gray-800 hover:text-blue-400 hover:border-l-blue-400"
                }`}
                onClick={() => setActiveTab("overview")}
              >
                <span className="font-medium">Dashboard</span>
              </button>
              
              <button
                className={`w-full flex cursor-pointer items-center rounded-[10px] gap-3 px-5 py-3 text-left transition-all border-l-4 ${
                  activeTab === "parcels"
                    ? "bg-gray-800 text-blue-400 border-l-blue-400"
                    : "text-gray-300 border-l-transparent hover:bg-gray-800 hover:text-blue-400 hover:border-l-blue-400"
                }`}
                onClick={() => setActiveTab("parcels")}
              >
                <span className="font-medium">Parcel Management</span>
              </button>
              
              <button
                className={`w-full flex cursor-pointer items-center rounded-[10px] gap-3 px-5 py-3 text-left transition-all border-l-4 ${
                  activeTab === "warehouse"
                    ? "bg-gray-800 text-blue-400 border-l-blue-400"
                    : "text-gray-300 border-l-transparent hover:bg-gray-800 hover:text-blue-400 hover:border-l-blue-400"
                }`}
                onClick={() => setActiveTab("warehouse")}
              >
                <span className="font-medium">Warehouse Management</span>
              </button>
            </div>
          </div>

          {/* Logistics Section */}
          <div className="px-6 mb-3">
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4">
              Logistics
            </h3>
            <div className="space-y-1">
              <button
                className={`w-full flex cursor-pointer items-center rounded-[10px] gap-3 px-5 py-3 text-left transition-all border-l-4 ${
                  activeTab === "consolidation"
                    ? "bg-gray-800 text-blue-400 border-l-blue-400"
                    : "text-gray-300 border-l-transparent hover:bg-gray-800 hover:text-blue-400 hover:border-l-blue-400"
                }`}
                onClick={() => setActiveTab("consolidation")}
              >
                <span className="font-medium">Parcel Consolidation</span>
              </button>
              
              <button
                className={`w-full flex cursor-pointer items-center rounded-[10px] gap-3 px-5 py-3 text-left transition-all border-l-4 ${
                  activeTab === "routes"
                    ? "bg-gray-800 text-blue-400 border-l-blue-400"
                    : "text-gray-300 border-l-transparent hover:bg-gray-800 hover:text-blue-400 hover:border-l-blue-400"
                }`}
                onClick={() => setActiveTab("routes")}
              >
                <span className="font-medium">Route Planning</span>
              </button>
              
              <button
                className={`w-full flex cursor-pointer items-center rounded-[10px] gap-3 px-5 py-3 text-left transition-all border-l-4 ${
                  activeTab === "tracking"
                    ? "bg-gray-800 text-blue-400 border-l-blue-400"
                    : "text-gray-300 border-l-transparent hover:bg-gray-800 hover:text-blue-400 hover:border-l-blue-400"
                }`}
                onClick={() => setActiveTab("tracking")}
              >
                <span className="font-medium">Live Tracking</span>
              </button>
            </div>
          </div>

          {/* Reports Section */}
          <div className="px-6">
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4">
              Reports
            </h3>
            <div className="space-y-1">
              <button
                className={`w-full flex cursor-pointer items-center rounded-[10px] gap-3 px-5 py-3 text-left transition-all border-l-4 ${
                  activeTab === "reports"
                    ? "bg-gray-800 text-blue-400 border-l-blue-400"
                    : "text-gray-300 border-l-transparent hover:bg-gray-800 hover:text-blue-400 hover:border-l-blue-400"
                }`}
                onClick={() => setActiveTab("reports")}
              >
                <span className="font-medium">Performance Reports</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default StaffSidebar;