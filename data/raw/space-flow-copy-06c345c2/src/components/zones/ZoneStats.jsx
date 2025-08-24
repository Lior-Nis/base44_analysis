
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Briefcase, BarChart, Layers } from "lucide-react";

export default function ZoneStats({ zones, workspaces }) {
  const totalCapacity = zones.reduce((sum, zone) => sum + (zone.capacity || 0), 0);
  const averageWorkspacesPerZone = zones.length > 0 
    ? (workspaces.length / zones.length).toFixed(1) 
    : 0;
    
  const zoneTypes = zones.reduce((acc, zone) => {
    acc[zone.zone_type] = (acc[zone.zone_type] || 0) + 1;
    return acc;
  }, {});
  const mostCommonType = Object.entries(zoneTypes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  const stats = [
    { title: "Total Zones", value: zones.length, icon: Users, color: "text-blue-600" },
    { title: "Total Capacity", value: totalCapacity, icon: Briefcase, color: "text-green-600" },
    { title: "Avg. Workspaces/Zone", value: averageWorkspacesPerZone, icon: BarChart, color: "text-purple-600" },
    { title: "Most Common Type", value: mostCommonType.replace('_', ' '), icon: Layers, color: "text-slate-600" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900 capitalize">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
