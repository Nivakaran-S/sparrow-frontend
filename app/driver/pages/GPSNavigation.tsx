const GPSNavigation = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-8">
        GPS Navigation
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <h3 className="text-2xl font-semibold mb-2">🗺️ Live Navigation</h3>
            <p>Current: 100 Market St | Next: 123 Main St (2.3 km)</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Next Delivery</h3>
          <p className="text-gray-400 mb-4">John Smith • 123 Main St • ETA: 15 mins</p>
          <h3 className="text-lg font-semibold text-white mb-4">Directions</h3>
          <ol className="list-decimal list-inside text-gray-400 space-y-2">
            <li>Continue on Market St for 1.2 km</li>
            <li>Turn right onto Main St</li>
            <li>Destination on the right</li>
          </ol>
          <div className="flex gap-2 mt-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 hover:-translate-y-1 transition-all">
              Start Navigation
            </button>
            <button className="bg-gray-600 text-gray-200 px-4 py-2 rounded-lg border border-gray-500 hover:bg-gray-500 hover:-translate-y-1 transition-all">
              Recalculate Route
            </button>
            <button className="bg-gray-600 text-gray-200 px-4 py-2 rounded-lg border border-gray-500 hover:bg-gray-500 hover:-translate-y-1 transition-all">
              Report Traffic
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GPSNavigation;