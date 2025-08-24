
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ExternalLink } from "lucide-react";

export default function FloorsTable({ floors, locations, zones, workspaces, onEdit, onDelete }) {
  const getLocationName = (locationId) => {
    const location = locations.find(l => l.id === locationId);
    return location?.name || 'N/A';
  };

  const getZoneCount = (floorId) => {
    return zones.filter(z => z.floor_id === floorId).length;
  };

  const getWorkspaceCount = (floorId) => {
    const floorZones = zones.filter(z => z.floor_id === floorId);
    return workspaces.filter(w => floorZones.some(z => z.id === w.zone_id)).length;
  };

  return (
    <Card className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Floor Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Zones</TableHead>
                <TableHead>Workspaces</TableHead>
                <TableHead>Floor Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {floors.map((floor) => {
                const locationName = getLocationName(floor.location_id);
                const zoneCount = getZoneCount(floor.id);
                const workspaceCount = getWorkspaceCount(floor.id);
                
                return (
                  <TableRow key={floor.id}>
                    <TableCell className="font-medium">{floor.name}</TableCell>
                    <TableCell>{locationName}</TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm text-slate-600 truncate">
                          {floor.description || 'No description'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{zoneCount}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{workspaceCount}</span>
                    </TableCell>
                    <TableCell>
                      {floor.floor_plan_url ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(floor.floor_plan_url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      ) : (
                        <span className="text-slate-400 text-sm">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={floor.active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}
                      >
                        {floor.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => onEdit(floor)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onDelete(floor)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
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
