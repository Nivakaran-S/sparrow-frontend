'use client';
import { useState, useEffect } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://api-gateway-nine-orpin.vercel.app";

interface Parcel {
  _id: string;
  trackingNumber: string;
  weight?: { value: number; unit: string };
  dimensions?: { length: number; width: number; height: number; unit: string };
  sender?: { name: string; phoneNumber: string; email: string; address: string };
  receiver?: { name: string; phoneNumber: string; email: string; address: string };
  status:
    | "created"
    | "at_warehouse"
    | "consolidated"
    | "in_transit"
    | "out_for_delivery"
    | "delivered"
    | "cancelled";
  warehouseId?: any;
  consolidationId?: any;
  createdBy?: any;
  createdTimeStamp?: string;
}

export default function ParcelManagement({ userId }: { userId?: string }) {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newParcel, setNewParcel] = useState<Partial<Parcel>>({
    trackingNumber: "",
    weight: { value: 0, unit: "kg" },
    dimensions: { length: 0, width: 0, height: 0, unit: "cm" },
    sender: { name: "", phoneNumber: "", email: "", address: "" },
    receiver: { name: "", phoneNumber: "", email: "", address: "" },
    status: "created",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchParcels();
  }, []);

  async function safeJsonParse(res: Response, label: string) {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      console.error(`${label} returned non-JSON:`, text);
      throw new Error(`${label} returned invalid JSON: ${text.slice(0, 100)}`);
    }
  }

  async function fetchParcels() {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/parcels/api/parcels/`, {
        credentials: "include",
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Failed to fetch parcels: ${text}`);
      }

      const data = await safeJsonParse(response, "Parcels");
      setParcels(data.data || data);
      setError("");
    } catch (err: any) {
      console.error("Parcel fetch error:", err);
      setError(err.message || "Failed to fetch parcels from server");
    } finally {
      setIsLoading(false);
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("weight.")) {
      const field = name.split(".")[1];
      setNewParcel((prev) => ({
        ...prev,
        weight: {
          value:
            field === "value"
              ? parseFloat(value) || 0
              : prev.weight?.value ?? 0,
          unit: field === "unit" ? value : prev.weight?.unit ?? "kg",
        },
      }));
    } else if (name.startsWith("dimensions.")) {
      const field = name.split(".")[1];
      setNewParcel((prev) => ({
        ...prev,
        dimensions: {
          length:
            field === "length"
              ? parseFloat(value) || 0
              : prev.dimensions?.length ?? 0,
          width:
            field === "width"
              ? parseFloat(value) || 0
              : prev.dimensions?.width ?? 0,
          height:
            field === "height"
              ? parseFloat(value) || 0
              : prev.dimensions?.height ?? 0,
          unit: field === "unit" ? value : prev.dimensions?.unit ?? "cm",
        },
      }));
    } else if (name.startsWith("sender.") || name.startsWith("receiver.")) {
      const [type, field] = name.split(".");
      setNewParcel((prev) => ({
        ...prev,
        [type]: { ...(prev[type as "sender" | "receiver"] || {}), [field]: value },
      }));
    } else {
      setNewParcel((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAddParcel = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (!newParcel.trackingNumber) {
        setError("Tracking number is required");
        return;
      }

      const parcelData = {
        ...newParcel,
        createdBy: userId,
        weight: newParcel.weight || { value: 0, unit: "kg" },
        dimensions:
          newParcel.dimensions || { length: 0, width: 0, height: 0, unit: "cm" },
      };

      const response = await fetch(`${API_BASE_URL}/api/parcels`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parcelData),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Parcel creation failed: ${text}`);
      }

      setShowAddForm(false);
      setNewParcel({
        trackingNumber: "",
        weight: { value: 0, unit: "kg" },
        dimensions: { length: 0, width: 0, height: 0, unit: "cm" },
        sender: { name: "", phoneNumber: "", email: "", address: "" },
        receiver: { name: "", phoneNumber: "", email: "", address: "" },
        status: "created",
      });
      setSuccess("Parcel created successfully!");
      fetchParcels();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create parcel");
    }
  };

  const handleStatusUpdate = async (id: string, status: Parcel["status"]) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/parcels/${id}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            service: "staff-dashboard",
            note: `Status updated to ${status} by staff`,
          }),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Status update failed: ${text}`);
      }

      setSuccess(`Parcel status updated to ${status}`);
      fetchParcels();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to update parcel status");
    }
  };

  const handleDeleteParcel = async (id: string) => {
    if (!confirm("Are you sure you want to delete this parcel?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/parcels/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Delete failed: ${text}`);
      }

      setSuccess("Parcel deleted successfully");
      fetchParcels();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to delete parcel");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Parcel Management</h2>
          <p className="text-gray-400 mt-1">
            Manage and track all parcel operations
          </p>
        </div>
        <button
          className="bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all cursor-pointer"
          onClick={() => setShowAddForm(true)}
        >
          Add New Parcel
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 text-green-300">
          {success}
        </div>
      )}

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="bg-black h-full opacity-70 w-full absolute"
            onClick={() => setShowAddForm(false)}
          ></div>
          <div className="bg-gradient-to-br absolute from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-2xl z-10 max-h-[90vh] overflow-y-auto">
            <h3 className="text-white text-xl font-semibold mb-6">
              Add New Parcel
            </h3>

            <form onSubmit={handleAddParcel} className="space-y-4">
              <input
                type="text"
                name="trackingNumber"
                value={newParcel.trackingNumber || ""}
                onChange={handleInputChange}
                placeholder="Tracking Number"
                className="w-full p-3 bg-gray-700 text-white rounded-lg"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  name="weight.value"
                  value={newParcel.weight?.value || ""}
                  onChange={handleInputChange}
                  placeholder="Weight"
                  className="p-3 bg-gray-700 text-white rounded-lg"
                />
                <select
                  name="weight.unit"
                  value={newParcel.weight?.unit || "kg"}
                  onChange={handleInputChange}
                  className="p-3 bg-gray-700 text-white rounded-lg"
                >
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <input
                  type="number"
                  name="dimensions.length"
                  value={newParcel.dimensions?.length || ""}
                  onChange={handleInputChange}
                  placeholder="Length"
                  className="p-3 bg-gray-700 text-white rounded-lg"
                />
                <input
                  type="number"
                  name="dimensions.width"
                  value={newParcel.dimensions?.width || ""}
                  onChange={handleInputChange}
                  placeholder="Width"
                  className="p-3 bg-gray-700 text-white rounded-lg"
                />
                <input
                  type="number"
                  name="dimensions.height"
                  value={newParcel.dimensions?.height || ""}
                  onChange={handleInputChange}
                  placeholder="Height"
                  className="p-3 bg-gray-700 text-white rounded-lg"
                />
              </div>

              <h4 className="text-gray-300 mt-4">Sender Info</h4>
              <input
                type="text"
                name="sender.name"
                value={newParcel.sender?.name || ""}
                onChange={handleInputChange}
                placeholder="Sender Name"
                className="w-full p-3 bg-gray-700 text-white rounded-lg"
              />
              <input
                type="text"
                name="sender.phoneNumber"
                value={newParcel.sender?.phoneNumber || ""}
                onChange={handleInputChange}
                placeholder="Sender Phone"
                className="w-full p-3 bg-gray-700 text-white rounded-lg"
              />

              <h4 className="text-gray-300 mt-4">Receiver Info</h4>
              <input
                type="text"
                name="receiver.name"
                value={newParcel.receiver?.name || ""}
                onChange={handleInputChange}
                placeholder="Receiver Name"
                className="w-full p-3 bg-gray-700 text-white rounded-lg"
              />
              <input
                type="text"
                name="receiver.phoneNumber"
                value={newParcel.receiver?.phoneNumber || ""}
                onChange={handleInputChange}
                placeholder="Receiver Phone"
                className="w-full p-3 bg-gray-700 text-white rounded-lg"
              />

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Save Parcel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Parcels Table */}
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
          <div className="text-center text-gray-400 p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            Loading parcels...
          </div>
        ) : parcels.length === 0 ? (
          <div className="text-center text-gray-400 p-8">No parcels found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-300">
              <thead className="bg-gray-700 text-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left">Tracking #</th>
                  <th className="px-4 py-2 text-left">Sender</th>
                  <th className="px-4 py-2 text-left">Receiver</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {parcels?.map((parcel) => (
                  <tr key={parcel._id} className="border-t border-gray-700">
                    <td className="px-4 py-2">{parcel.trackingNumber}</td>
                    <td className="px-4 py-2">{parcel.sender?.name}</td>
                    <td className="px-4 py-2">{parcel.receiver?.name}</td>
                    <td className="px-4 py-2 capitalize">{parcel.status}</td>
                    <td className="px-4 py-2 text-right space-x-2">
                      <button
                        onClick={() =>
                          handleStatusUpdate(parcel._id, "delivered")
                        }
                        className="bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-xs"
                      >
                        Mark Delivered
                      </button>
                      <button
                        onClick={() => handleDeleteParcel(parcel._id)}
                        className="bg-red-700 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs"
                      >
                        Delete
                      </button>
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
