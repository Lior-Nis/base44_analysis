import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

export default function OsteoporosisDistribution({ stats, isLoading }) {
  const distributionData = [
    {
      label: "Normal",
      value: stats.normal,
      color: "bg-green-500",
      icon: CheckCircle,
      textColor: "text-green-700"
    },
    {
      label: "Osteopenia",
      value: stats.osteopenia,
      color: "bg-yellow-500",
      icon: AlertTriangle,
      textColor: "text-yellow-700"
    },
    {
      label: "Osteoporosis",
      value: stats.osteoporosis,
      color: "bg-red-500",
      icon: XCircle,
      textColor: "text-red-700"
    }
  ];

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-slate-900">Diagnosis Distribution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-10" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        ) : (
          distributionData.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <item.icon className={`w-4 h-4 ${item.textColor}`} />
                  <span className="text-sm font-medium text-slate-700">{item.label}</span>
                </div>
                <span className={`text-sm font-semibold ${item.textColor}`}>
                  {item.value}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${item.color} transition-all duration-500 ease-out`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}