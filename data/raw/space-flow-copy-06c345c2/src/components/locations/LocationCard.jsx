
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  MapPin,
  Plus,
  Edit,
  ChevronDown,
  ChevronRight,
  Users,
  Briefcase } from
"lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function LocationCard({
  location,
  floors,
  zones,
  workspaces,
  onEdit,
  onAddFloor,
  onAddZone,
  onAddWorkspace
}) {
  const [isOpen, setIsOpen] = useState(false);

  const getZonesByFloor = (floorId) => {
    return zones.filter((z) => z.floor_id === floorId);
  };

  const getWorkspacesByZone = (zoneId) => {
    return workspaces.filter((w) => w.zone_id === zoneId);
  };

  const getTotalWorkspaces = () => {
    return floors.reduce((total, floor) => {
      const floorZones = getZonesByFloor(floor.id);
      return total + floorZones.reduce((zoneTotal, zone) => {
        return zoneTotal + getWorkspacesByZone(zone.id).length;
      }, 0);
    }, 0);
  };

  const getZoneTypeColor = (type) => {
    switch (type) {
      case 'open_desk':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'private_office':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'meeting_room':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'collaboration_space':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'phone_booth':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="w-5 h-5 text-slate-600" />
              {location.name}
              {location.is_default &&
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 ml-2">
                  Default
                </Badge>
              }
            </CardTitle>
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <MapPin className="w-4 h-4" />
              {location.address}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit('location', location)}>

            <Edit className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {location.description &&
        <p className="text-sm text-slate-600">{location.description}</p>
        }

        <div className="flex justify-between items-center text-sm">
          <div className="flex gap-4">
            <span className="text-slate-600">
              <strong>{floors.length}</strong> floors
            </span>
            <span className="text-slate-600">
              <strong>{getTotalWorkspaces()}</strong> workspaces
            </span>
          </div>
          <div className="flex gap-2">
            {location.is_default &&
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                Default
              </Badge>
            }
            <Badge
              variant="outline"
              className={location.active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}>

              {location.active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
        </div>

        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-white/80 backdrop-blur-sm border-slate-200">
              <span>View Structure</span>
              {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-3">
            {floors.map((floor) => {
              const floorZones = getZonesByFloor(floor.id);

              return (
                <div key={floor.id} className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-700">{floor.name}</span>
                      <span className="text-xs text-slate-500">({floorZones.length} zones)</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit('floor', floor)}>

                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onAddZone(floor.id)}>

                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {floorZones.map((zone) => {
                    const zoneWorkspaces = getWorkspacesByZone(zone.id);

                    return (
                      <div key={zone.id} className="ml-4 p-2 bg-white rounded border border-slate-200 mb-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{zone.name}</span>
                            <Badge variant="outline" className={getZoneTypeColor(zone.zone_type)}>
                              {zone.zone_type.replace('_', ' ')}
                            </Badge>
                            <span className="text-xs text-slate-500">
                              {zoneWorkspaces.length}/{zone.capacity}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onEdit('zone', zone)}>

                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onAddWorkspace(zone.id)}>

                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {zoneWorkspaces.length > 0 &&
                        <div className="mt-2 flex flex-wrap gap-1">
                            {zoneWorkspaces.map((workspace) =>
                          <button
                            key={workspace.id}
                            onClick={() => onEdit('workspace', workspace)}
                            className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded border text-slate-600">

                                {workspace.name}
                              </button>
                          )}
                          </div>
                        }
                      </div>);

                  })}
                </div>);

            })}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddFloor(location.id)} className="flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-white/80 backdrop-blur-sm border-slate-200">


              <Plus className="w-4 h-4 mr-2" />
              Add Floor
            </Button>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>);

}