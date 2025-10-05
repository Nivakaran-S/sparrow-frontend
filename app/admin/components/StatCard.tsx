const StatCard = ({ title, value, icon, change, positive = true }: any) => {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6 transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <div className="bg-blue-500/20 rounded-full w-10 h-10 flex items-center justify-center text-blue-400 text-xl">{icon}</div>
      </div>
      <h3 className="text-white text-4xl font-bold mb-2">{value}</h3>
      <div className="flex items-center gap-1 text-sm">
        <span className={positive ? "text-green-400" : "text-red-400"}>{positive ? "↗" : "↘"}</span>
        <span className={positive ? "text-green-400" : "text-red-400"}>{change}</span>
      </div>
    </div>
  );
}

export default StatCard;