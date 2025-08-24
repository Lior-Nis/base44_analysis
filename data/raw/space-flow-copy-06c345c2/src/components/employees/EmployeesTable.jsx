
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, LogIn, Eye, Briefcase, MapPin, Building2, CalendarDays, UserX } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Checkbox } from "@/components/ui/checkbox";

export default function EmployeesTable({ employees, workspaces, zones, floors, locations, onEdit, selectedEmployees, onSelectionChange, onUserManagement }) {
  const getWorkspaceName = (workspaceId) => {
    if (!workspaceId) return <span className="text-slate-400">None</span>;
    const workspace = workspaces.find((w) => w.id === workspaceId);
    if (!workspace) return 'Unknown Workspace';

    const zone = zones.find((z) => z.id === workspace.zone_id);
    const zoneName = zone?.name || 'Unknown Zone';

    return `${zoneName} - ${workspace.name}`;
  };

  const getZoneName = (zoneId) => {
    if (!zoneId) return <span className="text-slate-400">Any</span>;
    const zone = zones.find((z) => z.id === zoneId);
    if (!zone) return 'Unknown Zone';

    const floor = floors.find((f) => f.id === zone.floor_id);
    const location = floor ? locations.find((l) => l.id === floor.location_id) : null;

    const floorName = floor?.name || '';
    const locationName = location?.name || '';

    return (
      <div>
            <div>{zone.name}</div>
            <div className="text-xs text-slate-500">{locationName} - {floorName}</div>
        </div>);

  };

  const getLocationName = (locationId) => {
    if (!locationId) return <span className="text-slate-400">Not Assigned</span>;
    const location = locations.find((l) => l.id === locationId);
    return location?.name || 'Unknown Location';
  };

  const formatWorkDays = (days) => {
    if (!days || days.length === 0) return <span className="text-slate-400">Not Set</span>;
    const dayMap = {
      monday: 'M',
      tuesday: 'T',
      wednesday: 'W',
      thursday: 'Th',
      friday: 'F',
      saturday: 'Sa',
      sunday: 'Su'
    };
    return (
      <div className="flex gap-1">
        {['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].map((day) =>
        <span
          key={day}
          className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
          days.includes(day) ?
          'bg-slate-800 text-white' :
          'bg-slate-200 text-slate-500'}`
          }
          title={day.charAt(0).toUpperCase() + day.slice(1)}>

            {dayMap[day]}
          </span>
        )}
      </div>);

  };

  const handleSelectAll = (checked) => {
    // Only select employees that actually exist in the current list
    const currentEmployeeIds = employees.map((e) => e.id);
    onSelectionChange(checked ? currentEmployeeIds : []);
  };

  const handleSelectOne = (employeeId, checked) => {
    // Ensure we're only working with current employee IDs
    const currentEmployeeIds = employees.map((e) => e.id);

    if (checked) {
      // Only add if the employee exists in current list
      if (currentEmployeeIds.includes(employeeId)) {
        onSelectionChange([...selectedEmployees, employeeId]);
      }
    } else {
      onSelectionChange(selectedEmployees.filter((id) => id !== employeeId));
    }
  };

  // Filter selected employees to only include those that exist in current list
  const validSelectedEmployees = selectedEmployees.filter((id) =>
  employees.some((emp) => emp.id === id)
  );

  // Update parent if there's a mismatch
  React.useEffect(() => {
    if (validSelectedEmployees.length !== selectedEmployees.length) {
      onSelectionChange(validSelectedEmployees);
    }
  }, [employees, selectedEmployees, validSelectedEmployees.length, onSelectionChange]);

  const isAllSelected = employees.length > 0 && validSelectedEmployees.length === employees.length;

  return (
    <Card className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all" />

                  </TableHead>
                  <TableHead className="text-slate-950 px-4 font-medium h-12 align-middle [&:has([role=checkbox])]:pr-0">Employee</TableHead>
                  <TableHead className="text-slate-950 px-4 font-medium h-12 align-middle [&:has([role=checkbox])]:pr-0">Department</TableHead>
                  <TableHead>Assigned Location</TableHead>
                  <TableHead>Office Days</TableHead>
                  <TableHead>Dedicated Desk</TableHead>
                  <TableHead>Preferred Zone</TableHead>
                  <TableHead className="text-slate-950 px-4 font-medium h-12 align-middle [&:has([role=checkbox])]:pr-0">Status</TableHead>
                  <TableHead className="text-slate-950 px-4 font-medium h-12 align-middle [&:has([role=checkbox])]:pr-0">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) =>
                <TableRow key={employee.id} data-state={validSelectedEmployees.includes(employee.id) && "selected"}>
                    <TableCell>
                      <Checkbox
                      checked={validSelectedEmployees.includes(employee.id)}
                      onCheckedChange={(checked) => handleSelectOne(employee.id, checked)}
                      aria-label={`Select ${employee.name}`} />

                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{employee.name}</div>
                      <div className="text-sm text-slate-500">{employee.email}</div>
                    </TableCell>
                    <TableCell>{employee.department || 'N/A'}</TableCell>
                    <TableCell>{getLocationName(employee.assigned_location_id)}</TableCell>
                    <TableCell>{formatWorkDays(employee.work_days)}</TableCell>
                    <TableCell>{getWorkspaceName(employee.dedicated_workspace_id)}</TableCell>
                    <TableCell>{getZoneName(employee.preferred_zone_id)}</TableCell>
                    <TableCell>
                      <Badge
                      variant="outline"
                      className={employee.active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}>

                        {employee.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Link to={createPageUrl(`Profile?viewId=${employee.id}`)}>
                          <Button variant="ghost" size="icon" title="View Profile">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                        variant="ghost"
                        size="icon"
                        title="View as Employee"
                        onClick={() => {
                          sessionStorage.setItem('impersonatedEmployeeId', employee.id);
                          window.location.href = createPageUrl('Dashboard');
                        }}>

                          <LogIn className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onEdit(employee)} title="Edit">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onUserManagement?.(employee)}
                        title="User Management"
                        className="text-red-500 hover:text-red-600">

                          <UserX className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-4 px-2">
              <Checkbox
              id="select-all-mobile"
              checked={isAllSelected}
              onCheckedChange={handleSelectAll}
              aria-label="Select all" />

              <label htmlFor="select-all-mobile" className="text-sm font-medium text-slate-600">
                Select All ({validSelectedEmployees.length} selected)
              </label>
          </div>
          {employees.map((employee) =>
          <Card key={employee.id} className={`p-4 ${validSelectedEmployees.includes(employee.id) ? 'bg-slate-50 border-slate-300' : 'border-slate-200'}`}>
              <div className="flex gap-4">
                <Checkbox
                className="mt-1"
                checked={validSelectedEmployees.includes(employee.id)}
                onCheckedChange={(checked) => handleSelectOne(employee.id, checked)}
                aria-label={`Select ${employee.name}`} />

                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-slate-800">{employee.name}</p>
                      <p className="text-sm text-slate-500">{employee.email}</p>
                    </div>
                    <Badge
                    variant="outline"
                    className={`text-xs ${employee.active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>

                        {employee.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    {employee.department && <p className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-slate-400" /> {employee.department}</p>}
                    <p className="flex items-center gap-2"><Building2 className="w-4 h-4 text-slate-400" /> {getLocationName(employee.assigned_location_id)}</p>
                    <p className="flex items-start gap-2"><CalendarDays className="w-4 h-4 text-slate-400 mt-1" /> {formatWorkDays(employee.work_days)}</p>
                    <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> Preferred: {getZoneName(employee.preferred_zone_id)}</p>
                  </div>

                  <div className="flex items-center justify-end gap-1 border-t pt-3 mt-3">
                      <Link to={createPageUrl(`Profile?viewId=${employee.id}`)}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" /> View
                        </Button>
                      </Link>
                      <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      sessionStorage.setItem('impersonatedEmployeeId', employee.id);
                      window.location.href = createPageUrl('Dashboard');
                    }}>

                          <LogIn className="w-4 h-4 mr-2 text-blue-500" /> View As
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => onEdit(employee)}>
                        <Edit className="w-4 h-4 mr-2" /> Edit
                      </Button>
                      <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUserManagement?.(employee)}
                    className="text-red-600 border-red-200 hover:bg-red-50">

                        <UserX className="w-4 h-4 mr-2" /> Manage
                      </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </CardContent>
      </div>
    </Card>);

}