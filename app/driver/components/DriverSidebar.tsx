"use client";
import { useState } from "react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const DriverSidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div>
      <nav className="w-64 fixed h-[93vh] z-[99] top-[9vh] bg-gradient-to-b from-gray-900 to-gray-950 border-r border-gray-700 p-0 overflow-y-auto">
        <div className="pt-[40px]">
          {/* Dashboard Section */}
          <div className="px-6 mb-3">
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-3">
              Dashboard
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
                <span className="font-medium">Overview</span>
              </button>
              <button
                className={`w-full flex cursor-pointer items-center rounded-[10px] gap-3 px-5 py-3 text-left transition-all border-l-4 ${
                  activeTab === "profile"
                    ? "bg-gray-800 text-blue-400 border-l-blue-400"
                    : "text-gray-300 border-l-transparent hover:bg-gray-800 hover:text-blue-400 hover:border-l-blue-400"
                }`}
                onClick={() => setActiveTab("profile")}
              >
                <span className="font-medium">Driver Profile</span>
              </button>
              
            </div>
          </div>

          {/* Delivery Section */}
          <div className="px-6 mb-3">
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4">
              Delivery
            </h3>
            <div className="space-y-1">
              <button
                className={`w-full flex cursor-pointer items-center rounded-[10px] gap-3 px-5 py-3 text-left transition-all border-l-4 ${
                  activeTab === "current"
                    ? "bg-gray-800 text-blue-400 border-l-blue-400"
                    : "text-gray-300 border-l-transparent hover:bg-gray-800 hover:text-blue-400 hover:border-l-blue-400"
                }`}
                onClick={() => setActiveTab("current")}
              >
                <span className="font-medium">Current Deliveries</span>
              </button>
              
              
            </div>
          </div>

          {/* Performance Section */}
          <div className="px-6">
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4">
              Performance
            </h3>
            <div className="space-y-1">
              <button
                className={`w-full flex cursor-pointer items-center rounded-[10px] gap-3 px-5 py-3 text-left transition-all border-l-4 ${
                  activeTab === "earnings"
                    ? "bg-gray-800 text-blue-400 border-l-blue-400"
                    : "text-gray-300 border-l-transparent hover:bg-gray-800 hover:text-blue-400 hover:border-l-blue-400"
                }`}
                onClick={() => setActiveTab("earnings")}
              >
                <span className="font-medium">Earnings</span>
              </button>
              <button
                className={`w-full flex cursor-pointer items-center rounded-[10px] gap-3 px-5 py-3 text-left transition-all border-l-4 ${
                  activeTab === "history"
                    ? "bg-gray-800 text-blue-400 border-l-blue-400"
                    : "text-gray-300 border-l-transparent hover:bg-gray-800 hover:text-blue-400 hover:border-l-blue-400"
                }`}
                onClick={() => setActiveTab("history")}
              >
                <span className="font-medium">Delivery History</span>
              </button>
              <button
                className={`w-full flex cursor-pointer items-center rounded-[10px] gap-3 px-5 py-3 text-left transition-all border-l-4 ${
                  activeTab === "analytics"
                    ? "bg-gray-800 text-blue-400 border-l-blue-400"
                    : "text-gray-300 border-l-transparent hover:bg-gray-800 hover:text-blue-400 hover:border-l-blue-400"
                }`}
                onClick={() => setActiveTab("analytics")}
              >
                <span className="font-medium">Performance Analytics</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default DriverSidebar;