"use client";
import dynamic from "next/dynamic";

const LiveMapClient = dynamic(() => import("./LiveMap.client"), { ssr: false });

type DemoParcel = {
  id: string;
  code: string;
  city: string;
  lat: number;
  lng: number;
  status: string;
  eta?: string;
};

const demoParcels: DemoParcel[] = [
  { id: "SP2024001", code: "SP2024001", city: "New York",     lat: 40.7128, lng: -74.0060, status: "Pending",     eta: "—" },
  { id: "SP2024002", code: "SP2024002", city: "Los Angeles",  lat: 34.0522, lng: -118.2437, status: "Processing", eta: "—" },
  { id: "SP2024003", code: "SP2024003", city: "Chicago",      lat: 41.8781, lng: -87.6298,  status: "Ready",      eta: "—" },
  { id: "SP2024004", code: "SP2024004", city: "Houston",      lat: 29.7604, lng: -95.3698,  status: "In Transit", eta: "—" },
];


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
