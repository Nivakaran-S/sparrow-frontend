import { useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-gateway-nine-orpin.vercel.app";

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("30days");
  const [generating, setGenerating] = useState(false);

  const generateReport = async (reportType: string) => {
    setGenerating(true);
    try {
      // You can implement actual report generation here
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      alert(`${reportType} report generated successfully!`);
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  const reports = [
    {
      title: "Daily Operations Report",
      description: "Comprehensive daily activity summary",
      icon: "📊",
      type: "daily"
    },
    {
      title: "Financial Summary",
      description: "Revenue and cost analysis",
      icon: "💰",
      type: "financial"
    },
    {
      title: "Performance Analytics",
      description: "KPI trends and insights",
      icon: "📈",
      type: "performance"
    },
    {
      title: "Warehouse Inventory",
      description: "Stock levels and capacity report",
      icon: "🏢",
      type: "inventory"
    },
    {
      title: "Delivery Performance",
      description: "Delivery times and success rates",
      icon: "🚚",
      type: "delivery"
    },
    {
      title: "Customer Activity",
      description: "User engagement and satisfaction",
      icon: "👥",
      type: "customer"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">Reports & Analytics</h2>
        <p className="text-gray-400 mt-1">Generate and download comprehensive system reports</p>
      </div>
      
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 3 Months</option>
            <option value="365days">Last Year</option>
            <option value="custom">Custom Range</option>
          </select>
          <button 
            disabled={generating}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg font-medium transition-all hover:-translate-y-1 shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? "Generating..." : "Generate All Reports"}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report, index) => (
            <div key={index} className="bg-gray-900 border border-gray-700 rounded-lg p-5 transition-all hover:border-blue-500 hover:-translate-y-1">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl">{report.icon}</span>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-1">{report.title}</h3>
                  <p className="text-gray-400 text-sm">{report.description}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => generateReport(report.title)}
                  disabled={generating}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Download PDF
                </button>
                <button 
                  onClick={() => generateReport(report.title)}
                  disabled={generating}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm font-medium transition-colors disabled:opacity-50"
                >
                  CSV
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
        <h3 className="text-white text-lg font-semibold mb-4">Recent Reports</h3>
        <div className="space-y-3">
          {[
            { name: "Daily Operations - Dec 15, 2024", size: "2.4 MB", date: "2 hours ago" },
            { name: "Financial Summary - Q4 2024", size: "5.1 MB", date: "1 day ago" },
            { name: "Performance Analytics - Week 50", size: "1.8 MB", date: "3 days ago" }
          ].map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div>
                  <div className="text-white text-sm font-medium">{file.name}</div>
                  <div className="text-gray-400 text-xs">{file.size} • {file.date}</div>
                </div>
              </div>
              <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors">
                Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Reports;