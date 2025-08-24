
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Clock, MapPin } from "lucide-react";
import { format, isToday } from "date-fns";

export default function TodaysBookings({ bookings, user, onCheckIn, workspaces, zones }) {
  const todaysUserBookings = bookings.filter(b => 
    b.user_email === user?.email && 
    isToday(new Date(b.booking_date)) &&
    b.status !== 'cancelled'
  );

  const getWorkspaceDisplayName = (workspaceId) => {
    if (!workspaces || !zones) return `Workspace ${workspaceId}`;
    
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (!workspace) return `Workspace ${workspaceId}`;
    
    const zone = zones.find(z => z.id === workspace.zone_id);
    const zoneName = zone?.name || 'Unknown Zone';
    
    return `${zoneName} - ${workspace.name}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'checked_in':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'no_show':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Calendar className="w-5 h-5 text-slate-600" />
          Today's Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        {todaysUserBookings.length > 0 ? (
          <div className="space-y-4">
            {todaysUserBookings.map((booking) => (
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
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {booking.start_time || '09:00'} - {booking.end_time || '17:00'}
                      </div>
                      <Badge variant="outline" className={getStatusColor(booking.status)}>
                        {booking.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    {booking.notes && (
                      <p className="text-sm text-slate-500">{booking.notes}</p>
                    )}
                  </div>
                  {booking.status === 'confirmed' && (
                    <Button
                      size="sm"
                      onClick={() => onCheckIn(booking.id)}
                      className="bg-green-600 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Check In
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No bookings for today</p>
            <p className="text-slate-400 text-sm mt-1">
              Ready to reserve a workspace?
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
