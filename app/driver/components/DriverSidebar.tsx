
interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}


const DriverSidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {

    return(
        <div>
            <nav className="sidebar">
          <div className="nav-section">
            <h3>Dashboard</h3>
            <button 
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <span className="nav-icon">📊</span>
              Overview
            </button>
            <button 
              className={`nav-item ${activeTab === 'routes' ? 'active' : ''}`}
              onClick={() => setActiveTab('routes')}
            >
              <span className="nav-icon">🗺️</span>
              My Routes
            </button>
          </div>

          <div className="nav-section">
            <h3>Delivery</h3>
            <button 
              className={`nav-item ${activeTab === 'current' ? 'active' : ''}`}
              onClick={() => setActiveTab('current')}
            >
              <span className="nav-icon">📦</span>
              Current Deliveries
            </button>
            <button 
              className={`nav-item ${activeTab === 'navigation' ? 'active' : ''}`}
              onClick={() => setActiveTab('navigation')}
            >
              <span className="nav-icon">🧭</span>
              GPS Navigation
            </button>
            <button 
              className={`nav-item ${activeTab === 'scanner' ? 'active' : ''}`}
              onClick={() => setActiveTab('scanner')}
            >
              <span className="nav-icon">📱</span>
              Barcode Scanner
            </button>
          </div>

          <div className="nav-section">
            <h3>Performance</h3>
            <button 
              className={`nav-item ${activeTab === 'earnings' ? 'active' : ''}`}
              onClick={() => setActiveTab('earnings')}
            >
              <span className="nav-icon">💰</span>
              Earnings
            </button>
            <button 
              className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <span className="nav-icon">📋</span>
              Delivery History
            </button>
            <button 
              className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <span className="nav-icon">📈</span>
              Performance Analytics
            </button>
          </div>
        </nav>

        </div>
    )
}

export default DriverSidebar