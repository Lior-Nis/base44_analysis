import React from "react";
import { FileText, Users, Clock, TrendingUp } from "lucide-react";

export default function StatsOverview({ projects = [], teams = [] }) {
  const recentProjects = projects.filter(p => {
    const lastAccessed = new Date(p.last_accessed || p.created_date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return lastAccessed > weekAgo;
  }).length;

  const stats = [
    {
      label: "Total Projects",
      value: projects.length,
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      label: "Teams",
      value: teams.length,
      icon: Users,
      color: "text-green-600",
      bg: "bg-green-50"
    },
    {
      label: "Recent Activity",
      value: recentProjects,
      icon: Clock,
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      label: "This Week",
      value: `+${recentProjects}`,
      icon: TrendingUp,
      color: "text-orange-600",
      bg: "bg-orange-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}