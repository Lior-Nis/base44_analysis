
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Calendar, Users, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";

export default function ConflictsList({ conflicts, onSelectConflict, selectedConflict }) {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'dedicated_workspace':
        return <MapPin className="w-4 h-4" />;
      case 'overcapacity':
        return <Users className="w-4 h-4" />;
      case 'insufficient_capacity':
        return <AlertTriangle className="w-4 h-4" />;
      // Existing cases from original code, now adding new ones
      case 'location_mismatch':
        return <MapPin className="w-4 h-4" />;
      case 'dedicated_location_mismatch':
        return <MapPin className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'dedicated_workspace':
        return 'Dedicated Desk Conflict';
      case 'location_mismatch':
        return 'Location Mismatch';
      case 'dedicated_location_mismatch':
        return 'Dedicated Desk Location Mismatch';
      case 'overcapacity':
        return 'Zone Overcapacity';
      case 'insufficient_capacity':
        return 'Insufficient Capacity';
      default:
        return 'Unknown Conflict';
    }
  };

  return (
    <Card className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <AlertTriangle className="w-5 h-5 text-slate-600" />
          Conflicts ({conflicts.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {conflicts.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-green-300 mx-auto mb-3" />
            <p className="text-green-600 font-medium">No conflicts found</p>
            <p className="text-slate-400 text-sm mt-1">
              All workspace assignments are properly scheduled
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {conflicts.map((conflict) => (
              <div
                key={conflict.id}
                className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                  selectedConflict?.id === conflict.id
                    ? 'border-slate-400 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
                onClick={() => onSelectConflict(conflict)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(conflict.type)}
                    <span className="font-medium text-slate-700">
                      {getTypeLabel(conflict.type)}
                    </span>
                  </div>
                  <Badge variant="outline" className={getSeverityColor(conflict.severity)}>
                    {conflict.severity}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(conflict.date), 'EEEE, MMM d, yyyy')}
                  </div>

                  <p className="text-sm text-slate-600">{conflict.description}</p>

                  {conflict.type === 'dedicated_workspace' && (
                    <div className="text-sm text-slate-500">
                      Employee: {conflict.employee?.name} • Workspace: {conflict.workspace?.name}
                    </div>
                  )}

                  {(conflict.type === 'location_mismatch' || conflict.type === 'dedicated_location_mismatch') && (
                    <div className="text-sm text-slate-500">
                      Employee: {conflict.employee?.name} • Assigned: {conflict.assignedLocation?.name} • Actual: {conflict.bookingLocation?.name || conflict.workspaceLocation?.name}
                    </div>
                  )}

                  {conflict.type === 'overcapacity' && (
                    <div className="text-sm text-slate-500">
                      Zone: {conflict.zone?.name} • {conflict.bookings?.length} people / {Math.min(conflict.capacity, conflict.workspaceCount)} capacity
                    </div>
                  )}

                  {conflict.type === 'insufficient_capacity' && (
                    <div className="text-sm text-slate-500">
                      {conflict.unassignedEmployees?.length} unassigned employees • {conflict.availableDesks} desks available
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
