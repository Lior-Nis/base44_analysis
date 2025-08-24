
import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { User, Briefcase, MapPin, Building, ChevronDown, ChevronUp } from "lucide-react";

export default function DailyRosterTable({ seatingPlan, zones, floors, locations }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'employee.name', direction: 'ascending' });

  const getWorkspaceLocation = (workspace) => {
    if (!workspace) return { zone: 'N/A', floor: 'N/A', location: 'N/A', workspaceDisplay: 'N/A' };

    const zone = zones.find((z) => z.id === workspace.zone_id);
    if (!zone) return { zone: 'N/A', floor: 'N/A', location: 'N/A', workspaceDisplay: workspace.name };

    const floor = floors.find((f) => f.id === zone.floor_id);
    if (!floor) return { zone: zone.name, floor: 'N/A', location: 'N/A', workspaceDisplay: `${zone.name} - ${workspace.name}` };

    const location = locations.find((l) => l.id === floor.location_id);
    return {
      zone: zone.name,
      floor: floor.name,
      location: location?.name || 'N/A',
      workspaceDisplay: `${zone.name} - ${workspace.name}`
    };
  };

  const statusMap = {
    dedicated: { text: "Dedicated Desk", color: "bg-blue-100 text-blue-800 border-blue-200" },
    assigned: { text: "Auto-Assigned", color: "bg-green-100 text-green-800 border-green-200" },
    booked: { text: "Manual Booking", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
    unassigned: { text: "Unassigned", color: "bg-slate-100 text-slate-800 border-slate-200" }, // Changed from yellow
    conflict: { text: "Conflict", color: "bg-red-100 text-red-800 border-red-200" }
  };

  const sortedAndFilteredPlan = useMemo(() => {
    let filtered = seatingPlan.filter((item) =>
      item.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.workspace && item.workspace.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    filtered.sort((a, b) => {
      let aValue, bValue;

      if (sortConfig.key === 'employee.name') {
        aValue = a.employee.name;
        bValue = b.employee.name;
      } else if (sortConfig.key === 'status') {
        // Custom sorting for status, perhaps by a defined order or alphabetically
        aValue = a.status;
        bValue = b.status;
      } else {
        // Default to no specific sort order if key is not recognized
        return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [seatingPlan, searchTerm, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardContent className="p-0">
        <div className="p-4 flex items-center gap-4 border-b border-slate-100">
          <div className="relative flex-1">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Filter by employee or workspace..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-md border border-slate-300 bg-white pl-10 pr-4 text-base placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button onClick={() => requestSort('employee.name')} className="flex items-center gap-1">
                    Employee
                    {sortConfig.key === 'employee.name' && (sortConfig.direction === 'ascending' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
                  </button>
                </TableHead>
                <TableHead>
                  <button onClick={() => requestSort('status')} className="flex items-center gap-1">
                    Status
                    {sortConfig.key === 'status' && (sortConfig.direction === 'ascending' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />)}
                  </button>
                </TableHead>
                <TableHead>Assigned Workspace</TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAndFilteredPlan.length > 0 ?
                sortedAndFilteredPlan.map(({ employee, workspace, status, conflictReason }) => {
                  const locationInfo = workspace ? getWorkspaceLocation(workspace) : null;
                  const statusInfo = statusMap[status] || { text: status, color: "bg-gray-100 text-gray-800" };

                  return (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="font-medium text-slate-900">{employee.name}</div>
                        <div className="text-sm text-slate-500">{employee.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${statusInfo.color} flex gap-2 items-center w-fit`}>
                          {statusInfo.text}
                        </Badge>
                        {status === 'conflict' &&
                          <p className="text-xs text-red-600 mt-1 max-w-xs">{conflictReason}</p>
                        }
                      </TableCell>
                      <TableCell>
                        {workspace ? (
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-slate-400" />
                            <span>{locationInfo.workspaceDisplay}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {locationInfo ?
                          <>
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 text-slate-400" />
                              <span>{locationInfo.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500 pl-6">
                              <MapPin className="w-3 h-3" />
                              <span>{locationInfo.floor} / {locationInfo.zone}</span>
                            </div>
                          </> :
                          <span className="text-slate-400">—</span>
                        }
                      </TableCell>
                    </TableRow>
                  );
                }) :
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                    No employees found for this day or matching your filters.
                  </TableCell>
                </TableRow>
              }
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
