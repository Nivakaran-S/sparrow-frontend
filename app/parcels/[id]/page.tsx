"use client";

import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import "../../home.css";
//import { demoParcels } from "@/data/demoParcels";
//import { demoHistory } from "@/data/demoHistory";
import StatusTimeline from "@/app/staff/components/StatusTimeline";
import dynamic from "next/dynamic";

const TinyMap = dynamic(() => import("./tiny-map"), { ssr: false });

export default function ParcelDetailsPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  // const parcel = useMemo(() => demoParcels.find((p) => p.id === id) ?? null, [id]);
  // const history = useMemo(() => demoHistory[id] ?? [], [id]);

  // if (!parcel) {
  //   return (
  //     <div className="content">
  //       <div className="page-title">Parcel not found</div>
  //       <button className="action-btn secondary" onClick={() => router.back()}>
  //         ← Back
  //       </button>
  //     </div>
  //   );
  // }

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
