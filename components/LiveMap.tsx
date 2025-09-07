"use client";
import dynamic from "next/dynamic";
import type { DemoParcel } from "@/data/demoParcels";

const LiveMapClient = dynamic(() => import("./LiveMap.client"), { ssr: false });

export default function LiveMap({
  parcels = [],
  selectedId = null,
  onSelect,
}: {
  parcels?: DemoParcel[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  return <LiveMapClient parcels={parcels} selectedId={selectedId} onSelect={onSelect} />;
}
