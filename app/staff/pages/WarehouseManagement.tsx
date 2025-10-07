'use client';
import { useState, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-gateway-nine-orpin.vercel.app";

interface Address {
  _id?: string;
  locationNumber?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

interface Warehouse {
  _id: string;
  name: string;
  code?: string;
  address: Address | string;
  capacity?: {
    parcels?: number;
    weightLimit?: number;
  };
  contact?: any;
  status: 'active' | 'inactive' | 'under_maintenance';
  receivedParcels?: any[];
  createdTimestamp?: string;
  updatedTimestamp?: string;
}

interface WarehouseFormData {
  name: string;
  code: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  capacity: {
    parcels: number;
    weightLimit: number;
  };
  status: 'active' | 'inactive' | 'under_maintenance';
}

export default function WarehouseManagement({ userId }: { userId?: string }) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [activeModal, setActiveModal] = useState<{
    type: 'VIEW' | 'EDIT' | null,
    warehouse: Warehouse | null
  }>({ type: null, warehouse: null });
  const [newWarehouse, setNewWarehouse] = useState<WarehouseFormData>({
    name: "",
    code: "",
    address: {
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      latitude: 0,
      longitude: 0
    },
    capacity: {
      parcels: 0,
      weightLimit: 0
    },
    status: "active"
  });
  const [editWarehouse, setEditWarehouse] = useState<Partial<Warehouse>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/warehouses/warehouses`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setWarehouses(data.data || data);
      } else {
        throw new Error('Failed to fetch warehouses');
      }
    } catch (err) {
      console.error("Error fetching warehouses:", err);
      setError(err instanceof Error ? err.message : 'Failed to fetch warehouses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setNewWarehouse(prev => ({
        ...prev,
        address: { 
          ...prev.address, 
          [field]: ['latitude', 'longitude'].includes(field) ? parseFloat(value) || 0 : value 
        }
      }));
    } else if (name.startsWith('capacity.')) {
      const field = name.split('.')[1];
      setNewWarehouse(prev => ({
        ...prev,
        capacity: { ...prev.capacity, [field]: Number(value) || 0 }
      }));
    } else {
      setNewWarehouse(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setEditWarehouse(prev => ({
        ...prev,
        address: { 
          ...(typeof prev.address === 'object' ? prev.address : {}), 
          [field]: ['latitude', 'longitude'].includes(field) ? parseFloat(value) || 0 : value 
        } as Address
      }));
    } else if (name.startsWith('capacity.')) {
      const field = name.split('.')[1];
      setEditWarehouse(prev => ({
        ...prev,
        capacity: { ...prev.capacity, [field]: Number(value) || 0 }
      }));
    } else {
      setEditWarehouse(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      // First create the address
      const addressResponse = await fetch(`${API_BASE_URL}/api/warehouses/addresses`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWarehouse.address),
      });

      if (!addressResponse.ok) {
        const errorData = await addressResponse.json();
        throw new Error(errorData.message || 'Failed to create address');
      }

      const addressData = await addressResponse.json();
      const addressId = addressData.data?._id || addressData._id;

      // Then create the warehouse with the address ID
      const warehouseData = {
        name: newWarehouse.name,
        code: newWarehouse.code || undefined,
        address: addressId,
        capacity: newWarehouse.capacity,
        contact: userId || '507f1f77bcf86cd799439011', // Default contact ID if userId not provided
        status: newWarehouse.status
      };

      const response = await fetch(`${API_BASE_URL}/api/warehouses/warehouses`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(warehouseData),
      });

      if (response.ok) {
        setShowRegisterForm(false);
        setNewWarehouse({
          name: "",
          code: "",
          address: {
            street: "",
            city: "",
            state: "",
            postalCode: "",
            country: "",
            latitude: 0,
            longitude: 0
          },
          capacity: { parcels: 0, weightLimit: 0 },
          status: "active"
        });
        setSuccess('Warehouse created successfully!');
        fetchWarehouses();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create warehouse');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create warehouse');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!activeModal.warehouse?._id) return;
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      // If address is being edited and is an object, update it first
      let addressId = typeof activeModal.warehouse.address === 'string' 
        ? activeModal.warehouse.address 
        : activeModal.warehouse.address._id;

      if (editWarehouse.address && typeof editWarehouse.address === 'object') {
        if (addressId) {
          // Update existing address
          const addressResponse = await fetch(`${API_BASE_URL}/api/warehouses/addresses/${addressId}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editWarehouse.address),
          });

          if (!addressResponse.ok) {
            throw new Error('Failed to update address');
          }
        }
      }

      // Update warehouse
      const updateData: any = {};
      if (editWarehouse.name) updateData.name = editWarehouse.name;
      if (editWarehouse.code) updateData.code = editWarehouse.code;
      if (editWarehouse.capacity) updateData.capacity = editWarehouse.capacity;
      if (editWarehouse.status) updateData.status = editWarehouse.status;

      const response = await fetch(`${API_BASE_URL}/api/warehouses/warehouses/${activeModal.warehouse._id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        closeModal();
        setSuccess('Warehouse updated successfully!');
        fetchWarehouses();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update warehouse');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update warehouse');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateWarehouseStatus = async (id: string, status: Warehouse['status']) => {
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/warehouses/warehouses/${id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setSuccess(`Warehouse status updated to ${status}`);
        fetchWarehouses();
        closeModal();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update warehouse status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update warehouse status');
    }
  };

  const deleteWarehouse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this warehouse? This action cannot be undone.')) {
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/warehouses/warehouses/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setSuccess('Warehouse deleted successfully!');
        fetchWarehouses();
        closeModal();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete warehouse');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete warehouse');
    }
  };

  const openModal = (type: 'VIEW' | 'EDIT', warehouse: Warehouse) => {
    setActiveModal({ type, warehouse });
    if (type === 'EDIT') {
      setEditWarehouse({ ...warehouse });
    }
  };

  const closeModal = () => {
    setActiveModal({ type: null, warehouse: null });
    setEditWarehouse({});
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'inactive': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'under_maintenance': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getAddress = (address: Address | string | undefined): Address => {
    if (!address) return {};
    if (typeof address === 'string') return {};
    return address;
  };

  const isFormValid = () => {
    return newWarehouse.name && 
           newWarehouse.address?.city && 
           newWarehouse.address?.state && 
           newWarehouse.address?.country;
  };

  return (
    <div className="space-y-8 p-6">
      {/* Alerts */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-200 hover:text-white ml-4">✖</button>
        </div>
      )}

      {success && (
        <div className="bg-green-500/20 border border-green-500/30 text-green-400 p-4 rounded-lg flex justify-between items-center">
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="text-green-200 hover:text-white ml-4">✖</button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Warehouse Management</h2>
          <p className="text-gray-400 mt-1">Monitor and manage warehouse operations</p>
        </div>
        <button 
          className="bg-gradient-to-r cursor-pointer from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg font-medium transition-all"
          onClick={() => setShowRegisterForm(true)}
        >
          Register New Warehouse
        </button>
      </div>

      {/* Register Warehouse Modal */}
      {showRegisterForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
          <div onClick={() => setShowRegisterForm(false)} className="absolute inset-0 bg-black opacity-60"></div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 relative border border-gray-700 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-white text-xl font-semibold mb-6">Register New Warehouse</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Warehouse Name <span className="text-red-400">*</span>
                </label>
                <input 
                  type="text"
                  name="name"
                  value={newWarehouse.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Enter warehouse name"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Warehouse Code
                </label>
                <input 
                  type="text"
                  name="code"
                  value={newWarehouse.code}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Enter warehouse code (optional)"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Street Address
                </label>
                <input 
                  type="text"
                  name="address.street"
                  value={newWarehouse.address.street}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Enter street address"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  City <span className="text-red-400">*</span>
                </label>
                <input 
                  type="text"
                  name="address.city"
                  value={newWarehouse.address.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Enter city"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  State <span className="text-red-400">*</span>
                </label>
                <input 
                  type="text"
                  name="address.state"
                  value={newWarehouse.address.state}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Enter state"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Country <span className="text-red-400">*</span>
                </label>
                <input 
                  type="text"
                  name="address.country"
                  value={newWarehouse.address.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Enter country"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Postal Code
                </label>
                <input 
                  type="text"
                  name="address.postalCode"
                  value={newWarehouse.address.postalCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Enter postal code"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Parcel Capacity
                </label>
                <input 
                  type="number"
                  name="capacity.parcels"
                  value={newWarehouse.capacity.parcels || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Enter parcel capacity"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Weight Limit (kg)
                </label>
                <input 
                  type="number"
                  name="capacity.weightLimit"
                  value={newWarehouse.capacity.weightLimit || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Enter weight limit"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={newWarehouse.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="under_maintenance">Under Maintenance</option>
                </select>
              </div>
              <div className="col-span-2 flex gap-4 pt-4 justify-end">
                <button
                  type="button"
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200 rounded-lg font-medium transition-colors cursor-pointer"
                  onClick={() => setShowRegisterForm(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={!isFormValid() || isSubmitting}
                  className={`px-6 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                    isFormValid() && !isSubmitting
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white' 
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? 'Creating...' : 'Register Warehouse'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View/Edit Modal */}
      {activeModal.type && activeModal.warehouse && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
          <div onClick={closeModal} className="absolute inset-0 bg-black opacity-60"></div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 relative border border-gray-700 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-xl font-semibold">
                {activeModal.type === 'VIEW' ? 'Warehouse Details' : 'Edit Warehouse'}
              </h3>
              <button className="text-gray-400 hover:text-white cursor-pointer" onClick={closeModal}>✖</button>
            </div>

            {activeModal.type === 'VIEW' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-gray-300">
                  <p><strong className="text-white">Name:</strong> {activeModal.warehouse.name}</p>
                  <p><strong className="text-white">Code:</strong> {activeModal.warehouse.code || 'N/A'}</p>
                  <p><strong className="text-white">Street:</strong> {getAddress(activeModal.warehouse.address).street || 'N/A'}</p>
                  <p><strong className="text-white">City:</strong> {getAddress(activeModal.warehouse.address).city || 'N/A'}</p>
                  <p><strong className="text-white">State:</strong> {getAddress(activeModal.warehouse.address).state || 'N/A'}</p>
                  <p><strong className="text-white">Country:</strong> {getAddress(activeModal.warehouse.address).country || 'N/A'}</p>
                  <p><strong className="text-white">Postal Code:</strong> {getAddress(activeModal.warehouse.address).postalCode || 'N/A'}</p>
                  <p><strong className="text-white">Parcel Capacity:</strong> {activeModal.warehouse.capacity?.parcels || 'N/A'}</p>
                  <p><strong className="text-white">Weight Limit:</strong> {activeModal.warehouse.capacity?.weightLimit ? `${activeModal.warehouse.capacity.weightLimit} kg` : 'N/A'}</p>
                  <p><strong className="text-white">Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-sm border ${getStatusColor(activeModal.warehouse.status)}`}>
                      {activeModal.warehouse.status}
                    </span>
                  </p>
                  <p><strong className="text-white">Current Parcels:</strong> {activeModal.warehouse.receivedParcels?.length || 0}</p>
                  {activeModal.warehouse.createdTimestamp && (
                    <p><strong className="text-white">Created:</strong> {new Date(activeModal.warehouse.createdTimestamp).toLocaleDateString()}</p>
                  )}
                </div>
                
                <div className="border-t border-gray-700 pt-4">
                  <h4 className="text-white font-semibold mb-3">Quick Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => updateWarehouseStatus(activeModal.warehouse!._id, 'active')}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors cursor-pointer"
                    >
                      Set Active
                    </button>
                    <button
                      onClick={() => updateWarehouseStatus(activeModal.warehouse!._id, 'inactive')}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors cursor-pointer"
                    >
                      Set Inactive
                    </button>
                    <button
                      onClick={() => updateWarehouseStatus(activeModal.warehouse!._id, 'under_maintenance')}
                      className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm transition-colors cursor-pointer"
                    >
                      Set Maintenance
                    </button>
                    <button
                      onClick={() => setActiveModal({ type: 'EDIT', warehouse: activeModal.warehouse })}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors cursor-pointer"
                    >
                      Edit Details
                    </button>
                    <button
                      onClick={() => deleteWarehouse(activeModal.warehouse!._id)}
                      className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-red-400 border border-red-500/30 rounded text-sm transition-colors cursor-pointer"
                    >
                      Delete Warehouse
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editWarehouse.name || ''}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Code</label>
                  <input
                    type="text"
                    name="code"
                    value={editWarehouse.code || ''}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Parcel Capacity</label>
                  <input
                    type="number"
                    name="capacity.parcels"
                    value={editWarehouse.capacity?.parcels || ''}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Weight Limit (kg)</label>
                  <input
                    type="number"
                    name="capacity.weightLimit"
                    value={editWarehouse.capacity?.weightLimit || ''}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    min="0"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-400 text-sm font-medium mb-2">Status</label>
                  <select
                    name="status"
                    value={editWarehouse.status || 'active'}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="under_maintenance">Under Maintenance</option>
                  </select>
                </div>
                <div className="col-span-2 flex gap-4 pt-4 justify-end">
                  <button 
                    onClick={handleEditSubmit}
                    disabled={isSubmitting}
                    className={`px-6 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                      isSubmitting
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                    }`}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Warehouse Cards */}
      {isLoading ? (
        <div className="text-center text-gray-400 py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          Loading warehouses...
        </div>
      ) : warehouses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-4">No warehouses found</div>
          <p className="text-gray-500 mb-6">Get started by registering your first warehouse</p>
          <button 
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg font-medium transition-all cursor-pointer"
            onClick={() => setShowRegisterForm(true)}
          >
            Register Warehouse
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {warehouses.map((warehouse) => {
            const address = getAddress(warehouse.address);
            const currentParcels = warehouse.receivedParcels?.length || 0;
            const capacity = warehouse.capacity?.parcels || 0;
            const utilizationPercent = capacity > 0 ? Math.round((currentParcels / capacity) * 100) : 0;

            return (
              <div key={warehouse._id} className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/15">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-blue-400">
                    {warehouse.name}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(warehouse.status)}`}>
                    {warehouse.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="mb-6">
                  <p className="text-gray-400 text-sm mb-2">
                    <span className="font-medium text-white">Code:</span> {warehouse.code || 'N/A'}
                  </p>
                  <p className="text-gray-400 text-sm mb-3 flex items-center gap-2">
                    <span>📍</span>
                    {address.city || 'N/A'}, {address.state || 'N/A'}, {address.country || 'N/A'}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Capacity</span>
                      <span className="text-white font-medium">
                        {currentParcels}/{capacity} parcels
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          utilizationPercent >= 90 
                            ? 'bg-gradient-to-r from-red-500 to-red-600'
                            : utilizationPercent >= 70
                            ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                            : 'bg-gradient-to-r from-blue-500 to-blue-600'
                        }`}
                        style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                      ></div>
                    </div>
                    <div className="text-right text-xs text-gray-400">
                      {utilizationPercent}% occupied
                    </div>
                  </div>
                  {warehouse.capacity?.weightLimit && (
                    <p className="text-gray-400 text-xs mt-2">
                      Weight limit: {warehouse.capacity.weightLimit} kg
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button 
                    className="flex-1 px-4 py-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                    onClick={() => openModal('VIEW', warehouse)}
                  >
                    View Details
                  </button>
                  <button 
                    className="flex-1 px-4 cursor-pointer py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200 rounded-lg text-xs font-medium transition-colors"
                    onClick={() => openModal('EDIT', warehouse)}
                  >
                    Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}    