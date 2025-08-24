
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, X } from "lucide-react";
import { format, isFuture, isToday } from "date-fns";

export default function BookingsList({ bookings, workspaces, onCancel }) {
  const activeBookings = bookings
    .filter(b => 
      (isFuture(new Date(b.booking_date)) || isToday(new Date(b.booking_date))) &&
      b.status !== 'cancelled'
    )
    .sort((a, b) => new Date(a.booking_date) - new Date(b.booking_date));

  const getWorkspaceName = (workspaceId) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    return workspace?.name || `Workspace ${workspaceId}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'checked_in':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'no_show':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="w-5 h-5 text-slate-600" />
          Your Bookings
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeBookings.length > 0 ? (
          <div className="space-y-4">
            {activeBookings.map((booking) => (
              <div key={booking.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-500" />
                        <span className="font-medium text-slate-900">
                          {getWorkspaceName(booking.workspace_id)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span>{format(new Date(booking.booking_date), 'MMM d, yyyy')}</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {booking.start_time || '09:00'} - {booking.end_time || '17:00'}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className={getStatusColor(booking.status)}>
                      {booking.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  {booking.status === 'confirmed' && isFuture(new Date(booking.booking_date)) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onCancel(booking.id)}
                      className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel Booking
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No active bookings</p>
            <p className="text-slate-400 text-sm mt-1">
              Book a workspace to get started
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
