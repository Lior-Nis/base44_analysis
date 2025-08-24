
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  MapPin, 
  Users, 
  TrendingUp,
  Building2,
  CheckCircle
} from "lucide-react";
import { format, isToday, isThisWeek } from "date-fns";

export default function StatsOverview({ bookings, workspaces, locations, user }) {
  const todaysBookings = bookings.filter(b => 
    isToday(new Date(b.booking_date)) && b.status !== 'cancelled'
  );
  
  const userBookings = bookings.filter(b => b.user_email === user?.email);
  const thisWeekBookings = bookings.filter(b => 
    isThisWeek(new Date(b.booking_date)) && b.status !== 'cancelled'
  );
  
  const occupancyRate = workspaces.length > 0 
    ? Math.round((todaysBookings.length / workspaces.length) * 100)
    : 0;

  const stats = [
    {
      title: "Today's Bookings",
      value: todaysBookings.length,
      icon: Calendar,
      color: "from-blue-500 to-blue-600",
      trend: `${thisWeekBookings.length} this week`,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      title: "Available Spaces",
      value: workspaces.length - todaysBookings.length,
      icon: MapPin,
      color: "from-green-500 to-green-600",
      trend: `${workspaces.length} total spaces`,
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      title: "Occupancy Rate",
      value: `${occupancyRate}%`,
      icon: TrendingUp,
      color: "from-slate-500 to-slate-600",
      trend: "Current utilization",
      bgColor: "bg-slate-50",
      iconColor: "text-slate-600"
    },
    {
      title: "Your Bookings",
      value: userBookings.filter(b => new Date(b.booking_date) >= new Date()).length,
      icon: CheckCircle,
      color: "from-indigo-500 to-indigo-600",
      trend: `${userBookings.filter(b => b.status === 'checked_in').length} check-ins`,
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="card-hover border-0 shadow-lg bg-white/95 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.trend}</p>
                </div>
              </div>
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
