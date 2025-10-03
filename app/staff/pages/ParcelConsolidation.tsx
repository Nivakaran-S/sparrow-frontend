'use client'

import { useState, useEffect } from "react";
import { AlertCircle, Package, MapPin, Truck, Plus, X, CheckCircle } from "lucide-react";

// Types based on the backend models
interface Parcel {
  id: string;
  trackingNumber: string;
  customerId: string;
  weight: number;
  volume: number;
  origin: string;
  destination: string;
  status: 'RECEIVED' | 'PROCESSING' | 'CONSOLIDATED' | 'SHIPPED' | 'DELIVERED';
  createdAt: string;
  updatedAt: string;
}

interface ConsolidatedParcel {
  id: string;
  consolidationId: string;
  parcelIds: string[];
  customerId: string;
  totalWeight: number;
  totalVolume: number;
  origin: string;
  destination: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'SHIPPED';
  createdAt: string;
  updatedAt: string;
}

export default function ParcelConsolidation() {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [consolidations, setConsolidations] = useState<ConsolidatedParcel[]>([]);
  const [selectedParcelIds, setSelectedParcelIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [customerId, setCustomerId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // API configuration - try multiple endpoints
  const getApiUrl = (endpoint: string) => {
    // In production, use the API gateway
    if (process.env.NODE_ENV === 'production') {
      return `/api/${endpoint}`;
    }
    
    // In development, try direct service connection first, then gateway fallback
    return `http://localhost:8080/api/consolidation/api/${endpoint}`;
  };

  const getGatewayUrl = (endpoint: string) => {
    return `http://localhost:8080/api/consolidation/api/${endpoint}`;
  };

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
      // Try direct service first
      let response = await fetch(getApiUrl('parcels'));
      
      if (!response.ok) {
        // Try through API gateway
        console.log('Direct service failed, trying API gateway...');
        response = await fetch(getGatewayUrl('parcels'));
      }

      if (!response.ok) {
        console.warn('Both API calls failed, using mock data');
        throw new Error('Failed to fetch parcels from both direct and gateway endpoints');
      }
      
      const data = await response.json();
      setParcels(data);
    } catch (error) {
      console.error('Error fetching parcels:', error);
      // Enhanced mock data for demonstration
      setParcels([
        {
          id: "1",
          trackingNumber: "TRK001",
          customerId: "CUST001",
          weight: 2.5,
          volume: 0.1,
          origin: "Warehouse A",
          destination: "Zone North",
          status: "RECEIVED",
          createdAt: "2024-01-15T10:00:00Z",
          updatedAt: "2024-01-15T10:00:00Z"
        },
        {
          id: "2",
          trackingNumber: "TRK002",
          customerId: "CUST001",
          weight: 1.8,
          volume: 0.08,
          origin: "Warehouse A",
          destination: "Zone North",
          status: "RECEIVED",
          createdAt: "2024-01-15T11:00:00Z",
          updatedAt: "2024-01-15T11:00:00Z"
        },
        {
          id: "3",
          trackingNumber: "TRK003",
          customerId: "CUST002",
          weight: 3.2,
          volume: 0.15,
          origin: "Warehouse B",
          destination: "Zone South",
          status: "PROCESSING",
          createdAt: "2024-01-15T12:00:00Z",
          updatedAt: "2024-01-15T12:00:00Z"
        },
        {
          id: "4",
          trackingNumber: "TRK004",
          customerId: "CUST001",
          weight: 1.2,
          volume: 0.06,
          origin: "Warehouse A",
          destination: "Zone North",
          status: "RECEIVED",
          createdAt: "2024-01-15T13:00:00Z",
          updatedAt: "2024-01-15T13:00:00Z"
        },
        {
          id: "5",
          trackingNumber: "TRK005",
          customerId: "CUST003",
          weight: 4.1,
          volume: 0.18,
          origin: "Warehouse C",
          destination: "Zone East",
          status: "RECEIVED",
          createdAt: "2024-01-15T14:00:00Z",
          updatedAt: "2024-01-15T14:00:00Z"
        },
        {
          id: "6",
          trackingNumber: "TRK006",
          customerId: "CUST002",
          weight: 2.8,
          volume: 0.12,
          origin: "Warehouse B",
          destination: "Zone South",
          status: "RECEIVED",
          createdAt: "2024-01-15T15:00:00Z",
          updatedAt: "2024-01-15T15:00:00Z"
        }
      ]);
    }
  };

  const fetchConsolidations = async () => {
    try {
      // Try direct service first
      let response = await fetch(getApiUrl('consolidations'));
      
      if (!response.ok) {
        // Try through API gateway
        console.log('Direct consolidation service failed, trying API gateway...');
        response = await fetch(getGatewayUrl('consolidations'));
      }

      if (!response.ok) {
        console.warn('Both consolidation API calls failed, using mock data');
        throw new Error('Failed to fetch consolidations from both endpoints');
      }
      
      const data = await response.json();
      setConsolidations(data);
    } catch (error) {
      console.error('Error fetching consolidations:', error);
      // Enhanced mock data for demonstration
      setConsolidations([
        {
          id: "C001",
          consolidationId: "CONS001",
          parcelIds: ["7", "8"],
          customerId: "CUST003",
          totalWeight: 5.5,
          totalVolume: 0.25,
          origin: "Warehouse A",
          destination: "Zone East",
          status: "COMPLETED",
          createdAt: "2024-01-14T15:00:00Z",
          updatedAt: "2024-01-14T17:00:00Z"
        },
        {
          id: "C002",
          consolidationId: "CONS002",
          parcelIds: ["9", "10", "11"],
          customerId: "CUST004",
          totalWeight: 7.2,
          totalVolume: 0.32,
          origin: "Warehouse B",
          destination: "Zone West",
          status: "PENDING",
          createdAt: "2024-01-15T09:00:00Z",
          updatedAt: "2024-01-15T09:00:00Z"
        },
        {
          id: "C003",
          consolidationId: "CONS003",
          parcelIds: ["12", "13"],
          customerId: "CUST005",
          totalWeight: 4.8,
          totalVolume: 0.20,
          origin: "Warehouse C",
          destination: "Zone South",
          status: "PROCESSING",
          createdAt: "2024-01-15T14:00:00Z",
          updatedAt: "2024-01-15T16:00:00Z"
        }
      ]);
    }
  };

  const handleSelectParcel = (parcelId: string) => {
    setSelectedParcelIds(prev => 
      prev.includes(parcelId) 
        ? prev.filter(id => id !== parcelId)
        : [...prev, parcelId]
    );
  };

  const handleConsolidate = async () => {
    if (selectedParcelIds.length === 0) {
      setError('Please select at least one parcel');
      return;
    }
    if (!customerId) {
      setError('Please enter a customer ID');
      return;
    }

    try {
      // Try direct service first
      let response = await fetch(`${getApiUrl('consolidations')}?customerId=${customerId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedParcelIds)
      });

      if (!response.ok) {
        // Try through API gateway
        console.log('Direct consolidation creation failed, trying API gateway...');
        response = await fetch(`${getGatewayUrl('consolidations')}?customerId=${customerId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(selectedParcelIds)
        });
      }

      if (!response.ok) {
        throw new Error(`Failed to create consolidation: ${response.statusText}`);
      }

      const newConsolidation = await response.json();
      setConsolidations(prev => [...prev, newConsolidation]);
      
      // Update parcel statuses locally
      setParcels(prev => 
        prev.map(parcel => 
          selectedParcelIds.includes(parcel.id) 
            ? { ...parcel, status: 'CONSOLIDATED' as const }
            : parcel
        )
      );

      setSelectedParcelIds([]);
      setCustomerId("");
      setShowModal(false);
      setSuccess('Consolidation created successfully!');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error creating consolidation:', error);
      // Simulate successful consolidation for demo purposes
      const mockConsolidation: ConsolidatedParcel = {
        id: `C${Date.now()}`,
        consolidationId: `CONS${Date.now()}`,
        parcelIds: selectedParcelIds,
        customerId: customerId,
        totalWeight: selectedParcelIds.reduce((acc, id) => {
          const parcel = parcels.find(p => p.id === id);
          return acc + (parcel?.weight || 0);
        }, 0),
        totalVolume: selectedParcelIds.reduce((acc, id) => {
          const parcel = parcels.find(p => p.id === id);
          return acc + (parcel?.volume || 0);
        }, 0),
        origin: parcels.find(p => selectedParcelIds.includes(p.id))?.origin || "Unknown",
        destination: parcels.find(p => selectedParcelIds.includes(p.id))?.destination || "Unknown",
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setConsolidations(prev => [...prev, mockConsolidation]);
      
      // Update parcel statuses locally
      setParcels(prev => 
        prev.map(parcel => 
          selectedParcelIds.includes(parcel.id) 
            ? { ...parcel, status: 'CONSOLIDATED' as const }
            : parcel
        )
      );

      setSelectedParcelIds([]);
      setCustomerId("");
      setShowModal(false);
      setSuccess('Consolidation created successfully! (Demo Mode - API unavailable)');
      
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const updateConsolidationStatus = async (consolidationId: string, status: ConsolidatedParcel['status']) => {
    try {
      // Try direct service first
      let response = await fetch(`${getApiUrl('consolidations')}/${consolidationId}/status/${status}`, {
        method: 'PATCH'
      });

      if (!response.ok) {
        // Try through API gateway
        response = await fetch(`${getGatewayUrl('consolidations')}/${consolidationId}/status/${status}`, {
          method: 'PATCH'
        });
      }

      if (!response.ok) {
        throw new Error('Failed to update consolidation status');
      }

      const updatedConsolidation = await response.json();
      setConsolidations(prev => 
        prev.map(c => c.id === consolidationId ? updatedConsolidation : c)
      );
      
      setSuccess(`Consolidation status updated to ${status}`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating consolidation status:', error);
      
      // Fallback: Update locally for demo purposes
      setConsolidations(prev => 
        prev.map(c => c.id === consolidationId ? { ...c, status, updatedAt: new Date().toISOString() } : c)
      );
      
      setSuccess(`Consolidation status updated to ${status} (Demo Mode)`);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  // Group parcels by destination for available parcels only
  const availableParcels = parcels.filter(p => 
    p.status === 'RECEIVED' || p.status === 'PROCESSING'
  );
  
  const parcelsByDestination = availableParcels.reduce((acc: Record<string, Parcel[]>, parcel) => {
    const key = parcel.destination || "Unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(parcel);
    return acc;
  }, {});

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-400';
      case 'PROCESSING': return 'text-blue-400';
      case 'PENDING': return 'text-yellow-400';
      case 'SHIPPED': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />;
      case 'PROCESSING': return <Package className="w-4 h-4" />;
      case 'SHIPPED': return <Truck className="w-4 h-4" />;
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
                placeholder="Enter Customer ID"
                value={customerId}
                onChange={e => setCustomerId(e.target.value)}
                className="px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
              <button
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg font-medium transition-all hover:-translate-y-1 shadow-lg shadow-blue-600/30 flex items-center gap-2"
                onClick={() => setShowModal(true)}
                disabled={!customerId}
              >
                <Plus className="w-4 h-4" />
                Select Parcels
              </button>
            </div>
            
            <div className="text-sm text-gray-400">
              Available parcels: {availableParcels.length} | 
              Active consolidations: {consolidations.length}
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center text-gray-400 py-12">
            <Package className="w-12 h-12 mx-auto mb-4 animate-spin" />
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
                        Total weight: {parcels.reduce((acc, p) => acc + p.weight, 0).toFixed(1)}kg • 
                        Total volume: {parcels.reduce((acc, p) => acc + p.volume, 0).toFixed(2)}m³
                      </p>
                    </div>
                    
                    <div className="space-y-2 mb-6">
                      {parcels.map(parcel => (
                        <div key={parcel.id} className="flex items-center justify-between p-3 bg-gray-900 border border-gray-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Package className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300">{parcel.trackingNumber}</span>
                            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                              {parcel.status}
                            </span>
                          </div>
                          <div className="text-gray-400 text-sm">
                            {parcel.weight}kg • {parcel.volume}m³
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <button 
                      className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all"
                      onClick={() => {
                        setCustomerId(parcels[0]?.customerId || '');
                        setShowModal(true);
                      }}
                    >
                      Create Consolidation
                    </button>
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
                {consolidations.map(consolidation => (
                  <div key={consolidation.id} className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-500/20 rounded-full w-10 h-10 flex items-center justify-center text-purple-400">
                          <Truck className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-purple-400 font-semibold">{consolidation.consolidationId}</h4>
                          <p className="text-gray-400 text-sm">Customer: {consolidation.customerId}</p>
                        </div>
                      </div>
                      
                      <div className={`flex items-center gap-2 ${getStatusColor(consolidation.status)}`}>
                        {getStatusIcon(consolidation.status)}
                        <span className="font-medium">{consolidation.status}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-gray-400">Origin</p>
                        <p className="text-gray-300">{consolidation.origin}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Destination</p>
                        <p className="text-gray-300">{consolidation.destination}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Total Weight</p>
                        <p className="text-gray-300">{consolidation.totalWeight}kg</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Parcels</p>
                        <p className="text-gray-300">{consolidation.parcelIds.length} items</p>
                      </div>
                    </div>
                    
                    {consolidation.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors"
                          onClick={() => updateConsolidationStatus(consolidation.id, 'PROCESSING')}
                        >
                          Start Processing
                        </button>
                        <button
                          className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                          onClick={() => updateConsolidationStatus(consolidation.id, 'COMPLETED')}
                        >
                          Mark Complete
                        </button>
                      </div>
                    )}
                    
                    {consolidation.status === 'COMPLETED' && (
                      <button
                        className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
                        onClick={() => updateConsolidationStatus(consolidation.id, 'SHIPPED')}
                      >
                        Mark as Shipped
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
                  Customer ID: <span className="font-semibold">{customerId}</span> • 
                  Selected: {selectedParcelIds.length} parcel(s)
                </p>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-2 mb-6">
                {availableParcels
                  .filter(parcel => parcel.customerId === customerId)
                  .map(parcel => (
                    <label key={parcel.id} className="flex items-center gap-3 bg-gray-900 border border-gray-700 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedParcelIds.includes(parcel.id)}
                        onChange={() => handleSelectParcel(parcel.id)}
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
                          {parcel.origin} → {parcel.destination} • {parcel.weight}kg • {parcel.volume}m³
                        </div>
                      </div>
                    </label>
                  ))}
                
                {availableParcels.filter(p => p.customerId === customerId).length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No parcels found for customer: {customerId}</p>
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
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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