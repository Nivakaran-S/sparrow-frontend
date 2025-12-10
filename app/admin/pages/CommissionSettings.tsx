import { useState, useEffect } from 'react';
import { Settings, DollarSign, TrendingUp, Save, RefreshCw, Plus, Edit2, Trash2, CheckCircle, AlertCircle, Truck } from 'lucide-react';

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://api-gateway-nine-orpin.vercel.app";

interface CommissionSetting {
  _id?: string;
  deliveryType: string;
  commissionRate: number;
  baseAmount: number;
  description?: string;
  isActive: boolean;
  createdBy?: any;
  updatedBy?: any;
  createdTimestamp?: string;
  updatedTimestamp?: string;
}

const DELIVERY_TYPES = [
  { value: 'default', label: 'Default (Fallback)', icon: '🔧' },
  { value: 'address_to_warehouse', label: 'Address → Warehouse', icon: '📦' },
  { value: 'warehouse_to_warehouse', label: 'Warehouse → Warehouse', icon: '🏢' },
  { value: 'warehouse_to_address', label: 'Warehouse → Address', icon: '🚚' }
];

const CommissionSettings = ({setActiveTab }: { setActiveTab?: (tab: string) => void }) => {
  const [settings, setSettings] = useState<CommissionSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [formData, setFormData] = useState<CommissionSetting>({
    deliveryType: 'default',
    commissionRate: 10,
    baseAmount: 50,
    description: '',
    isActive: true
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `${API_BASE_URL}/api/parcels/api/commission-settings`,
        { credentials: 'include' }
      );

      if (!response.ok) throw new Error('Failed to fetch commission settings');

      const result = await response.json();
      
      if (result.success) {
        setSettings(result.data || []);
      }
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `${API_BASE_URL}/api/parcels/api/commission-settings/initialize`,
        {
          method: 'POST',
          credentials: 'include'
        }
      );

      if (!response.ok) throw new Error('Failed to initialize settings');

      const result = await response.json();
      
      if (result.success) {
        setSuccessMessage('Default commission settings initialized successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
        await fetchSettings();
      }
    } catch (err: any) {
      console.error('Error initializing settings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validation
      if (formData.commissionRate < 0 || formData.commissionRate > 100) {
        throw new Error('Commission rate must be between 0 and 100');
      }
      if (formData.baseAmount < 0) {
        throw new Error('Base amount must be non-negative');
      }

      const url = editingId
        ? `${API_BASE_URL}/api/parcels/api/commission-settings/${formData.deliveryType}`
        : `${API_BASE_URL}/api/parcels/api/commission-settings`;

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save settings');
      }

      const result = await response.json();
      
      if (result.success) {
        setSuccessMessage(
          editingId 
            ? 'Commission settings updated successfully!' 
            : 'Commission settings created successfully!'
        );
        setTimeout(() => setSuccessMessage(null), 3000);
        
        setEditingId(null);
        setShowAddForm(false);
        resetForm();
        await fetchSettings();
      }
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (setting: CommissionSetting) => {
    setFormData({
      deliveryType: setting.deliveryType,
      commissionRate: setting.commissionRate,
      baseAmount: setting.baseAmount,
      description: setting.description || '',
      isActive: setting.isActive
    });
    setEditingId(setting._id || null);
    setShowAddForm(true);
  };

  const handleDelete = async (deliveryType: string) => {
    if (deliveryType === 'default') {
      alert('Cannot delete default commission settings');
      return;
    }

    if (!confirm(`Are you sure you want to delete commission settings for ${deliveryType}?`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/api/parcels/api/commission-settings/${deliveryType}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      );

      if (!response.ok) throw new Error('Failed to delete settings');

      const result = await response.json();
      
      if (result.success) {
        setSuccessMessage('Commission settings deleted successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
        await fetchSettings();
      }
    } catch (err: any) {
      console.error('Error deleting settings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      deliveryType: 'default',
      commissionRate: 10,
      baseAmount: 50,
      description: '',
      isActive: true
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const getDeliveryTypeLabel = (type: string): string => {
    const dt = DELIVERY_TYPES.find(t => t.value === type);
    return dt ? dt.label : type;
  };

  if (loading && settings.length === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading commission settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Commission Settings
          </h2>
          <p className="text-gray-400 mt-2">
            Configure commission rates and base amounts for different delivery types
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchSettings}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {settings.length === 0 && (
            <button
              onClick={initializeDefaultSettings}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
            >
              <Settings className="w-4 h-4" />
              Initialize Defaults
            </button>
          )}
          {!showAddForm && (
            <button
              onClick={() => {
                resetForm();
                setShowAddForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add New
            </button>
          )}
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-500/10 border border-green-500 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <p className="text-green-400">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            {editingId ? 'Edit Commission Settings' : 'Add New Commission Settings'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Delivery Type *</label>
              <select
                value={formData.deliveryType}
                onChange={(e) => setFormData({ ...formData, deliveryType: e.target.value })}
                disabled={!!editingId}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none disabled:opacity-50"
              >
                {DELIVERY_TYPES.map(dt => (
                  <option key={dt.value} value={dt.value}>
                    {dt.icon} {dt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Commission Rate (%) *</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.commissionRate}
                onChange={(e) => setFormData({ ...formData, commissionRate: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="e.g., 10"
              />
              <p className="text-gray-500 text-xs mt-1">Percentage of base amount driver earns as commission</p>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Base Amount (Rs.) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.baseAmount}
                onChange={(e) => setFormData({ ...formData, baseAmount: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                placeholder="e.g., 50.00"
              />
              <p className="text-gray-500 text-xs mt-1">Minimum guaranteed amount for this delivery type</p>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Status</label>
              <div className="flex items-center gap-3 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-300">Active</span>
                </label>
              </div>
              <p className="text-gray-500 text-xs mt-1">Only active settings will be used for calculations</p>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-400 text-sm mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="Optional description for this commission setting..."
            />
          </div>

          {/* Example Calculation */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
            <h4 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Example Calculation
            </h4>
            <p className="text-gray-300 text-sm mb-2">
              For a delivery with calculated base amount of Rs. {formData.baseAmount.toFixed(2)}:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div>
                <span className="text-gray-400">Base Amount:</span>
                <span className="text-white font-semibold ml-2">Rs. {formData.baseAmount.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-400">Commission ({formData.commissionRate}%):</span>
                <span className="text-green-400 font-semibold ml-2">
                  Rs. {(formData.baseAmount * formData.commissionRate / 100).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Driver Earns:</span>
                <span className="text-blue-400 font-semibold ml-2">
                  Rs. {(formData.baseAmount * formData.commissionRate / 100).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {editingId ? 'Update Settings' : 'Save Settings'}
            </button>
            <button
              onClick={resetForm}
              disabled={loading}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Settings List */}
      {settings.length > 0 ? (
        <div className="space-y-4">
          {settings.map((setting) => {
            const exampleEarning = (setting.baseAmount * setting.commissionRate / 100).toFixed(2);

            return (
              <div
                key={setting._id}
                className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 hover:-translate-y-1 hover:border-blue-400 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Truck className="w-5 h-5 text-blue-400" />
                      <h3 className="text-xl font-semibold text-white">
                        {getDeliveryTypeLabel(setting.deliveryType)}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        setting.isActive 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                          : 'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                      }`}>
                        {setting.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {setting.description && (
                      <p className="text-gray-400 text-sm">{setting.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(setting)}
                      className="p-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-all"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {setting.deliveryType !== 'default' && (
                      <button
                        onClick={() => handleDelete(setting.deliveryType)}
                        className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Commission Rate</div>
                    <div className="text-white font-semibold text-lg">{setting.commissionRate}%</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Base Amount</div>
                    <div className="text-white font-semibold text-lg">Rs. {setting.baseAmount.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Example Earning</div>
                    <div className="text-green-400 font-semibold text-lg">Rs. {exampleEarning}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs mb-1">Last Updated</div>
                    <div className="text-gray-300 text-sm">
                      {setting.updatedTimestamp 
                        ? new Date(setting.updatedTimestamp).toLocaleDateString() 
                        : 'N/A'}
                    </div>
                  </div>
                </div>

                {setting.deliveryType === 'default' && (
                  <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <p className="text-yellow-300 text-sm">
                        This is the default fallback setting used when no specific delivery type setting is found or active.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-12 text-center">
          <Settings className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            No Commission Settings Found
          </h3>
          <p className="text-gray-400 mb-6">
            Initialize default settings or create custom commission configurations
          </p>
          <button
            onClick={initializeDefaultSettings}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all"
          >
            Initialize Default Settings
          </button>
        </div>
      )}

      {/* Information Box */}
      <div className="mt-8 bg-blue-500/10 border border-blue-500/50 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <div className="bg-blue-500/20 rounded-full p-2 flex-shrink-0">
            <DollarSign className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h4 className="text-blue-300 font-semibold mb-2">How Commission Works</h4>
            <ul className="text-gray-300 text-sm space-y-2">
              <li>• When a delivery is completed, the system calculates a base amount based on distance, weight, and delivery type</li>
              <li>• The driver earns a commission percentage of this base amount</li>
              <li>• Additional bonuses may be added for urgent deliveries</li>
              <li>• If no specific delivery type setting exists, the system uses the default settings</li>
              <li>• Only active commission settings are used in earnings calculations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommissionSettings;