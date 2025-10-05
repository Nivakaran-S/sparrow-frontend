"use client";
import { useState, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-gateway-nine-orpin.vercel.app";

const MyParcels = () => {
  const [parcels, setParcels] = useState<any[]>([]);
  const [filteredParcels, setFilteredParcels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParcel, setSelectedParcel] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchParcels();
  }, []);

  useEffect(() => {
    filterParcels();
  }, [selectedStatus, searchQuery, parcels]);

  const fetchParcels = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/parcels`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setParcels(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching parcels:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterParcels = () => {
    let filtered = parcels;

    if (selectedStatus !== "all") {
      filtered = filtered.filter(p => p.status === selectedStatus);
    }

    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.receiver?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredParcels(filtered);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      created: "bg-gray-500",
      at_warehouse: "bg-yellow-500",
      consolidated: "bg-blue-500",
      in_transit: "bg-purple-500",
      out_for_delivery: "bg-orange-500",
      delivered: "bg-green-500",
      cancelled: "bg-red-500"
    };
    return colors[status] || "bg-gray-500";
  };

  const getStatusLabel = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const statusOptions = [
    { value: "all", label: "All Parcels" },
    { value: "created", label: "Created" },
    { value: "at_warehouse", label: "At Warehouse" },
    { value: "consolidated", label: "Consolidated" },
    { value: "in_transit", label: "In Transit" },
    { value: "out_for_delivery", label: "Out for Delivery" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" }
  ];

  const viewParcelDetails = (parcel: any) => {
    setSelectedParcel(parcel);
    setShowDetails(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="text-white">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">My Parcels</h2>
        <p className="text-gray-400">Manage and track all your shipments</p>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by tracking number or receiver..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Filter by Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-sm">Total</p>
          <p className="text-2xl font-bold text-white">{parcels.length}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-900/30 to-gray-900 p-4 rounded-lg border border-purple-700">
          <p className="text-gray-400 text-sm">In Transit</p>
          <p className="text-2xl font-bold text-purple-400">
            {parcels.filter(p => p.status === 'in_transit').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-900/30 to-gray-900 p-4 rounded-lg border border-green-700">
          <p className="text-gray-400 text-sm">Delivered</p>
          <p className="text-2xl font-bold text-green-400">
            {parcels.filter(p => p.status === 'delivered').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-900/30 to-gray-900 p-4 rounded-lg border border-yellow-700">
          <p className="text-gray-400 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-400">
            {parcels.filter(p => p.status === 'created' || p.status === 'at_warehouse').length}
          </p>
        </div>
      </div>

      {/* Parcels List */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden">
        {filteredParcels.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Tracking Number</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Receiver</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Weight</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Created</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredParcels.map((parcel) => (
                  <tr key={parcel._id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📦</span>
                        <span className="text-white font-mono font-semibold">{parcel.trackingNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{parcel.receiver?.name || 'N/A'}</p>
                        <p className="text-gray-400 text-sm">{parcel.receiver?.phoneNumber || ''}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-white">
                      {parcel.weight?.value || 'N/A'} {parcel.weight?.unit || ''}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(parcel.status)} bg-opacity-20 text-white inline-block`}>
                        {getStatusLabel(parcel.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(parcel.createdTimeStamp).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => viewParcelDetails(parcel)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">📭</div>
            <p>No parcels found</p>
            <p className="text-sm mt-2">Try adjusting your filters or create a new shipment</p>
          </div>
        )}
      </div>

      {/* Parcel Details Modal */}
      {showDetails && selectedParcel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-700 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">Parcel Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Tracking Info */}
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">Tracking Number</p>
                    <p className="text-white text-xl font-mono font-bold">{selectedParcel.trackingNumber}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedParcel.status)} bg-opacity-20 text-white`}>
                    {getStatusLabel(selectedParcel.status)}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">
                  Created: {new Date(selectedParcel.createdTimeStamp).toLocaleString()}
                </p>
              </div>

              {/* Sender & Receiver */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <h4 className="text-blue-400 font-semibold mb-3">Sender</h4>
                  <p className="text-white font-medium">{selectedParcel.sender?.name || 'N/A'}</p>
                  <p className="text-gray-400 text-sm">{selectedParcel.sender?.phoneNumber || ''}</p>
                  <p className="text-gray-400 text-sm">{selectedParcel.sender?.email || ''}</p>
                  <p className="text-gray-400 text-sm mt-2">{selectedParcel.sender?.address || ''}</p>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <h4 className="text-green-400 font-semibold mb-3">Receiver</h4>
                  <p className="text-white font-medium">{selectedParcel.receiver?.name || 'N/A'}</p>
                  <p className="text-gray-400 text-sm">{selectedParcel.receiver?.phoneNumber || ''}</p>
                  <p className="text-gray-400 text-sm">{selectedParcel.receiver?.email || ''}</p>
                  <p className="text-gray-400 text-sm mt-2">{selectedParcel.receiver?.address || ''}</p>
                </div>
              </div>

              {/* Parcel Specifications */}
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <h4 className="text-purple-400 font-semibold mb-3">Parcel Specifications</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Weight</p>
                    <p className="text-white font-medium">
                      {selectedParcel.weight?.value || 'N/A'} {selectedParcel.weight?.unit || ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Dimensions</p>
                    <p className="text-white font-medium">
                      {selectedParcel.dimensions?.length || 'N/A'} × {selectedParcel.dimensions?.width || 'N/A'} × {selectedParcel.dimensions?.height || 'N/A'} {selectedParcel.dimensions?.unit || ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status History */}
              {selectedParcel.statusHistory && selectedParcel.statusHistory.length > 0 && (
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <h4 className="text-yellow-400 font-semibold mb-3">Status History</h4>
                  <div className="space-y-3">
                    {selectedParcel.statusHistory.map((history: any, index: number) => (
                      <div key={index} className="flex items-start gap-3 border-l-2 border-blue-500 pl-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(history.status)} bg-opacity-20 text-white`}>
                              {getStatusLabel(history.status)}
                            </span>
                            {history.location && (
                              <span className="text-gray-400 text-xs">📍 {history.location}</span>
                            )}
                          </div>
                          {history.note && (
                            <p className="text-gray-400 text-sm mt-1">{history.note}</p>
                          )}
                          <p className="text-gray-500 text-xs mt-1">
                            {new Date(history.timestamp).toLocaleString()} • {history.service || 'N/A'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 p-6">
              <button
                onClick={() => setShowDetails(false)}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyParcels;