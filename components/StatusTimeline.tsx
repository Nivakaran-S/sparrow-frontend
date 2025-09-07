"use client";

import dayjs from "dayjs";

export type StatusEvent = { time: string; status: string; note?: string };

export default function StatusTimeline({ events = [] }: { events: StatusEvent[] }) {
  if (!events.length) return <div className="text-sm text-gray-400">No history yet.</div>;

  return (
    <ol className="relative border-s ps-6">
      {events.map((e, i) => (
        <li key={i} className="mb-5">
          <div className="absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full bg-gray-500" />
          <div className="text-xs text-gray-400">
            {dayjs(e.time).format("YYYY-MM-DD HH:mm")}
          </div>
          <div className="font-medium">{e.status}</div>
          {e.note && <div className="text-sm text-gray-300">{e.note}</div>}
        </li>
      ))}
    </ol>
  );
}
