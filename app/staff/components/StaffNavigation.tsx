'use client'
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const StaffNavigation = () => {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== "staff") {
        router.push("/login");
        return;
      }
      setUser(parsedUser);
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white text-xl">
      Loading...
    </div>
  );

  return (
    <div className="fixed w-[100vw] z-[9999]">
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 px-8 py-4 sticky top-0 z-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-white">Staff Operations</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative bg-gray-800 border border-gray-600 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-gray-700 hover:border-blue-500 transition-all">
              <span className="text-lg">🔔</span>
              <div className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                3
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {user.name.charAt(0)}
              </div>
              <span className="text-white font-medium">{user.name}</span>
              <button
                onClick={handleLogout}
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

export default StaffNavigation;