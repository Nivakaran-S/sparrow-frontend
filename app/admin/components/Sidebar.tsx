'use client'
import { useState } from "react";

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {

    return(
        <div>
            <nav className="w-64 fixed h-[93vh] z-[99] top-[9vh] bg-gradient-to-b from-gray-900 to-gray-950 border-r border-gray-700 p-0 overflow-y-auto">
            <div className="pt-5">
                <div className="px-6 mb-4">
                <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">Admin Panel</h3>
                <div className="space-y-1">
                    <button 
                    className={`w-full flex cursor-pointer items-center rounded-[10px] gap-3 px-4 py-3 text-left transition-all border-l-4 ${
                        activeTab === 'overview' 
                        ? 'bg-gray-800 text-blue-400 border-l-blue-400' 
                        : 'text-gray-300 border-l-transparent hover:bg-gray-800 hover:text-blue-400 hover:border-l-blue-400'
                    }`}
                    onClick={() => setActiveTab('overview')}
                    >
                    
                    <span className="font-medium">Dashboard Overview</span>
                    </button>
                    <button 
                    className={`w-full cursor-pointer flex items-center rounded-[10px] gap-3 px-4 py-3 text-left transition-all border-l-4 ${
                        activeTab === 'users' 
                        ? 'bg-gray-800 text-blue-400 border-l-blue-400' 
                        : 'text-gray-300 border-l-transparent hover:bg-gray-800 hover:text-blue-400 hover:border-l-blue-400'
                    }`}
                    onClick={() => setActiveTab('users')}
                    >
                    
                    <span className="font-medium">User Management</span>
                    </button>
                    <button 
                    className={`w-full cursor-pointer flex items-center rounded-[10px] gap-3 px-4 py-3 text-left transition-all border-l-4 ${
                        activeTab === 'roles' 
                        ? 'bg-gray-800 text-blue-400 border-l-blue-400' 
                        : 'text-gray-300 border-l-transparent hover:bg-gray-800 hover:text-blue-400 hover:border-l-blue-400'
                    }`}
                    onClick={() => setActiveTab('roles')}
                    >
                    
                    <span className="font-medium">Role Management</span>
                    </button>
                </div>
                </div>

                <div className="px-6 mb-2">
                <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4">Analytics</h3>
                <div className="space-y-1">
                    <button 
                    className={`w-full flex cursor-pointer items-center rounded-[10px] gap-3 px-4 py-3 text-left transition-all border-l-4 ${
                        activeTab === 'kpis' 
                        ? 'bg-gray-800 text-blue-400 border-l-blue-400' 
                        : 'text-gray-300 border-l-transparent hover:bg-gray-800 hover:text-blue-400 hover:border-l-blue-400'
                    }`}
                    onClick={() => setActiveTab('kpis')}
                    >
                    
                    <span className="font-medium">KPI Monitoring</span>
                    </button>
                    <button 
                    className={`w-full flex cursor-pointer items-center rounded-[10px] gap-3 px-4 py-3 text-left transition-all border-l-4 ${
                        activeTab === 'reports' 
                        ? 'bg-gray-800 text-blue-400 border-l-blue-400' 
                        : 'text-gray-300 border-l-transparent hover:bg-gray-800 hover:text-blue-400 hover:border-l-blue-400'
                    }`}
                    onClick={() => setActiveTab('reports')}
                    >
                    
                    <span className="font-medium">Reports</span>
                    </button>
                </div>
                </div>

                <div className="px-6">
                <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-4">System</h3>
                <div className="space-y-1">
                    <button 
                    className={`w-full flex cursor-pointer items-center rounded-[10px] gap-3 px-4 py-3 text-left transition-all border-l-4 ${
                        activeTab === 'settings' 
                        ? 'bg-gray-800 text-blue-400 border-l-blue-400' 
                        : 'text-gray-300 border-l-transparent hover:bg-gray-800 hover:text-blue-400 hover:border-l-blue-400'
                    }`}
                    onClick={() => setActiveTab('settings')}
                    >
                    
                    <span className="font-medium">System Settings</span>
                    </button>
                </div>
                </div>
            </div>
            </nav>
        </div>
    )
}

export default Sidebar;