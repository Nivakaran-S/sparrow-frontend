"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import StaffNavigation from "./components/StaffNavigation";
import StaffSidebar from "./components/StaffSidebar";

import StaffOverview from "./pages/StaffOverview";
import ParcelConsolidation from "./pages/ParcelConsolidation";
import ParcelManagement from "./pages/ParcelManagement";
import PerformanceReports from "./pages/PerformanceReports";
import RoutePlanning from "./pages/RoutePlanning";
import WarehouseManagement from "./pages/WarehouseManagement";
import LiveTracking from "./pages/LiveTracking";

export default function StaffDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white text-xl">
        Loading...
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <StaffNavigation />

      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <StaffSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

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


// Parcel Management Component


// Warehouse Management Component


// Parcel Consolidation Component


// Route Planning Component


// Live Tracking Component


// Performance Reports Component
