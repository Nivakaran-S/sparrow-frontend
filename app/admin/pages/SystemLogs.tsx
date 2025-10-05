import { useState, useEffect } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api-gateway-nine-orpin.vercel.app";

type LogEntry = {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  service: string;
  message: string;
  user?: string;
};

const SystemLogs = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterService, setFilterService] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // For now, show a message that logging system is not implemented
    // In production, you would fetch from a logging service/endpoint
    generateMockLogs();
  }, []);

  const generateMockLogs = () => {
    // This simulates what real logs would look like
    // Replace this with actual API call when logging endpoint is ready
    const mockLogs: LogEntry[] = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        level: 'info',
        service: 'user-service',
        message: 'User authentication successful',
        user: 'system'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        level: 'success',
        service: 'parcel-service',
        message: 'Parcel status updated successfully',
        user: 'admin'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        level: 'warning',
        service: 'warehouse-service',
        message: 'Warehouse capacity approaching limit',
        user: 'system'
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        level: 'error',
        service: 'consolidation-service',
        message: 'Failed to create consolidation: Validation error',
        user: 'staff_user'
      },
    ];
    
    setLogs(mockLogs);
  };

  const getLevelColor = (level: string) => {
    switch(level) {
      case 'info': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'success': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'warning': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getLevelIcon = (level: string) => {
    switch(level) {
      case 'info': return 'ℹ️';
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '📝';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesLevel = filterLevel === 'all' || log.level === filterLevel;
    const matchesService = filterService === 'all' || log.service === filterService;
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.service.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLevel && matchesService && matchesSearch;
  });

  const services = Array.from(new Set(logs.map(log => log.service)));

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">System Logs</h2>
          <p className="text-gray-400 mt-1">Monitor system activities and events</p>
          <p className="text-yellow-400 text-xs mt-2">⚠️ Note: This is showing simulated log data. Implement a logging service endpoint for real data.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={generateMockLogs}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            🔄 Refresh
          </button>
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200 rounded-lg text-sm font-medium transition-colors">
            Export Logs
          </button>
        </div>
      </div>

      {/* Log Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Logs', value: logs.length, icon: '📊', color: 'text-white' },
          { label: 'Errors', value: logs.filter(l => l.level === 'error').length, icon: '❌', color: 'text-red-400' },
          { label: 'Warnings', value: logs.filter(l => l.level === 'warning').length, icon: '⚠️', color: 'text-yellow-400'
            },
          { label: 'Success', value: logs.filter(l => l.level === 'success').length, icon: '✅', color: 'text-green-400' }
        ].map((stat, index) => (
          <div key={index} className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{stat.icon}</span>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            placeholder="Search logs..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
          />
          <select 
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Levels</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
          <select 
            value={filterService}
            onChange={(e) => setFilterService(e.target.value)}
            className="px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="all">All Services</option>
            {services.map(service => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-900 border-b border-gray-700">
                <th className="text-white px-6 py-4 text-left font-semibold text-sm">Level</th>
                <th className="text-white px-6 py-4 text-left font-semibold text-sm">Time</th>
                <th className="text-white px-6 py-4 text-left font-semibold text-sm">Service</th>
                <th className="text-white px-6 py-4 text-left font-semibold text-sm">Message</th>
                <th className="text-white px-6 py-4 text-left font-semibold text-sm">User</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, index) => (
                <tr 
                  key={log.id} 
                  className={`border-b border-gray-700 hover:bg-blue-500/5 transition-colors ${
                    index === filteredLogs.length - 1 ? 'border-b-0' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getLevelIcon(log.level)}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getLevelColor(log.level)}`}>
                        {log.level}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300 text-sm">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-gray-300 text-sm">
                    <span className="px-2 py-1 bg-gray-700 rounded text-xs">
                      {log.service}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300 text-sm">{log.message}</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{log.user || 'N/A'}</td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    No logs found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SystemLogs;