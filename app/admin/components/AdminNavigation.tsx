"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-gateway-nine-orpin.vercel.app";

type UserResponse = {
  firstName?: string;
  lastName?: string;
  email?: string;
};

const AdminNavigation = ({ user }: { user?: UserResponse }) => {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const notifications = [
    { id: 1, text: "Your parcel TRK001 has been shipped", time: "10 mins ago", type: "info" },
    { id: 2, text: "Parcel TRK002 is out for delivery", time: "1 hour ago", type: "success" },
    { id: 3, text: "New shipping rates available", time: "2 hours ago", type: "info" },
  ];

  

  return (
    <div className="fixed w-[100vw]  top-0 z-[9999]">
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 px-8 py-4 sticky top-0 z-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-3xl">📦</span>
              <h1 className="text-3xl font-bold text-white">Sparrow</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Quick Actions */}
            <div className="hidden md:flex items-center gap-3">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                + New Shipment
              </button>
            </div>

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <div 
                className="relative bg-gray-800 border border-gray-600 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-gray-700 hover:border-blue-500 transition-all"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              >
                <span className="text-lg">🔔</span>
                {notifications.length > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {notifications.length}
                  </div>
                )}
              </div>
              
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-700">
                    <h3 className="text-white font-semibold">Notifications</h3>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map(notification => (
                        <div key={notification.id} className="px-4 py-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0">
                          <p className="text-white text-sm">{notification.text}</p>
                          <p className="text-gray-400 text-xs mt-1">{notification.time}</p>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-gray-400 text-sm">No new notifications</div>
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-700">
                    <button className="text-blue-400 text-sm hover:text-blue-300 w-full text-center">
                      Mark all as read
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="relative" ref={dropdownRef}>
              <div 
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-800 rounded-lg px-3 py-2 transition-colors"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.firstName?.charAt(0) || 'U'}
                </div>
                <div className="hidden md:block">
                  <span className="text-white font-medium">{user?.firstName} {user?.lastName}</span>
                  <p className="text-gray-400 text-xs">{user?.email}</p>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-2 z-50">
                  <button className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 transition-colors">
                    Profile Settings
                  </button>
                  <button className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 transition-colors">
                    Billing & Payment
                  </button>
                  <div className="border-t border-gray-700 my-2"></div>
                  <button 
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default AdminNavigation;