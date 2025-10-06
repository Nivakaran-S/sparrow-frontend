'use client'

import { useState, useEffect } from "react";
import { AlertCircle, Package, MapPin, Truck, Plus, X, CheckCircle } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-gateway-nine-orpin.vercel.app";

interface Parcel {
  _id: string;
  trackingNumber: string;
  status: string;
  weight?: { value: number; unit: string };
  sender?: { address: string };
  receiver?: { address: string };
  warehouseId?: string;
}

interface Consolidation {
  _id: string;
  referenceCode: string;
  masterTrackingNumber?: string;
  parcels: string[];
  status: 'pending' | 'consolidated' | 'in_transit' | 'delivered' | 'cancelled';
  warehouseId?: any;
  createdBy?: any;
  createdAt?: string;
  updatedAt?: string;
}

export default function ParcelConsolidation({ userId }: { userId?: string }) {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [consolidations, setConsolidations] = useState<Consolidation[]>([]);
  const [selectedParcelIds, setSelectedParcelIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [referenceCode, setReferenceCode] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([fetchParcels(), fetchConsolidations()]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchParcels = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/parcels/api/parcels`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const parcelList = data.data || data;
        // Only show parcels that are at warehouse or created
        const availableParcels = parcelList.filter((p: Parcel) => 
          p.status === 'at_warehouse' || p.status === 'created'
        );
        setParcels(availableParcels);
      } else {
        throw new Error('Failed to fetch parcels');
      }
    } catch (error) {
      console.error('Error fetching parcels:', error);
      setError('Failed to fetch parcels');
    }
  };

  const fetchConsolidations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/consolidations/api/consolidations`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setConsolidations(data || []);
      } else {
        throw new Error('Failed to fetch consolidations');
      }
    } catch (error) {
      console.error('Error fetching consolidations:', error);
      setError('Failed to fetch consolidations');
    }
  };

  const handleSelectParcel = (parcelId: string) => {
    setSelectedParcelIds(prev => 
      prev.includes(parcelId) 
        ? prev.filter(id => id !== parcelId)
        : [...prev, parcelId]
    );
  };

  const generateReferenceCode = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `CON-${year}${month}${day}-${random}`;
  };

  const handleConsolidate = async () => {
    if (selectedParcelIds.length === 0) {
      setError('Please select at least one parcel');
      return;
    }

    setError("");
    setSuccess("");

    try {
      const consolidationData = {
        referenceCode: referenceCode || generateReferenceCode(),
        parcels: selectedParcelIds,
        createdBy: userId,
        status: 'pending'
      };

      const response = await fetch(`${API_BASE_URL}/api/consolidations/api/consolidations`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consolidationData)
      });

      if (response.ok) {
        const newConsolidation = await response.json();
        
        // Update parcel statuses
        await Promise.all(selectedParcelIds.map(parcelId =>
          fetch(`${API_BASE_URL}/api/parcels/${parcelId}/status`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              status: 'consolidated',
              service: 'consolidation-service',
              note: 'Parcel consolidated'
            })
          })
        ));

        setSelectedParcelIds([]);
        setReferenceCode("");
        setShowModal(false);
        setSuccess('Consolidation created successfully!');
        
        await fetchData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create consolidation');
      }
    } catch (error: any) {
      console.error('Error creating consolidation:', error);
      setError(error.message || 'Failed to create consolidation');
    }
  };

  const updateConsolidationStatus = async (consolidationId: string, status: Consolidation['status']) => {
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/consolidations/api/consolidations/${consolidationId}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status,
          note: `Status updated to ${status}`
        })
      });

      if (response.ok) {
        setSuccess(`Consolidation status updated to ${status}`);
        await fetchConsolidations();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error: any) {
      console.error('Error updating consolidation status:', error);
      setError(error.message || 'Failed to update consolidation status');
    }
  };

  const parcelsByDestination = parcels.reduce((acc: Record<string, Parcel[]>, parcel) => {
    const key = parcel.receiver?.address || "Unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(parcel);
    return acc;
  }, {});

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'consolidated': return 'text-green-400';
      case 'in_transit': return 'text-blue-400';
      case 'pending': return 'text-yellow-400';
      case 'delivered': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'consolidated': return <CheckCircle className="w-4 h-4" />;
      case 'in_transit': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-2">Parcel Consolidation Hub</h2>
          <p className="text-gray-300">Efficiently manage and consolidate parcels for optimized delivery</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-red-300">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
              <button onClick={() => setError('')} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 text-green-300">
              <CheckCircle className="w-5 h-5" />
              <span>{success}</span>
              <button onClick={() => setSuccess('')} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <input
                type="text"
                placeholder="Reference Code (auto-generated if empty)"
                value={referenceCode}
                onChange={e => setReferenceCode(e.target.value)}
                className="px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
              <button
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg font-medium transition-all hover:-translate-y-1 shadow-lg shadow-blue-600/30 flex items-center gap-2"
                onClick={() => setShowModal(true)}
              >
                <Plus className="w-4 h-4" />
                Create Consolidation
              </button>
            </div>
            
            <div className="text-sm text-gray-400">
              Available parcels: {parcels.length} | 
              Active consolidations: {consolidations.length}
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center text-gray-400 py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading parcels and consolidations...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            
            {/* Available Parcels by Destination */}
            <div>
              <h3 className="text-2xl font-semibold text-white mb-6">Available Parcels</h3>
              <div className="space-y-6">
                {Object.entries(parcelsByDestination).map(([destination, parcels]) => (
                  <div key={destination} className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 hover:border-blue-500 transition-all">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-500/20 rounded-full w-12 h-12 flex items-center justify-center text-blue-400">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-blue-400 text-xl font-semibold">{destination}</h4>
                        <p className="text-gray-400 text-sm">{parcels.length} parcels available</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-gray-300">
                        Total weight: {parcels.reduce((acc, p) => acc + (p.weight?.value || 0), 0).toFixed(1)}{parcels[0]?.weight?.unit || 'kg'}
                      </p>
                    </div>
                    
                    <div className="space-y-2 mb-6">
                      {parcels.map(parcel => (
                        <div key={parcel._id} className="flex items-center justify-between p-3 bg-gray-900 border border-gray-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Package className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300">{parcel.trackingNumber}</span>
                            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                              {parcel.status}
                            </span>
                          </div>
                          <div className="text-gray-400 text-sm">
                            {parcel.weight?.value || 0}{parcel.weight?.unit || 'kg'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {Object.keys(parcelsByDestination).length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No available parcels for consolidation</p>
                  </div>
                )}
              </div>
            </div>

            {/* Active Consolidations */}
            <div>
              <h3 className="text-2xl font-semibold text-white mb-6">Active Consolidations</h3>
              <div className="space-y-4">
                {consolidations?.map(consolidation => (
                  <div key={consolidation._id} className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-500/20 rounded-full w-10 h-10 flex items-center justify-center text-purple-400">
                          <Truck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-purple-400 font-semibold">{consolidation.referenceCode}</h4>
                          <p className="text-gray-400 text-sm">
                            {consolidation.masterTrackingNumber || 'No tracking number'}
                          </p>
                        </div>
                      </div>
                      
                      <div className={`flex items-center gap-2 ${getStatusColor(consolidation.status)}`}>
                        {getStatusIcon(consolidation.status)}
                        <span className="font-medium">{consolidation.status}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-gray-400">Parcels</p>
                        <p className="text-gray-300">{consolidation.parcels.length} items</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Created</p>
                        <p className="text-gray-300">
                          {consolidation.createdAt ? new Date(consolidation.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    {consolidation.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                          onClick={() => updateConsolidationStatus(consolidation._id, 'consolidated')}
                        >
                          Mark Consolidated
                        </button>
                      </div>
                    )}
                    
                    {consolidation.status === 'consolidated' && (
                      <button
                        className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                        onClick={() => updateConsolidationStatus(consolidation._id, 'in_transit')}
                      >
                        Mark In Transit
                      </button>
                    )}

                    {consolidation.status === 'in_transit' && (
                      <button
                        className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                        onClick={() => updateConsolidationStatus(consolidation._id, 'delivered')}
                      >
                        Mark Delivered
                      </button>
                    )}
                  </div>
                ))}
                
                {consolidations.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    <Truck className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No active consolidations</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Parcel Selection Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-3xl max-h-[80vh] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white text-2xl font-semibold">Select Parcels for Consolidation</h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="mb-4 p-4 bg-blue-500/20 border border-blue-500 rounded-lg">
                <p className="text-blue-300 text-sm">
                  Selected: {selectedParcelIds.length} parcel(s)
                </p>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2 mb-6">
                {parcels.map(parcel => (
                  <label key={parcel._id} className="flex items-center gap-3 bg-gray-900 border border-gray-700 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedParcelIds.includes(parcel._id)}
                      onChange={() => handleSelectParcel(parcel._id)}
                      className="w-4 h-4 accent-blue-500"
                    />
                    <Package className="w-5 h-5 text-gray-400" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-300 font-medium">{parcel.trackingNumber}</span>
                        <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                          {parcel.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">
                        {parcel.sender?.address || 'N/A'} → {parcel.receiver?.address || 'N/A'} • {parcel.weight?.value || 0}{parcel.weight?.unit || 'kg'}
                      </div>
                    </div>
                  </label>
                ))}
                
                {parcels.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No parcels available for consolidation</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-4">
                <button
                  type="button"
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200 rounded-lg font-medium transition-colors"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedParcelIds([]);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedParcelIds.length > 0
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white cursor-pointer'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                  onClick={handleConsolidate}
                  disabled={selectedParcelIds.length === 0}
                >
                  Create Consolidation ({selectedParcelIds.length})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}