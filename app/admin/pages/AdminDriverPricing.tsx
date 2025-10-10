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
};

type DriverPricing = {
  _id: string;
  pricingId: Pricing | string;
  parcelType: string;
  driverBaseEarning: number;
  driverEarningPerKm: number;
  driverEarningPerKg: number;
  urgentDeliveryBonus: number;
  commissionPercentage: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type DriverPricingFormData = {
  pricingId: string;
  driverBaseEarning: string;
  driverEarningPerKm: string;
  driverEarningPerKg: string;
  urgentDeliveryBonus: string;
  commissionPercentage: string;
  isActive: boolean;
};

const AdminDriverPricing = ({ setActiveTab }: { setActiveTab?: (tab: string) => void }) => {
  const [driverPricings, setDriverPricings] = useState<DriverPricing[]>([]);
  const [pricings, setPricings] = useState<Pricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDriverPricing, setEditingDriverPricing] = useState<DriverPricing | null>(null);
  const [formData, setFormData] = useState<DriverPricingFormData>({
    pricingId: "",
    driverBaseEarning: "",
    driverEarningPerKm: "",
    driverEarningPerKg: "",
    urgentDeliveryBonus: "0",
    commissionPercentage: "20",
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([fetchDriverPricings(), fetchPricings()]);
  };

  const fetchDriverPricings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/pricing/api/pricing-driver`, {
        credentials: 'include'
      });

      if (!response.ok) throw new Error("Failed to fetch driver pricing data");

      const data = await response.json();
      setDriverPricings(data.data || []);
    } catch (error) {
      console.error("Error fetching driver pricings:", error);
      setError("Failed to load driver pricing data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPricings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pricing/api/pricing?isActive=true`, {
        credentials: 'include'
      });

      if (!response.ok) throw new Error("Failed to fetch pricing data");

      const data = await response.json();
      setPricings(data.data || []);
    } catch (error) {
      console.error("Error fetching pricings:", error);
    }
  };

  const handleOpenModal = (driverPricing?: DriverPricing) => {
    if (driverPricing) {
      setEditingDriverPricing(driverPricing);
      setFormData({
        pricingId: typeof driverPricing.pricingId === 'object' ? driverPricing.pricingId._id : driverPricing.pricingId,
        driverBaseEarning: driverPricing.driverBaseEarning.toString(),
        driverEarningPerKm: driverPricing.driverEarningPerKm.toString(),
        driverEarningPerKg: driverPricing.driverEarningPerKg.toString(),
        urgentDeliveryBonus: driverPricing.urgentDeliveryBonus.toString(),
        commissionPercentage: driverPricing.commissionPercentage.toString(),
        isActive: driverPricing.isActive
      });
    } else {
      setEditingDriverPricing(null);
      setFormData({
        pricingId: "",
        driverBaseEarning: "",
        driverEarningPerKm: "",
        driverEarningPerKg: "",
        urgentDeliveryBonus: "0",
        commissionPercentage: "20",
        isActive: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDriverPricing(null);
  };

  const handleSubmit = async () => {
    if (!formData.pricingId || !formData.driverBaseEarning || !formData.driverEarningPerKm || !formData.driverEarningPerKg) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const payload = {
        pricingId: formData.pricingId,
        driverBaseEarning: parseFloat(formData.driverBaseEarning),
        driverEarningPerKm: parseFloat(formData.driverEarningPerKm),
        driverEarningPerKg: parseFloat(formData.driverEarningPerKg),
        urgentDeliveryBonus: parseFloat(formData.urgentDeliveryBonus),
        commissionPercentage: parseFloat(formData.commissionPercentage),
        isActive: formData.isActive
      };

      const url = editingDriverPricing 
        ? `${API_BASE_URL}/api/pricing/api/pricing-driver/${editingDriverPricing._id}`
        : `${API_BASE_URL}/api/pricing/api/pricing-driver`;
      
      const method = editingDriverPricing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save driver pricing");
      }

      await fetchDriverPricings();
      handleCloseModal();
    } catch (error: any) {
      console.error("Error saving driver pricing:", error);
      alert(error.message || "Failed to save driver pricing. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this driver pricing?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/pricing/api/pricing-driver/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error("Failed to delete driver pricing");

      await fetchDriverPricings();
    } catch (error) {
      console.error("Error deleting driver pricing:", error);
      alert("Failed to delete driver pricing. Please try again.");
    }
  };

  const toggleActive = async (driverPricing: DriverPricing) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pricing/api/pricing-driver/${driverPricing._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ isActive: !driverPricing.isActive })
      });

      if (!response.ok) throw new Error("Failed to update driver pricing");

      await fetchDriverPricings();
    } catch (error) {
      console.error("Error updating driver pricing:", error);
      alert("Failed to update driver pricing status. Please try again.");
    }
  };

  const getPricingName = (pricingId: string | Pricing): string => {
    if (typeof pricingId === 'object') {
      return pricingId.parcelType;
    }
    const pricing = pricings.find(p => p._id === pricingId);
    return pricing?.parcelType || 'Unknown';
  };

  const calculateMargin = (driverPricing: DriverPricing): number => {
    if (typeof driverPricing.pricingId === 'object') {
      const pricing = driverPricing.pricingId;
      const avgCustomerPrice = pricing.basePrice + (pricing.pricePerKm * 10) + (pricing.pricePerKg * 5);
      const avgDriverEarning = driverPricing.driverBaseEarning + (driverPricing.driverEarningPerKm * 10) + (driverPricing.driverEarningPerKg * 5);
      return ((avgCustomerPrice - avgDriverEarning) / avgCustomerPrice) * 100;
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-gray-400">Loading driver pricing data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-red-400 mb-4">{error}</p>
        <button 
          onClick={fetchData}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const activeDriverPricings = driverPricings.filter(p => p.isActive).length;
  const inactiveDriverPricings = driverPricings.filter(p => !p.isActive).length;
  const avgCommission = driverPricings.length > 0 
    ? driverPricings.reduce((sum, p) => sum + p.commissionPercentage, 0) / driverPricings.length 
    : 0;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Driver Pricing Management</h2>
        <div className="flex gap-3">
          <button 
            onClick={fetchData}
            className="px-4 py-2 bg-gray-700 cursor-pointer hover:bg-gray-600 border border-gray-600 text-gray-200 rounded-lg font-medium transition-all hover:-translate-y-1"
          >
            Refresh
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="px-6 py-2 bg-blue-600 cursor-pointer hover:bg-blue-700 text-white rounded-lg font-medium transition-all hover:-translate-y-1"
          >
            + Create Driver Pricing
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-2">Total Driver Plans</div>
          <div className="text-4xl font-bold text-white">{driverPricings.length}</div>
          <div className="text-green-400 text-sm mt-2">All parcel types</div>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-2">Active Plans</div>
          <div className="text-4xl font-bold text-green-400">{activeDriverPricings}</div>
          <div className="text-gray-400 text-sm mt-2">Currently in use</div>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-2">Inactive Plans</div>
          <div className="text-4xl font-bold text-yellow-400">{inactiveDriverPricings}</div>
          <div className="text-gray-400 text-sm mt-2">Not in use</div>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-2">Avg Commission</div>
          <div className="text-4xl font-bold text-blue-400">{avgCommission.toFixed(1)}%</div>
          <div className="text-gray-400 text-sm mt-2">Company earnings</div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900 border-b border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Parcel Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Base Earning</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Per KM</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Per KG</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Urgent Bonus</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Commission</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {driverPricings.map((driverPricing) => (
                <tr key={driverPricing._id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🚗</span>
                      <div>
                        <div className="text-sm font-semibold text-white">{driverPricing.parcelType}</div>
                        <div className="text-xs text-gray-400">Updated {new Date(driverPricing.updatedAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                    Rs. {driverPricing.driverBaseEarning.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    Rs. {driverPricing.driverEarningPerKm.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    Rs. {driverPricing.driverEarningPerKg.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    Rs. {driverPricing.urgentDeliveryBonus.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                      {driverPricing.commissionPercentage}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActive(driverPricing)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        driverPricing.isActive 
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                          : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                      }`}
                    >
                      {driverPricing.isActive ? '✓ Active' : '○ Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenModal(driverPricing)}
                      className="text-blue-400 cursor-pointer hover:text-blue-300 mr-4 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(driverPricing._id)}
                      className="text-red-400 cursor-pointer hover:text-red-300 transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {driverPricings.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No driver pricing plans found. Create your first one!
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br mt-[80px] from-gray-800 to-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">
                {editingDriverPricing ? 'Edit Driver Pricing' : 'Create Driver Pricing'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 cursor-pointer hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Customer Pricing Plan *
                </label>
                <select
                  value={formData.pricingId}
                  onChange={(e) => setFormData({ ...formData, pricingId: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                  disabled={!!editingDriverPricing}
                >
                  <option value="">Select a pricing plan...</option>
                  {pricings.map((pricing) => (
                    <option key={pricing._id} value={pricing._id}>
                      {pricing.parcelType} (Base: Rs. {pricing.basePrice}, Per KM: Rs. {pricing.pricePerKm}, Per KG: Rs. {pricing.pricePerKg})
                    </option>
                  ))}
                </select>
                {editingDriverPricing && (
                  <p className="text-xs text-gray-400 mt-1">Pricing plan cannot be changed after creation</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Driver Base Earning (Rs) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.driverBaseEarning}
                    onChange={(e) => setFormData({ ...formData, driverBaseEarning: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Driver Earning Per KM (Rs) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.driverEarningPerKm}
                    onChange={(e) => setFormData({ ...formData, driverEarningPerKm: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Driver Earning Per KG (Rs) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.driverEarningPerKg}
                    onChange={(e) => setFormData({ ...formData, driverEarningPerKg: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Urgent Delivery Bonus (Rs)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.urgentDeliveryBonus}
                    onChange={(e) => setFormData({ ...formData, urgentDeliveryBonus: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company Commission (%) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.commissionPercentage}
                  onChange={(e) => setFormData({ ...formData, commissionPercentage: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="20"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Commission percentage deducted from customer price
                </p>
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
                  Mark as active (available for drivers)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button
                  onClick={handleCloseModal}
                  className="px-6 py-2  bg-gray-700 cursor-pointer hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-blue-600 cursor-pointer hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  {editingDriverPricing ? 'Update Driver Pricing' : 'Create Driver Pricing'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDriverPricing;