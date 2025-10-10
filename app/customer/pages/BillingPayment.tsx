"use client";
import { useState, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-gateway-nine-orpin.vercel.app/api/parcels";

interface TrackShipmentsProps {
  setActiveTab?: (tab: string) => void;
}


const BillingPayment = ({ setActiveTab }: TrackShipmentsProps) => {
  const [activeTabInside, setActiveTabInside] = useState("overview");
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: "Credit Card", last4: "4242", expiry: "12/25", isDefault: true },
    { id: 2, type: "PayPal", email: "user@example.com", isDefault: false }
  ]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      // Fetch invoices
      const invoiceResponse = await fetch(`${API_BASE_URL}/api/invoice`, {
        credentials: 'include',
      });
      
      if (invoiceResponse.ok) {
        const invoiceData = await invoiceResponse.json();
        setInvoices(invoiceData.data || []);
      }

      // Fetch payments
      const paymentResponse = await fetch(`${API_BASE_URL}/api/payment`, {
        credentials: 'include',
      });
      
      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json();
        setPayments(paymentData.data || []);
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: "bg-green-900/30 text-green-400",
      issued: "bg-blue-900/30 text-blue-400",
      pending: "bg-yellow-900/30 text-yellow-400",
      overdue: "bg-red-900/30 text-red-400",
      cancelled: "bg-gray-900/30 text-gray-400",
      successful: "bg-green-900/30 text-green-400",
      processing: "bg-blue-900/30 text-blue-400",
      failed: "bg-red-900/30 text-red-400",
      refunded: "bg-purple-900/30 text-purple-400",
    };
    return colors[status] || "bg-gray-900/30 text-gray-400";
  };

  const calculateTotalSpent = () => {
    return payments
      .filter(p => p.paymentStatus === 'successful')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  };

  const calculatePendingPayments = () => {
    return invoices
      .filter(i => i.status === 'issued' || i.status === 'overdue')
      .reduce((sum, i) => sum + (i.totalAmount || 0), 0);
  };

  const downloadInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/invoice/${invoiceId}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        // Create downloadable invoice (simple JSON for now)
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${data.data.invoiceNumber}.json`;
        a.click();
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
    }
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
        <h2 className="text-3xl font-bold mb-2">Billing & Payment</h2>
        <p className="text-gray-400">Manage your payment methods and view billing history</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-700">
        {["overview", "invoices", "transactions"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTabInside(tab)}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTabInside === tab
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTabInside === "overview" && (
        <div className="space-y-6">
          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-900/30 to-gray-900 p-6 rounded-xl border border-blue-700">
              <p className="text-gray-400 text-sm mb-2">Total Spent (All Time)</p>
              <p className="text-3xl font-bold text-white">Rs. {calculateTotalSpent().toFixed(2)}</p>
              <p className="text-gray-400 text-sm mt-2">{payments.filter(p => p.paymentStatus === 'successful').length} transactions</p>
            </div>

            <div className="bg-gradient-to-br from-green-900/30 to-gray-900 p-6 rounded-xl border border-green-700">
              <p className="text-gray-400 text-sm mb-2">Pending Payments</p>
              <p className="text-3xl font-bold text-white">Rs. {calculatePendingPayments().toFixed(2)}</p>
              <p className="text-yellow-400 text-sm mt-2">
                {invoices.filter(i => i.status === 'issued' || i.status === 'overdue').length} invoice(s) pending
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/30 to-gray-900 p-6 rounded-xl border border-purple-700">
              <p className="text-gray-400 text-sm mb-2">Current Balance</p>
              <p className="text-3xl font-bold text-white">Rs. {calculatePendingPayments().toFixed(2)}</p>
              <p className={calculatePendingPayments() > 0 ? "text-yellow-400 text-sm mt-2" : "text-green-400 text-sm mt-2"}>
                {calculatePendingPayments() > 0 ? 'Payment required' : 'All payments up to date'}
              </p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {payments.slice(0, 5).map((payment) => (
                <div
                  key={payment._id}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      💳
                    </div>
                    <div>
                      <p className="text-white font-medium">Payment for {payment.parcels?.length || 0} parcel(s)</p>
                      <p className="text-gray-400 text-sm">{new Date(payment.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">Rs. {payment.amount.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(payment.paymentStatus)}`}>
                      {payment.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Payment Methods Tab */}
      {activeTabInside === "methods" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-400">Manage your payment methods</p>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
              + Add Payment Method
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-2xl">
                      {method.type === "Credit Card" ? "💳" : "🅿️"}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{method.type}</p>
                      {method.type === "Credit Card" ? (
                        <p className="text-gray-400 text-sm">•••• {method.last4}</p>
                      ) : (
                        <p className="text-gray-400 text-sm">{method.email}</p>
                      )}
                    </div>
                  </div>
                  {method.isDefault && (
                    <span className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full text-xs font-medium">
                      Default
                    </span>
                  )}
                </div>
                {method.type === "Credit Card" && (
                  <p className="text-gray-400 text-sm mb-4">Expires: {method.expiry}</p>
                )}
                <div className="flex gap-2">
                  {!method.isDefault && (
                    <button className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
                      Set as Default
                    </button>
                  )}
                  <button className="flex-1 px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg text-sm transition-colors">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTabInside === "invoices" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Invoice Number</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Issue Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {invoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 text-white font-mono">{invoice.invoiceNumber}</td>
                      <td className="px-6 py-4 text-gray-400">{new Date(invoice.issueDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-white font-semibold">Rs. {invoice.totalAmount.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => downloadInvoice(invoice._id)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                          >
                            Download
                          </button>
                          {(invoice.status === "issued" || invoice.status === "overdue") && (
                            <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors">
                              Pay Now
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTabInside === "transactions" && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Date Range</label>
                <select className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500">
                  <option>Last 30 Days</option>
                  <option>Last 3 Months</option>
                  <option>Last 6 Months</option>
                  <option>Last Year</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Status</label>
                <select className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500">
                  <option>All Statuses</option>
                  <option>Successful</option>
                  <option>Pending</option>
                  <option>Failed</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Search</label>
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Transaction ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Method</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 text-white font-mono">{payment._id.slice(-8).toUpperCase()}</td>
                      <td className="px-6 py-4 text-gray-400">{new Date(payment.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-white">{payment.paymentMethod.replace('_', ' ')}</td>
                      <td className="px-6 py-4 text-white font-semibold">Rs. {payment.amount.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.paymentStatus)}`}>
                          {payment.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingPayment;