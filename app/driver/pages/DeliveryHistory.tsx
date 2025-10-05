import { useState } from "react";

const DeliveryHistory = () => {
  const [history] = useState([
    { date: "2024-01-20", deliveries: 12, distance: "156 km", earnings: "$245.50", rating: 4.9 },
    { date: "2024-01-19", deliveries: 15, distance: "189 km", earnings: "$298.75", rating: 4.8 },
    { date: "2024-01-18", deliveries: 10, distance: "134 km", earnings: "$198.25", rating: 4.7 },
    { date: "2024-01-17", deliveries: 14, distance: "167 km", earnings: "$267.80", rating: 4.8 },
  ]);

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-8">
        Delivery History
      </h2>
      <div className="flex gap-4 mb-6">
        <select className="bg-gray-800 border border-gray-700 text-white p-2 rounded-lg focus:border-blue-500 outline-none">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>Last 3 Months</option>
        </select>
        <button className="bg-gray-600 text-gray-200 px-4 py-2 rounded-lg border border-gray-500 hover:bg-gray-500 hover:-translate-y-1 transition-all">
          Export Data
        </button>
      </div>
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-4 text-white font-semibold">Date</th>
              <th className="p-4 text-white font-semibold">Deliveries</th>
              <th className="p-4 text-white font-semibold">Distance</th>
              <th className="p-4 text-white font-semibold">Earnings</th>
              <th className="p-4 text-white font-semibold">Rating</th>
              <th className="p-4 text-white font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {history.map((day, index) => (
              <tr key={index} className="border-b border-gray-700 hover:bg-blue-500/5">
                <td className="p-4 text-blue-400">{day.date}</td>
                <td className="p-4 text-gray-400">{day.deliveries}</td>
                <td className="p-4 text-gray-400">{day.distance}</td>
                <td className="p-4 text-blue-400">{day.earnings}</td>
                <td className="p-4 text-gray-400">⭐ {day.rating}</td>
                <td className="p-4">
                  <button className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-all">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DeliveryHistory;