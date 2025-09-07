"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../home.css";


export default function DriverDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'driver') {
        router.push('/login');
        return;
      }
      setUser(parsedUser);
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
  };

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <span className="logo-icon">🚚</span>
            <h1 className="system-title">Driver Portal</h1>
          </div>
          <div className="header-actions">
            <div className="online-toggle">
              <button 
                className={`status-toggle ${isOnline ? 'online' : 'offline'}`}
                onClick={toggleOnlineStatus}
              >
                {isOnline ? '🟢 Online' : '🔴 Offline'}
              </button>
            </div>
            <div className="notification-bell">🔔</div>
            <div className="user-profile">
              <div className="profile-img"></div>
              <span className="user-name">{user.name}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-layout">
        {/* Driver Sidebar */}
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

        {/* Main Content */}
        <main className="main-content">
          {activeTab === 'overview' && <DriverOverview isOnline={isOnline} />}
          {activeTab === 'routes' && <MyRoutes />}
          {activeTab === 'current' && <CurrentDeliveries />}
          {activeTab === 'navigation' && <GPSNavigation />}
          {activeTab === 'scanner' && <BarcodeScanner />}
          {activeTab === 'earnings' && <Earnings />}
          {activeTab === 'history' && <DeliveryHistory />}
          {activeTab === 'analytics' && <PerformanceAnalytics />}
        </main>
      </div>
    </div>
  );
}

// Driver Overview Component
function DriverOverview({ isOnline }: { isOnline: boolean }) {
  return (
    <div className="content-section">
      <div className="overview-header">
        <h2 className="section-title">Driver Dashboard</h2>
        <div className={`driver-status ${isOnline ? 'online' : 'offline'}`}>
          Status: {isOnline ? 'Online & Ready' : 'Offline'}
        </div>
      </div>
      
      <div className="metrics-grid">
        <div className="metric-card driver-metric">
          <div className="metric-icon">📦</div>
          <div className="metric-info">
            <h3 className="metric-value">12</h3>
            <p className="metric-label">Today's Deliveries</p>
          </div>
        </div>
        <div className="metric-card driver-metric">
          <div className="metric-icon">🛣️</div>
          <div className="metric-info">
            <h3 className="metric-value">156 km</h3>
            <p className="metric-label">Distance Traveled</p>
          </div>
        </div>
        <div className="metric-card driver-metric">
          <div className="metric-icon">💰</div>
          <div className="metric-info">
            <h3 className="metric-value">$245</h3>
            <p className="metric-label">Today's Earnings</p>
          </div>
        </div>
        <div className="metric-card driver-metric">
          <div className="metric-icon">⭐</div>
          <div className="metric-info">
            <h3 className="metric-value">4.8/5</h3>
            <p className="metric-label">Rating</p>
          </div>
        </div>
      </div>

      <div className="current-route-card">
        <h3 className="card-title">Current Route</h3>
        <div className="route-info">
          <div className="route-details">
            <h4 className="route-name">Route R-045</h4>
            <p className="route-description">8 stops • Est. 3.5 hours • 45 km</p>
            <div className="route-progress">
              <div className="progress-text">Progress: 3 of 8 stops completed</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{width: '37.5%'}}></div>
              </div>
            </div>
          </div>
          <div className="route-actions">
            <button className="action-btn primary">View Details</button>
            <button className="action-btn secondary">Navigate</button>
          </div>
        </div>
      </div>

      <div className="quick-stats">
        <h3 className="section-subtitle">Quick Stats</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">This Week</span>
            <span className="stat-value">67 deliveries</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">This Month</span>
            <span className="stat-value">286 deliveries</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Success Rate</span>
            <span className="stat-value">98.5%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Average Time</span>
            <span className="stat-value">12 min/stop</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// My Routes Component
function MyRoutes() {
  const [routes] = useState([
    { 
      id: 'R-045', 
      name: 'Downtown Route', 
      stops: 8, 
      distance: '45 km', 
      estimated: '3.5 hrs',
      status: 'Active',
      priority: 'High'
    },
    { 
      id: 'R-046', 
      name: 'Suburb Route', 
      stops: 12, 
      distance: '67 km', 
      estimated: '4.2 hrs',
      status: 'Scheduled',
      priority: 'Medium'
    },
    { 
      id: 'R-044', 
      name: 'Express Route', 
      stops: 5, 
      distance: '28 km', 
      estimated: '2.1 hrs',
      status: 'Completed',
      priority: 'High'
    },
  ]);

  return (
    <div className="content-section">
      <h2 className="section-title">My Optimized Routes</h2>
      
      <div className="routes-container">
        {routes.map(route => (
          <div key={route.id} className="route-card">
            <div className="route-header">
              <div className="route-main-info">
                <h3 className="route-id">{route.id}</h3>
                <h4 className="route-title">{route.name}</h4>
              </div>
              <div className="route-badges">
                <span className={`status-badge ${route.status.toLowerCase()}`}>
                  {route.status}
                </span>
                <span className={`priority-badge ${route.priority.toLowerCase()}`}>
                  {route.priority}
                </span>
              </div>
            </div>
            
            <div className="route-stats">
              <div className="route-stat">
                <span className="stat-icon">📍</span>
                <span className="stat-text">{route.stops} stops</span>
              </div>
              <div className="route-stat">
                <span className="stat-icon">🛣️</span>
                <span className="stat-text">{route.distance}</span>
              </div>
              <div className="route-stat">
                <span className="stat-icon">⏱️</span>
                <span className="stat-text">{route.estimated}</span>
              </div>
            </div>
            
            <div className="route-actions">
              <button className="action-btn primary">View Route</button>
              <button className="action-btn secondary">Navigate</button>
              <button className="action-btn secondary">Report Issue</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Current Deliveries Component
function CurrentDeliveries() {
  const [deliveries] = useState([
    { 
      id: 'SP2024089', 
      recipient: 'John Smith', 
      address: '123 Main St, Downtown',
      phone: '+1 (555) 123-4567',
      status: 'In Transit',
      priority: 'High',
      timeWindow: '2:00 PM - 4:00 PM'
    },
    { 
      id: 'SP2024090', 
      recipient: 'Alice Johnson', 
      address: '456 Oak Ave, Midtown',
      phone: '+1 (555) 987-6543',
      status: 'Next',
      priority: 'Medium',
      timeWindow: '4:00 PM - 6:00 PM'
    },
    { 
      id: 'SP2024091', 
      recipient: 'Bob Wilson', 
      address: '789 Pine Rd, Uptown',
      phone: '+1 (555) 456-7890',
      status: 'Pending',
      priority: 'Low',
      timeWindow: '6:00 PM - 8:00 PM'
    },
  ]);

  return (
    <div className="content-section">
      <h2 className="section-title">Current Deliveries</h2>
      
      <div className="deliveries-list">
        {deliveries.map(delivery => (
          <div key={delivery.id} className="delivery-card">
            <div className="delivery-header">
              <div className="delivery-id">#{delivery.id}</div>
              <div className="delivery-badges">
                <span className={`status-badge ${delivery.status.toLowerCase().replace(' ', '-')}`}>
                  {delivery.status}
                </span>
                <span className={`priority-badge ${delivery.priority.toLowerCase()}`}>
                  {delivery.priority}
                </span>
              </div>
            </div>
            
            <div className="delivery-details">
              <div className="detail-row">
                <span className="detail-icon">👤</span>
                <span className="detail-text">{delivery.recipient}</span>
              </div>
              <div className="detail-row">
                <span className="detail-icon">📍</span>
                <span className="detail-text">{delivery.address}</span>
              </div>
              <div className="detail-row">
                <span className="detail-icon">📞</span>
                <span className="detail-text">{delivery.phone}</span>
              </div>
              <div className="detail-row">
                <span className="detail-icon">⏰</span>
                <span className="detail-text">{delivery.timeWindow}</span>
              </div>
            </div>
            
            <div className="delivery-actions">
              <button className="action-btn primary">Navigate</button>
              <button className="action-btn secondary">Call Customer</button>
              <button className="action-btn secondary">Mark Delivered</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// GPS Navigation Component
function GPSNavigation() {
  return (
    <div className="content-section">
      <h2 className="section-title">GPS Navigation</h2>
      
      <div className="navigation-container">
        <div className="map-section">
          <div className="map-placeholder">
            <div className="map-content">
              <h3 className="map-title">🗺️ Live Navigation</h3>
              <p className="map-subtitle">Turn-by-turn directions to next delivery</p>
              <div className="current-location">
                <p className="location-text">📍 Current: 100 Market St</p>
                <p className="destination-text">🎯 Next: 123 Main St (2.3 km)</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="navigation-sidebar">
          <div className="next-delivery">
            <h3 className="sidebar-title">Next Delivery</h3>
            <div className="delivery-info">
              <h4 className="customer-name">John Smith</h4>
              <p className="delivery-address">123 Main St, Downtown</p>
              <p className="delivery-time">ETA: 15 minutes</p>
            </div>
          </div>
          
          <div className="directions">
            <h3 className="sidebar-title">Directions</h3>
            <div className="direction-steps">
              <div className="direction-step current">
                <span className="step-icon">➡️</span>
                <span className="step-text">Continue on Market St for 1.2 km</span>
              </div>
              <div className="direction-step">
                <span className="step-icon">↩️</span>
                <span className="step-text">Turn right onto Main St</span>
              </div>
              <div className="direction-step">
                <span className="step-icon">📍</span>
                <span className="step-text">Destination on the right</span>
              </div>
            </div>
          </div>
          
          <div className="navigation-controls">
            <button className="nav-btn primary">Start Navigation</button>
            <button className="nav-btn secondary">Recalculate Route</button>
            <button className="nav-btn secondary">Report Traffic</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Barcode Scanner Component
function BarcodeScanner() {
  const [scannedCode, setScannedCode] = useState('');
  
  return (
    <div className="content-section">
      <h2 className="section-title">Barcode Scanner</h2>
      
      <div className="scanner-container">
        <div className="scanner-section">
          <div className="camera-placeholder">
            <div className="camera-content">
              <div className="camera-icon">📱</div>
              <h3 className="camera-title">Barcode Scanner</h3>
              <p className="camera-subtitle">Position barcode within the frame</p>
              <div className="scanner-frame">
                <div className="scanner-line"></div>
              </div>
            </div>
          </div>
          
          <div className="manual-input">
            <h4 className="input-title">Manual Entry</h4>
            <input 
              type="text" 
              className="barcode-input" 
              placeholder="Enter barcode manually"
              value={scannedCode}
              onChange={(e) => setScannedCode(e.target.value)}
            />
            <button className="action-btn primary">Submit</button>
          </div>
        </div>
        
        <div className="scanner-history">
          <h3 className="history-title">Recent Scans</h3>
          <div className="scan-list">
            <div className="scan-item">
              <span className="scan-code">SP2024089</span>
              <span className="scan-status">✅ Delivered</span>
              <span className="scan-time">2:30 PM</span>
            </div>
            <div className="scan-item">
              <span className="scan-code">SP2024088</span>
              <span className="scan-status">✅ Delivered</span>
              <span className="scan-time">1:45 PM</span>
            </div>
            <div className="scan-item">
              <span className="scan-code">SP2024087</span>
              <span className="scan-status">✅ Delivered</span>
              <span className="scan-time">12:20 PM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Earnings Component
function Earnings() {
  return (
    <div className="content-section">
      <h2 className="section-title">Earnings & Payments</h2>
      
      <div className="earnings-overview">
        <div className="earnings-cards">
          <div className="earning-card">
            <h3 className="earning-title">Today</h3>
            <div className="earning-amount">$245.50</div>
            <p className="earning-details">12 deliveries • 156 km</p>
          </div>
          
          <div className="earning-card">
            <h3 className="earning-title">This Week</h3>
            <div className="earning-amount">$1,234.75</div>
            <p className="earning-details">67 deliveries • 890 km</p>
          </div>
          
          <div className="earning-card">
            <h3 className="earning-title">This Month</h3>
            <div className="earning-amount">$4,567.20</div>
            <p className="earning-details">286 deliveries • 3,456 km</p>
          </div>
        </div>
      </div>
      
      <div className="payment-breakdown">
        <h3 className="breakdown-title">Payment Breakdown</h3>
        <div className="breakdown-items">
          <div className="breakdown-item">
            <span className="item-label">Base Rate</span>
            <span className="item-value">$15.00/hour</span>
          </div>
          <div className="breakdown-item">
            <span className="item-label">Per Delivery</span>
            <span className="item-value">$3.50/delivery</span>
          </div>
          <div className="breakdown-item">
            <span className="item-label">Distance Bonus</span>
            <span className="item-value">$0.45/km</span>
          </div>
          <div className="breakdown-item">
            <span className="item-label">Performance Bonus</span>
            <span className="item-value">+$25.00</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Delivery History Component
function DeliveryHistory() {
  const [history] = useState([
    { date: '2024-01-20', deliveries: 12, distance: '156 km', earnings: '$245.50', rating: 4.9 },
    { date: '2024-01-19', deliveries: 15, distance: '189 km', earnings: '$298.75', rating: 4.8 },
    { date: '2024-01-18', deliveries: 10, distance: '134 km', earnings: '$198.25', rating: 4.7 },
    { date: '2024-01-17', deliveries: 14, distance: '167 km', earnings: '$267.80', rating: 4.8 },
  ]);
  
  return (
    <div className="content-section">
      <h2 className="section-title">Delivery History</h2>
      
      <div className="history-filters">
        <select className="filter-select">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>Last 3 Months</option>
        </select>
        <button className="action-btn secondary">Export Data</button>
      </div>
      
      <div className="history-table">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Deliveries</th>
              <th>Distance</th>
              <th>Earnings</th>
              <th>Rating</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {history.map((day, index) => (
              <tr key={index}>
                <td className="table-date">{day.date}</td>
                <td>{day.deliveries}</td>
                <td>{day.distance}</td>
                <td className="table-earnings">{day.earnings}</td>
                <td>
                  <span className="rating-display">⭐ {day.rating}</span>
                </td>
                <td>
                  <button className="btn-small primary">View Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Performance Analytics Component
function PerformanceAnalytics() {
  return (
    <div className="content-section">
      <h2 className="section-title">Performance Analytics</h2>
      
      <div className="analytics-grid">
        <div className="analytics-card">
          <h3 className="analytics-title">Delivery Efficiency</h3>
          <div className="analytics-chart">
            <div className="chart-placeholder">
              <p className="chart-text">📊</p>
              <p className="chart-label">Average: 12 min/delivery</p>
            </div>
          </div>
          <p className="analytics-insight">15% faster than average driver</p>
        </div>
        
        <div className="analytics-card">
          <h3 className="analytics-title">Customer Rating Trend</h3>
          <div className="analytics-chart">
            <div className="chart-placeholder">
              <p className="chart-text">📈</p>
              <p className="chart-label">Current: 4.8/5</p>
            </div>
          </div>
          <p className="analytics-insight">Improved by 0.3 this month</p>
        </div>
        
        <div className="analytics-card">
          <h3 className="analytics-title">Fuel Efficiency</h3>
          <div className="analytics-chart">
            <div className="chart-placeholder">
              <p className="chart-text">⛽</p>
              <p className="chart-label">8.5 L/100km</p>
            </div>
          </div>
          <p className="analytics-insight">12% better than fleet average</p>
        </div>
      </div>
      
      <div className="performance-goals">
        <h3 className="goals-title">Performance Goals</h3>
        <div className="goal-items">
          <div className="goal-item">
            <div className="goal-header">
              <span className="goal-name">Daily Delivery Target</span>
              <span className="goal-progress">12/15</span>
            </div>
            <div className="goal-bar">
              <div className="goal-fill" style={{width: '80%'}}></div>
            </div>
          </div>
          
          <div className="goal-item">
            <div className="goal-header">
              <span className="goal-name">Customer Rating</span>
              <span className="goal-progress">4.8/5.0</span>
            </div>
            <div className="goal-bar">
              <div className="goal-fill" style={{width: '96%'}}></div>
            </div>
          </div>
          
          <div className="goal-item">
            <div className="goal-header">
              <span className="goal-name">On-Time Delivery</span>
              <span className="goal-progress">98%</span>
            </div>
            <div className="goal-bar">
              <div className="goal-fill" style={{width: '98%'}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}