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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-gateway-nine-orpin.vercel.app";

export default function StaffDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/check-cookie`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        router.push("/login");
        return;
      }

      const data = await response.json();
      
      if (data.role !== "Staff") {
        router.push("/login");
        return;
      }

      // Fetch staff details
      const staffResponse = await fetch(`${API_BASE_URL}/api/users/staff/${data.id}`, {
        credentials: 'include',
      });

      if (staffResponse.ok) {
        const staffData = await staffResponse.json();
        const staff = staffData[0];
        
        setUser({
          id: data.id,
          role: data.role,
          firstName: staff.firstName,
          lastName: staff.lastName,
          email: staff.email,
          phoneNumber: staff.phoneNumber,
          gender: staff.gender
        });
      } else {
        setUser({
          id: data.id,
          role: data.role,
        });
      }
    } catch (error) {
      console.error("Authentication error:", error);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white text-xl">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <span className="ml-4">Loading...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-yellow-500 text-white">
      <StaffNavigation user={user} />

      <div className="flex min-h-[calc(100vh-80px)]">
        <StaffSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 p-8 ml-[18vw] mt-[10vh] overflow-y-auto min-h-[90vh] bg-[#1D1D1D]">
          {activeTab === "overview" && <StaffOverview userId={user?.id} />}
          {activeTab === "parcels" && <ParcelManagement userId={user?.id} />}
          {activeTab === "warehouse" && <WarehouseManagement userId={user?.id} />}
          {activeTab === "consolidation" && <ParcelConsolidation userId={user?.id} />}
          {activeTab === "routes" && <RoutePlanning userId={user?.id} />}
          {activeTab === "tracking" && <LiveTracking userId={user?.id} />}
          {activeTab === "reports" && <PerformanceReports userId={user?.id} />}
        </main>
      </div>
    </div>
  );
}