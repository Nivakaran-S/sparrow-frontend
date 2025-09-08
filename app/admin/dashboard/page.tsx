"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../../home.css";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'admin') {
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

  if (!user) return <div>Loading...</div>;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <span className="logo-icon">🏢</span>
            <h1 className="system-title">Admin Dashboard</h1>
          </div>
          <div className="header-actions">
            <div className="notification-bell">🔔</div>
            <div className="user-profile">
              <div className="profile-img"></div>
              <span style={{color: '#fff'}}>{user.name}</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-layout">
        {/* Admin Sidebar */}
        <nav className="sidebar">
          <div className="nav-section">
            <h3>Admin Panel</h3>
            <button 
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <span className="nav-icon">📊</span>
              Dashboard Overview
            </button>
            <button 
              className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <span className="nav-icon">👥</span>
              User Management
            </button>
            <button 
              className={`nav-item ${activeTab === 'roles' ? 'active' : ''}`}
              onClick={() => setActiveTab('roles')}
            >
              <span className="nav-icon">🔐</span>
              Role Management
            </button>
          </div>

          <div className="nav-section">
            <h3>Analytics</h3>
            <button 
              className={`nav-item ${activeTab === 'kpis' ? 'active' : ''}`}
              onClick={() => setActiveTab('kpis')}
            >
              <span className="nav-icon">📈</span>
              KPI Monitoring
            </button>
            <button 
              className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <span className="nav-icon">📋</span>
              Reports
            </button>
          </div>

          <div className="nav-section">
            <h3>System</h3>
            <button 
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <span className="nav-icon">⚙️</span>
              System Settings
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="main-content">
          {activeTab === 'overview' && <AdminOverview />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'roles' && <RoleManagement />}
          {activeTab === 'kpis' && <KPIMonitoring />}
          {activeTab === 'reports' && <Reports />}
          {activeTab === 'settings' && <SystemSettings />}
        </main>
      </div>
    </div>
  );
}

// Admin Overview Component
function AdminOverview() {
  return (
    <div className="content-section">
      <h2 style={{color: '#fff'}}>System Overview</h2>
      
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">👥</div>
          <div className="metric-info">
            <h3 style={{color: '#fff'}}>1,247</h3>
            <p style={{color: '#9ca3af'}}>Total Users</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">📦</div>
          <div className="metric-info">
            <h3 style={{color: '#fff'}}>8,456</h3>
            <p style={{color: '#9ca3af'}}>Total Parcels</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">🚚</div>
          <div className="metric-info">
            <h3 style={{color: '#fff'}}>89</h3>
            <p style={{color: '#9ca3af'}}>Active Drivers</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">💰</div>
          <div className="metric-info">
            <h3 style={{color: '#fff'}}>$45,231</h3>
            <p style={{color: '#9ca3af'}}>Revenue</p>
          </div>
        </div>
      </div>

      <div className="admin-quick-actions">
        <h3 style={{color: '#fff'}}>Quick Actions</h3>
        <div className="action-buttons">
          <button className="action-btn primary">Create New User</button>
          <button className="action-btn secondary">Generate Report</button>
          <button className="action-btn secondary">System Backup</button>
          <button className="action-btn secondary">Send Announcement</button>
        </div>
      </div>
    </div>
  );
}

// User Management Component
function UserManagement() {
  const [users] = useState([
    { id: 1, name: 'John Admin', email: 'admin@sparrow.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Sarah Staff', email: 'staff@sparrow.com', role: 'Staff', status: 'Active' },
    { id: 3, name: 'Alice Customer', email: 'customer@sparrow.com', role: 'Customer', status: 'Active' },
    { id: 4, name: 'Bob Driver', email: 'driver@sparrow.com', role: 'Driver', status: 'Active' },
  ]);

  return (
    <div className="content-section">
      <h2 style={{color: '#fff'}}>User Management</h2>
      
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <span className={`status ${user.status.toLowerCase()}`}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <button className="btn-small primary">Edit</button>
                  <button className="btn-small danger">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Role Management Component
function RoleManagement() {
  const [roles] = useState([
    { 
      id: 1, 
      name: 'Admin', 
      permissions: ['User Management', 'System Settings', 'Reports', 'KPI Access'],
      users: 2 
    },
    { 
      id: 2, 
      name: 'Staff', 
      permissions: ['Parcel Management', 'Warehouse Management', 'Route Planning'],
      users: 15 
    },
    { 
      id: 3, 
      name: 'Customer', 
      permissions: ['Track Parcels', 'View Costs', 'Request Delivery'],
      users: 1200 
    },
    { 
      id: 4, 
      name: 'Driver', 
      permissions: ['View Routes', 'Update Delivery Status', 'Access GPS'],
      users: 30 
    },
  ]);

  return (
    <div className="content-section">
      <h2 style={{color: '#fff'}}>Role Management</h2>
      
      <div className="roles-grid">
        {roles.map(role => (
          <div key={role.id} className="role-card">
            <h3 style={{color: '#60a5fa'}}>{role.name}</h3>
            <p style={{color: '#9ca3af'}}>{role.users} users</p>
            <div className="permissions-list">
              <h4 style={{color: '#fff'}}>Permissions:</h4>
              <ul>
                {role.permissions.map((permission, index) => (
                  <li key={index} style={{color: '#d1d5db'}}>{permission}</li>
                ))}
              </ul>
            </div>
            <div className="role-actions">
              <button className="btn-small primary">Edit Role</button>
              <button className="btn-small secondary">View Users</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// KPI Monitoring Component
function KPIMonitoring() {
  return (
    <div className="content-section">
      <h2 style={{color: '#fff'}}>KPI Monitoring</h2>
      
      <div className="kpi-grid">
        <div className="kpi-card">
          <h3 style={{color: '#60a5fa'}}>Delivery Performance</h3>
          <div className="kpi-value">98.5%</div>
          <p style={{color: '#10b981'}}>↑ 2.3% from last month</p>
        </div>
        
        <div className="kpi-card">
          <h3 style={{color: '#60a5fa'}}>Average Delivery Time</h3>
          <div className="kpi-value">2.4 days</div>
          <p style={{color: '#10b981'}}>↓ 0.3 days improved</p>
        </div>
        
        <div className="kpi-card">
          <h3 style={{color: '#60a5fa'}}>Customer Satisfaction</h3>
          <div className="kpi-value">4.7/5</div>
          <p style={{color: '#10b981'}}>↑ 0.2 from last month</p>
        </div>
        
        <div className="kpi-card">
          <h3 style={{color: '#60a5fa'}}>Cost per Delivery</h3>
          <div className="kpi-value">$12.50</div>
          <p style={{color: '#ef4444'}}>↑ $0.80 increased</p>
        </div>
      </div>
    </div>
  );
}

// Reports Component
function Reports() {
  return (
    <div className="content-section">
      <h2 style={{color: '#fff'}}>Reports & Analytics</h2>
      
      <div className="reports-section">
        <div className="report-filters">
          <select className="filter-select">
            <option>Last 30 Days</option>
            <option>Last 3 Months</option>
            <option>Last Year</option>
          </select>
          <button className="action-btn primary">Generate Report</button>
        </div>
        
        <div className="report-cards">
          <div className="report-card">
            <h3 style={{color: '#fff'}}>Daily Operations Report</h3>
            <p style={{color: '#9ca3af'}}>Comprehensive daily activity summary</p>
            <button className="btn-small primary">Download</button>
          </div>
          
          <div className="report-card">
            <h3 style={{color: '#fff'}}>Financial Summary</h3>
            <p style={{color: '#9ca3af'}}>Revenue and cost analysis</p>
            <button className="btn-small primary">Download</button>
          </div>
          
          <div className="report-card">
            <h3 style={{color: '#fff'}}>Performance Analytics</h3>
            <p style={{color: '#9ca3af'}}>KPI trends and insights</p>
            <button className="btn-small primary">Download</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// System Settings Component
function SystemSettings() {
  return (
    <div className="content-section">
      <h2 style={{color: '#fff'}}>System Settings</h2>
      
      <div className="settings-sections">
        <div className="settings-card">
          <h3 style={{color: '#60a5fa'}}>General Settings</h3>
          <div className="setting-item">
            <label style={{color: '#fff'}}>System Name</label>
            <input type="text" defaultValue="Sparrow Logistics" className="setting-input" />
          </div>
          <div className="setting-item">
            <label style={{color: '#fff'}}>Default Timezone</label>
            <select className="setting-select">
              <option>UTC+0</option>
              <option>UTC+5:30</option>
            </select>
          </div>
        </div>
        
        <div className="settings-card">
          <h3 style={{color: '#60a5fa'}}>Security Settings</h3>
          <div className="setting-item">
            <label style={{color: '#fff'}}>Password Policy</label>
            <select className="setting-select">
              <option>Strong</option>
              <option>Medium</option>
            </select>
          </div>
          <div className="setting-item">
            <label style={{color: '#fff'}}>Session Timeout (minutes)</label>
            <input type="number" defaultValue="60" className="setting-input" />
          </div>
        </div>
      </div>
    </div>
  );
}