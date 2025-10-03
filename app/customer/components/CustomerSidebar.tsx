'use client'
import { useState } from "react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const CustomerSidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div>
      <nav className="w-64 fixed h-[93vh] z-[99] top-[9vh] bg-gradient-to-b from-gray-900 to-gray-950 border-r border-gray-700 p-0 overflow-y-auto">
        <div className="pt-8">
          {/* My Account Section */}
          <div className="px-6 mb-8">
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4">
              My Account
            </h3>
            <div className="space-y-1">
              <button
                className={`w-full flex cursor-pointer items-center rounded-[10px] gap-3 px-3 py-2.5 text-left transition-all border-l-4 ${
                  activeTab === "overview"
                    ? "bg-gray-800 text-blue-400 border-l-blue-400"
                    : "text-gray-300 border-l-transparent hover:bg-gray-800 hover:text-blue-400 hover:border-l-blue-400"
                }`}
                onClick={() => setActiveTab("overview")}
              >
                <span className="font-medium">Dashboard Overview</span>
              </button>
              
              <button
                className={`w-full flex cursor-pointer items-center rounded-[10px] gap-3 px-3 py-2.5 text-left transition-all border-l-4 ${
                  activeTab === "profile"
                    ? "bg-gray-800 text-blue-400 border-l-blue-400"
                    : "text-gray-300 border-l-transparent hover:bg-gray-800 hover:text-blue-400 hover:border-l-blue-400"
                }`}
                onClick={() => setActiveTab("profile")}
              >
                <span className="font-medium">My Profile</span>
              </button>
              
              <button
                className={`w-full flex cursor-pointer items-center rounded-[10px] gap-3 px-3 py-2.5 text-left transition-all border-l-4 ${
                  activeTab === "billing"
                    ? "bg-gray-800 text-blue-400 border-l-blue-400"
                    : "text-gray-300 border-l-transparent hover:bg-gray-800 hover:text-blue-400 hover:border-l-blue-400"
                }`}
                onClick={() => setActiveTab("billing")}
              >
                <span className="font-medium">Billing & Payment</span>
              </button>
            </div>
          </div>

          {/* Shipping Section */}
          <div className="px-6 mb-8">
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4">
              Shipping
            </h3>
            <div className="space-y-1">
              <button
                className={`w-full flex cursor-pointer items-center rounded-[10px] gap-3 px-3 py-2.5 text-left transition-all border-l-4 ${
                  activeTab === "parcels"
                    ? "bg-gray-800 text-blue-400 border-l-blue-400"
                    : "text-gray-300 border-l-transparent hover:bg-gray-800 hover:text-blue-400 hover:border-l-blue-400"
                }`}
                onClick={() => setActiveTab("parcels")}
              >
                <span className="font-medium">My Parcels</span>
              </button>
              
              <button
                className={`w-full flex cursor-pointer items-center rounded-[10px] gap-3 px-3 py-2.5 text-left transition-all border-l-4 ${
                  activeTab === "tracking"
                    ? "bg-gray-800 text-blue-400 border-l-blue-400"
                    : "text-gray-300 border-l-transparent hover:bg-gray-800 hover:text-blue-400 hover:border-l-blue-400"
                }`}
                onClick={() => setActiveTab("tracking")}
              >
                <span className="font-medium">Track Shipments</span>
              </button>
              
              <button
                className={`w-full flex cursor-pointer items-center rounded-[10px] gap-3 px-3 py-2.5 text-left transition-all border-l-4 ${
                  activeTab === "shipping"
                    ? "bg-gray-800 text-blue-400 border-l-blue-400"
                    : "text-gray-300 border-l-transparent hover:bg-gray-800 hover:text-blue-400 hover:border-l-blue-400"
                }`}
                onClick={() => setActiveTab("shipping")}
              >
                <span className="font-medium">New Shipment</span>
              </button>
            </div>
          </div>

          {/* Support Section */}
          <div className="px-6">
            <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4">
              Support
            </h3>
            <div className="space-y-1">
              <button
                className={`w-full flex cursor-pointer items-center rounded-[10px] gap-3 px-3 py-2.5 text-left transition-all border-l-4 ${
                  activeTab === "support"
                    ? "bg-gray-800 text-blue-400 border-l-blue-400"
                    : "text-gray-300 border-l-transparent hover:bg-gray-800 hover:text-blue-400 hover:border-l-blue-400"
                }`}
                onClick={() => setActiveTab("support")}
              >
                <span className="font-medium">Help & Support</span>
              </button>
              
              <button
                className={`w-full flex cursor-pointer items-center rounded-[10px] gap-3 px-3 py-2.5 text-left transition-all border-l-4 ${
                  activeTab === "history"
                    ? "bg-gray-800 text-blue-400 border-l-blue-400"
                    : "text-gray-300 border-l-transparent hover:bg-gray-800 hover:text-blue-400 hover:border-l-blue-400"
                }`}
                onClick={() => setActiveTab("history")}
              >
                <span className="font-medium">Order History</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default CustomerSidebar;