'use client'
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { tokenManager } from "../../api/AuthenticationApi";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const AdminNavigation = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Just get user info from token manager
    const userId = tokenManager.getUserId();
    const username = tokenManager.getUsername();
    const roles = tokenManager.getRoles();
    
    if (userId && username) {
      setUser({
        id: userId,
        name: username,
        email: "", // Can be fetched from API if needed
        role: roles.includes("ADMIN") ? "ADMIN" : ""
      });
    }
    setIsLoading(false);
  }, []);

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

  const handleLogout = () => {
    tokenManager.clearTokens();
    router.push("/login");
  };

  const notifications = [
    { id: 1, text: "New patient registration requires approval", time: "10 mins ago" },
    { id: 2, text: "Appointment scheduled for tomorrow", time: "1 hour ago" },
    { id: 3, text: "Inventory low on medical supplies", time: "2 hours ago" },
  ];



  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white text-xl">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-4">Loading...</span>
      </div>
    );
  }

  return (
    <div className="fixed w-full z-[9999]">
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 px-4 md:px-8 py-4 sticky top-0 z-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl md:text-3xl font-bold text-white">Admin Dashboard</h1>
          </div>
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

            {/* User Profile */}
            <div className="relative" ref={dropdownRef}>
              <div 
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.name?.charAt(0) || "U"}
                </div>
                <span className="text-white font-medium hidden md:inline">{user?.name || "User"}</span>
                <svg 
                  className={`w-4 h-4 text-white transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-700">
                    <p className="text-white text-sm font-medium">{user?.name}</p>
                    <p className="text-gray-400 text-xs truncate">Admin Account</p>
                  </div>
                  <button className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700">
                    Profile Settings
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700">
                    Help & Support
                  </button>
                  <div className="border-t border-gray-700"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300"
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