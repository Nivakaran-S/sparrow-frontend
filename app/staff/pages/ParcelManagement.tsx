'use client'
import { useState, useEffect } from "react";

// Define types based on the OpenAPI spec
interface Parcel {
  id?: string;
  trackingNumber: string;
  customerId: string;
  weight: number;
  volume: number;
  origin: string;
  destination: string;
  status: "RECEIVED" | "PROCESSING" | "CONSOLIDATED" | "SHIPPED" | "DELIVERED";
  createdAt?: string;
  updatedAt?: string;
}

// API functions based on the provided endpoints
const API_BASE_URL = "http://localhost:8080/api/consolidation";

async function getAllParcels(): Promise<Parcel[]> {
  const response = await fetch(`${API_BASE_URL}/api/parcels`);
  if (!response.ok) {
    throw new Error('Failed to fetch parcels');
  }
  return response.json();
}

async function createParcel(parcel: Parcel): Promise<Parcel> {
  const response = await fetch(`${API_BASE_URL}/api/parcels`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(parcel),
  });
  if (!response.ok) {
    throw new Error('Failed to create parcel');
  }
  return response.json();
}

async function updateParcelStatus(id: string, status: Parcel["status"]): Promise<Parcel> {
  const response = await fetch(`${API_BASE_URL}/api/parcels/${id}/status/${status}`, {
    method: 'PATCH',
  });
  if (!response.ok) {
    throw new Error('Failed to update parcel status');
  }
  return response.json();
}

async function deleteParcel(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/parcels/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete parcel');
  }
}

export default function ParcelManagement() {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newParcel, setNewParcel] = useState<Partial<Parcel>>({
    trackingNumber: "",
    customerId: "",
    origin: "",
    destination: "",
    weight: 0,
    volume: 0,
    status: "RECEIVED"
  });

  useEffect(() => {
    fetchParcels();
  }, []);

  async function fetchParcels() {
    setIsLoading(true);
    try {
      const data = await getAllParcels();
      setParcels(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewParcel(prev => ({ 
      ...prev, 
      [name]: name === 'weight' || name === 'volume' ? parseFloat(value) || 0 : value 
    }));
  };

  const handleAddParcel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newParcel.trackingNumber || !newParcel.customerId) return;
      await createParcel(newParcel as Parcel);
      setShowAddForm(false);
      setNewParcel({ 
        trackingNumber: "", 
        customerId: "", 
        origin: "", 
        destination: "", 
        weight: 0, 
        volume: 0,
        status: "RECEIVED"
      });
      fetchParcels();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusUpdate = async (id: string, status: Parcel["status"]) => {
    try {
      await updateParcelStatus(id, status);
      fetchParcels();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteParcel = async (id: string) => {
    try {
      await deleteParcel(id);
      fetchParcels();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Parcel Management</h2>
          <p className="text-gray-400 mt-1">Manage and track all parcel operations</p>
        </div>
        <button 
          className="bg-gradient-to-r from-blue-800 cursor-pointer to-blue-900 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all"
          onClick={() => setShowAddForm(true)}
        >
          Add New Parcel
        </button>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-black h-full opacity-70 w-full absolute" onClick={() => setShowAddForm(false)}></div>
          <div className="bg-gradient-to-br absolute from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-lg z-10">
            <h3 className="text-white text-xl font-semibold mb-6">Add New Parcel</h3>
            <form className="space-y-4" onSubmit={handleAddParcel}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Tracking Number</label>
                  <input 
                    type="text" 
                    name="trackingNumber"
                    value={newParcel.trackingNumber}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Enter tracking number" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Customer ID</label>
                  <input 
                    type="text" 
                    name="customerId"
                    value={newParcel.customerId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Enter customer ID" 
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Origin</label>
                  <input 
                    type="text" 
                    name="origin"
                    value={newParcel.origin}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Enter origin" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Destination</label>
                  <input 
                    type="text" 
                    name="destination"
                    value={newParcel.destination}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Enter destination" 
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Weight (kg)</label>
                  <input 
                    type="number" 
                    name="weight"
                    step="0.01"
                    value={newParcel.weight || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Enter weight" 
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Volume (m³)</label>
                  <input 
                    type="number" 
                    name="volume"
                    step="0.01"
                    value={newParcel.volume || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Enter volume" 
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  className="flex-1 cursor-pointer px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200 rounded-lg font-medium transition-colors"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 cursor-pointer px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all"
                >
                  Add Parcel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-white text-lg font-semibold">All Parcels</h3>
          <button 
            onClick={fetchParcels}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Refresh
          </button>
        </div>
        
        {isLoading ? (
          <div className="text-center text-gray-400 p-8">Loading parcels...</div>
        ) : parcels.length === 0 ? (
          <div className="text-center text-gray-400 p-8">No parcels found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900">
                  <th className="text-white px-6 py-4 text-left font-semibold text-sm">Tracking Number</th>
                  <th className="text-white px-6 py-4 text-left font-semibold text-sm">Customer ID</th>
                  <th className="text-white px-6 py-4 text-left font-semibold text-sm">Origin</th>
                  <th className="text-white px-6 py-4 text-left font-semibold text-sm">Destination</th>
                  <th className="text-white px-6 py-4 text-left font-semibold text-sm">Weight</th>
                  <th className="text-white px-6 py-4 text-left font-semibold text-sm">Volume</th>
                  <th className="text-white px-6 py-4 text-left font-semibold text-sm">Status</th>
                  <th className="text-white px-6 py-4 text-left font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {parcels.map((parcel) => (
                  <tr key={parcel.id} className="border-b border-gray-700 hover:bg-blue-500/5 transition-colors">
                    <td className="px-6 py-4 text-blue-400 font-medium text-sm">{parcel.trackingNumber}</td>
                    <td className="px-6 py-4 text-gray-300 text-sm">{parcel.customerId}</td>
                    <td className="px-6 py-4 text-gray-300 text-sm">{parcel.origin}</td>
                    <td className="px-6 py-4 text-gray-300 text-sm">{parcel.destination}</td>
                    <td className="px-6 py-4 text-gray-300 text-sm">{parcel.weight} kg</td>
                    <td className="px-6 py-4 text-gray-300 text-sm">{parcel.volume} m³</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        parcel.status === "RECEIVED" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                        parcel.status === "PROCESSING" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                        parcel.status === "CONSOLIDATED" ? "bg-green-500/20 text-green-400 border-green-500/30" :
                        parcel.status === "SHIPPED" ? "bg-purple-500/20 text-purple-400 border-purple-500/30" :
                        parcel.status === "DELIVERED" ? "bg-gray-500/20 text-gray-400 border-gray-500/30" :
                        "bg-gray-500/20 text-gray-400 border-gray-500/30"
                      }`}>
                        {parcel.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      {parcel.status !== "PROCESSING" && (
                        <button
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
                          onClick={() => handleStatusUpdate(parcel.id!, "PROCESSING")}
                        >
                          Mark Processing
                        </button>
                      )}
                      {parcel.status === "RECEIVED" && (
                        <button
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
                          onClick={() => handleDeleteParcel(parcel.id!)}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}