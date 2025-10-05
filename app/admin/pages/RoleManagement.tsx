import { useState, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-gateway-nine-orpin.vercel.app";

type Role = {
  id: number;
  name: string;
  permissions: string[];
  users: number;
  description: string;
};

const RoleManagement = () => {
  const [roles] = useState<Role[]>([
    { 
      id: 1, 
      name: 'Admin', 
      permissions: ['User Management', 'System Settings', 'Reports', 'KPI Access', 'Full Control'],
      users: 2,
      description: 'Full system access and control'
    },
    { 
      id: 2, 
      name: 'Staff', 
      permissions: ['Parcel Management', 'Warehouse Management', 'Route Planning', 'Inventory Control'],
      users: 15,
      description: 'Operational staff with warehouse access'
    },
    { 
      id: 3, 
      name: 'Customer', 
      permissions: ['Track Parcels', 'View Costs', 'Request Delivery', 'View Receipts'],
      users: 1200,
      description: 'Standard customer account'
    },
    { 
      id: 4, 
      name: 'Driver', 
      permissions: ['View Routes', 'Update Delivery Status', 'Access GPS', 'Scan Parcels'],
      users: 30,
      description: 'Delivery personnel'
    },
  ]);

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setShowEditModal(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Role Management</h2>
          <p className="text-gray-400 mt-1">Configure user roles and permissions</p>
        </div>
        <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all hover:-translate-y-1 shadow-lg shadow-blue-600/30">
          Create New Role
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roles.map(role => (
          <div key={role.id} className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/15">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-blue-400 text-xl font-semibold">{role.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{role.description}</p>
              </div>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium border border-blue-500/30">
                {role.users} users
              </span>
            </div>
            
            <div className="mb-6">
              <h4 className="text-white text-sm font-medium mb-3">Permissions:</h4>
              <div className="space-y-2">
                {role.permissions.map((permission, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-gray-300 text-sm">{permission}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => handleEditRole(role)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
              >
                Edit Role
              </button>
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200 rounded-lg text-xs font-medium transition-colors">
                View Users
              </button>
              {role.name !== 'Admin' && (
                <button className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-600/30 text-red-400 rounded-lg text-xs font-medium transition-colors">
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Role Statistics */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
        <h3 className="text-white text-lg font-semibold mb-4">Role Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {roles.map(role => (
            <div key={role.id} className="text-center p-4 bg-gray-900 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{role.users}</div>
              <div className="text-sm text-gray-400 mt-1">{role.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RoleManagement;