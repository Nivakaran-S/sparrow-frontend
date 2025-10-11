"use client";
import { useState, useEffect } from "react";
import { 
  Truck, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Filter, 
  MapPin, 
  Package, 
  User,
  Calendar,
  ChevronDown,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  Layers
} from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-gateway-nine-orpin.vercel.app";

interface Delivery {
  _id: string;
  deliveryNumber: string;
  deliveryItemType: "parcel" | "consolidation";
  parcels: any[];
  consolidation?: {
    _id: string;
    masterTrackingNumber: string;
    referenceCode: string;
    parcels: any[];
  };
  assignedDriver: {
    _id: string;
    userName: string;
    entityId: string;
  };
  assignedBy: {
    _id: string;
    userName: string;
  };
  fromLocation: {
    type: string;
    warehouseId?: any;
    address?: string;
    locationName?: string;
    latitude?: number;
    longitude?: number;
  };
  toLocation: {
    type: string;
    warehouseId?: any;
    address?: string;
    locationName?: string;
    latitude?: number;
    longitude?: number;
  };
  deliveryType: string;
  status: string;
  priority: string;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  createdTimestamp: string;
  updatedTimestamp: string;
}

interface Driver {
  _id: string;
  userName: string;
  entityId: string;
}

interface Warehouse {
  _id: string;
  name: string;
  code: string;
  address: any;
}

interface Parcel {
  _id: string;
  trackingNumber: string;
  status: string;
  warehouseId?: any;
  receiver?: {
    name?: string;
    address?: string;
    phoneNumber?: string;
  };
  sender?: {
    name?: string;
    address?: string;
    phoneNumber?: string;
  };
}

interface Consolidation {
  _id: string;
  masterTrackingNumber: string;
  referenceCode: string;
  status: string;
  parcels: any[];
  warehouseId?: any;
}

export default function DeliveryManagement({ userId, setActiveTab }: { userId?: string; setActiveTab?: (tab: string) => void }) {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState<Delivery[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [consolidations, setConsolidations] = useState<Consolidation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [itemTypeFilter, setItemTypeFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState({
    deliveryItemType: "parcel" as "parcel" | "consolidation",
    parcels: [] as string[],
    consolidation: "",
    assignedDriver: "",
    fromLocationType: "warehouse",
    fromWarehouseId: "",
    fromAddress: "",
    fromLatitude: "",
    fromLongitude: "",
    fromLocationName: "",
    toLocationType: "address",
    toWarehouseId: "",
    toAddress: "",
    toLatitude: "",
    toLongitude: "",
    toLocationName: "",
    priority: "normal",
    estimatedDeliveryTime: "",
    deliveryInstructions: "",
    notes: ""
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    filterDeliveries();
  }, [searchTerm, statusFilter, typeFilter, priorityFilter, itemTypeFilter, deliveries]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchDeliveries(),
        fetchDrivers(),
        fetchWarehouses(),
        fetchParcels(),
        fetchConsolidations()
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDeliveries = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/parcels/api/deliveries`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setDeliveries(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/users?role=Driver`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setDrivers(data.data || data || []);
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/warehouses/warehouses`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setWarehouses(data.data || data || []);
      }
    } catch (error) {
      console.error("Error fetching warehouses:", error);
    }
  };

  const fetchParcels = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/parcels/api/parcels`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        const allParcels = data.data || [];
        // Filter parcels that are available for delivery (include full parcel data)
        const availableParcels = allParcels.filter((p: any) => 
          p.status === 'created' || p.status === 'at_warehouse'
        );
        setParcels(availableParcels);
      }
    } catch (error) {
      console.error("Error fetching parcels:", error);
    }
  };

  const fetchConsolidations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/consolidations/consolidations`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        const allConsolidations = data.data || [];
        // Filter consolidations that are ready for delivery (include full data)
        const availableConsolidations = allConsolidations.filter((c: any) => 
          c.status === 'consolidated' || c.status === 'pending'
        );
        setConsolidations(availableConsolidations);
      }
    } catch (error) {
      console.error("Error fetching consolidations:", error);
    }
  };

  // Auto-fill form based on selected parcels
  const handleParcelSelection = (parcelId: string, isChecked: boolean) => {
    let updatedParcels: string[];
    
    if (isChecked) {
      updatedParcels = [...formData.parcels, parcelId];
    } else {
      updatedParcels = formData.parcels.filter(id => id !== parcelId);
    }

    setFormData({ ...formData, parcels: updatedParcels });

    // Auto-fill form if this is the first parcel selected
    if (isChecked && updatedParcels.length === 1) {
      const selectedParcel = parcels.find(p => p._id === parcelId);
      if (selectedParcel) {
        autoFillFromParcel(selectedParcel);
      }
    }
  };

  // Auto-fill form from parcel data
  const autoFillFromParcel = (parcel: any) => {
    const updates: any = {};

    // Set from location if parcel has warehouse
    if (parcel.warehouseId) {
      updates.fromLocationType = "warehouse";
      updates.fromWarehouseId = parcel.warehouseId._id || parcel.warehouseId;
    }

    // Set to location from receiver address if available
    if (parcel.receiver?.address) {
      updates.toLocationType = "address";
      updates.toAddress = parcel.receiver.address;
      // You can add latitude/longitude if available in parcel data
      updates.toLocationName = parcel.receiver.name || "";
    }

    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Auto-fill form based on selected consolidation
  const handleConsolidationSelection = (consolidationId: string) => {
    setFormData({ ...formData, consolidation: consolidationId });

    if (consolidationId) {
      const selectedConsolidation = consolidations.find(c => c._id === consolidationId);
      if (selectedConsolidation) {
        autoFillFromConsolidation(selectedConsolidation);
      }
    }
  };

  // Auto-fill form from consolidation data
  const autoFillFromConsolidation = (consolidation: any) => {
    const updates: any = {};

    // Set from location from warehouse
    if (consolidation.warehouseId) {
      updates.fromLocationType = "warehouse";
      updates.fromWarehouseId = consolidation.warehouseId._id || consolidation.warehouseId;
    }

    // If consolidation has parcels, use the first parcel's receiver info for destination
    if (consolidation.parcels && consolidation.parcels.length > 0) {
      const firstParcel = consolidation.parcels[0];
      if (firstParcel.receiver?.address) {
        updates.toLocationType = "address";
        updates.toAddress = firstParcel.receiver.address;
        updates.toLocationName = firstParcel.receiver.name || "";
      }
    }

    setFormData(prev => ({ ...prev, ...updates }));
  };

  const filterDeliveries = () => {
    let filtered = [...deliveries];

    if (searchTerm) {
      filtered = filtered.filter(delivery => 
        delivery.deliveryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.assignedDriver?.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.parcels.some(p => p.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        delivery.consolidation?.referenceCode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(delivery => delivery.status === statusFilter);
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(delivery => delivery.deliveryType === typeFilter);
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(delivery => delivery.priority === priorityFilter);
    }

    if (itemTypeFilter !== "all") {
      filtered = filtered.filter(delivery => delivery.deliveryItemType === itemTypeFilter);
    }

    setFilteredDeliveries(filtered);
  };

  const handleCreateDelivery = async (e: React.FormEvent) => {
    e.preventDefault();

    const deliveryData: any = {
      deliveryItemType: formData.deliveryItemType,
      assignedDriver: formData.assignedDriver,
      assignedBy: userId,
      fromLocation: {
        type: formData.fromLocationType,
      },
      toLocation: {
        type: formData.toLocationType,
      },
      priority: formData.priority,
      deliveryInstructions: formData.deliveryInstructions,
      notes: formData.notes
    };

    // Add parcels or consolidation based on deliveryItemType
    if (formData.deliveryItemType === "parcel") {
      deliveryData.parcels = formData.parcels;
    } else {
      deliveryData.consolidation = formData.consolidation;
    }

    // From location
    if (formData.fromLocationType === "warehouse") {
      deliveryData.fromLocation.warehouseId = formData.fromWarehouseId;
    } else {
      deliveryData.fromLocation.address = formData.fromAddress;
      deliveryData.fromLocation.latitude = parseFloat(formData.fromLatitude);
      deliveryData.fromLocation.longitude = parseFloat(formData.fromLongitude);
      deliveryData.fromLocation.locationName = formData.fromLocationName;
    }

    // To location
    if (formData.toLocationType === "warehouse") {
      deliveryData.toLocation.warehouseId = formData.toWarehouseId;
    } else {
      deliveryData.toLocation.address = formData.toAddress;
      deliveryData.toLocation.latitude = parseFloat(formData.toLatitude);
      deliveryData.toLocation.longitude = parseFloat(formData.toLongitude);
      deliveryData.toLocation.locationName = formData.toLocationName;
    }

    if (formData.estimatedDeliveryTime) {
      deliveryData.estimatedDeliveryTime = formData.estimatedDeliveryTime;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/parcels/api/deliveries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(deliveryData)
      });

      if (res.ok) {
        await fetchDeliveries();
        setShowCreateModal(false);
        resetForm();
        alert("Delivery created successfully!");
      } else {
        const error = await res.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error creating delivery:", error);
      alert("Failed to create delivery");
    }
  };

  const handleUpdateStatus = async (deliveryId: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/parcels/api/deliveries/${deliveryId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus, note: `Status updated to ${newStatus}` })
      });

      if (res.ok) {
        await fetchDeliveries();
        alert("Status updated successfully!");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const handleDeleteDelivery = async () => {
    if (!selectedDelivery) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/parcels/api/deliveries/${selectedDelivery._id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        await fetchDeliveries();
        setShowDeleteModal(false);
        setSelectedDelivery(null);
        alert("Delivery deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting delivery:", error);
      alert("Failed to delete delivery");
    }
  };

  const resetForm = () => {
    setFormData({
      deliveryItemType: "parcel",
      parcels: [],
      consolidation: "",
      assignedDriver: "",
      fromLocationType: "warehouse",
      fromWarehouseId: "",
      fromAddress: "",
      fromLatitude: "",
      fromLongitude: "",
      fromLocationName: "",
      toLocationType: "address",
      toWarehouseId: "",
      toAddress: "",
      toLatitude: "",
      toLongitude: "",
      toLocationName: "",
      priority: "normal",
      estimatedDeliveryTime: "",
      deliveryInstructions: "",
      notes: ""
    });
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      assigned: "bg-blue-500/20 text-blue-400 border-blue-500/50",
      accepted: "bg-green-500/20 text-green-400 border-green-500/50",
      in_progress: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      picked_up: "bg-purple-500/20 text-purple-400 border-purple-500/50",
      in_transit: "bg-orange-500/20 text-orange-400 border-orange-500/50",
      delivered: "bg-green-500/20 text-green-400 border-green-500/50",
      failed: "bg-red-500/20 text-red-400 border-red-500/50",
      cancelled: "bg-gray-500/20 text-gray-400 border-gray-500/50"
    };
    return colors[status] || "bg-gray-500/20 text-gray-400 border-gray-500/50";
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      low: "bg-gray-500/20 text-gray-400",
      normal: "bg-blue-500/20 text-blue-400",
      high: "bg-orange-500/20 text-orange-400",
      urgent: "bg-red-500/20 text-red-400"
    };
    return colors[priority] || "bg-gray-500/20 text-gray-400";
  };

  const formatDeliveryType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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

  const getItemCount = (delivery: Delivery) => {
    if (delivery.deliveryItemType === "parcel") {
      return `${delivery.parcels.length} Parcel${delivery.parcels.length !== 1 ? 's' : ''}`;
    } else {
      return `1 Consolidation (${delivery.consolidation?.parcels?.length || 0} parcels)`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Delivery Management</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r cursor-pointer from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all hover:-translate-y-1 shadow-lg shadow-blue-600/30 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Delivery
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 rounded-lg w-12 h-12 flex items-center justify-center">
              <Truck className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Deliveries</p>
              <p className="text-white text-2xl font-bold">{deliveries.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-500/20 rounded-lg w-12 h-12 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">In Progress</p>
              <p className="text-white text-2xl font-bold">
                {deliveries.filter(d => d.status === 'in_progress' || d.status === 'in_transit').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-500/20 rounded-lg w-12 h-12 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Delivered</p>
              <p className="text-white text-2xl font-bold">
                {deliveries.filter(d => d.status === 'delivered').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-500/20 rounded-lg w-12 h-12 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Failed</p>
              <p className="text-white text-2xl font-bold">
                {deliveries.filter(d => d.status === 'failed' || d.status === 'cancelled').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by delivery number, driver, tracking number, or consolidation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-700 cursor-pointer hover:bg-gray-600 border border-gray-600 text-gray-200 px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2"
          >
            <Filter className="w-5 h-5" />
            Filters
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-700">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Item Type</label>
              <select
                value={itemTypeFilter}
                onChange={(e) => setItemTypeFilter(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="parcel">Parcel</option>
                <option value="consolidation">Consolidation</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="assigned">Assigned</option>
                <option value="accepted">Accepted</option>
                <option value="in_progress">In Progress</option>
                <option value="picked_up">Picked Up</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Delivery Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="address_to_warehouse">Address to Warehouse</option>
                <option value="warehouse_to_warehouse">Warehouse to Warehouse</option>
                <option value="warehouse_to_address">Warehouse to Address</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Deliveries List */}
      <div className="space-y-4">
        {filteredDeliveries.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-12 text-center">
            <Truck className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No deliveries found</p>
          </div>
        ) : (
          filteredDeliveries.map((delivery) => (
            <div
              key={delivery._id}
              className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 hover:border-blue-500 transition-all"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Section */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-white text-xl font-bold mb-2">{delivery.deliveryNumber}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(delivery.status)}`}>
                          {delivery.status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(delivery.priority)}`}>
                          {delivery.priority.toUpperCase()}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                          {formatDeliveryType(delivery.deliveryType)}
                        </span>
                        {delivery.deliveryItemType === "consolidation" && (
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-400 flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            CONSOLIDATION
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-400">
                        <MapPin className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-medium">From:</span>
                      </div>
                      <p className="text-white text-sm pl-6">
                        {delivery.fromLocation.type === 'warehouse' 
                          ? delivery.fromLocation.warehouseId?.name || 'Warehouse'
                          : delivery.fromLocation.address || delivery.fromLocation.locationName}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-400">
                        <MapPin className="w-4 h-4 text-red-400" />
                        <span className="text-sm font-medium">To:</span>
                      </div>
                      <p className="text-white text-sm pl-6">
                        {delivery.toLocation.type === 'warehouse' 
                          ? delivery.toLocation.warehouseId?.name || 'Warehouse'
                          : delivery.toLocation.address || delivery.toLocation.locationName}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-400 text-sm">Driver:</span>
                      <span className="text-white text-sm font-medium">{delivery.assignedDriver?.userName || 'N/A'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {delivery.deliveryItemType === "parcel" ? (
                        <Package className="w-4 h-4 text-purple-400" />
                      ) : (
                        <Layers className="w-4 h-4 text-cyan-400" />
                      )}
                      <span className="text-gray-400 text-sm">Items:</span>
                      <span className="text-white text-sm font-medium">{getItemCount(delivery)}</span>
                    </div>
                  </div>

                  {delivery.deliveryItemType === "consolidation" && delivery.consolidation && (
                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Layers className="w-4 h-4 text-cyan-400" />
                        <span className="text-cyan-400 text-sm font-medium">Consolidation Details</span>
                      </div>
                      <p className="text-gray-300 text-sm pl-6">
                        Reference: {delivery.consolidation.referenceCode}
                      </p>
                      <p className="text-gray-400 text-xs pl-6">
                        Tracking: {delivery.consolidation.masterTrackingNumber}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>Created: {formatDate(delivery.createdTimestamp)}</span>
                  </div>
                </div>

                {/* Right Section - Actions */}
                <div className="flex flex-col gap-2 lg:min-w-[200px]">
                  <select
                    value={delivery.status}
                    onChange={(e) => handleUpdateStatus(delivery._id, e.target.value)}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="assigned">Assigned</option>
                    <option value="accepted">Accepted</option>
                    <option value="in_progress">In Progress</option>
                    <option value="picked_up">Picked Up</option>
                    <option value="in_transit">In Transit</option>
                    <option value="near_destination">Near Destination</option>
                    <option value="delivered">Delivered</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <button
                    onClick={() => {
                      setSelectedDelivery(delivery);
                      setShowDeleteModal(true);
                    }}
                    className="w-full bg-red-600 cursor-pointer hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>

            
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Delivery Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] ">
          <div className="bg-gray-900 overflow-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border border-gray-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
              <h3 className="text-white text-2xl font-bold">Create New Delivery</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateDelivery} className="p-6 space-y-6">
              {/* Delivery Item Type Selection */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Delivery Type *</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, deliveryItemType: "parcel", consolidation: "" })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.deliveryItemType === "parcel"
                        ? "border-blue-500 bg-blue-500/20"
                        : "border-gray-700 bg-gray-800 hover:border-gray-600"
                    }`}
                  >
                    <Package className={`w-8 h-8 mx-auto mb-2 ${
                      formData.deliveryItemType === "parcel" ? "text-blue-400" : "text-gray-400"
                    }`} />
                    <p className={`font-medium ${
                      formData.deliveryItemType === "parcel" ? "text-blue-400" : "text-gray-300"
                    }`}>
                      Parcel Delivery
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Deliver individual parcels</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, deliveryItemType: "consolidation", parcels: [] })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.deliveryItemType === "consolidation"
                        ? "border-cyan-500 bg-cyan-500/20"
                        : "border-gray-700 bg-gray-800 hover:border-gray-600"
                    }`}
                  >
                    <Layers className={`w-8 h-8 mx-auto mb-2 ${
                      formData.deliveryItemType === "consolidation" ? "text-cyan-400" : "text-gray-400"
                    }`} />
                    <p className={`font-medium ${
                      formData.deliveryItemType === "consolidation" ? "text-cyan-400" : "text-gray-300"
                    }`}>
                      Consolidation Delivery
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Deliver a consolidated shipment</p>
                  </button>
                </div>
              </div>

              {/* Parcels Selection - Only show if parcel delivery */}
              {formData.deliveryItemType === "parcel" && (
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Select Parcels * 
                    <span className="text-xs text-gray-500 ml-2">(Form will auto-fill from first selected parcel)</span>
                  </label>
                  <div className="max-h-40 overflow-y-auto bg-gray-800 border border-gray-700 rounded-lg p-3 space-y-2">
                    {parcels.map(parcel => (
                      <label key={parcel._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-700 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={formData.parcels.includes(parcel._id)}
                          onChange={(e) => handleParcelSelection(parcel._id, e.target.checked)}
                          className="w-4 h-4"
                        />
                        <div className="flex-1">
                          <span className="text-white text-sm">{parcel.trackingNumber}</span>
                          <span className="text-gray-400 text-xs ml-2">({parcel.status})</span>
                          {(parcel as any).receiver?.name && (
                            <div className="text-xs text-gray-500 mt-1">
                              To: {(parcel as any).receiver.name} - {(parcel as any).receiver?.address}
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                  {parcels.length === 0 && (
                    <p className="text-gray-500 text-sm mt-2">No available parcels</p>
                  )}
                </div>
              )}

              {/* Consolidation Selection - Only show if consolidation delivery */}
              {formData.deliveryItemType === "consolidation" && (
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Select Consolidation *
                    <span className="text-xs text-gray-500 ml-2">(Form will auto-fill from consolidation data)</span>
                  </label>
                  <select
                    required
                    value={formData.consolidation}
                    onChange={(e) => handleConsolidationSelection(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">Select a consolidation</option>
                    {consolidations.map(consolidation => (
                      <option key={consolidation._id} value={consolidation._id}>
                        {consolidation.referenceCode} - {consolidation.masterTrackingNumber} ({(consolidation as any).parcels?.length || 0} parcels)
                      </option>
                    ))}
                  </select>
                  {consolidations.length === 0 && (
                    <p className="text-gray-500 text-sm mt-2">No available consolidations</p>
                  )}
                  
                  {/* Show consolidation details when selected */}
                  {formData.consolidation && (() => {
                    const selectedCons = consolidations.find(c => c._id === formData.consolidation);
                    return selectedCons ? (
                      <div className="mt-3 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                        <p className="text-cyan-400 text-sm font-medium mb-1">Consolidation Details:</p>
                        <p className="text-gray-300 text-xs">Reference: {selectedCons.referenceCode}</p>
                        <p className="text-gray-300 text-xs">Tracking: {selectedCons.masterTrackingNumber}</p>
                        <p className="text-gray-300 text-xs">Parcels: {(selectedCons as any).parcels?.length || 0}</p>
                        {(selectedCons as any).warehouseId?.name && (
                          <p className="text-gray-300 text-xs">Warehouse: {(selectedCons as any).warehouseId.name}</p>
                        )}
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              {/* Driver Selection */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Assign Driver *</label>
                <select
                  required
                  value={formData.assignedDriver}
                  onChange={(e) => setFormData({ ...formData, assignedDriver: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a driver</option>
                  {drivers.map(driver => (
                    <option key={driver._id} value={driver._id}>
                      {driver.userName}
                    </option>
                  ))}
                </select>
              </div>

              {/* From Location */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                  From Location
                  <span className="text-xs text-gray-500 font-normal">(Auto-filled, but editable)</span>
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Location Type *</label>
                    <select
                      value={formData.fromLocationType}
                      onChange={(e) => setFormData({ ...formData, fromLocationType: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="warehouse">Warehouse</option>
                      <option value="address">Address</option>
                    </select>
                  </div>

                  {formData.fromLocationType === "warehouse" ? (
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Select Warehouse *</label>
                      <select
                        required
                        value={formData.fromWarehouseId}
                        onChange={(e) => setFormData({ ...formData, fromWarehouseId: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a warehouse</option>
                        {warehouses.map(warehouse => (
                          <option key={warehouse._id} value={warehouse._id}>
                            {warehouse.name} ({warehouse.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Address *</label>
                        <input
                          type="text"
                          required
                          value={formData.fromAddress}
                          onChange={(e) => setFormData({ ...formData, fromAddress: e.target.value })}
                          placeholder="Enter full address"
                          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-400 text-sm mb-2">Latitude *</label>
                          <input
                            type="number"
                            step="any"
                            required
                            value={formData.fromLatitude}
                            onChange={(e) => setFormData({ ...formData, fromLatitude: e.target.value })}
                            placeholder="6.9271"
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm mb-2">Longitude *</label>
                          <input
                            type="number"
                            step="any"
                            required
                            value={formData.fromLongitude}
                            onChange={(e) => setFormData({ ...formData, fromLongitude: e.target.value })}
                            placeholder="79.8612"
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Location Name</label>
                        <input
                          type="text"
                          value={formData.fromLocationName}
                          onChange={(e) => setFormData({ ...formData, fromLocationName: e.target.value })}
                          placeholder="e.g., Customer Pickup Point"
                          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* To Location */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                  To Location
                  <span className="text-xs text-gray-500 font-normal">(Auto-filled, but editable)</span>
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Location Type *</label>
                    <select
                      value={formData.toLocationType}
                      onChange={(e) => setFormData({ ...formData, toLocationType: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="warehouse">Warehouse</option>
                      <option value="address">Address</option>
                    </select>
                  </div>

                  {formData.toLocationType === "warehouse" ? (
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Select Warehouse *</label>
                      <select
                        required
                        value={formData.toWarehouseId}
                        onChange={(e) => setFormData({ ...formData, toWarehouseId: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a warehouse</option>
                        {warehouses.map(warehouse => (
                          <option key={warehouse._id} value={warehouse._id}>
                            {warehouse.name} ({warehouse.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Address *</label>
                        <input
                          type="text"
                          required
                          value={formData.toAddress}
                          onChange={(e) => setFormData({ ...formData, toAddress: e.target.value })}
                          placeholder="Enter full address"
                          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-400 text-sm mb-2">Latitude *</label>
                          <input
                            type="number"
                            step="any"
                            required
                            value={formData.toLatitude}
                            onChange={(e) => setFormData({ ...formData, toLatitude: e.target.value })}
                            placeholder="7.2008"
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-400 text-sm mb-2">Longitude *</label>
                          <input
                            type="number"
                            step="any"
                            required
                            value={formData.toLongitude}
                            onChange={(e) => setFormData({ ...formData, toLongitude: e.target.value })}
                            placeholder="79.8358"
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Location Name</label>
                        <input
                          type="text"
                          value={formData.toLocationName}
                          onChange={(e) => setFormData({ ...formData, toLocationName: e.target.value })}
                          placeholder="e.g., Customer Delivery Point"
                          className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Estimated Delivery Time</label>
                  <input
                    type="datetime-local"
                    value={formData.estimatedDeliveryTime}
                    onChange={(e) => setFormData({ ...formData, estimatedDeliveryTime: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Delivery Instructions</label>
                <textarea
                  value={formData.deliveryInstructions}
                  onChange={(e) => setFormData({ ...formData, deliveryInstructions: e.target.value })}
                  placeholder="Special instructions for the driver..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Internal notes..."
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-700 cursor-pointer hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 cursor-pointer bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg shadow-blue-600/30"
                >
                  Create Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-red-500/20 rounded-full w-12 h-12 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-white text-xl font-bold">Delete Delivery</h3>
                <p className="text-gray-400 text-sm">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-gray-300 mb-6">
              Are you sure you want to delete delivery <span className="font-bold text-white">{selectedDelivery.deliveryNumber}</span>?
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedDelivery(null);
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDelivery}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}