"use client";

import LiveMap from "@/components/LiveMap";
import "../home.css";
import Link from "next/link";

export default function TrackingPage() {
  return (
    <div className="home-container">
      <nav className="notch-navbar">
        <div className="notch-navbar-inner">
          <Link className="brand-name" href="/">Sparrow</Link>
          <div className="nav-links">
            <Link className="nav-link" href="/">Home</Link>
            <Link className="nav-link active" href="/tracking">Tracking</Link>
          </div>
        </div>
      </nav>

      <main className="content">
        <h1 className="page-title">Live Parcel Tracking</h1>
        <LiveMap />
      </main>
    </div>
  );
}
