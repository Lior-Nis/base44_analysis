
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock } from "lucide-react";
import { format, isFuture, isToday, isTomorrow } from "date-fns";

export default function UpcomingBookings({ bookings, user, workspaces, zones }) {
  const upcomingBookings = bookings
    .filter(b => 
      b.user_email === user?.email && 
      (isFuture(new Date(b.booking_date)) || isToday(new Date(b.booking_date))) &&
      b.status !== 'cancelled'
    )
    .sort((a, b) => new Date(a.booking_date) - new Date(b.booking_date))
    .slice(0, 5);

  const getDateLabel = (date) => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const getWorkspaceDisplayName = (workspaceId) => {
    if (!workspaces || !zones) return `Workspace ${workspaceId}`;
    
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (!workspace) return `Workspace ${workspaceId}`;
    
    const zone = zones.find(z => z.id === workspace.zone_id);
    const zoneName = zone?.name || 'Unknown Zone';
    
    return `${zoneName} - ${workspace.name}`;
  };

  return (
    <Card className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Calendar className="w-5 h-5 text-slate-600" />
          Upcoming Bookings
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingBookings.length > 0 ? (
          <div className="space-y-3">
            {upcomingBookings.map((booking) => {
              const bookingDate = new Date(booking.booking_date);
              
              return (
                <div key={booking.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        <span className="font-medium text-slate-900">
                          {getWorkspaceDisplayName(booking.workspace_id)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="font-medium">
                          {getDateLabel(bookingDate)}
                        </span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {booking.start_time || '09:00'} - {booking.end_time || '17:00'}
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No upcoming bookings</p>
            <p className="text-slate-400 text-sm mt-1">
              Plan your week by booking workspaces
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
