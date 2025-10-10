"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DriverNavigation from "./components/DriverNavigation";
import DriverSidebar from "./components/DriverSidebar";
import DeliveryHistory from "./pages/DeliveryHistory";
import Earnings from "./pages/Earnings";
import BarcodeScanner from "./pages/BarcodeScanner";
import GPSNavigation from "./pages/GPSNavigation";
import CurrentDeliveries from "./pages/CurrentDeliveries";
import MyRoutes from "./pages/MyRoutes";
import DriverOverview from "./pages/DriverOverview";
import PerformanceAnalytics from "./pages/PerformanceAnalytics";
import DriverProfile from "./pages/DriverProfile";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-gateway-nine-orpin.vercel.app";


export default function DriverDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(false);
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
        
        if (data.role !== "Driver") {
          router.push("/login");
          return;
        }
  
        // Fetch customer details
        const driverResponse = await fetch(`${API_BASE_URL}/api/users/driver/${data.id}`, {
          credentials: 'include',
        });
  
        if (driverResponse.ok) {
          const driverData = await driverResponse.json();
          const driver = driverData[0];
          
          setUser({
            id: data.id,
            role: data.role,
            firstName: driver.firstName,
            lastName: driver.lastName,
            email: driver.email,
            phoneNumber: driver.phoneNumber,
            gender: driver.gender
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
    <div className="min-h-screen  bg-black text-white flex flex-col">
      {/* Header */}
      <DriverNavigation setActiveTab={setActiveTab} user={user}/>

      <div className="flex flex-1">
        {/* Sidebar */}
        <DriverSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content */}
        <main className="p-6 flex-1 ml-[14vw] mt-[12vh] bg-[#1D1D1D] overflow-y-auto">
          {activeTab === "overview" && <DriverOverview setActiveTab={setActiveTab} />}
          {activeTab === "profile" && <DriverProfile setActiveTab={setActiveTab} />}
          {activeTab === "routes" && <MyRoutes setActiveTab={setActiveTab} />}
          {activeTab === "current" && <CurrentDeliveries setActiveTab={setActiveTab} />}
          {activeTab === "navigation" && <GPSNavigation setActiveTab={setActiveTab} />}
          {activeTab === "earnings" && <Earnings setActiveTab={setActiveTab} />}
          {activeTab === "history" && <DeliveryHistory setActiveTab={setActiveTab} />}
          {activeTab === "analytics" && <PerformanceAnalytics setActiveTab={setActiveTab} />}
        </main>
      </div>
    </div>
  );
}

