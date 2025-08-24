import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

export default function ProgressChart({ assignments, loading }) {
  const generateChartData = () => {
    const subjects = {};
    
    assignments.forEach(assignment => {
      if (!subjects[assignment.subject]) {
        subjects[assignment.subject] = { total: 0, completed: 0 };
      }
      subjects[assignment.subject].total++;
      if (assignment.status === "completed") {
        subjects[assignment.subject].completed++;
      }
    });

    return Object.entries(subjects).map(([subject, data]) => ({
      subject,
      total: data.total,
      completed: data.completed,
      completion: Math.round((data.completed / data.total) * 100) || 0
    }));
  };

  const chartData = generateChartData();

  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Subject Progress
          </CardTitle>
          <div className="text-sm text-gray-500">
            Completion rates by subject
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : chartData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="subject" 
                  className="text-sm text-gray-600"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis className="text-sm text-gray-600" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="completed" 
                  fill="url(#colorGradient)" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="total" 
                  fill="#e5e7eb" 
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.9}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No assignments yet. Add some to see your progress!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}