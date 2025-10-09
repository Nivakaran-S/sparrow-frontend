import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-gateway-nine-orpin.vercel.app";

type Pricing = {
  _id: string;
  parcelType: string;
  basePrice: number;
  pricePerKm: number;
  pricePerKg: number;
  urgentDeliveryMultiplier: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type PricingFormData = {
  parcelType: string;
  basePrice: string;
  pricePerKm: string;
  pricePerKg: string;
  urgentDeliveryMultiplier: string;
  isActive: boolean;
};

const AdminPricing = () => {
  const [pricings, setPricings] = useState<Pricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPricing, setEditingPricing] = useState<Pricing | null>(null);
  const [formData, setFormData] = useState<PricingFormData>({
    parcelType: "",
    basePrice: "",
    pricePerKm: "",
    pricePerKg: "",
    urgentDeliveryMultiplier: "1.5",
    isActive: true
  });

  useEffect(() => {
    fetchPricings();
  }, []);

  const fetchPricings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/pricing/api/pricing`, {
        credentials: 'include'
      });

      if (!response.ok) throw new Error("Failed to fetch pricing data");

      const data = await response.json();
      setPricings(data.data || []);
    } catch (error) {
      console.error("Error fetching pricings:", error);
      setError("Failed to load pricing data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (pricing?: Pricing) => {
    if (pricing) {
      setEditingPricing(pricing);
      setFormData({
        parcelType: pricing.parcelType,
        basePrice: pricing.basePrice.toString(),
        pricePerKm: pricing.pricePerKm.toString(),
        pricePerKg: pricing.pricePerKg.toString(),
        urgentDeliveryMultiplier: pricing.urgentDeliveryMultiplier.toString(),
        isActive: pricing.isActive
      });
    } else {
      setEditingPricing(null);
      setFormData({
        parcelType: "",
        basePrice: "",
        pricePerKm: "",
        pricePerKg: "",
        urgentDeliveryMultiplier: "1.5",
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPricing(null);
  };

  const handleSubmit = async () => {
    if (!formData.parcelType || !formData.basePrice || !formData.pricePerKm || !formData.pricePerKg) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const payload = {
        parcelType: formData.parcelType,
        basePrice: parseFloat(formData.basePrice),
        pricePerKm: parseFloat(formData.pricePerKm),
        pricePerKg: parseFloat(formData.pricePerKg),
        urgentDeliveryMultiplier: parseFloat(formData.urgentDeliveryMultiplier),
        isActive: formData.isActive
      };

      const url = editingPricing 
        ? `${API_BASE_URL}/api/pricing/api/pricing/${editingPricing._id}`
        : `${API_BASE_URL}/api/pricing/api/pricing`;
      
      const method = editingPricing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Failed to save pricing");

      await fetchPricings();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving pricing:", error);
      alert("Failed to save pricing. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this pricing?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/pricing/api/pricing/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error("Failed to delete pricing");

      await fetchPricings();
    } catch (error) {
      console.error("Error deleting pricing:", error);
      alert("Failed to delete pricing. Please try again.");
    }
  };

  const toggleActive = async (pricing: Pricing) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pricing/api/pricing/${pricing._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ ...pricing, isActive: !pricing.isActive })
      });

      if (!response.ok) throw new Error("Failed to update pricing");

      await fetchPricings();
    } catch (error) {
      console.error("Error updating pricing:", error);
      alert("Failed to update pricing status. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-gray-400">Loading pricing data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-red-400 mb-4">{error}</p>
        <button 
          onClick={fetchPricings}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const activePricings = pricings.filter(p => p.isActive).length;
  const inactivePricings = pricings.filter(p => !p.isActive).length;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Pricing Management</h2>
        <div className="flex gap-3">
          <button 
            onClick={fetchPricings}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200 rounded-lg font-medium transition-all hover:-translate-y-1"
          >
            🔄 Refresh
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all hover:-translate-y-1"
          >
            + Create New Pricing
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-2">Total Pricing Plans</div>
          <div className="text-4xl font-bold text-white">{pricings.length}</div>
          <div className="text-green-400 text-sm mt-2">All parcel types</div>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-2">Active Plans</div>
          <div className="text-4xl font-bold text-green-400">{activePricings}</div>
          <div className="text-gray-400 text-sm mt-2">Currently in use</div>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-2">Inactive Plans</div>
          <div className="text-4xl font-bold text-yellow-400">{inactivePricings}</div>
          <div className="text-gray-400 text-sm mt-2">Not in use</div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900 border-b border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Parcel Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Base Price</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Per KM</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Per KG</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Urgent Multiplier</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {pricings.map((pricing) => (
                <tr key={pricing._id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">📦</span>
                      <div>
                        <div className="text-sm font-semibold text-white">{pricing.parcelType}</div>
                        <div className="text-xs text-gray-400">Updated {new Date(pricing.updatedAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                    Rs. {pricing.basePrice.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    Rs. {pricing.pricePerKm.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    Rs. {pricing.pricePerKg.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {pricing.urgentDeliveryMultiplier}x
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActive(pricing)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        pricing.isActive 
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                          : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                      }`}
                    >
                      {pricing.isActive ? '✓ Active' : '○ Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenModal(pricing)}
                      className="text-blue-400 hover:text-blue-300 mr-4 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(pricing._id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pricings.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No pricing plans found. Create your first one!
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">
                {editingPricing ? 'Edit Pricing' : 'Create New Pricing'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Parcel Type *
                </label>
                <input
                  type="text"
                  value={formData.parcelType}
                  onChange={(e) => setFormData({ ...formData, parcelType: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g., Standard, Express, Fragile"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Base Price (Rs) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Price Per KM (Rs) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.pricePerKm}
                    onChange={(e) => setFormData({ ...formData, pricePerKm: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Price Per KG (Rs) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.pricePerKg}
                    onChange={(e) => setFormData({ ...formData, pricePerKg: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Urgent Delivery Multiplier *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={formData.urgentDeliveryMultiplier}
                    onChange={(e) => setFormData({ ...formData, urgentDeliveryMultiplier: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="1.5"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-gray-900 border-gray-700 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-300">
                  Mark as active (available for use)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  {editingPricing ? 'Update Pricing' : 'Create Pricing'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPricing;
