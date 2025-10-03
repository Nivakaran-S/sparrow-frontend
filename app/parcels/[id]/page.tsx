"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import "../../home.css";
import { demoParcels } from "@/data/demoParcels";
import { demoHistory } from "@/data/demoHistory";
import StatusTimeline from "@/app/staff/components/StatusTimeline";
import dynamic from "next/dynamic";

const TinyMap = dynamic(() => import("./tiny-map"), { ssr: false });

export default function ParcelDetailsPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const parcel = useMemo(() => demoParcels.find((p) => p.id === id) ?? null, [id]);
  const history = useMemo(() => demoHistory[id] ?? [], [id]);

  if (!parcel) {
    return (
      <div className="content">
        <div className="page-title">Parcel not found</div>
        <button className="action-btn secondary" onClick={() => router.back()}>
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Top bar */}
      <nav className="notch-navbar">
        <div className="notch-navbar-inner">
          <button className="nav-link" onClick={() => router.back()}>
            ← Back
          </button>
          <span className="brand-name">Sparrow</span>
          <div />
        </div>
      </nav>

      <main className="content">
        <header className="details-header">
          <h1 className="page-title">Parcel {parcel.code}</h1>
          <span className={`status-pill ${parseStatus(parcel.status)}`}>{parcel.status}</span>
        </header>

        {/* 2-column responsive layout */}
        <div className="details-grid">
          {/* LEFT */}
          <section className="card">
            <div className="card-title">Current Location</div>
            <TinyMap lat={parcel.lat} lng={parcel.lng} />
          </section>

          {/* RIGHT */}
          <aside className="card">
            <div className="card-title">Details</div>
            <ul className="info-list">
              <li><span>Code</span><b>{parcel.code}</b></li>
              <li><span>Status</span><b>{parcel.status}</b></li>
              <li><span>ETA</span><b>{parcel.eta ?? "—"}</b></li>
              <li><span>City</span><b>{parcel.city ?? "—"}</b></li>
              <li><span>Lat / Lng</span><b>{parcel.lat}, {parcel.lng}</b></li>
            </ul>
            <div className="inline-actions">
              <button className="action-btn primary" onClick={() => router.back()}>Back to Dashboard</button>
            </div>
          </aside>

          {/* TIMELINE (full-width) */}
          <section className="card col-span-2">
            <div className="card-title">Status History</div>
            <div style={{ maxHeight: 380, overflowY: "auto", paddingRight: 6 }}>
              <StatusTimeline events={history} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function parseStatus(s: string) {
  const t = s.toLowerCase();
  if (t.includes("transit")) return "pill-blue";
  if (t.includes("process")) return "pill-purple";
  if (t.includes("ready")) return "pill-amber";
  if (t.includes("deliver")) return "pill-green";
  return "pill-gray";
}
