
import { useState } from "react";

const UserManagement = () =>  {
  const [users] = useState([
    { id: 1, name: 'John Admin', email: 'admin@sparrow.com', role: 'ADMIN', status: 'Active' },
    { id: 2, name: 'Sarah Staff', email: 'staff@sparrow.com', role: 'STAFF', status: 'Active' },
    { id: 3, name: 'Alice Customer', email: 'customer@sparrow.com', role: 'CUSTOMER', status: 'Active' },
    { id: 4, name: 'Bob Driver', email: 'driver@sparrow.com', role: 'DRIVER', status: 'Active' },
  ]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">User Management</h2>
          <p className="text-gray-400 mt-1">Manage system users and their permissions</p>
        </div>
        <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all hover:-translate-y-1 shadow-lg shadow-blue-600/30">
          Add New User
        </button>
      </div>
      
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-white text-lg font-semibold">All Users</h3>
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="Search users..." 
              className="px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
            />
            <select className="px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none">
              <option>All Roles</option>
              <option>Admin</option>
              <option>Staff</option>
              <option>Customer</option>
              <option>Driver</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-900">
                <th className="text-white px-6 py-4 text-left font-semibold text-sm">Name</th>
                <th className="text-white px-6 py-4 text-left font-semibold text-sm">Email</th>
                <th className="text-white px-6 py-4 text-left font-semibold text-sm">Role</th>
                <th className="text-white px-6 py-4 text-left font-semibold text-sm">Status</th>
                <th className="text-white px-6 py-4 text-left font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} className={`border-b border-gray-700 hover:bg-blue-500/5 transition-colors ${index === users.length - 1 ? 'border-b-0' : ''}`}>
                  <td className="px-6 py-4 text-gray-300 text-sm">{user.name}</td>
                  <td className="px-6 py-4 text-gray-300 text-sm">{user.email}</td>
                  <td className="px-6 py-4 text-gray-300 text-sm">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium border border-blue-500/30">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300 text-sm">
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold uppercase tracking-wider border border-green-500/30">
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300 text-sm">
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors">
                        Edit
                      </button>
                      <button className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


export default UserManagement;