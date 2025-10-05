"use client";
import { useState } from "react";

const BillingPayment = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: "Credit Card", last4: "4242", expiry: "12/25", isDefault: true },
    { id: 2, type: "PayPal", email: "user@example.com", isDefault: false }
  ]);

  const invoices = [
    { id: "INV-001", date: "2025-01-15", amount: 125.0, status: "paid" },
    { id: "INV-002", date: "2025-01-10", amount: 89.5, status: "paid" },
    { id: "INV-003", date: "2025-01-05", amount: 156.75, status: "pending" }
  ];

  const transactions = [
    { id: "TXN-001", date: "2025-01-15", description: "Shipment TRK001", amount: 125.0, status: "completed" },
    { id: "TXN-002", date: "2025-01-10", description: "Shipment TRK002", amount: 89.5, status: "completed" },
    { id: "TXN-003", date: "2025-01-05", description: "Shipment TRK003", amount: 156.75, status: "pending" }
  ];

  return (
    <div className="text-white">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Billing & Payment</h2>
        <p className="text-gray-400">Manage your payment methods and view billing history</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-700">
        {["overview", "methods", "invoices", "transactions"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === tab
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-900/30 to-gray-900 p-6 rounded-xl border border-blue-700">
              <p className="text-gray-400 text-sm mb-2">Total Spent (This Month)</p>
              <p className="text-3xl font-bold text-white">Rs. 371.25</p>
              <p className="text-gray-400 text-sm mt-2">3 transactions</p>
            </div>

            <div className="bg-gradient-to-br from-green-900/30 to-gray-900 p-6 rounded-xl border border-green-700">
              <p className="text-gray-400 text-sm mb-2">Pending Payments</p>
              <p className="text-3xl font-bold text-white">Rs. 156.75</p>
              <p className="text-yellow-400 text-sm mt-2">1 invoice pending</p>
            </div>

            <div className="bg-gradient-to-br from-purple-900/30 to-gray-900 p-6 rounded-xl border border-purple-700">
              <p className="text-gray-400 text-sm mb-2">Current Balance</p>
              <p className="text-3xl font-bold text-white">Rs. 0.00</p>
              <p className="text-green-400 text-sm mt-2">All payments up to date</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((txn) => (
                <div
                  key={txn.id}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      💳
                    </div>
                    <div>
                      <p className="text-white font-medium">{txn.description}</p>
                      <p className="text-gray-400 text-sm">{txn.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">${txn.amount.toFixed(2)}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        txn.status === "completed"
                          ? "bg-green-900/30 text-green-400"
                          : "bg-yellow-900/30 text-yellow-400"
                      }`}
                    >
                      {txn.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Payment Methods Tab */}
      {activeTab === "methods" && (
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

          {/* Add New Card Form */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6">
            <h3 className="text-xl font-bold text-white mb-6">Add New Payment Method</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-2">Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm font-medium mb-2">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <button className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                Add Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === "invoices" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Invoice ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 text-white font-mono">{invoice.id}</td>
                      <td className="px-6 py-4 text-gray-400">{invoice.date}</td>
                      <td className="px-6 py-4 text-white font-semibold">${invoice.amount.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            invoice.status === "paid"
                              ? "bg-green-900/30 text-green-400"
                              : "bg-yellow-900/30 text-yellow-400"
                          }`}
                        >
                          {invoice.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
                            Download
                          </button>
                          {invoice.status === "pending" && (
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
      {activeTab === "transactions" && (
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
                  <option>Completed</option>
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
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Description</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 text-white font-mono">{txn.id}</td>
                      <td className="px-6 py-4 text-gray-400">{txn.date}</td>
                      <td className="px-6 py-4 text-white">{txn.description}</td>
                      <td className="px-6 py-4 text-white font-semibold">${txn.amount.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            txn.status === "completed"
                              ? "bg-green-900/30 text-green-400"
                              : "bg-yellow-900/30 text-yellow-400"
                          }`}
                        >
                          {txn.status}
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
