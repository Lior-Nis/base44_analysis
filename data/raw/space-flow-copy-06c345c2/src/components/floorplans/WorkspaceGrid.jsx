import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, Phone, Video, MapPin, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const workspaceIcons = {
  desk: Briefcase,
  meeting_room: Users,
  phone_booth: Phone,
  collaboration_space: Video
};

export default function WorkspaceGrid({ 
  workspaces, 
  zones, 
  selectedDate, 
  getWorkspaceAvailability 
}) {
  const getZoneName = (zoneId) => {
    const zone = zones.find(z => z.id === zoneId);
    return zone?.name || 'Unknown Zone';
  };

  const getWorkspaceTypeColor = (type) => {
    switch (type) {
      case 'desk':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'meeting_room':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'phone_booth':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'collaboration_space':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (workspaces.length === 0) {
    return (
      <Card className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No Workspaces Found</h3>
          <p className="text-slate-500">
            No workspaces match your current filters.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Briefcase className="w-5 h-5 text-slate-600" />
          Workspaces ({workspaces.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workspaces.map((workspace) => {
            const availability = getWorkspaceAvailability(workspace.id, selectedDate);
            const Icon = workspaceIcons[workspace.workspace_type] || Briefcase;
            const isAvailable = availability.status === 'available';

            return (
              <div
                key={workspace.id}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  isAvailable
                    ? 'bg-green-50 border-green-200 hover:bg-green-100'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-slate-600" />
                    <div>
                      <h3 className="font-semibold text-slate-700">{workspace.name}</h3>
                      <p className="text-sm text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {getZoneName(workspace.zone_id)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge variant="outline" className={getWorkspaceTypeColor(workspace.workspace_type)}>
                      {workspace.workspace_type.replace('_', ' ')}
                    </Badge>
                    <Badge 
                      variant="outline"
                      className={isAvailable 
                        ? 'bg-green-100 text-green-700 border-green-300'
                        : 'bg-red-100 text-red-700 border-red-300'
                      }
                    >
                      {availability.status}
                    </Badge>
                  </div>
                </div>

                {workspace.description && (
                  <p className="text-sm text-slate-600 mb-3">{workspace.description}</p>
                )}

                {availability.status === 'booked' && availability.user && (
                  <div className="mb-3 p-2 bg-red-100 rounded-lg">
                    <p className="text-sm text-red-700">
                      Booked by: {availability.user}
                    </p>
                  </div>
                )}

                {workspace.equipment && workspace.equipment.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-slate-700 mb-2">Equipment:</p>
                    <div className="flex flex-wrap gap-1">
                      {workspace.equipment.map((equipment, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-600">
                          {equipment.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {isAvailable && (
                  <Link to={createPageUrl("Bookings")}>
                    <Button 
                      size="sm" 
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                    >
                      Book Now
                    </Button>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}