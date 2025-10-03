import { useState, useEffect } from "react";

interface Warehouse {
  id?: string;
  warehouseCode: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  capacity: number;
  currentUtilization: number;
  supportedParcelTypes?: string[];
  availableServices?: string[];
  status?: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'FULL';
  createdAt?: string;
  updatedAt?: string;
  location?: {
    latitude?: number;
    longitude?: number;
  };
}

const API_BASE_URL = 'http://localhost:8080/api/warehouses/api/warehouses';

export default function WarehouseManagement() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [activeModal, setActiveModal] = useState<{
    type: 'VIEW' | 'EDIT' | null,
    warehouse: Warehouse | null
  }>({ type: null, warehouse: null });
  const [newWarehouse, setNewWarehouse] = useState<Partial<Warehouse>>({
    warehouseCode: "",
    name: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    capacity: 0,
    currentUtilization: 0,
    supportedParcelTypes: [],
    availableServices: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editWarehouse, setEditWarehouse] = useState<Partial<Warehouse>>({});

  // Fetch warehouses from API
  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_BASE_URL);
      if (response.ok) {
        const data = await response.json();
        setWarehouses(data);
        setError(null);
      } else {
        throw new Error('Failed to fetch warehouses');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch warehouses');
      // Show placeholder data on error
      setWarehouses([
        {
          id: "placeholder-1",
          warehouseCode: "WH001",
          name: "Main Distribution Center",
          address: "123 Warehouse St",
          city: "Colombo",
          state: "Western Province",
          country: "Sri Lanka",
          postalCode: "10100",
          capacity: 1000,
          currentUtilization: 750,
          status: "ACTIVE"
        },
        {
          id: "placeholder-2", 
          warehouseCode: "WH002",
          name: "North Regional Hub",
          address: "456 Storage Ave",
          city: "Kandy",
          state: "Central Province", 
          country: "Sri Lanka",
          postalCode: "20000",
          capacity: 800,
          currentUtilization: 400,
          status: "ACTIVE"
        },
        {
          id: "placeholder-3",
          warehouseCode: "WH003", 
          name: "South Coast Terminal",
          address: "789 Port Road",
          city: "Galle",
          state: "Southern Province",
          country: "Sri Lanka", 
          postalCode: "80000",
          capacity: 600,
          currentUtilization: 580,
          status: "MAINTENANCE"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewWarehouse(prev => ({
      ...prev,
      [name]: name === 'capacity' || name === 'currentUtilization' ? Number(value) : value
    }));
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditWarehouse(prev => ({
      ...prev,
      [name]: name === 'capacity' || name === 'currentUtilization' ? Number(value) : value
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newWarehouse),
      });

      if (response.ok) {
        const createdWarehouse = await response.json();
        setWarehouses(prev => [...prev, createdWarehouse]);
        setShowRegisterForm(false);
        setNewWarehouse({
          warehouseCode: "",
          name: "",
          address: "",
          city: "",
          state: "",
          country: "",
          postalCode: "",
          capacity: 0,
          currentUtilization: 0,
          supportedParcelTypes: [],
          availableServices: [],
        });
        setError(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create warehouse');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create warehouse');
    }
  };

  const handleEditSubmit = async () => {
    if (!activeModal.warehouse?.id) return;

    try {
      const response = await fetch(`${API_BASE_URL}/${activeModal.warehouse.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editWarehouse),
      });

      if (response.ok) {
        const updatedWarehouse = await response.json();
        setWarehouses(prev => 
          prev.map(w => w.id === activeModal.warehouse?.id ? updatedWarehouse : w)
        );
        closeModal();
        setError(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update warehouse');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update warehouse');
    }
  };

  const updateWarehouseStatus = async (id: string, status: Warehouse['status']) => {
    if (!status) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/status/${status}`, {
        method: 'PATCH',
      });

      if (response.ok) {
        const updatedWarehouse = await response.json();
        setWarehouses(prev => 
          prev.map(w => w.id === id ? updatedWarehouse : w)
        );
        setError(null);
      } else {
        throw new Error('Failed to update warehouse status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update warehouse status');
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
      case 'ACTIVE': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'INACTIVE': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'MAINTENANCE': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'FULL': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const isFormValid = () => {
    return newWarehouse.warehouseCode && 
           newWarehouse.name && 
           newWarehouse.address && 
           newWarehouse.city && 
           newWarehouse.state && 
           newWarehouse.country && 
           newWarehouse.postalCode && 
           newWarehouse.capacity !== undefined && 
           newWarehouse.capacity > 0;
  };

  return (
    <div className="space-y-8 p-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            className="text-red-200 hover:text-white ml-4"
          >
            ✖
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Warehouse Management</h2>
          <p className="text-gray-400 mt-1">Monitor and manage warehouse operations</p>
        </div>
        <button 
          className="bg-gradient-to-r cursor-pointer from-blue-900 to-blue-900 hover:from-blue-800 hover:to-blue-900 text-white px-6 py-2 rounded-lg font-medium transition-all"
          onClick={() => setShowRegisterForm(true)}
        >
          Register New Warehouse
        </button>
      </div>

      {/* Register Warehouse Modal */}
      {showRegisterForm && (
        <div className="fixed inset-0 flex left-[10vw] top-[15vh] items-center justify-center z-50 px-4">
          <div onClick={() => setShowRegisterForm(false)} className="bg-black h-[100%] w-[100%] opacity-[80%]"></div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 absolute border border-gray-700 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-white text-xl font-semibold mb-6">Register New Warehouse</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: 'warehouseCode', type: 'text', required: true },
                { name: 'name', type: 'text', required: true },
                { name: 'address', type: 'text', required: true },
                { name: 'city', type: 'text', required: true },
                { name: 'state', type: 'text', required: true },
                { name: 'country', type: 'text', required: true },
                { name: 'postalCode', type: 'text', required: true },
                { name: 'capacity', type: 'number', required: true }
              ].map((field) => (
                <div key={field.name} className="flex flex-col">
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    {field.name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    {field.required && <span className="text-red-400">*</span>}
                  </label>
                  <input 
                    type={field.type}
                    name={field.name}
                    value={(newWarehouse as any)[field.name] || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder={`Enter ${field.name.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                    min={field.type === 'number' ? '0' : undefined}
                  />
                </div>
              ))}
              <div className="col-span-2 flex gap-4 pt-4 justify-end">
                <button
                  type="button"
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200 rounded-lg font-medium transition-colors"
                  onClick={() => setShowRegisterForm(false)}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={!isFormValid()}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    isFormValid() 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white cursor-pointer' 
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Register Warehouse
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View / Edit Modal */}
      {activeModal.type && (
        <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
          <div onClick={closeModal} className="bg-black opacity-[60%] h-[100%] w-[100%]"></div>
          <div className="bg-gradient-to-br absolute left-[30vw] top-[15vh] from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-xl font-semibold">
                {activeModal.type === 'VIEW' ? 'Warehouse Details' : 'Edit Warehouse'}
              </h3>
              <button className="text-gray-400 hover:text-white" onClick={closeModal}>✖</button>
            </div>

            {activeModal.warehouse && (
              <>
                {activeModal.type === 'VIEW' ? (
                  <div className="grid grid-cols-2 gap-4 text-gray-300">
                    <p><strong className="text-white">Warehouse Code:</strong> {activeModal.warehouse.warehouseCode}</p>
                    <p><strong className="text-white">Name:</strong> {activeModal.warehouse.name}</p>
                    <p><strong className="text-white">Address:</strong> {activeModal.warehouse.address}</p>
                    <p><strong className="text-white">City:</strong> {activeModal.warehouse.city}</p>
                    <p><strong className="text-white">State:</strong> {activeModal.warehouse.state}</p>
                    <p><strong className="text-white">Country:</strong> {activeModal.warehouse.country}</p>
                    <p><strong className="text-white">Postal Code:</strong> {activeModal.warehouse.postalCode}</p>
                    <p><strong className="text-white">Capacity:</strong> {activeModal.warehouse.capacity} cubic meters</p>
                    <p><strong className="text-white">Current Utilization:</strong> {activeModal.warehouse.currentUtilization} cubic meters</p>
                    <p><strong className="text-white">Status:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded text-sm ${getStatusColor(activeModal.warehouse.status)}`}>
                        {activeModal.warehouse.status}
                      </span>
                    </p>
                    {activeModal.warehouse.createdAt && (
                      <p><strong className="text-white">Created:</strong> {new Date(activeModal.warehouse.createdAt).toLocaleDateString()}</p>
                    )}
                    {activeModal.warehouse.updatedAt && (
                      <p><strong className="text-white">Last Updated:</strong> {new Date(activeModal.warehouse.updatedAt).toLocaleDateString()}</p>
                    )}
                    
                    <div className="col-span-2 flex gap-2 mt-4">
                      <button
                        onClick={() => updateWarehouseStatus(activeModal.warehouse!.id!, 'ACTIVE')}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors cursor-pointer"
                      >
                        Set Active
                      </button>
                      <button
                        onClick={() => updateWarehouseStatus(activeModal.warehouse!.id!, 'INACTIVE')}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors cursor-pointer"
                      >
                        Set Inactive
                      </button>
                      <button
                        onClick={() => updateWarehouseStatus(activeModal.warehouse!.id!, 'MAINTENANCE')}
                        className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm transition-colors cursor-pointer"
                      >
                        Set Maintenance
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { name: 'warehouseCode', type: 'text' },
                      { name: 'name', type: 'text' },
                      { name: 'address', type: 'text' },
                      { name: 'city', type: 'text' },
                      { name: 'state', type: 'text' },
                      { name: 'country', type: 'text' },
                      { name: 'postalCode', type: 'text' },
                      { name: 'capacity', type: 'number' },
                      { name: 'currentUtilization', type: 'number' }
                    ].map((field) => (
                      <div key={field.name} className="flex flex-col">
                        <label className="block text-gray-400 text-sm font-medium mb-2">
                          {field.name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </label>
                        <input
                          type={field.type}
                          name={field.name}
                          value={(editWarehouse as any)[field.name] || ''}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                          min={field.type === 'number' ? '0' : undefined}
                        />
                      </div>
                    ))}
                    <div className="col-span-2 flex gap-4 pt-4 justify-end">
                      <button 
                        type="button" 
                        className="px-6 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200 rounded-lg font-medium transition-colors cursor-pointer" 
                        onClick={closeModal}
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleEditSubmit}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all cursor-pointer"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Warehouse Cards */}
      {isLoading ? (
        <div className="text-center text-gray-400">Loading warehouses...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {warehouses.map((warehouse) => (
            <div key={warehouse.id} className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/15">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-blue-400">
                  {warehouse.name}
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(warehouse.status)}`}>
                  {warehouse.status}
                </span>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-2">
                  <span className="font-medium">Code:</span> {warehouse.warehouseCode}
                </p>
                <p className="text-gray-400 text-sm mb-3 flex items-center gap-2">
                  <span>📍</span>
                  {warehouse.city}, {warehouse.state}, {warehouse.country}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Capacity Utilization</span>
                    <span className="text-white font-medium">
                      {warehouse.currentUtilization}/{warehouse.capacity} m³
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${warehouse.capacity ? Math.min((warehouse.currentUtilization / warehouse.capacity) * 100, 100) : 0}%`,
                      }}
                    ></div>
                  </div>
                  <div className="text-right text-xs text-gray-400">
                    {warehouse.capacity ? Math.round((warehouse.currentUtilization / warehouse.capacity) * 100) : 0}% occupied
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  className="px-4 py-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                  onClick={() => openModal('VIEW', warehouse)}
                >
                  View Details
                </button>
                <button 
                  className="px-4 cursor-pointer py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200 rounded-lg text-xs font-medium transition-colors"
                  onClick={() => openModal('EDIT', warehouse)}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {warehouses.length === 0 && !isLoading && (
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
      )}
    </div>
  );
}