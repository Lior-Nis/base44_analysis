
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Clock, Code, Target } from "lucide-react";

export default function StatsOverview({ 
  totalHoursLearned = 0,
  lessonsCompleted = 0,
  currentStreak = 0,
  totalProjects = 0 
}) {
  const stats = [
    {
      title: "Hours Learned",
      value: totalHoursLearned,
      icon: Clock,
      gradient: "from-blue-400 to-cyan-400",
    },
    {
      title: "Lessons Completed", 
      value: lessonsCompleted,
      icon: Code,
      gradient: "from-green-400 to-emerald-400",
    },
    {
      title: "Current Streak",
      value: `${currentStreak} days`,
      icon: Target,
      gradient: "from-orange-400 to-amber-400",
    },
    {
      title: "Projects Built",
      value: totalProjects,
      icon: Trophy,
      gradient: "from-purple-400 to-violet-400",
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="hover-lift border-0 shadow-lg text-white overflow-hidden rounded-2xl relative group">
           <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} transition-transform duration-500 group-hover:scale-110`}></div>
           <div className="relative p-6">
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium opacity-80">{stat.title}</span>
                <div className="bg-white/20 p-2 rounded-lg">
                    <stat.icon className="w-5 h-5" />
                </div>
            </div>
            <div className="text-3xl font-bold">{stat.value}</div>
           </div>
        </Card>
      ))}
    </div>
  );
}
