import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, User, Clock, X } from "lucide-react";
import { format, isToday } from "date-fns";

export default function AdminBookingsList({ bookings, workspaces, selectedDate, onCancel }) {
  const activeBookings = bookings
    .filter(b => 
      b.booking_date === selectedDate &&
      b.status !== 'cancelled'
    )
    .sort((a, b) => {
        const workspaceA = workspaces.find(w => w.id === a.workspace_id)?.name || '';
        const workspaceB = workspaces.find(w => w.id === b.workspace_id)?.name || '';
        return workspaceA.localeCompare(workspaceB);
    });

  const getWorkspaceName = (workspaceId) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    return workspace?.name || `Workspace ${workspaceId}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'checked_in':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Briefcase className="w-5 h-5 text-slate-600" />
          All Bookings for {format(new Date(selectedDate), 'MMM d')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeBookings.length > 0 ? (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {activeBookings.map((booking) => (
              <div key={booking.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="font-medium text-slate-900">
                        {getWorkspaceName(booking.workspace_id)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <User className="w-4 h-4" />
                        {booking.user_email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4" />
                        {booking.start_time || '09:00'} - {booking.end_time || '17:00'}
                      </div>
                    </div>
                    <Badge variant="outline" className={getStatusColor(booking.status)}>
                      {booking.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onCancel(booking.id)}
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel Booking
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No bookings for this date</p>
            <p className="text-slate-400 text-sm mt-1">
              The office is all clear.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}