"use client";
import { useState, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-gateway-nine-orpin.vercel.app";

const OrderHistory = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/parcels`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredOrders = () => {
    let filtered = orders;

    if (filterStatus !== "all") {
      filtered = filtered.filter(o => o.status === filterStatus);
    }

    if (sortBy === "date") {
      filtered.sort((a, b) => new Date(b.createdTimeStamp).getTime() - new Date(a.createdTimeStamp).getTime());
    } else if (sortBy === "status") {
      filtered.sort((a, b) => a.status.localeCompare(b.status));
    }

    return filtered;
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

  const viewOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Tracking Number', 'Receiver', 'Status', 'Weight', 'Date'].join(','),
      ...getFilteredOrders().map(order => [
        order.trackingNumber,
        order.receiver?.name || 'N/A',
        order.status,
        `${order.weight?.value || 'N/A'} ${order.weight?.unit || ''}`,
        new Date(order.createdTimeStamp).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
        <h2 className="text-3xl font-bold mb-2">Order History</h2>
        <p className="text-gray-400">View and manage your complete shipping history</p>
      </div>

      {/* Filters and Actions */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Orders</option>
              <option value="created">Created</option>
              <option value="at_warehouse">At Warehouse</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="date">Date</option>
              <option value="status">Status</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-end gap-2">
            <button
              onClick={exportToCSV}
              className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <span>📥</span>
              Export to CSV
            </button>
            <button className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
              Print Report
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-lg border border-gray-700 text-center">
          <p className="text-gray-400 text-sm mb-1">Total Orders</p>
          <p className="text-2xl font-bold text-white">{orders.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-900/30 to-gray-900 p-4 rounded-lg border border-green-700 text-center">
          <p className="text-gray-400 text-sm mb-1">Delivered</p>
          <p className="text-2xl font-bold text-green-400">
            {orders.filter(o => o.status === 'delivered').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-900/30 to-gray-900 p-4 rounded-lg border border-purple-700 text-center">
          <p className="text-gray-400 text-sm mb-1">In Transit</p>
          <p className="text-2xl font-bold text-purple-400">
            {orders.filter(o => o.status === 'in_transit').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-900/30 to-gray-900 p-4 rounded-lg border border-yellow-700 text-center">
          <p className="text-gray-400 text-sm mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-400">
            {orders.filter(o => o.status === 'created' || o.status === 'at_warehouse').length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-900/30 to-gray-900 p-4 rounded-lg border border-red-700 text-center">
          <p className="text-gray-400 text-sm mb-1">Cancelled</p>
          <p className="text-2xl font-bold text-red-400">
            {orders.filter(o => o.status === 'cancelled').length}
          </p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden">
        {getFilteredOrders().length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Order ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Tracking #</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Receiver</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Destination</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {getFilteredOrders().map((order, index) => (
                  <tr key={order._id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-white font-mono">#{(index + 1).toString().padStart(4, '0')}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📦</span>
                        <span className="text-white font-mono">{order.trackingNumber}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{order.receiver?.name || 'N/A'}</p>
                      <p className="text-gray-400 text-sm">{order.receiver?.phoneNumber || ''}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm max-w-xs truncate">
                      {order.receiver?.address || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)} bg-opacity-20 text-white inline-block`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(order.createdTimeStamp).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => viewOrderDetails(order)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">📋</div>
            <p>No orders found</p>
            <p className="text-sm mt-2">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-700 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">Order Details</h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Tracking Number</p>
                    <p className="text-white font-mono font-bold">{selectedOrder.trackingNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Status</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)} bg-opacity-20 text-white inline-block mt-1`}>
                      {getStatusLabel(selectedOrder.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Created Date</p>
                    <p className="text-white">{new Date(selectedOrder.createdTimeStamp).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Weight</p>
                    <p className="text-white">{selectedOrder.weight?.value || 'N/A'} {selectedOrder.weight?.unit || ''}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <h4 className="text-blue-400 font-semibold mb-3">Sender</h4>
                  <p className="text-white font-medium">{selectedOrder.sender?.name || 'N/A'}</p>
                  <p className="text-gray-400 text-sm">{selectedOrder.sender?.phoneNumber || ''}</p>
                  <p className="text-gray-400 text-sm">{selectedOrder.sender?.email || ''}</p>
                  <p className="text-gray-400 text-sm mt-2">{selectedOrder.sender?.address || ''}</p>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <h4 className="text-green-400 font-semibold mb-3">Receiver</h4>
                  <p className="text-white font-medium">{selectedOrder.receiver?.name || 'N/A'}</p>
                  <p className="text-gray-400 text-sm">{selectedOrder.receiver?.phoneNumber || ''}</p>
                  <p className="text-gray-400 text-sm">{selectedOrder.receiver?.email || ''}</p>
                  <p className="text-gray-400 text-sm mt-2">{selectedOrder.receiver?.address || ''}</p>
                </div>
              </div>

              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <h4 className="text-yellow-400 font-semibold mb-3">Status History</h4>
                  <div className="space-y-2">
                    {selectedOrder.statusHistory.map((history: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                        <div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(history.status)} bg-opacity-20 text-white`}>
                            {getStatusLabel(history.status)}
                          </span>
                          {history.note && <p className="text-gray-400 text-sm mt-1">{history.note}</p>}
                        </div>
                        <p className="text-gray-500 text-xs">{new Date(history.timestamp).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 p-6 flex gap-4">
              <button
                onClick={() => setShowDetails(false)}
                className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
              <button className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                Track Shipment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;