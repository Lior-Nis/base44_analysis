import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Users, Clock, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

export default function StatsOverview({ totalAnalyses, totalPatients, processingCount, stats, isLoading }) {
  const statsCards = [
    {
      title: "Total Analyses",
      value: totalAnalyses,
      icon: Activity,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Active Patients",
      value: totalPatients,
      icon: Users,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Processing",
      value: processingCount,
      icon: Clock,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Normal Results",
      value: `${stats.normal}%`,
      icon: CheckCircle,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((stat, index) => (
        <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-4 h-4 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {isLoading ? <Skeleton className="h-6 w-16" /> : stat.value}
            </div>
            <div className="flex items-center space-x-1 text-xs text-slate-500 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>Updated now</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}