"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CustomerNavigation from "./components/CustomerNavigation";
import CustomerSidebar from "./components/CustomerSidebar";
import CustomerOverview from "./pages/CustomerOverview";
import CustomerProfile from "./pages/CustomerProfile";
import BillingPayment from "./pages/BillingPayment";
import MyParcels from "./pages/MyParcels";
import TrackShipments from "./pages/TrackShipments";
import NewShipment from "./pages/NewShipment";
import HelpSupport from "./pages/HelpSupport";
import OrderHistory from "./pages/OrderHistory";

// Base API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-gateway-nine-orpin.vercel.app";

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/check-cookie`, {
          method: 'GET',
          credentials: 'include', // Important: Send cookies with request
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          // Unauthorized - redirect to login
          router.push("/login");
          return;
        }

        const data = await response.json();
        
        // Check if user has customer role
        if (data.role !== "Customer") {
          router.push("/login");
          return;
        }

        setUser({
          id: data.id,
          role: data.role,
        });
      } catch (error) {
        console.error("Authentication error:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white text-xl">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      <span className="ml-4">Loading...</span>
    </div>
  );


  return (
    <div className="min-h-screen bg-black text-white">
      <CustomerNavigation user={user} />
      <div className="flex min-h-[calc(100vh-80px)]">
        <CustomerSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-8 ml-[18vw] mt-[10vh] overflow-y-auto bg-black">
          {activeTab === 'overview' && <CustomerOverview />}
          {activeTab === 'profile' && <CustomerProfile />}
          {activeTab === 'billing' && <BillingPayment />}
          {activeTab === 'parcels' && <MyParcels />}
          {activeTab === 'tracking' && <TrackShipments />}
          {activeTab === 'shipping' && <NewShipment />}
          {activeTab === 'support' && <HelpSupport />}
          {activeTab === 'history' && <OrderHistory />}
        </main>
      </div>
    </div>
  );
}

// Component placeholders (add your actual implementations)












