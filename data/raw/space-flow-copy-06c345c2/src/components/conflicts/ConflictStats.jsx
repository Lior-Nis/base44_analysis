import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Users, MapPin, Calendar } from "lucide-react";

export default function ConflictStats({ conflicts }) {
  const stats = {
    total: conflicts.length,
    high: conflicts.filter(c => c.severity === 'high').length,
    medium: conflicts.filter(c => c.severity === 'medium').length,
    low: conflicts.filter(c => c.severity === 'low').length,
    dedicated: conflicts.filter(c => c.type === 'dedicated_workspace').length,
    overcapacity: conflicts.filter(c => c.type === 'overcapacity').length,
    insufficient: conflicts.filter(c => c.type === 'insufficient_capacity').length
  };

  const statItems = [
    {
      title: "Total Conflicts",
      value: stats.total,
      icon: AlertTriangle,
      color: stats.total > 0 ? "text-red-600" : "text-green-600",
      bgColor: stats.total > 0 ? "bg-red-50" : "bg-green-50"
    },
    {
      title: "High Priority",
      value: stats.high,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "Dedicated Desk",
      value: stats.dedicated,
      icon: MapPin,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Overcapacity",
      value: stats.overcapacity,
      icon: Users,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((stat, index) => (
        <Card key={index} className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
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