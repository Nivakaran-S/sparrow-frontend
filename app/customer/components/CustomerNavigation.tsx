"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter} from "next/navigation";

type UserResponse = {
  firstName?: string;
  lastName?: string;
  // Add other fields as needed
};

const CustomerNavigation = ({ user }: { user?: UserResponse }) => {
  const router = useRouter();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
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
  
  
  
    const notifications = [
      { id: 1, text: "New patient registration requires approval", time: "10 mins ago" },
      { id: 2, text: "Appointment scheduled for tomorrow", time: "1 hour ago" },
      { id: 3, text: "Inventory low on medical supplies", time: "2 hours ago" },
    ];

  
  if (!user) return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white text-xl">
      Loading...
    </div>
  );

  return (
    <div className="fixed  w-[100vw] top-0 z-[9999]">
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 px-8 py-4 sticky top-0 z-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-white">Customer Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <div 
                className="relative bg-gray-800 border border-gray-600 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-gray-700 hover:border-blue-500 transition-all"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              >
                <span className="text-lg">🔔</span>
                <div className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {notifications.length}
                </div>
              </div>
              
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-700">
                    <h3 className="text-white font-semibold">Notifications</h3>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.map(notification => (
                      <div key={notification.id} className="px-4 py-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0">
                        <p className="text-white text-sm">{notification.text}</p>
                        <p className="text-gray-400 text-xs mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-700">
                    <button className="text-blue-400 text-sm hover:text-blue-300 w-full text-center">
                      Mark all as read
                    </button>
                  </div>
                </div>
              )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user.firstName?.charAt(0) || 'U'}
              </div>
              <span className="text-white font-medium">{user.firstName} {user.lastName}</span>
              <button
                className="ml-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white border-none rounded-lg text-sm font-medium cursor-pointer transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default CustomerNavigation;