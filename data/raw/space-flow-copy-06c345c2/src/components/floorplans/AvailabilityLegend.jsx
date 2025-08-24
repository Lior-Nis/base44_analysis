
import React from "react";
import { Badge } from "@/components/ui/badge";

const legendItems = [
  { label: "Available", color: "bg-green-500" },
  { label: "Your Desk", color: "bg-teal-500" }, // Changed from amber
  { label: "Manual Booking", color: "bg-blue-500" },
  { label: "Roster Assigned", color: "bg-purple-500" },
  { label: "Unavailable", color: "bg-slate-400" },
];

export default function AvailabilityLegend() {
  return (
    <div className="p-4 rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200">
      <h4 className="text-sm font-semibold text-slate-700 mb-3">Legend</h4>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
            <span className="text-xs text-slate-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
