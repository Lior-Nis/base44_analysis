import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Briefcase, CalendarCheck } from "lucide-react";

export default function EmployeeStats({ employees }) {
  const totalEmployees = employees.length;
  const withDedicatedDesk = employees.filter(e => e.dedicated_workspace_id).length;
  
  const totalOfficeDays = employees.reduce((acc, e) => acc + (e.work_days?.length || 0), 0);
  const avgOfficeDays = totalEmployees > 0 ? (totalOfficeDays / totalEmployees).toFixed(1) : 0;

  const stats = [
    { title: "Total Employees", value: totalEmployees, icon: Users, color: "text-blue-600" },
    { title: "With Dedicated Desk", value: withDedicatedDesk, icon: Briefcase, color: "text-green-600" },
    { title: "Avg. Office Days/Week", value: avgOfficeDays, icon: CalendarCheck, color: "text-amber-600" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}