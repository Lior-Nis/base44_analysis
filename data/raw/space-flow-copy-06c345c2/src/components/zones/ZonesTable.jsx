
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ArrowRight, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ZonesTable({ zones, floors, locations, workspaces, onEdit, onDelete }) {
  const getFloorAndLocation = (floorId) => {
    const floor = floors.find(f => f.id === floorId);
    if (!floor) return { floorName: 'N/A', locationName: 'N/A' };
    const location = locations.find(l => l.id === floor.location_id);
    return {
      floorName: floor.name,
      locationName: location?.name || 'N/A'
    };
  };

  const getWorkspaceCount = (zoneId) => {
    return workspaces.filter(w => w.zone_id === zoneId).length;
  };

  const getZoneTypeColor = (type) => {
    switch (type) {
      case 'open_desk': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'private_office': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'meeting_room': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'collaboration_space': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'phone_booth': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zone Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-center">Capacity</TableHead>
                <TableHead className="text-center">Workspaces</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zones.map((zone) => {
                const { floorName, locationName } = getFloorAndLocation(zone.floor_id);
                const workspaceCount = getWorkspaceCount(zone.id);

                return (
                  <TableRow key={zone.id}>
                    <TableCell className="font-medium">{zone.name}</TableCell>
                    <TableCell>
                      <div>{locationName}</div>
                      <div className="text-xs text-slate-500">{floorName}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getZoneTypeColor(zone.zone_type)}>
                        {zone.zone_type.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{zone.capacity}</TableCell>
                    <TableCell className="text-center">
                      <Link to={createPageUrl(`Workspaces?zoneId=${zone.id}`)}>
                        <Badge variant="secondary" className="cursor-pointer hover:bg-slate-200">
                          <Briefcase className="w-3 h-3 mr-1" />
                          {workspaceCount}
                        </Badge>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={zone.active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}
                      >
                        {zone.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(zone)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(zone)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                        <Link to={createPageUrl(`Workspaces?zoneId=${zone.id}`)}>
                          <Button variant="ghost" size="icon">
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
