import { useState } from "react";

const BarcodeScanner = ()=> {
  const [scannedCode, setScannedCode] = useState("");

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-8">
        Barcode Scanner
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 mb-6">
            <div className="text-center text-gray-400">
              <div className="text-4xl mb-2">📱</div>
              <h3 className="text-xl font-semibold text-white mb-2">Barcode Scanner</h3>
              <p className="mb-4">Position barcode within the frame</p>
              <div className="border-2 border-gray-500 rounded-lg h-40 flex items-center justify-center relative">
                <div className="bg-blue-500 h-1 w-full absolute top-1/2 transform -translate-y-1/2"></div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Manual Entry</h4>
            <input
              type="text"
              className="w-full p-3 rounded-lg border border-gray-700 bg-gray-800 text-white placeholder-gray-500 focus:border-blue-500 outline-none"
              placeholder="Enter barcode manually"
              value={scannedCode}
              onChange={(e) => setScannedCode(e.target.value)}
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 hover:-translate-y-1 transition-all mt-4">
              Submit
            </button>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Scans</h3>
          <div className="space-y-4">
            {[
              { code: "SP2024089", status: "✅ Delivered", time: "2:30 PM" },
              { code: "SP2024088", status: "✅ Delivered", time: "1:45 PM" },
              { code: "SP2024087", status: "✅ Delivered", time: "12:20 PM" },
            ].map((scan, idx) => (
              <div key={idx} className="flex justify-between text-gray-400">
                <span>{scan.code}</span>
                <span>{scan.status}</span>
                <span>{scan.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BarcodeScanner;