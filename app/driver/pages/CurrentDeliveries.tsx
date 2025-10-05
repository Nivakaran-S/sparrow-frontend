import { useState } from "react";

const CurrentDeliveries = () => {
  const [deliveries] = useState([
    { id: "SP2024089", recipient: "John Smith", address: "123 Main St, Downtown", phone: "+1 (555) 123-4567", status: "In Transit", priority: "High", timeWindow: "2:00 PM - 4:00 PM" },
    { id: "SP2024090", recipient: "Alice Johnson", address: "456 Oak Ave, Midtown", phone: "+1 (555) 987-6543", status: "Next", priority: "Medium", timeWindow: "4:00 PM - 6:00 PM" },
    { id: "SP2024091", recipient: "Bob Wilson", address: "789 Pine Rd, Uptown", phone: "+1 (555) 456-7890", status: "Pending", priority: "Low", timeWindow: "6:00 PM - 8:00 PM" },
  ]);

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-8">
        Current Deliveries
      </h2>
      <div className="space-y-6">
        {deliveries.map((d) => (
          <div
            key={d.id}
            className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 hover:-translate-y-1 hover:border-blue-400 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="text-blue-400 font-semibold">#{d.id}</div>
              <div className="flex gap-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    d.status === "In Transit"
                      ? "bg-purple-500/20 text-purple-400"
                      : d.status === "Next"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-amber-500/20 text-amber-400"
                  }`}
                >
                  {d.status}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    d.priority === "High"
                      ? "bg-red-500/20 text-red-400"
                      : d.priority === "Medium"
                      ? "bg-yellow-500/20 text-yellow-400"
                      : "bg-gray-500/20 text-gray-400"
                  }`}
                >
                  {d.priority}
                </span>
              </div>
            </div>
            <div className="space-y-2 text-gray-400">
              <div>👤 {d.recipient}</div>
              <div>📍 {d.address}</div>
              <div>📞 {d.phone}</div>
              <div>⏰ {d.timeWindow}</div>
            </div>
            <div className="flex gap-2 mt-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 hover:-translate-y-1 transition-all">
                Navigate
              </button>
              <button className="bg-gray-600 text-gray-200 px-4 py-2 rounded-lg border border-gray-500 hover:bg-gray-500 hover:-translate-y-1 transition-all">
                Call Customer
              </button>
              <button className="bg-gray-600 text-gray-200 px-4 py-2 rounded-lg border border-gray-500 hover:bg-gray-500 hover:-translate-y-1 transition-all">
                Mark Delivered
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CurrentDeliveries;