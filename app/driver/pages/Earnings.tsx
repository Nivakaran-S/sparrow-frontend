import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, Package, Calendar, RefreshCw, Clock, Award, Truck, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://api-gateway-nine-orpin.vercel.app";

interface EarningRecord {
  _id: string;
  driver: {
    _id: string;
    userName: string;
    entityId: string;
  };
  delivery: {
    _id: string;
    deliveryNumber: string;
    deliveryItemType: string;
    deliveryType: string;
    priority: string;
    parcels?: any[];
    consolidation?: any;
  };
  baseAmount: number;
  commissionRate: number;
  commissionAmount: number;
  bonusAmount: number;
  deductions: number;
  totalEarnings: number;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  deliveryCompletedAt: string;
  paidAt?: string;
  notes?: string;
  createdTimestamp: string;
}

interface EarningsSummary {
  totalEarnings: number;
  totalCommission: number;
  totalBonus: number;
  totalDeductions: number;
  pendingAmount: number;
  approvedAmount: number;
  paidAmount: number;
  deliveryCount: number;
  byStatus: {
    pending: { count: number; amount: number };
    approved: { count: number; amount: number };
    paid: { count: number; amount: number };
    cancelled: { count: number; amount: number };
  };
}

interface PeriodData {
  amount: number;
  count: number;
}

const Earnings = ({ userId, setActiveTab }: { userId?: string; setActiveTab?: (tab: string) => void }) => {
  const [earnings, setEarnings] = useState<EarningRecord[]>([]);
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [periodStats, setPeriodStats] = useState<{
    today: PeriodData;
    week: PeriodData;
    month: PeriodData;
  }>({
    today: { amount: 0, count: 0 },
    week: { amount: 0, count: 0 },
    month: { amount: 0, count: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [commissionWarning, setCommissionWarning] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (driverId) {
      fetchAllData();
      const interval = setInterval(fetchAllData, 60000); // Refresh every minute
      return () => clearInterval(interval);
    }
  }, [driverId]);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/check-cookie`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Not authenticated");

      const data = await response.json();

      if (data.role !== "Driver") {
        throw new Error("Not authorized - Driver role required");
      }

      setDriverId(data.id);
    } catch (err: any) {
      console.error("Auth check failed:", err);
      setError("Authentication failed. Please login.");
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    try {
      await Promise.all([fetchEarnings(), fetchEarningsSummary()]);
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Error fetching all data:", err);
    }
  };

  const fetchEarnings = async () => {
    if (!driverId) return;

    try {
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/api/parcels/api/earnings/driver/${driverId}`,
        { credentials: "include" }
      );

      if (!response.ok) {
        // Check if it's a 404 (no earnings yet)
        if (response.status === 404) {
          setEarnings([]);
          calculatePeriodStats([]);
          setLoading(false);
          return;
        }
        throw new Error("Failed to fetch earnings");
      }

      const result = await response.json();

      if (result.success) {
        const earningsData = result.data || [];
        setEarnings(earningsData);
        calculatePeriodStats(earningsData);
        
        // Check if any earnings have 0% commission rate (warning sign)
        const hasZeroCommission = earningsData.some((e: EarningRecord) => e.commissionRate === 0);
        setCommissionWarning(hasZeroCommission);
      } else {
        setEarnings([]);
        calculatePeriodStats([]);
      }
    } catch (err: any) {
      console.error("Error fetching earnings:", err);
      // Don't show error if it's just empty data
      if (err.message !== "Failed to fetch earnings") {
        setError(err.message);
      }
      setEarnings([]);
      calculatePeriodStats([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEarningsSummary = async () => {
    if (!driverId) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/parcels/api/earnings/driver/${driverId}/summary`,
        { credentials: "include" }
      );

      if (!response.ok) {
        // If 404, just set empty summary
        if (response.status === 404) {
          setSummary(null);
          return;
        }
        throw new Error("Failed to fetch summary");
      }

      const result = await response.json();

      if (result.success) {
        setSummary(result.data);
      } else {
        setSummary(null);
      }
    } catch (err: any) {
      console.error("Error fetching summary:", err);
      setSummary(null);
    }
  };

  const calculatePeriodStats = (earningsData: EarningRecord[]) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const stats = {
      today: { amount: 0, count: 0 },
      week: { amount: 0, count: 0 },
      month: { amount: 0, count: 0 }
    };

    earningsData.forEach(earning => {
      const completedDate = new Date(earning.deliveryCompletedAt);
      
      if (completedDate >= monthStart) {
        stats.month.amount += earning.totalEarnings;
        stats.month.count++;
        
        if (completedDate >= weekStart) {
          stats.week.amount += earning.totalEarnings;
          stats.week.count++;
          
          if (completedDate >= todayStart) {
            stats.today.amount += earning.totalEarnings;
            stats.today.count++;
          }
        }
      }
    });

    setPeriodStats(stats);
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      approved: "bg-green-500/20 text-green-400 border-green-500/50",
      paid: "bg-blue-500/20 text-blue-400 border-blue-500/50",
      cancelled: "bg-red-500/20 text-red-400 border-red-500/50",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400 border-gray-500/50";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'paid':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatDeliveryType = (type: string): string => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' → ');
  };

  const filteredEarnings = filterStatus === 'all' 
    ? earnings 
    : earnings.filter(e => e.status === filterStatus);

  if (loading && !earnings.length) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading earnings data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Earnings & Payments
          </h2>
          {lastUpdate && (
            <p className="text-gray-500 text-sm mt-1">
              Last updated: {formatRelativeTime(lastUpdate.toISOString())}
            </p>
          )}
        </div>
        <button
          onClick={fetchAllData}
          disabled={loading}
          className="text-gray-400 cursor-pointer hover:text-white transition-colors flex items-center gap-2 disabled:opacity-50"
          title="Refresh data"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Commission Warning */}
      {commissionWarning && (
        <div className="mb-6 bg-yellow-500/10 border border-yellow-500 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-400 font-semibold mb-1">Commission Settings Issue</p>
            <p className="text-gray-300 text-sm">
              Some of your earnings show 0% commission rate. This means commission settings may not be properly configured. 
              Please contact your administrator to initialize commission settings.
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <div className="flex-1">
            <p className="text-red-400">{error}</p>
          </div>
          <button
            onClick={fetchAllData}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Earning Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          {
            title: "Today",
            amount: periodStats.today.amount.toFixed(2),
            count: periodStats.today.count,
            icon: Calendar,
            color: "from-blue-500 to-blue-600",
            bgGradient: "from-blue-900/20 to-gray-900"
          },
          {
            title: "This Week",
            amount: periodStats.week.amount.toFixed(2),
            count: periodStats.week.count,
            icon: TrendingUp,
            color: "from-green-500 to-green-600",
            bgGradient: "from-green-900/20 to-gray-900"
          },
          {
            title: "This Month",
            amount: periodStats.month.amount.toFixed(2),
            count: periodStats.month.count,
            icon: DollarSign,
            color: "from-purple-500 to-purple-600",
            bgGradient: "from-purple-900/20 to-gray-900"
          },
        ].map((earning, idx) => (
          <div
            key={idx}
            className={`bg-gradient-to-br ${earning.bgGradient} border border-gray-700 rounded-xl p-6 hover:-translate-y-1 hover:border-blue-400 transition-all`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 font-medium">{earning.title}</h3>
              <div className={`bg-gradient-to-r ${earning.color} rounded-full p-2`}>
                <earning.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              Rs. {earning.amount}
            </div>
            <p className="text-gray-400 text-sm">{earning.count} deliveries</p>
          </div>
        ))}
      </div>

      {/* Summary Cards */}
      {summary ? (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Earnings Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                <span className="text-gray-400 text-sm">Total Earnings</span>
              </div>
              <div className="text-xl font-bold text-white">
                Rs. {summary.totalEarnings.toFixed(2)}
              </div>
              <div className="text-gray-500 text-xs mt-1">{summary.deliveryCount} deliveries</div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-400 text-sm">Pending</span>
              </div>
              <div className="text-xl font-bold text-white">
                Rs. {summary.pendingAmount.toFixed(2)}
              </div>
              <div className="text-gray-500 text-xs mt-1">{summary.byStatus.pending.count} deliveries</div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-gray-400 text-sm">Approved</span>
              </div>
              <div className="text-xl font-bold text-white">
                Rs. {summary.approvedAmount.toFixed(2)}
              </div>
              <div className="text-gray-500 text-xs mt-1">{summary.byStatus.approved.count} deliveries</div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-5 h-5 text-blue-400" />
                <span className="text-gray-400 text-sm">Paid</span>
              </div>
              <div className="text-xl font-bold text-white">
                Rs. {summary.paidAmount.toFixed(2)}
              </div>
              <div className="text-gray-500 text-xs mt-1">{summary.byStatus.paid.count} deliveries</div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Commission:</span>
                <span className="text-white font-semibold ml-2">Rs. {summary.totalCommission.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-400">Bonuses:</span>
                <span className="text-green-400 font-semibold ml-2">+Rs. {summary.totalBonus.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-gray-400">Deductions:</span>
                <span className="text-red-400 font-semibold ml-2">-Rs. {summary.totalDeductions.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      ) : earnings.length > 0 && (
        <div className="mb-6 bg-blue-500/10 border border-blue-500 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-blue-300 text-sm">
            Earnings summary is being calculated. Refresh to see updated summary.
          </p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'pending', 'approved', 'paid', 'cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-lg transition-all ${
              filterStatus === status
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            {status !== 'all' && summary && (
              <span className="ml-2 text-xs">
                ({summary.byStatus[status as keyof typeof summary.byStatus].count})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Earnings List */}
      {filteredEarnings.length > 0 ? (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-400" />
            Earnings History ({filteredEarnings.length})
          </h3>
          <div className="space-y-3">
            {filteredEarnings.map((earning) => {
              const itemCount = earning.delivery.deliveryItemType === 'consolidation'
                ? earning.delivery.consolidation?.parcels?.length || 0
                : earning.delivery.parcels?.length || 0;

              return (
                <div 
                  key={earning._id} 
                  className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 hover:border-blue-500 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-blue-500/20 rounded-full p-2">
                          <Package className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <div className="text-white font-semibold">
                            {earning.delivery.deliveryNumber}
                          </div>
                          <div className="text-gray-400 text-sm flex items-center gap-2 mt-1 flex-wrap">
                            <span>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                            <span>•</span>
                            <span className="text-purple-400">
                              {formatDeliveryType(earning.delivery.deliveryType)}
                            </span>
                            {earning.delivery.priority === 'urgent' && (
                              <>
                                <span>•</span>
                                <span className="text-red-400">Urgent</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold text-lg mb-1">
                        Rs. {earning.totalEarnings.toFixed(2)}
                      </div>
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(earning.status)}`}>
                        {getStatusIcon(earning.status)}
                        {earning.status.charAt(0).toUpperCase() + earning.status.slice(1)}
                      </div>
                    </div>
                  </div>

                  {/* Earnings Breakdown */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-gray-700">
                    <div>
                      <div className="text-gray-500 text-xs">Base Amount</div>
                      <div className="text-gray-300 text-sm font-semibold">
                        Rs. {earning.baseAmount.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs">
                        Commission 
                        {earning.commissionRate === 0 && (
                          <span className="ml-1 text-yellow-400">⚠️</span>
                        )}
                      </div>
                      <div className={`text-sm font-semibold ${earning.commissionRate === 0 ? 'text-yellow-400' : 'text-blue-400'}`}>
                        {earning.commissionRate}% = Rs. {earning.commissionAmount.toFixed(2)}
                      </div>
                    </div>
                    {earning.bonusAmount > 0 && (
                      <div>
                        <div className="text-gray-500 text-xs">Bonus</div>
                        <div className="text-green-400 text-sm font-semibold">
                          +Rs. {earning.bonusAmount.toFixed(2)}
                        </div>
                      </div>
                    )}
                    {earning.deductions > 0 && (
                      <div>
                        <div className="text-gray-500 text-xs">Deductions</div>
                        <div className="text-red-400 text-sm font-semibold">
                          -Rs. {earning.deductions.toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Timestamps */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700 text-xs text-gray-500">
                    <div>
                      Completed: {formatRelativeTime(earning.deliveryCompletedAt)}
                    </div>
                    {earning.paidAt && (
                      <div className="text-green-400">
                        Paid: {formatRelativeTime(earning.paidAt)}
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {earning.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="text-gray-500 text-xs mb-1">Notes:</div>
                      <div className="text-gray-300 text-sm">{earning.notes}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-12 text-center">
          <Truck className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            No Earnings Found
          </h3>
          <p className="text-gray-400 mb-4">
            {filterStatus === 'all' 
              ? "You haven't earned anything yet. Complete deliveries to start earning!"
              : `No ${filterStatus} earnings found.`}
          </p>
          {earnings.length === 0 && (
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-left max-w-md mx-auto">
              <h4 className="text-blue-400 font-semibold mb-2">How to Start Earning:</h4>
              <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
                <li>Accept delivery assignments from admin</li>
                <li>Complete deliveries and mark them as delivered</li>
                <li>Earnings are automatically calculated and approved</li>
                <li>Check back here to see your earnings</li>
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Payment Information */}
      <div className="bg-blue-500/10 border border-blue-500/50 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="bg-blue-500/20 rounded-full p-2 flex-shrink-0">
            <DollarSign className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h4 className="text-blue-300 font-semibold mb-1">Payment Information</h4>
            <p className="text-gray-300 text-sm">
              Earnings are automatically calculated when you complete deliveries. Each delivery has a base amount 
              calculated from distance, weight, and delivery type. You earn a commission percentage (set by admin) 
              on this base amount. Urgent deliveries may include additional bonuses. Earnings are typically approved 
              automatically and paid weekly to your registered bank account. Contact admin if you have questions 
              about your earnings or if you see 0% commission rates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earnings;