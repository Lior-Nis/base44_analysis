
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertTriangle,
  Calendar,
  Users,
  MapPin,
  CheckCircle,
  XCircle,
  RefreshCw,
  Filter } from
"lucide-react";
import { format, addDays, startOfWeek, endOfWeek, parseISO, isWithinInterval } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

import { Employee } from "@/api/entities";
import { Workspace } from "@/api/entities";
import { Booking } from "@/api/entities";
import { Zone } from "@/api/entities";
import { Floor } from "@/api/entities";
import { Location } from "@/api/entities";
import { OutOfOffice } from "@/api/entities";
import { User } from "@/api/entities";
import { useCurrentUser } from "@/components/useCurrentUser";

import ConflictsList from "../components/conflicts/ConflictsList";
import ConflictResolution from "../components/conflicts/ConflictResolution";
import ConflictStats from "../components/conflicts/ConflictStats";

export default function ConflictsPage() {
  const [employees, setEmployees] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [zones, setZones] = useState([]);
  const [floors, setFloors] = useState([]);
  const [locations, setLocations] = useState([]);
  const [outOfOffice, setOutOfOffice] = useState([]);
  const { user: realUser, loading: userLoading } = useCurrentUser(); // Renamed user to realUser to avoid conflict
  const [dataLoading, setDataLoading] = useState(true);
  const [resolving, setResolving] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateRange, setDateRange] = useState('today'); // 'today', 'week', 'custom'
  const [conflictFilter, setConflictFilter] = useState('all'); // 'all', 'dedicated', 'overcapacity'
  const [selectedConflict, setSelectedConflict] = useState(null);

  const { toast } = useToast();

  useEffect(() => {
    if (!userLoading) {
      loadData();
    }
  }, [userLoading]);

  const loadData = async () => {
    setDataLoading(true);
    try {
      const allEmployees = await Employee.list();
      await new Promise((res) => setTimeout(res, 250)); // Delay added
      const allWorkspaces = await Workspace.list();
      await new Promise((res) => setTimeout(res, 250)); // Delay added
      const allBookings = await Booking.list();
      await new Promise((res) => setTimeout(res, 250)); // Delay added
      const allZones = await Zone.list();
      await new Promise((res) => setTimeout(res, 250)); // Delay added
      const allFloors = await Floor.list();
      await new Promise((res) => setTimeout(res, 250)); // Delay added
      const allLocations = await Location.list();
      await new Promise((res) => setTimeout(res, 250)); // Delay added
      const allOutOfOffice = await OutOfOffice.list();

      setEmployees(allEmployees);
      setWorkspaces(allWorkspaces);
      setBookings(allBookings);
      setZones(allZones);
      setFloors(allFloors);
      setLocations(allLocations);
      setOutOfOffice(allOutOfOffice);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load conflicts data.",
        variant: "destructive"
      });
    }
    setDataLoading(false);
  };

  const getDateRange = () => {
    const baseDate = new Date(selectedDate);
    switch (dateRange) {
      case 'today':
        return [baseDate, baseDate];
      case 'week':
        return [startOfWeek(baseDate), endOfWeek(baseDate)];
      default:
        return [baseDate, baseDate];
    }
  };

  const conflicts = useMemo(() => {
    if (dataLoading) return [];

    const [startDate, endDate] = getDateRange();
    const conflictsList = [];

    // Generate date range
    const dates = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    dates.forEach((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const dayOfWeek = format(date, "eeee").toLowerCase();

      // Get employees scheduled for this day, excluding those out of office
      const employeesForDay = employees.filter(
        (e) => {
          if (!e.active || !e.work_days?.includes(dayOfWeek)) return false;

          const checkDate = parseISO(dateStr);
          const isOutOfOffice = outOfOffice.some((ooo) => {
            if (ooo.employee_email !== e.email || ooo.status !== 'approved') return false;
            const start = parseISO(ooo.start_date);
            const end = parseISO(ooo.end_date);
            return isWithinInterval(checkDate, { start, end });
          });

          return !isOutOfOffice;
        }
      );

      // Get bookings for this day
      const bookingsForDay = bookings.filter(
        (b) => b.booking_date === dateStr && b.status !== "cancelled"
      );

      // Check for location assignment conflicts
      employeesForDay.forEach((employee) => {
        if (employee.assigned_location_id) {
          // Check if employee has bookings at wrong location
          const employeeBookings = bookingsForDay.filter((b) => b.user_email === employee.email);

          employeeBookings.forEach((booking) => {
            const workspace = workspaces.find((w) => w.id === booking.workspace_id);
            if (workspace) {
              const zone = zones.find((z) => z.id === workspace.zone_id);
              if (zone) {
                const floor = floors.find((f) => f.id === zone.floor_id);
                if (floor && floor.location_id !== employee.assigned_location_id) {
                  const assignedLocation = locations.find((l) => l.id === employee.assigned_location_id);
                  const bookingLocation = locations.find((l) => l.id === floor.location_id);

                  conflictsList.push({
                    id: `${dateStr}-${employee.id}-location`,
                    type: 'location_mismatch',
                    date: dateStr,
                    employee,
                    booking,
                    workspace,
                    assignedLocation,
                    bookingLocation,
                    severity: 'medium',
                    description: `${employee.name} is assigned to ${assignedLocation?.name} but booked at ${bookingLocation?.name}`
                  });
                }
              }
            }
          });

          // Check if dedicated workspace is at wrong location
          if (employee.dedicated_workspace_id) {
            const dedicatedWorkspace = workspaces.find((w) => w.id === employee.dedicated_workspace_id);
            if (dedicatedWorkspace) {
              const zone = zones.find((z) => z.id === dedicatedWorkspace.zone_id);
              if (zone) {
                const floor = floors.find((f) => f.id === zone.floor_id);
                if (floor && floor.location_id !== employee.assigned_location_id) {
                  const assignedLocation = locations.find((l) => l.id === employee.assigned_location_id);
                  const workspaceLocation = locations.find((l) => l.id === floor.location_id);

                  conflictsList.push({
                    id: `${dateStr}-${employee.id}-dedicated-location`,
                    type: 'dedicated_location_mismatch',
                    date: dateStr,
                    employee,
                    workspace: dedicatedWorkspace,
                    assignedLocation,
                    workspaceLocation,
                    severity: 'high',
                    description: `${employee.name}'s dedicated desk is at ${workspaceLocation?.name} but they're assigned to ${assignedLocation?.name}`
                  });
                }
              }
            }
          }
        }
      });

      // Check for dedicated workspace conflicts
      employeesForDay.forEach((employee) => {
        if (employee.dedicated_workspace_id) {
          const conflictingBooking = bookingsForDay.find(
            (b) => b.workspace_id === employee.dedicated_workspace_id && b.user_email !== employee.email
          );

          if (conflictingBooking) {
            conflictsList.push({
              id: `${dateStr}-${employee.id}-dedicated`,
              type: 'dedicated_workspace',
              date: dateStr,
              employee,
              workspace: workspaces.find((w) => w.id === employee.dedicated_workspace_id),
              conflictingBooking,
              severity: 'high',
              description: `${employee.name}'s dedicated workspace is booked by ${conflictingBooking.user_email}`
            });
          }
        }
      });

      // Check for overcapacity by zone
      const zoneOccupancy = {};
      bookingsForDay.forEach((booking) => {
        const workspace = workspaces.find((w) => w.id === booking.workspace_id);
        if (workspace) {
          const zone = zones.find((z) => z.id === workspace.zone_id);
          if (zone) {
            if (!zoneOccupancy[zone.id]) {
              zoneOccupancy[zone.id] = {
                zone,
                bookings: [],
                capacity: zone.capacity,
                workspaceCount: workspaces.filter((w) => w.zone_id === zone.id).length
              };
            }
            zoneOccupancy[zone.id].bookings.push(booking);
          }
        }
      });

      // Add roster assignments to occupancy
      const assignedWorkspaces = new Set(bookingsForDay.map((b) => b.workspace_id));
      employeesForDay.forEach((employee) => {
        if (employee.dedicated_workspace_id && !assignedWorkspaces.has(employee.dedicated_workspace_id)) {
          const workspace = workspaces.find((w) => w.id === employee.dedicated_workspace_id);
          if (workspace) {
            const zone = zones.find((z) => z.id === workspace.zone_id);
            if (zone) {
              if (!zoneOccupancy[zone.id]) {
                zoneOccupancy[zone.id] = {
                  zone,
                  bookings: [],
                  capacity: zone.capacity,
                  workspaceCount: workspaces.filter((w) => w.zone_id === zone.id).length
                };
              }
              zoneOccupancy[zone.id].bookings.push({
                type: 'roster',
                employee,
                workspace_id: workspace.id
              });
            }
          }
        }
      });

      // Check for overcapacity conflicts
      Object.values(zoneOccupancy).forEach(({ zone, bookings, capacity, workspaceCount }) => {
        if (bookings.length > Math.min(capacity, workspaceCount)) {
          conflictsList.push({
            id: `${dateStr}-${zone.id}-overcapacity`,
            type: 'overcapacity',
            date: dateStr,
            zone,
            bookings,
            capacity,
            workspaceCount,
            severity: 'medium',
            description: `${zone.name} is over capacity: ${bookings.length} people for ${Math.min(capacity, workspaceCount)} spaces`
          });
        }
      });

      // Check for unassigned employees
      const totalAssigned = new Set([
      ...bookingsForDay.map((b) => b.user_email),
      ...employeesForDay.filter((e) => e.dedicated_workspace_id && !bookingsForDay.some((b) => b.workspace_id === e.dedicated_workspace_id)).map((e) => e.email)]
      );

      const unassignedEmployees = employeesForDay.filter((e) => !totalAssigned.has(e.email));
      const availableDesks = workspaces.filter((w) =>
      w.workspace_type === 'desk' &&
      !bookingsForDay.some((b) => b.workspace_id === w.id) &&
      !employeesForDay.some((e) => e.dedicated_workspace_id === w.id)
      );

      if (unassignedEmployees.length > 0 && availableDesks.length < unassignedEmployees.length) {
        conflictsList.push({
          id: `${dateStr}-unassigned`,
          type: 'insufficient_capacity',
          date: dateStr,
          unassignedEmployees,
          availableDesks: availableDesks.length,
          needed: unassignedEmployees.length,
          severity: 'high',
          description: `${unassignedEmployees.length} employees cannot be seated (${availableDesks.length} desks available)`
        });
      }
    });

    // Filter conflicts
    let filteredConflicts = conflictsList;
    if (conflictFilter === 'dedicated') {
      filteredConflicts = conflictsList.filter((c) => c.type === 'dedicated_workspace' || c.type === 'dedicated_location_mismatch');
    } else if (conflictFilter === 'overcapacity') {
      filteredConflicts = conflictsList.filter((c) => c.type === 'overcapacity');
    }

    return filteredConflicts.sort((a, b) => {
      if (a.severity === 'high' && b.severity !== 'high') return -1;
      if (b.severity === 'high' && a.severity !== 'high') return 1;
      return new Date(a.date) - new Date(b.date);
    });
  }, [selectedDate, dateRange, conflictFilter, employees, workspaces, bookings, zones, floors, locations, outOfOffice, dataLoading]);

  const handleResolveConflict = async (conflict, resolution) => {
    setResolving(true);
    try {
      switch (resolution.type) {
        case 'cancel_booking':
          await Booking.update(resolution.bookingId, { status: 'cancelled' });
          break;
        case 'reassign_workspace':
          if (resolution.newWorkspaceId) {
            await Booking.update(resolution.bookingId, { workspace_id: resolution.newWorkspaceId });
          }
          break;
        case 'update_employee':
          if (resolution.employeeId && resolution.updates) {
            await Employee.update(resolution.employeeId, resolution.updates);
          }
          break;
      }

      toast({
        title: "Conflict Resolved",
        description: "The conflict has been successfully resolved."
      });

      setSelectedConflict(null);
      await loadData();
    } catch (error) {
      console.error("Error resolving conflict:", error);
      toast({
        title: "Error",
        description: "Failed to resolve the conflict.",
        variant: "destructive"
      });
    }
    setResolving(false);
  };

  if (userLoading || dataLoading) {
    return (
      <div className="p-6 md:p-8 gradient-bg min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-64"></div>
            <div className="h-48 bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      </div>);

  }

  if (realUser?.role !== 'admin') {
    return (
      <div className="p-6 md:p-8 gradient-bg min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Admin Access Required</h3>
              <p className="text-slate-500">
                You need administrator privileges to manage conflicts.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>);

  }

  return (
    <>
      <Toaster />
      <div className="p-6 md:p-8 gradient-bg min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Seating Conflicts</h1>
              <p className="text-slate-600 mt-1">
                Identify and resolve workspace scheduling conflicts.
              </p>
            </div>
            <Button
              onClick={loadData}
              variant="outline"
              className="flex items-center gap-2 border-blue-500 text-blue-600 bg-white">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>

          {/* Filters */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-white border-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {dateRange === 'today' &&
                <div className="flex items-center gap-2">
                    <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)} className="flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-white border-slate-300" />
                  </div>
                }

                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <Select value={conflictFilter} onValueChange={setConflictFilter}>
                    <SelectTrigger className="flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-white border-slate-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Conflicts</SelectItem>
                      <SelectItem value="dedicated">Dedicated Desk</SelectItem>
                      <SelectItem value="overcapacity">Overcapacity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <ConflictStats conflicts={conflicts} />

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ConflictsList
                conflicts={conflicts}
                onSelectConflict={setSelectedConflict}
                selectedConflict={selectedConflict} />

            </div>

            <div>
              {selectedConflict ?
              <ConflictResolution
                conflict={selectedConflict}
                workspaces={workspaces}
                zones={zones}
                onResolve={handleResolveConflict}
                onCancel={() => setSelectedConflict(null)}
                resolving={resolving} /> :


              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <AlertTriangle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Select a conflict to resolve</p>
                    <p className="text-slate-400 text-sm mt-1">
                      Choose a conflict from the list to see resolution options
                    </p>
                  </CardContent>
                </Card>
              }
            </div>
          </div>
        </div>
      </div>
    </>);

}
