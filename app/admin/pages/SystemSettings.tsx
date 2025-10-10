import { useState } from "react";

const SystemSettings = ({setActiveTab }: { setActiveTab?: (tab: string) => void }) => {
  const [settings, setSettings] = useState({
    systemName: "Sparrow Logistics",
    timezone: "UTC+0",
    language: "English",
    passwordPolicy: "strong",
    sessionTimeout: 60,
    twoFactorAuth: false,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true
  });

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const handleSystemAction = async (action: string) => {
    if (confirm(`Are you sure you want to ${action.toLowerCase()}?`)) {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert(`${action} completed successfully!`);
      } catch (error) {
        alert(`Failed to ${action.toLowerCase()}`);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-white">System Settings</h2>
        <p className="text-gray-400 mt-1">Configure system-wide settings and preferences</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
          <h3 className="text-blue-400 text-lg font-semibold mb-6">General Settings</h3>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium">System Name</label>
              <input 
                type="text" 
                value={settings.systemName}
                onChange={(e) => setSettings({...settings, systemName: e.target.value})}
                className="px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium">Default Timezone</label>
              <select 
                value={settings.timezone}
                onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                className="px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option>UTC+0</option>
                <option>UTC+5:30</option>
                <option>UTC-5</option>
                <option>UTC+8</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium">Language</label>
              <select 
                value={settings.language}
                onChange={(e) => setSettings({...settings, language: e.target.value})}
                className="px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Security Settings */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
          <h3 className="text-blue-400 text-lg font-semibold mb-6">Security Settings</h3>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium">Password Policy</label>
              <select 
                value={settings.passwordPolicy}
                onChange={(e) => setSettings({...settings, passwordPolicy: e.target.value})}
                className="px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="strong">Strong (8+ chars, mixed case, numbers, symbols)</option>
                <option value="medium">Medium (6+ chars, mixed case, numbers)</option>
                <option value="basic">Basic (6+ chars)</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium">Session Timeout (minutes)</label>
              <input 
                type="number" 
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                className="px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-white text-sm font-medium">Two-Factor Authentication</label>
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="2fa"
                  checked={settings.twoFactorAuth}
                  onChange={(e) => setSettings({...settings, twoFactorAuth: e.target.checked})}
                  className="w-4 h-4 bg-gray-900 border border-gray-600 rounded focus:border-blue-500"
                />
                <label htmlFor="2fa" className="text-gray-300 text-sm">Enable for all users</label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Notification Settings */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
          <h3 className="text-blue-400 text-lg font-semibold mb-6">Notification Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">Email Notifications</p>
                <p className="text-gray-400 text-xs">System alerts via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">SMS Notifications</p>
                <p className="text-gray-400 text-xs">Critical alerts via SMS</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={(e) => setSettings({...settings, smsNotifications: e.target.checked})}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">Push Notifications</p>
                <p className="text-gray-400 text-xs">Real-time browser notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) => setSettings({...settings, pushNotifications: e.target.checked})}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
        
        {/* System Maintenance */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-6">
          <h3 className="text-blue-400 text-lg font-semibold mb-6">System Maintenance</h3>
          <div className="space-y-4">
            <button 
              onClick={() => handleSystemAction("Run System Backup")}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Run System Backup
            </button>
            <button 
              onClick={() => handleSystemAction("Clear Cache")}
              className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors"
            >
              Clear Cache
            </button>
            <button 
              onClick={() => handleSystemAction("Generate System Report")}
              className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              Generate System Report
            </button>
            <button 
              onClick={() => handleSystemAction("Reset System Logs")}
              className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Reset System Logs
            </button>
          </div>
        </div>
      </div>
      
      {/* Save Settings */}
      <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-200 rounded-lg font-medium transition-colors"
        >
          Cancel Changes
        </button>
        <button 
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all hover:-translate-y-1 shadow-lg shadow-green-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

export default SystemSettings;