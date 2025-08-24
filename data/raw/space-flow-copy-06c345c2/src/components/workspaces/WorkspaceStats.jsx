import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, BarChart, CheckSquare, XSquare } from "lucide-react";

export default function WorkspaceStats({ workspaces }) {
  const totalWorkspaces = workspaces.length;
  const activeWorkspaces = workspaces.filter(w => w.active).length;
  const inactiveWorkspaces = totalWorkspaces - activeWorkspaces;

  const workspaceTypes = workspaces.reduce((acc, ws) => {
    acc[ws.workspace_type] = (acc[ws.workspace_type] || 0) + 1;
    return acc;
  }, {});
  const mostCommonType = Object.entries(workspaceTypes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  const stats = [
    { title: "Total Workspaces", value: totalWorkspaces, icon: Briefcase, color: "text-blue-600" },
    { title: "Active", value: activeWorkspaces, icon: CheckSquare, color: "text-green-600" },
    { title: "Inactive", value: inactiveWorkspaces, icon: XSquare, color: "text-red-600" },
    { title: "Most Common Type", value: mostCommonType.replace('_', ' '), icon: BarChart, color: "text-amber-600" },
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