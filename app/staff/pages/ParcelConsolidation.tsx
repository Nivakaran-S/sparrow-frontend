'use client'

import { useState, useEffect } from "react";
import { AlertCircle, Package, MapPin, Truck, Plus, X, CheckCircle, Warehouse, User, Hash, ArrowRight, RefreshCw, Eye, Layers } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-gateway-nine-orpin.vercel.app";

interface Parcel {
  _id: string;
  trackingNumber: string;
  status: string;
  weight?: { value: number; unit: string };
  sender?: { address: string; name?: string };
  receiver?: { address: string; name?: string };
  warehouseId?: string;
  consolidationId?: any;
}

interface Consolidation {
  _id: string;
  referenceCode: string;
  masterTrackingNumber?: string;
  parcels: any[];
  status: 'pending' | 'consolidated' | 'in_transit' | 'delivered' | 'cancelled';
  warehouseId?: any;
  assignedDriver?: any;
  createdBy?: any;
  createdTimestamp?: string;
  updatedTimestamp?: string;
  statusHistory?: any[];
}

interface Driver {
  _id: string;
  userName: string;
  entityId: string;
  details?: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
}

interface WarehouseType {
  _id: string;
  name: string;
  code: string;
  address?: any;
  status: string;
}

export default function ParcelConsolidation({ userId, setActiveTab }: { userId?: string; setActiveTab?: (tab: string) => void }) {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [consolidations, setConsolidations] = useState<Consolidation[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseType[]>([]);
  const [selectedParcelIds, setSelectedParcelIds] = useState<string[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referenceCode, setReferenceCode] = useState("");
  const [masterTrackingNumber, setMasterTrackingNumber] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedConsolidation, setSelectedConsolidation] = useState<Consolidation | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchParcels(), 
        fetchConsolidations(), 
        fetchDrivers(),
        fetchWarehouses()
      ]);
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
        const availableParcels = parcelList.filter((p: Parcel) => 
          p.status !== 'delivered' && p.status !== 'cancelled'
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
        setConsolidations(data.data || data || []);
      } else {
        throw new Error('Failed to fetch consolidations');
      }
    } catch (error) {
      console.error('Error fetching consolidations:', error);
      setError('Failed to fetch consolidations');
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/users?role=Driver`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setDrivers(data.data || []);
      } else {
        throw new Error('Failed to fetch drivers');
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setError('Failed to fetch drivers');
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/warehouses/warehouses`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const warehouseList = data.data || data;
        setWarehouses(warehouseList.filter((w: WarehouseType) => w.status === 'active'));
      } else {
        throw new Error('Failed to fetch warehouses');
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      setError('Failed to fetch warehouses');
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

  const generateMasterTrackingNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `MTN-${year}${month}${day}-${random}`;
  };

  const handleConsolidate = async () => {
    if (selectedParcelIds.length === 0) {
      setError('Please select at least one parcel');
      return;
    }

    if (!selectedWarehouseId) {
      setError('Please select a warehouse');
      return;
    }

    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const finalReferenceCode = referenceCode || generateReferenceCode();
      const finalMasterTracking = masterTrackingNumber || generateMasterTrackingNumber();

      const consolidationData = {
        referenceCode: finalReferenceCode,
        masterTrackingNumber: finalMasterTracking,
        parcels: selectedParcelIds,
        createdBy: userId || '507f1f77bcf86cd799439011',
        status: 'pending',
        warehouseId: selectedWarehouseId,
        ...(selectedDriverId && { assignedDriver: selectedDriverId })
      };

      const response = await fetch(`${API_BASE_URL}/api/consolidations/api/consolidations`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consolidationData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to create consolidation');
      }

      const newConsolidation = await response.json();
      const consolidationId = newConsolidation._id || newConsolidation.data?._id;
      
      const updatePromises = selectedParcelIds.map(async (parcelId) => {
        try {
          await fetch(`${API_BASE_URL}/api/parcels/api/parcels/${parcelId}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              status: 'consolidated',
              consolidationId: consolidationId,
              warehouseId: selectedWarehouseId,
              ...(selectedDriverId && { assignedDriver: selectedDriverId })
            })
          });

          await fetch(`${API_BASE_URL}/api/parcels/api/parcels/${parcelId}/status`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              status: 'consolidated',
              service: 'consolidation-service',
              note: `Parcel consolidated under ${finalReferenceCode}`
            })
          });

          await fetch(`${API_BASE_URL}/api/warehouses/warehouses/${selectedWarehouseId}/add-parcel`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ parcelId })
          });

        } catch (err) {
          console.error(`Error updating parcel ${parcelId}:`, err);
        }
      });

      await Promise.all(updatePromises);

      await fetch(`${API_BASE_URL}/api/consolidations/api/consolidations/${consolidationId}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'consolidated',
          note: 'Consolidation created and parcels added to warehouse'
        })
      });

      setSelectedParcelIds([]);
      setSelectedDriverId("");
      setSelectedWarehouseId("");
      setReferenceCode("");
      setMasterTrackingNumber("");
      setShowModal(false);
      
      setSuccess(`Consolidation created successfully! Tracking: ${finalMasterTracking}`);
      
      await fetchData();
      setTimeout(() => setSuccess(''), 5000);
      
    } catch (error: any) {
      console.error('Error creating consolidation:', error);
      setError(error.message || 'Failed to create consolidation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateConsolidationStatus = async (consolidationId: string, status: Consolidation['status']) => {
    setError("");
    setSuccess("");

    try {
      const consolidationResponse = await fetch(
        `${API_BASE_URL}/api/consolidations/api/consolidations/id/${consolidationId}`,
        {
          credentials: 'include'
        }
      );

      if (!consolidationResponse.ok) {
        throw new Error('Failed to fetch consolidation details');
      }

      const consolidationData = await consolidationResponse.json();
      const consolidationDetails = consolidationData.data || consolidationData;
      const parcelIds = Array.isArray(consolidationDetails.parcels) 
        ? consolidationDetails.parcels 
        : [];

      const parcelStatusMap: Record<Consolidation['status'], string> = {
        'pending': 'consolidated',
        'consolidated': 'consolidated',
        'in_transit': 'in_transit',
        'delivered': 'delivered',
        'cancelled': 'cancelled'
      };

      const parcelStatus = parcelStatusMap[status];

      const consolidationUpdateResponse = await fetch(
        `${API_BASE_URL}/api/consolidations/api/consolidations/${consolidationId}/status`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            status,
            note: `Status updated to ${status}`
          })
        }
      );

      if (!consolidationUpdateResponse.ok) {
        throw new Error('Failed to update consolidation status');
      }

      const parcelUpdatePromises = parcelIds.map(async (parcelId: any) => {
        try {
          const id = typeof parcelId === 'string' ? parcelId : parcelId._id || parcelId.toString();
          
          await fetch(`${API_BASE_URL}/api/parcels/api/parcels/${id}/status`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              status: parcelStatus,
              service: 'consolidation-service',
              note: `Consolidation status changed to ${status}`
            })
          });
        } catch (err) {
          console.error(`Error updating parcel status:`, err);
        }
      });

      await Promise.all(parcelUpdatePromises);

      setSuccess(`Consolidation and ${parcelIds.length} parcel(s) status updated to ${status}`);
      await fetchData();
      setTimeout(() => setSuccess(''), 3000);

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
      case 'consolidated': return 'text-green-400 bg-green-500/20 border-green-500/50';
      case 'in_transit': return 'text-blue-400 bg-blue-500/20 border-blue-500/50';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      case 'delivered': return 'text-purple-400 bg-purple-500/20 border-purple-500/50';
      case 'cancelled': return 'text-red-400 bg-red-500/20 border-red-500/50';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/50';
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-2">Parcel Consolidation Hub</h2>
          <p className="text-gray-300">Efficiently manage and consolidate parcels for optimized delivery</p>
          <p className="text-sm text-blue-300 mt-2">
            ℹ️ You can create multiple consolidations until parcels are delivered
          </p>
          
          {setActiveTab && (
            <div className="flex justify-center gap-3 mt-4">
              <button
                onClick={() => setActiveTab('parcels')}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                View All Parcels
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTab('warehouse')}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                <Warehouse className="w-4 h-4" />
                Warehouse Management
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTab('tracking')}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                Live Tracking
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

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

        <div className="bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <button
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg font-medium transition-all hover:-translate-y-1 shadow-lg shadow-blue-600/30 flex items-center gap-2"
              onClick={() => setShowModal(true)}
            >
              <Plus className="w-4 h-4" />
              Create Consolidation
            </button>

            <button
              onClick={fetchData}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            
            <div className="text-sm text-gray-400">
              Available parcels: {parcels.length} | 
              Active consolidations: {consolidations.length}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center text-gray-400 py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading parcels and consolidations...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            
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
                            {parcel.consolidationId && (
                              <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded flex items-center gap-1">
                                <Layers className="w-3 h-3" />
                                In Consolidation
                              </span>
                            )}
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
                          <p className="text-gray-400 text-xs flex items-center gap-1">
                            <Hash className="w-3 h-3" />
                            {consolidation.masterTrackingNumber || 'No tracking number'}
                          </p>
                        </div>
                      </div>
                      
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(consolidation.status)}`}>
                        {getStatusIcon(consolidation.status)}
                        <span>{consolidation.status}</span>
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
                          {consolidation.createdTimestamp ? formatDate(consolidation.createdTimestamp) : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {consolidation.warehouseId && (
                      <div className="mb-4">
                        <p className="text-gray-400 text-sm">Warehouse</p>
                        <p className="text-gray-300 text-sm">{consolidation.warehouseId.name || 'N/A'}</p>
                      </div>
                    )}

                    {consolidation.assignedDriver && (
                      <div className="mb-4">
                        <p className="text-gray-400 text-sm">Assigned Driver</p>
                        <p className="text-gray-300 text-sm">{consolidation.assignedDriver.userName || 'N/A'}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedConsolidation(consolidation);
                          setShowDetailsModal(true);
                        }}
                        className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>

                      {consolidation.status === 'pending' && (
                        <button
                          className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                          onClick={() => updateConsolidationStatus(consolidation._id, 'consolidated')}
                        >
                          Mark Consolidated
                        </button>
                      )}
                      
                      {consolidation.status === 'consolidated' && (
                        <button
                          className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                          onClick={() => updateConsolidationStatus(consolidation._id, 'in_transit')}
                        >
                          Mark In Transit
                        </button>
                      )}

                      {consolidation.status === 'in_transit' && (
                        <button
                          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                          onClick={() => updateConsolidationStatus(consolidation._id, 'delivered')}
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>
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

        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center z-[9999]">
            <div className="bg-black opacity-50 h-[100vh] w-[100vw]" onClick={() => setShowModal(false)}></div>
            <div className="bg-gradient-to-br from-gray-800 absolute to-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white text-2xl font-semibold">Create Consolidation</h3>
                <button 
                  onClick={() => {
                    setShowModal(false);
                    setSelectedParcelIds([]);
                    setSelectedDriverId("");
                    setSelectedWarehouseId("");
                    setReferenceCode("");
                    setMasterTrackingNumber("");
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                  disabled={isSubmitting}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="overflow-y-auto overflow-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Reference Code
                    </label>
                    <input
                      type="text"
                      placeholder="Auto-generated if empty"
                      value={referenceCode}
                      onChange={e => setReferenceCode(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      <Hash className="w-4 h-4 inline mr-1" />
                      Master Tracking Number
                    </label>
                    <input
                      type="text"
                      placeholder="Auto-generated if empty"
                      value={masterTrackingNumber}
                      onChange={e => setMasterTrackingNumber(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    <Warehouse className="w-4 h-4 inline mr-2" />
                    Select Warehouse <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={selectedWarehouseId}
                    onChange={(e) => setSelectedWarehouseId(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    disabled={isSubmitting}
                  >
                    <option value="">Select a warehouse...</option>
                    {warehouses.map(warehouse => (
                      <option key={warehouse._id} value={warehouse._id}>
                        {warehouse.name} ({warehouse.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Assign Driver (Optional)
                  </label>
                  <select
                    value={selectedDriverId}
                    onChange={(e) => setSelectedDriverId(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    disabled={isSubmitting}
                  >
                    <option value="">Select a driver...</option>
                    {drivers.map(driver => (
                      <option key={driver._id} value={driver._id}>
                        {driver.details ? `${driver.details.firstName} ${driver.details.lastName}` : driver.userName}
                        {driver.details?.phoneNumber && ` - ${driver.details.phoneNumber}`}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="p-4 bg-blue-500/20 border border-blue-500 rounded-lg">
                  <p className="text-blue-300 text-sm">
                    Selected: {selectedParcelIds.length} parcel(s)
                  </p>
                  <p className="text-blue-200 text-xs mt-1">
                    ℹ️ Parcels not yet delivered can be selected for consolidation
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Select Parcels <span className="text-red-400">*</span>
                  </label>
                  {parcels.map(parcel => (
                    <label key={parcel._id} className="flex items-center gap-3 bg-gray-900 border border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedParcelIds.includes(parcel._id)}
                        onChange={() => handleSelectParcel(parcel._id)}
                        className="w-4 h-4 accent-blue-500"
                        disabled={isSubmitting}
                      />
                      <Package className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-gray-300 font-medium">{parcel.trackingNumber}</span>
                          <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                            {parcel.status}
                          </span>
                          {parcel.consolidationId && (
                            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded flex items-center gap-1">
                              <Layers className="w-3 h-3" />
                              Already in consolidation
                            </span>
                          )}
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
              </div>
              
              <div className="flex gap-4 mt-6 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200 rounded-lg font-medium transition-colors"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedParcelIds([]);
                    setSelectedDriverId("");
                    setSelectedWarehouseId("");
                    setReferenceCode("");
                    setMasterTrackingNumber("");
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedParcelIds.length > 0 && selectedWarehouseId && !isSubmitting
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white cursor-pointer'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                  onClick={handleConsolidate}
                  disabled={selectedParcelIds.length === 0 || !selectedWarehouseId || isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : `Create Consolidation (${selectedParcelIds.length})`}
                </button>
              </div>
            </div>
          </div>
        )}

        {showDetailsModal && selectedConsolidation && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
                <h3 className="text-white text-2xl font-bold">Consolidation Details</h3>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedConsolidation(null);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">{selectedConsolidation.referenceCode}</h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedConsolidation.status)}`}>
                      {getStatusIcon(selectedConsolidation.status)}
                      <span className="ml-1">{selectedConsolidation.status.toUpperCase()}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Master Tracking Number</p>
                    <p className="text-white font-medium">{selectedConsolidation.masterTrackingNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Parcels</p>
                    <p className="text-white font-medium">{selectedConsolidation.parcels.length}</p>
                  </div>
                </div>

                {selectedConsolidation.warehouseId && (
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Warehouse</p>
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                      <p className="text-white">{selectedConsolidation.warehouseId.name || 'N/A'}</p>
                      {selectedConsolidation.warehouseId.code && (
                        <p className="text-gray-400 text-sm">Code: {selectedConsolidation.warehouseId.code}</p>
                      )}
                    </div>
                  </div>
                )}

                {selectedConsolidation.assignedDriver && (
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Assigned Driver</p>
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                      <p className="text-white">{selectedConsolidation.assignedDriver.userName || 'N/A'}</p>
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-gray-400 text-sm mb-2">Parcels in Consolidation</p>
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 space-y-2">
                    {selectedConsolidation.parcels.map((parcel: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-900 rounded">
                        <Package className="w-4 h-4 text-purple-400" />
                        <span className="text-white">{parcel.trackingNumber || `Parcel ${index + 1}`}</span>
                        {parcel.status && (
                          <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded ml-auto">
                            {parcel.status}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {selectedConsolidation.statusHistory && selectedConsolidation.statusHistory.length > 0 && (
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Status History</p>
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 space-y-2">
                      {selectedConsolidation.statusHistory.map((history: any, index: number) => (
                        <div key={index} className="flex items-start gap-2 p-2">
                          <div className={`mt-1 w-2 h-2 rounded-full ${getStatusColor(history.status)}`}></div>
                          <div className="flex-1">
                            <p className="text-white text-sm font-medium">{history.status}</p>
                            <p className="text-gray-400 text-xs">
                              {history.timestamp ? formatDate(history.timestamp) : 'N/A'}
                            </p>
                            {history.note && (
                              <p className="text-gray-400 text-xs mt-1">{history.note}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Created</p>
                    <p className="text-white">{selectedConsolidation.createdTimestamp ? formatDate(selectedConsolidation.createdTimestamp) : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Last Updated</p>
                    <p className="text-white">{selectedConsolidation.updatedTimestamp ? formatDate(selectedConsolidation.updatedTimestamp) : 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}