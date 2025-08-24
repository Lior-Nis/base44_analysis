
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

export default function WorkspacesTable({ workspaces, zones, floors, locations, onEdit, onDelete }) {

  const getZoneName = (zoneId) => {
    const zone = zones.find(z => z.id === zoneId);
    return zone?.name || 'N/A';
  };

  const getWorkspaceTypeColor = (type) => {
    switch (type) {
      case 'desk': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'meeting_room': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'phone_booth': return 'bg-green-100 text-green-800 border-green-200';
      case 'collaboration_space': return 'bg-orange-100 text-orange-800 border-orange-200';
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
                <TableHead>Workspace Name</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Equipment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workspaces.map((workspace) => (
                <TableRow key={workspace.id}>
                  <TableCell className="font-medium">{workspace.name}</TableCell>
                  <TableCell>{getZoneName(workspace.zone_id)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getWorkspaceTypeColor(workspace.workspace_type)}>
                      {workspace.workspace_type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {workspace.equipment?.join(', ') || 'None'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={workspace.active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}
                    >
                      {workspace.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(workspace)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(workspace)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
