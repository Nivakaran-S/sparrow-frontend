const Earnings = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-8">
        Earnings & Payments
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { title: "Today", amount: "$245.50", details: "12 deliveries • 156 km" },
          { title: "This Week", amount: "$1,234.75", details: "67 deliveries • 890 km" },
          { title: "This Month", amount: "$4,567.20", details: "286 deliveries • 3,456 km" },
        ].map((earning, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 text-center"
          >
            <h3 className="text-lg font-semibold text-white mb-2">{earning.title}</h3>
            <div className="text-2xl font-bold text-blue-400">{earning.amount}</div>
            <p className="text-gray-400 text-sm">{earning.details}</p>
          </div>
        ))}
      </div>
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Payment Breakdown</h3>
        <div className="space-y-4">
          {[
            { label: "Base Rate", value: "$15.00/hour" },
            { label: "Per Delivery", value: "$3.50/delivery" },
            { label: "Distance Bonus", value: "$0.45/km" },
            { label: "Performance Bonus", value: "+$25.00" },
          ].map((item, idx) => (
            <div key={idx} className="flex justify-between text-gray-400">
              <span>{item.label}</span>
              <span>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


export default Earnings;