"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellDot, Check, Plus } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-gateway-nine-orpin.vercel.app";

type UserResponse = {
  firstName?: string;
  lastName?: string;
  email?: string;
};

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdTimestamp: string;
  entityType?: string;
  entityId?: string;
}

interface CustomerNavigationProps {
  user?: UserResponse;
  setActiveTab?: (tab: string) => void;
}

const CustomerNavigation = ({ user, setActiveTab }: CustomerNavigationProps) => {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
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

  useEffect(() => {
    checkAuthAndFetchNotifications();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [userId]);

  const checkAuthAndFetchNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/check-cookie`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUserId(data.id);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    }
  };

  const fetchNotifications = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      
      const notifResponse = await fetch(
        `${API_BASE_URL}/api/notifications/api/notifications/user/${userId}?limit=10`,
        { credentials: "include" }
      );

      if (notifResponse.ok) {
        const notifData = await notifResponse.json();
        setNotifications(notifData);
      }

      const countResponse = await fetch(
        `${API_BASE_URL}/api/notifications/api/notifications/user/${userId}/unread-count`,
        { credentials: "include" }
      );

      if (countResponse.ok) {
        const countData = await countResponse.json();
        setUnreadCount(countData.count);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/api/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/api/notifications/user/${userId}/read-all`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      if (response.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "parcel_update":
        return "📦";
      case "consolidation_update":
        return "🚚";
      case "warehouse_update":
        return "🏭";
      case "payment_update":
        return "💰";
      case "system_alert":
        return "⚠️";
      default:
        return "🔔";
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  if (!user) return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white text-xl">
      Loading...
    </div>
  );

  return (
    <div className="fixed w-[100vw] top-0 z-[9999]">
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
              <button 
                onClick={() => setActiveTab && setActiveTab('newShipment')}
                className="px-4 py-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Shipment
              </button>
            </div>

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <div 
                className="relative bg-gray-800 border border-gray-600 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-gray-700 hover:border-blue-500 transition-all"
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  if (!isNotificationsOpen) {
                    fetchNotifications();
                  }
                }}
              >
                {unreadCount > 0 ? (
                  <BellDot className="w-5 h-5 text-white" />
                ) : (
                  <Bell className="w-5 h-5 text-white" />
                )}
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </div>
                )}
              </div>
              
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-white font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs text-gray-400">{unreadCount} unread</span>
                    )}
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {loading ? (
                      <div className="px-4 py-8 text-center text-gray-400">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-2 text-sm">Loading...</p>
                      </div>
                    ) : notifications.length > 0 ? (
                      notifications.map(notification => (
                        <div
                          key={notification._id}
                          className={`px-4 py-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0 transition-colors ${
                            !notification.isRead ? "bg-blue-500/5" : ""
                          }`}
                          onClick={() => !notification.isRead && markAsRead(notification._id)}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl flex-shrink-0">
                              {getNotificationIcon(notification.type)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-white text-sm font-medium">
                                  {notification.title}
                                </p>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                                )}
                              </div>
                              <p className="text-gray-400 text-xs mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-gray-500 text-xs mt-1">
                                {getTimeAgo(notification.createdTimestamp)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-gray-400">
                        <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No notifications yet</p>
                      </div>
                    )}
                  </div>
                  
                  {notifications.length > 0 && (
                    <div className="px-4 py-2 border-t border-gray-700">
                      <button
                        onClick={markAllAsRead}
                        disabled={unreadCount === 0}
                        className="text-blue-400 text-sm hover:text-blue-300 w-full text-center disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        Mark all as read
                      </button>
                    </div>
                  )}
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
                  {user.firstName?.charAt(0) || 'U'}
                </div>
                <div className="hidden md:block">
                  <span className="text-white font-medium">{user.firstName} {user.lastName}</span>
                  <p className="text-gray-400 text-xs">{user.email}</p>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-2 z-50">
                  <button 
                    onClick={() => {
                      setActiveTab && setActiveTab('profile');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 cursor-pointer text-left text-white hover:bg-gray-700 transition-colors"
                  >
                    Profile Settings
                  </button>
                  <button 
                    onClick={() => {
                      setActiveTab && setActiveTab('billing');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 cursor-pointer py-2 text-left text-white hover:bg-gray-700 transition-colors"
                  >
                    Billing & Payment
                  </button>
                  <div className="border-t border-gray-700 my-2"></div>
                  <button 
                    onClick={handleLogout}
                    className="w-full px-4 py-2 cursor-pointer text-left text-red-400 hover:bg-gray-700 transition-colors"
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

export default CustomerNavigation;