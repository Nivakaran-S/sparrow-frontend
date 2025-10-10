"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminNavigation from "./components/AdminNavigation";
import Sidebar from "./components/Sidebar";
import AdminOverview from "./pages/AdminOverview";
import UserManagement from "./pages/UserManagement";
import RoleManagement from "./pages/RoleManagement";

import KPIMonitoring from "./pages/KPIMonitoring";
import SystemLogs from "./pages/SystemLogs";
import Reports from "./pages/Reports";
import SystemSettings from "./pages/SystemSettings";
import SwiftScreen from "./pages/SwiftScreen";
import AdminPricing from "./pages/AdminPricing";
import AdminProfile from "./pages/AdminProfile";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-gateway-nine-orpin.vercel.app";


export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
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
        
        if (data.role !== "Admin") {
          router.push("/login");
          return;
        }
  
        // Fetch admin details
        const adminResponse = await fetch(`${API_BASE_URL}/api/users/admin/${data.id}`, {
          credentials: 'include',
        });
  
        if (adminResponse.ok) {
          const adminData = await adminResponse.json();
          const admin = adminData[0];
          
          setUser({
            id: data.id,
            role: data.role,
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            phoneNumber: admin.phoneNumber,
            gender: admin.gender
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
    <div className="min-h-screen bg-orange-500 text-white">
      {/* Header */}
      <AdminNavigation user={user} setActiveTab={setActiveTab} />

      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content */}
        <main className="flex-1 p-8 ml-[18vw] min-h-[90vh] mt-[10vh] overflow-y-auto bg-[#1D1D1D]">
          {activeTab === 'overview' && <AdminOverview setActiveTab={setActiveTab} />}
          {activeTab === 'users' && <UserManagement setActiveTab={setActiveTab} />}
          {activeTab === 'roles' && <RoleManagement setActiveTab={setActiveTab}/>}
          {activeTab === 'pricing' && <AdminPricing setActiveTab={setActiveTab}/>}
          {activeTab === 'profile' && <AdminProfile setActiveTab={setActiveTab}/>}
          {activeTab === 'kpis' && <KPIMonitoring setActiveTab={setActiveTab}/>}
          {activeTab === 'logs' && <SystemLogs setActiveTab={setActiveTab}/>}
          {activeTab === 'reports' && <Reports setActiveTab={setActiveTab}/>}
          {activeTab === 'swift' && <SwiftScreen setActiveTab={setActiveTab}/>}
        </main>
      </div>
    </div>
  );
}