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
import SwiftScreen from "./pages/SwiftScreen";
import { User } from "../types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-gateway-nine-orpin.vercel.app";

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<User | null>(null);
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

      if (data.role !== "Customer") {
        router.push("/login");
        return;
      }

      // Fetch customer details
      const customerResponse = await fetch(`${API_BASE_URL}/api/users/customer/${data.id}`, {
        credentials: 'include',
      });

      if (customerResponse.ok) {
        const customerData = await customerResponse.json();
        const customer = customerData[0];

        setUser({
          id: data.id,
          role: data.role,
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phoneNumber: customer.phoneNumber,
          gender: customer.gender
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
    <div className="min-h-screen bg-blue-900 text-white">
      <CustomerNavigation user={user} setActiveTab={setActiveTab} />
      <div className="flex min-h-[calc(100vh-80px)]">
        <CustomerSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-8 ml-[18vw] min-h-[90vh] mt-[10vh] overflow-y-auto bg-[#1A1A1A]">
          {activeTab === 'overview' && <CustomerOverview setActiveTab={setActiveTab} />}
          {activeTab === 'profile' && <CustomerProfile setActiveTab={setActiveTab} />}
          {activeTab === 'billing' && <BillingPayment setActiveTab={setActiveTab} />}
          {activeTab === 'parcels' && <MyParcels setActiveTab={setActiveTab} />}
          {activeTab === 'tracking' && <TrackShipments setActiveTab={setActiveTab} />}
          {activeTab === 'newShipment' && <NewShipment setActiveTab={setActiveTab} />}
          {activeTab === 'support' && <HelpSupport setActiveTab={setActiveTab} />}
          {activeTab === 'swift' && <SwiftScreen setActiveTab={setActiveTab} />}
          {activeTab === 'history' && <OrderHistory setActiveTab={setActiveTab} />}
          {activeTab === 'addresses' && (
            <div className="text-white">
              <h2 className="text-3xl font-bold mb-2">Saved Addresses</h2>
              <p className="text-gray-400 mb-8">Manage your shipping and billing addresses</p>
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-8 text-center">
                <div className="text-6xl mb-4">📍</div>
                <p className="text-gray-400">This feature is coming soon!</p>
              </div>
            </div>
          )}
          {activeTab === 'consolidation' && (
            <div className="text-white">
              <h2 className="text-3xl font-bold mb-2">Consolidation Requests</h2>
              <p className="text-gray-400 mb-8">Combine multiple parcels into one shipment</p>
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-8 text-center">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-gray-400">This feature is coming soon!</p>
              </div>
            </div>
          )}
          {activeTab === 'receipts' && (
            <div className="text-white">
              <h2 className="text-3xl font-bold mb-2">Receipts</h2>
              <p className="text-gray-400 mb-8">View and download your receipts</p>
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-8 text-center">
                <div className="text-6xl mb-4">🧾</div>
                <p className="text-gray-400">This feature is coming soon!</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}