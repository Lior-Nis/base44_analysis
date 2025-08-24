import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Layers, Users, BarChart } from "lucide-react";

export default function FloorStats({ floors, zones, workspaces }) {
  const totalZones = zones.length;
  const totalWorkspaces = workspaces.length;
  const averageZonesPerFloor = floors.length > 0 ? (totalZones / floors.length).toFixed(1) : 0;
  const averageWorkspacesPerFloor = floors.length > 0 ? (totalWorkspaces / floors.length).toFixed(1) : 0;

  const stats = [
    { 
      title: "Total Floors", 
      value: floors.length, 
      icon: MapPin, 
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    { 
      title: "Total Zones", 
      value: totalZones, 
      icon: Layers, 
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    { 
      title: "Avg. Zones/Floor", 
      value: averageZonesPerFloor, 
      icon: BarChart, 
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    { 
      title: "Avg. Workspaces/Floor", 
      value: averageWorkspacesPerFloor, 
      icon: Users, 
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}