"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../../home.css";
import LiveMap from "@/components/LiveMap";
import { demoParcels } from "@/data/demoParcels";
import { demoHistory } from "@/data/demoHistory";
import StatusTimeline from "@/components/StatusTimeline";
import { useLiveParcels } from "@/hooks/useLiveParcels";


export default function StaffDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== "staff") {
        router.push("/login");
        return;
      }
      setUser(parsedUser);
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo-section">
            <span className="logo-icon">📦</span>
            <h1 className="system-title">Staff Operations</h1>
          </div>
          <div className="header-actions">
            <div className="notification-bell">🔔</div>
            <div className="user-profile">
              <div className="profile-img"></div>
              <span className="user-name">{user.name}</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-layout">
        {/* Staff Sidebar */}
        <nav className="sidebar">
          <div className="nav-section">
            <h3>Operations</h3>
            <button
              className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <span className="nav-icon">📊</span>
              Dashboard
            </button>
            <button
              className={`nav-item ${activeTab === "parcels" ? "active" : ""}`}
              onClick={() => setActiveTab("parcels")}
            >
              <span className="nav-icon">📦</span>
              Parcel Management
            </button>
            <button
              className={`nav-item ${activeTab === "warehouse" ? "active" : ""}`}
              onClick={() => setActiveTab("warehouse")}
            >
              <span className="nav-icon">🏭</span>
              Warehouse Management
            </button>
          </div>

          <div className="nav-section">
            <h3>Logistics</h3>
            <button
              className={`nav-item ${activeTab === "consolidation" ? "active" : ""}`}
              onClick={() => setActiveTab("consolidation")}
            >
              <span className="nav-icon">📋</span>
              Parcel Consolidation
            </button>
            <button
              className={`nav-item ${activeTab === "routes" ? "active" : ""}`}
              onClick={() => setActiveTab("routes")}
            >
              <span className="nav-icon">🗺️</span>
              Route Planning
            </button>
            <button
              className={`nav-item ${activeTab === "tracking" ? "active" : ""}`}
              onClick={() => setActiveTab("tracking")}
            >
              <span className="nav-icon">📍</span>
              Live Tracking
            </button>
          </div>

          <div className="nav-section">
            <h3>Reports</h3>
            <button
              className={`nav-item ${activeTab === "reports" ? "active" : ""}`}
              onClick={() => setActiveTab("reports")}
            >
              <span className="nav-icon">📈</span>
              Performance Reports
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="main-content">
          {activeTab === "overview" && <StaffOverview />}
          {activeTab === "parcels" && <ParcelManagement />}
          {activeTab === "warehouse" && <WarehouseManagement />}
          {activeTab === "consolidation" && <ParcelConsolidation />}
          {activeTab === "routes" && <RoutePlanning />}
          {activeTab === "tracking" && <LiveTracking />}
          {activeTab === "reports" && <PerformanceReports />}
        </main>
      </div>
    </div>
  );
}

// Staff Overview Component
function StaffOverview() {
  return (
    <div className="content-section">
      <h2 className="section-title">Staff Operations Dashboard</h2>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">📦</div>
          <div className="metric-info">
            <h3 className="metric-value">247</h3>
            <p className="metric-label">Pending Parcels</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">✅</div>
          <div className="metric-info">
            <h3 className="metric-value">156</h3>
            <p className="metric-label">Processed Today</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">🏭</div>
          <div className="metric-info">
            <h3 className="metric-value">8</h3>
            <p className="metric-label">Active Warehouses</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">📋</div>
          <div className="metric-info">
            <h3 className="metric-value">23</h3>
            <p className="metric-label">Consolidated Groups</p>
          </div>
        </div>
      </div>

      <div className="staff-quick-actions">
        <h3 className="section-subtitle">Quick Actions</h3>
        <div className="action-buttons">
          <button className="action-btn primary">Add New Parcel</button>
          <button className="action-btn secondary">Register Warehouse</button>
          <button className="action-btn secondary">Create Route</button>
          <button className="action-btn secondary">Generate Report</button>
        </div>
      </div>

      <div className="recent-activity">
        <h3 className="section-subtitle">Recent Activities</h3>
        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-icon">📦</span>
            <div className="activity-details">
              <p className="activity-text">
                <strong>Parcel SP2024089</strong> added to warehouse WH-001
              </p>
              <small className="activity-time">5 minutes ago</small>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">📋</span>
            <div className="activity-details">
              <p className="activity-text">
                <strong>15 parcels</strong> consolidated for Zone-A delivery
              </p>
              <small className="activity-time">12 minutes ago</small>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-icon">🗺️</span>
            <div className="activity-details">
              <p className="activity-text">
                <strong>Route R-045</strong> optimized for 8 destinations
              </p>
              <small className="activity-time">25 minutes ago</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Parcel Management Component
function ParcelManagement() {
  const [parcels] = useState([
    {
      id: "SP2024001",
      sender: "John Doe",
      recipient: "Alice Smith",
      destination: "New York",
      status: "Pending",
      weight: "2.5kg",
    },
    {
      id: "SP2024002",
      sender: "Bob Wilson",
      recipient: "Carol Johnson",
      destination: "Los Angeles",
      status: "Processing",
      weight: "1.8kg",
    },
    {
      id: "SP2024003",
      sender: "David Brown",
      recipient: "Eva Davis",
      destination: "Chicago",
      status: "Ready",
      weight: "3.2kg",
    },
    {
      id: "SP2024004",
      sender: "Frank Miller",
      recipient: "Grace Lee",
      destination: "Houston",
      status: "In Transit",
      weight: "1.1kg",
    },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="content-section">
      <div className="section-header">
        <h2 className="section-title">Parcel Management</h2>
        <button className="action-btn primary" onClick={() => setShowAddForm(true)}>
          Add New Parcel
        </button>
      </div>

      {showAddForm && (
        <div className="form-modal">
          <div className="form-container">
            <h3 className="form-title">Add New Parcel</h3>
            <form className="parcel-form">
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Sender Name</label>
                  <input type="text" className="form-input" placeholder="Enter sender name" />
                </div>
                <div className="form-field">
                  <label className="form-label">Recipient Name</label>
                  <input type="text" className="form-input" placeholder="Enter recipient name" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Destination</label>
                  <input type="text" className="form-input" placeholder="Enter destination" />
                </div>
                <div className="form-field">
                  <label className="form-label">Weight</label>
                  <input type="text" className="form-input" placeholder="Enter weight" />
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="action-btn secondary"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="action-btn primary">
                  Add Parcel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Parcel ID</th>
              <th>Sender</th>
              <th>Recipient</th>
              <th>Destination</th>
              <th>Weight</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {parcels.map((parcel) => (
              <tr key={parcel.id}>
                <td className="parcel-id">{parcel.id}</td>
                <td>{parcel.sender}</td>
                <td>{parcel.recipient}</td>
                <td>{parcel.destination}</td>
                <td>{parcel.weight}</td>
                <td>
                  <span className={`status ${parcel.status.toLowerCase().replace(" ", "-")}`}>
                    {parcel.status}
                  </span>
                </td>
                <td>
                  <button className="btn-small primary">Edit</button>
                  <button
                    className="btn-small secondary"
                    onClick={() => window.location.assign(`/parcels/${parcel.id}`)}
                  >
                    Track
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Warehouse Management Component
function WarehouseManagement() {
  const [warehouses] = useState([
    {
      id: "WH-001",
      name: "Central Warehouse",
      location: "Downtown",
      capacity: "1000",
      occupied: "785",
      status: "Active",
    },
    {
      id: "WH-002",
      name: "North Warehouse",
      location: "North District",
      capacity: "800",
      occupied: "450",
      status: "Active",
    },
    {
      id: "WH-003",
      name: "South Warehouse",
      location: "South District",
      capacity: "600",
      occupied: "590",
      status: "Nearly Full",
    },
  ]);

  const [showRegisterForm, setShowRegisterForm] = useState(false);

  return (
    <div className="content-section">
      <div className="section-header">
        <h2 className="section-title">Warehouse Management</h2>
        <button className="action-btn primary" onClick={() => setShowRegisterForm(true)}>
          Register New Warehouse
        </button>
      </div>

      {showRegisterForm && (
        <div className="form-modal">
          <div className="form-container">
            <h3 className="form-title">Register New Warehouse</h3>
            <form className="warehouse-form">
              <div className="form-field">
                <label className="form-label">Warehouse Name</label>
                <input type="text" className="form-input" placeholder="Enter warehouse name" />
              </div>
              <div className="form-field">
                <label className="form-label">Location</label>
                <input type="text" className="form-input" placeholder="Enter location" />
              </div>
              <div className="form-field">
                <label className="form-label">Capacity</label>
                <input type="number" className="form-input" placeholder="Enter capacity" />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="action-btn secondary"
                  onClick={() => setShowRegisterForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="action-btn primary">
                  Register Warehouse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="warehouse-grid">
        {warehouses.map((warehouse) => (
          <div key={warehouse.id} className="warehouse-card">
            <div className="warehouse-header">
              <h3 className="warehouse-name">{warehouse.name}</h3>
              <span className={`status ${warehouse.status.toLowerCase().replace(" ", "-")}`}>
                {warehouse.status}
              </span>
            </div>
            <div className="warehouse-details">
              <p className="warehouse-location">📍 {warehouse.location}</p>
              <div className="capacity-info">
                <p className="capacity-text">
                  Capacity: {warehouse.occupied}/{warehouse.capacity}
                </p>
                <div className="capacity-bar">
                  <div
                    className="capacity-fill"
                    style={{
                      width: `${(parseInt(warehouse.occupied) / parseInt(warehouse.capacity)) * 100
                        }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="warehouse-actions">
              <button className="btn-small primary">View Details</button>
              <button className="btn-small secondary">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Parcel Consolidation Component
function ParcelConsolidation() {
  return (
    <div className="content-section">
      <h2 className="section-title">Parcel Consolidation</h2>

      <div className="consolidation-controls">
        <div className="filter-section">
          <label className="form-label">Group by Location:</label>
          <select className="form-select">
            <option>All Locations</option>
            <option>New York</option>
            <option>Los Angeles</option>
            <option>Chicago</option>
          </select>
          <button className="action-btn primary">Auto Consolidate</button>
        </div>
      </div>

      <div className="consolidation-groups">
        <div className="group-card">
          <h3 className="group-title">📍 New York Zone</h3>
          <p className="group-info">12 parcels • Total weight: 15.8kg</p>
          <div className="parcel-list">
            <div className="parcel-item">SP2024001 - 2.5kg</div>
            <div className="parcel-item">SP2024005 - 1.8kg</div>
            <div className="parcel-item">SP2024012 - 3.2kg</div>
            <div className="parcel-item">+9 more parcels</div>
          </div>
          <button className="action-btn secondary">Create Route</button>
        </div>

        <div className="group-card">
          <h3 className="group-title">📍 Chicago Zone</h3>
          <p className="group-info">8 parcels • Total weight: 11.2kg</p>
          <div className="parcel-list">
            <div className="parcel-item">SP2024003 - 3.2kg</div>
            <div className="parcel-item">SP2024008 - 2.1kg</div>
            <div className="parcel-item">SP2024015 - 1.9kg</div>
            <div className="parcel-item">+5 more parcels</div>
          </div>
          <button className="action-btn secondary">Create Route</button>
        </div>
      </div>
    </div>
  );
}

// Route Planning Component
function RoutePlanning() {
  return (
    <div className="content-section">
      <h2 className="section-title">Route Planning</h2>

      <div className="route-planning-grid">
        <div className="planning-panel">
          <h3 className="panel-title">Create New Route</h3>
          <form className="route-form">
            <div className="form-field">
              <label className="form-label">Route Name</label>
              <input type="text" className="form-input" placeholder="Enter route name" />
            </div>
            <div className="form-field">
              <label className="form-label">Starting Point</label>
              <select className="form-select">
                <option>Central Warehouse</option>
                <option>North Warehouse</option>
                <option>South Warehouse</option>
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Destinations</label>
              <textarea className="form-textarea" placeholder="Enter destinations (one per line)"></textarea>
            </div>
            <button type="submit" className="action-btn primary">
              Optimize Route
            </button>
          </form>
        </div>

        <div className="routes-panel">
          <h3 className="panel-title">Active Routes</h3>
          <div className="route-list">
            <div className="route-item">
              <h4 className="route-name">Route R-001</h4>
              <p className="route-info">8 stops • 45 km • Est. 3.5 hours</p>
              <div className="route-status">
                <span className="status in-progress">In Progress</span>
                <button className="btn-small secondary">View Details</button>
              </div>
            </div>
            <div className="route-item">
              <h4 className="route-name">Route R-002</h4>
              <p className="route-info">5 stops • 32 km • Est. 2.8 hours</p>
              <div className="route-status">
                <span className="status planned">Planned</span>
                <button className="btn-small secondary">View Details</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


// Live Tracking Component (map + selectable list + timeline)
// Live Tracking Component (map + selectable list + timeline) + City consolidation
function LiveTracking() {
  const { parcels, source } = useLiveParcels();  // live with fallback
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  // NEW: consolidation filter by city
  const [cityFilter, setCityFilter] = React.useState<string>("All");

  // Build city groups (consolidation)
  const cityGroups = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const p of parcels) {
      const key = p.city ?? "Unknown";
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    // turn into sorted array, “All” on top
    const rows = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    return rows;
  }, [parcels]);

  // Apply filter to the dataset that goes to the map & the list
  const filteredParcels = React.useMemo(() => {
    if (cityFilter === "All") return parcels;
    return parcels.filter(p => (p.city ?? "Unknown") === cityFilter);
  }, [parcels, cityFilter]);

  // Select first parcel whenever filtered set changes and current selection goes missing
  React.useEffect(() => {
    if (filteredParcels.length === 0) { setSelectedId(null); return; }
    if (!selectedId || !filteredParcels.some(p => p.id === selectedId)) {
      setSelectedId(filteredParcels[0].id);
    }
  }, [filteredParcels, selectedId]);

  // Use demo history for now
  const { demoHistory } = require("@/data/demoHistory");
  const selectedHistory = selectedId ? (demoHistory[selectedId] ?? []) : [];

  return (
    <div className="content-section">
      <h2 className="section-title">Live Tracking</h2>

      <div className="tracking-dashboard">
        {/* Left: map (filtered) */}
        <div className="tracking-map">
          <LiveMap
            parcels={filteredParcels as any}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId(id)}
          />
        </div>

        {/* Right: consolidation + list + timeline */}
        <div className="tracking-sidebar">
          {/* Consolidation header */}
          <div className="sidebar-title" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>Active Deliveries <span style={{ fontSize: 12, opacity: 0.7 }}>({source})</span></span>

            {/* City filter dropdown */}
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              style={{
                background: "#1f2937",
                border: "1px solid #374151",
                color: "#e5e7eb",
                padding: "6px 8px",
                borderRadius: 6,
                fontSize: 13,
              }}
              title="Filter by City"
            >
              <option value="All">All Cities</option>
              {cityGroups.map(([city]) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Consolidation summary list */}
          <div style={{ marginTop: 8, marginBottom: 12 }}>
            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 6 }}>Consolidation by City</div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 6 }}>
              <li>
                <button
                  onClick={() => setCityFilter("All")}
                  className={`delivery-item ${cityFilter === "All" ? "active" : ""}`}
                  style={{ width: "100%", textAlign: "left" }}
                >
                  <div className="delivery-header">
                    <span className="delivery-id">All Cities</span>
                    <span className="delivery-driver">Count: {parcels.length}</span>
                  </div>
                </button>
              </li>
              {cityGroups.map(([city, count]) => (
                <li key={city}>
                  <button
                    onClick={() => setCityFilter(city)}
                    className={`delivery-item ${cityFilter === city ? "active" : ""}`}
                    style={{ width: "100%", textAlign: "left" }}
                  >
                    <div className="delivery-header">
                      <span className="delivery-id">{city}</span>
                      <span className="delivery-driver">Count: {count}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Filtered parcel list */}
          <div className="delivery-list">
            {filteredParcels.map((p) => {
              const isActive = p.id === selectedId;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`delivery-item ${isActive ? "active" : ""}`}
                  style={{ textAlign: "left" }}
                >
                  <div className="delivery-header">
                    <span className="delivery-id">{p.code}</span>
                    <span className="delivery-driver">Status: {p.status}</span>
                  </div>
                  <div className="delivery-eta">
                    <p className="eta-text">City: {p.city ?? "—"} • ETA: {p.eta ?? "—"}</p>
                  </div>
                </button>
              );
            })}
            {filteredParcels.length === 0 && (
              <div style={{ fontSize: 13, opacity: 0.6, padding: "6px 2px" }}>
                No parcels in this city.
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="timeline-card">
            <h4 className="sidebar-title" style={{ marginTop: "12px" }}>
              Status History {selectedId ? `(${selectedId})` : ""}
            </h4>
            <div style={{ maxHeight: 260, overflowY: "auto", paddingRight: 6 }}>
              <StatusTimeline events={selectedHistory} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



// Performance Reports Component
function PerformanceReports() {
  return (
    <div className="content-section">
      <h2 className="section-title">Performance Reports</h2>

      <div className="reports-dashboard">
        <div className="report-filters">
          <select className="filter-select">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 3 Months</option>
          </select>
          <button className="action-btn primary">Generate Report</button>
        </div>

        <div className="performance-metrics">
          <div className="performance-card">
            <h3 className="performance-title">Parcels Processed</h3>
            <div className="performance-value">1,247</div>
            <p className="performance-change positive">↑ 12% from last week</p>
          </div>

          <div className="performance-card">
            <h3 className="performance-title">Average Processing Time</h3>
            <div className="performance-value">2.3 hrs</div>
            <p className="performance-change positive">↓ 0.5 hrs improved</p>
          </div>

          <div className="performance-card">
            <h3 className="performance-title">Route Efficiency</h3>
            <div className="performance-value">94.2%</div>
            <p className="performance-change positive">↑ 3.1% optimized</p>
          </div>
        </div>
      </div>
    </div>
  );
}
