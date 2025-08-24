import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  colorScheme = "emerald",
  suffix = "",
  loading = false 
}) {
  const getChangeIcon = () => {
    if (change > 0) return <TrendingUp className="w-4 h-4" />;
    if (change < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getChangeColor = () => {
    if (change > 0) return "text-emerald-600 bg-emerald-50";
    if (change < 0) return "text-red-600 bg-red-50";
    return "text-slate-600 bg-slate-50";
  };

  const colorMap = {
    emerald: "from-emerald-500 to-emerald-600",
    yellow: "from-yellow-500 to-yellow-600",
    blue: "from-blue-500 to-blue-600",
    purple: "from-purple-500 to-purple-600",
  };

  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="animate-pulse">
              <div className="h-4 w-24 bg-slate-200 rounded"></div>
            </div>
            <div className={`p-3 rounded-xl bg-gradient-to-r ${colorMap[colorScheme]} bg-opacity-10`}>
              <Icon className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 w-32 bg-slate-200 rounded mb-2"></div>
            <div className="h-4 w-20 bg-slate-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 hover:shadow-xl transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">
            {title}
          </CardTitle>
          <div className={`p-3 rounded-xl bg-gradient-to-r ${colorMap[colorScheme]} bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300`}>
            <Icon className={`w-5 h-5 text-${colorScheme}-600 group-hover:scale-110 transition-transform`} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold text-slate-900">
            {value}{suffix}
          </div>
          {change !== undefined && (
            <Badge variant="secondary" className={`${getChangeColor()} font-medium`}>
              {getChangeIcon()}
              <span className="ml-1">
                {Math.abs(change).toFixed(1)}%
              </span>
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}