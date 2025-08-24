
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  Users, 
  Phone, 
  Video,
  Monitor,
  Wifi,
  Coffee,
  MapPin,
  Calendar
} from "lucide-react";

const workspaceIcons = {
  desk: Briefcase,
  meeting_room: Users,
  phone_booth: Phone,
  collaboration_space: Video
};

const equipmentIcons = {
  monitor: Monitor,
  webcam: Video,
  wifi: Wifi,
  coffee: Coffee
};

export default function WorkspaceGrid({ 
  workspaces, 
  zones, 
  floors, 
  locations,
  selectedDate,
  onBookNow,
  currentUserAssignment // Changed from userBookings and currentUser
}) {
  const getWorkspaceLocation = (workspace) => {
    const zone = zones.find(z => z.id === workspace.zone_id);
    const floor = zone ? floors.find(f => f.id === zone.floor_id) : null;
    const location = floor ? locations.find(l => l.id === floor.location_id) : null;
    
    return {
      zone: zone?.name || 'Unknown Zone',
      floor: floor?.name || 'Unknown Floor',
      location: location?.name || 'Unknown Location'
    };
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

  // This check is now simplified based on currentUserAssignment
  const userAlreadyAssigned = !!currentUserAssignment;

  // Only show available workspaces (already filtered by parent component)
  if (workspaces.length === 0) {
    return (
      <Card className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No Available Workspaces</h3>
          <p className="text-slate-500">
            All workspaces are booked for the selected date. Try choosing a different date or adjusting your filters.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">
          Available Workspaces ({workspaces.length})
        </h2>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          {new Date(selectedDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
          })}
        </Badge>
      </div>

      {userAlreadyAssigned && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            <p className="text-orange-800 font-medium">
              You are already scheduled for this date
            </p>
          </div>
          <p className="text-orange-700 text-sm mt-1">
            Your status is "{currentUserAssignment.status}". You cannot book another workspace.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workspaces.map((workspace) => {
          const location = getWorkspaceLocation(workspace);
          const Icon = workspaceIcons[workspace.workspace_type] || Briefcase;

          return (
            <Card key={workspace.id} className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Icon className="w-5 h-5 text-slate-600" />
                      {workspace.name}
                    </CardTitle>
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <MapPin className="w-4 h-4" />
                      {location.location} • {location.floor} • {location.zone}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge variant="outline" className={getWorkspaceTypeColor(workspace.workspace_type)}>
                      {workspace.workspace_type.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                      Available
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {workspace.description && (
                  <p className="text-sm text-slate-600">{workspace.description}</p>
                )}
                
                {workspace.equipment && workspace.equipment.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">Equipment:</p>
                    <div className="flex flex-wrap gap-2">
                      {workspace.equipment.map((item, index) => {
                        const EquipIcon = equipmentIcons[item.toLowerCase()] || Monitor;
                        return (
                          <div key={index} className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-lg">
                            <EquipIcon className="w-3 h-3 text-slate-500" />
                            <span className="text-xs text-slate-600">{item}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <Button 
                  onClick={() => onBookNow(workspace)}
                  disabled={userAlreadyAssigned}
                  className={`w-full ${userAlreadyAssigned 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-slate-900 hover:bg-slate-800'
                  } text-white`}
                >
                  {userAlreadyAssigned ? `Already assigned (${currentUserAssignment.status})` : 'Book Now'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
