import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  AlertTriangle 
} from "lucide-react";
import { motion } from "framer-motion";

const StatCard = ({ title, value, icon: Icon, gradient, textColor, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      <div className={`h-2 ${gradient}`} />
      <CardContent className="p-6 bg-white/80 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              {title}
            </p>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className={`text-3xl font-bold ${textColor}`}>
                {value}
              </p>
            )}
          </div>
          <div className={`p-4 rounded-full ${gradient} bg-opacity-10`}>
            <Icon className={`w-6 h-6 ${textColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default function StatsGrid({ stats, loading }) {
  const statsData = [
    {
      title: "Total Assignments",
      value: stats.total,
      icon: BookOpen,
      gradient: "bg-gradient-to-r from-blue-500 to-blue-600",
      textColor: "text-blue-600"
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      gradient: "bg-gradient-to-r from-green-500 to-green-600",
      textColor: "text-green-600"
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock,
      gradient: "bg-gradient-to-r from-yellow-500 to-yellow-600",
      textColor: "text-yellow-600"
    },
    {
      title: "Overdue",
      value: stats.overdue,
      icon: AlertTriangle,
      gradient: "bg-gradient-to-r from-red-500 to-red-600",
      textColor: "text-red-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => (
        <StatCard
          key={stat.title}
          {...stat}
          loading={loading}
        />
      ))}
    </div>
  );
}