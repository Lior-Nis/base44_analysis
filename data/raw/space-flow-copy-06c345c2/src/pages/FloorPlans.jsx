
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MapPin,
  Building2,
  Calendar,
  Search,
  RefreshCw,
  LayoutGrid,
  List,
  Users
} from "lucide-react";
import { format, parseISO, isWithinInterval } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Badge } from "@/components/ui/badge";

import { useCurrentUser } from "@/components/useCurrentUser";
import { useData } from "@/components/DataProvider";

import AvailabilityLegend from "../components/floorplans/AvailabilityLegend";
import FloorLayout from "../components/floorplans/FloorLayout";
import WorkspaceGrid from "../components/floorplans/WorkspaceGrid";

function calculateSeatingPlan(selectedDate, allData) {
  const { employees, workspaces, bookings, outOfOffice } = allData;
  if (!employees || !workspaces || !bookings || !outOfOffice) return [];

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const dayOfWeek = format(selectedDate, "eeee").toLowerCase();

  const bookingsForDay = bookings.filter(
    (b) => b.booking_date === dateStr && b.status !== "cancelled"
  );

  const scheduledEmployees = employees.filter((e) => {
    if (!e.active || !e.work_days?.includes(dayOfWeek)) return false;
    const checkDate = parseISO(dateStr);
    const isOutOfOffice = outOfOffice.some(ooo => {
      if (ooo.employee_email !== e.email || ooo.status !== 'approved' || !ooo.start_date || !ooo.end_date) return false;
      const start = parseISO(ooo.start_date);
      const end = parseISO(ooo.end_date);
      const endOfDay = new Date(end);
      endOfDay.setHours(23, 59, 59, 999);
      return isWithinInterval(checkDate, { start, end: endOfDay });
    });
    return !isOutOfOffice;
  });

  const manuallyBookedEmails = new Set(bookingsForDay.map(b => b.user_email));
  const manuallyBookedEmployees = employees.filter(e => manuallyBookedEmails.has(e.email));

  const combinedEmployees = [
    ...scheduledEmployees,
    ...manuallyBookedEmployees.filter(mbe => !scheduledEmployees.some(se => se.id === mbe.id))
  ];

  const assignedWorkspaces = new Set();
  bookingsForDay.forEach(b => {
    assignedWorkspaces.add(b.workspace_id);
  });

  const assignments = [];
  const unassignedEmployees = [];

  combinedEmployees.forEach((employee) => {
    const manualBooking = bookingsForDay.find(b => b.user_email === employee.email);
    if (manualBooking) {
      return;
    }

    if (employee.dedicated_workspace_id) {
      const conflictingBooking = bookingsForDay.find(
        b => b.workspace_id === employee.dedicated_workspace_id && b.user_email !== employee.email
      );
      const workspace = workspaces.find(w => w.id === employee.dedicated_workspace_id);
      if (conflictingBooking) {
        assignments.push({ employee, workspace: null, status: "conflict", conflictReason: `Dedicated workspace booked by ${conflictingBooking.user_email}` });
      } else if (workspace && !assignedWorkspaces.has(workspace.id)) {
        assignments.push({ employee, workspace, status: "dedicated" });
        assignedWorkspaces.add(employee.dedicated_workspace_id);
      } else {
        unassignedEmployees.push(employee);
      }
    } else {
      unassignedEmployees.push(employee);
    }
  });

  unassignedEmployees.forEach((employee) => {
    let foundWorkspace = null;
    const activeDeskWorkspaces = workspaces.filter((w) => w.active && w.workspace_type === "desk");

    if (employee.preferred_zone_id) {
      const preferredWorkspaces = activeDeskWorkspaces.filter((w) =>
          w.zone_id === employee.preferred_zone_id && !assignedWorkspaces.has(w.id)
      );
      if (preferredWorkspaces.length > 0) foundWorkspace = preferredWorkspaces[0];
    }

    if (!foundWorkspace) {
      const anyAvailableDesk = activeDeskWorkspaces.filter((w) =>
          !assignedWorkspaces.has(w.id)
      );
      if (anyAvailableDesk.length > 0) foundWorkspace = anyAvailableDesk[0];
    }

    if (foundWorkspace) {
      assignments.push({ employee, workspace: foundWorkspace, status: "assigned" });
      assignedWorkspaces.add(foundWorkspace.id);
    } else {
      assignments.push({ employee, workspace: null, status: "unassigned" });
    }
  });

  return assignments;
}

export default function FloorPlansPage() {
  const {
    locations,
    floors,
    zones,
    workspaces,
    bookings,
    employees,
    outOfOffice,
    loading: dataLoading,
    refreshData
  } = useData();
  const { user, loading: userLoading } = useCurrentUser();

  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('visual');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMyDeskOnly, setShowMyDeskOnly] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!dataLoading && locations.length > 0 && !selectedLocation) {
      const firstActiveLocation = locations.find(l => l.active);
      if (firstActiveLocation) {
        setSelectedLocation(firstActiveLocation.id);
        const locationFloors = floors.filter(f => f.location_id === firstActiveLocation.id && f.active);
        if (locationFloors.length > 0) {
          setSelectedFloor(locationFloors[0].id);
        }
      }
    }
  }, [dataLoading, locations, floors, selectedLocation]);

  const allDataForRoster = useMemo(() => ({
    employees,
    workspaces,
    bookings,
    outOfOffice,
  }), [employees, workspaces, bookings, outOfOffice]);

  const seatingPlan = useMemo(() => {
    if (userLoading || dataLoading) return [];
    const date = parseISO(selectedDate);
    date.setHours(12);
    return calculateSeatingPlan(date, allDataForRoster);
  }, [selectedDate, allDataForRoster, userLoading, dataLoading]);

  const handleLocationChange = (locationId) => {
    setSelectedLocation(locationId);
    const locationFloors = floors.filter(f => f.location_id === locationId && f.active);
    if (locationFloors.length > 0) {
      setSelectedFloor(locationFloors[0].id);
    } else {
      setSelectedFloor('');
    }
  };

  const getWorkspaceAvailability = (workspaceId) => {
    const manualBooking = bookings.find(b =>
        b.workspace_id === workspaceId &&
        b.booking_date === selectedDate &&
        b.status !== 'cancelled'
    );
    if (manualBooking) {
        return {
            status: 'booked_manual',
            type: 'manual',
            user: manualBooking.user_email,
            isCurrentUser: manualBooking.user_email === user?.email
        };
    }

    const rosterAssignment = seatingPlan.find(a => a.workspace?.id === workspaceId);
    if (rosterAssignment) {
        return {
            status: 'booked_roster',
            type: 'roster',
            user: rosterAssignment.employee.email,
            isCurrentUser: rosterAssignment.employee.email === user?.email
        };
    }

    return { status: 'available' };
  };

  const handleWorkspaceClick = (workspace) => {
    navigate(`${createPageUrl("Bookings")}?location=${selectedLocation}&date=${selectedDate}&workspace=${workspace.id}`);
  };

  const handleMyDeskToggle = () => {
    const newValue = !showMyDeskOnly;
    setShowMyDeskOnly(newValue);

    if (newValue && user?.email) {
      const userManualBooking = bookings.find(b =>
        b.user_email === user.email &&
        b.booking_date === selectedDate &&
        b.status !== 'cancelled'
      );
      const userRosterAssignment = seatingPlan.find(a => a.employee.email === user.email);

      if (!userManualBooking && !userRosterAssignment) {
        toast({
          title: "No Assignment Found",
          description: "You don't have a desk assignment for this date.",
          duration: 3000,
        });
      }
    }
  };

  if (userLoading || dataLoading) {
    return (
      <div className="p-6 md:p-8 gradient-bg min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-48 bg-slate-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getFilteredWorkspaces = (allWorkspaces) => {
    if (!showMyDeskOnly || !user?.email) {
      return allWorkspaces;
    }

    const userManualBooking = bookings.find(b =>
      b.user_email === user.email &&
      b.booking_date === selectedDate &&
      b.status !== 'cancelled'
    );
    const userRosterAssignment = seatingPlan.find(a => a.employee.email === user.email);

    const userWorkspaceIds = [];
    if (userManualBooking) userWorkspaceIds.push(userManualBooking.workspace_id);
    if (userRosterAssignment?.workspace) userWorkspaceIds.push(userRosterAssignment.workspace.id);

    return allWorkspaces.filter(w => userWorkspaceIds.includes(w.id));
  };

  const activeLocations = locations.filter(l => l.active);
  const currentLocation = locations.find(l => l.id === selectedLocation);
  const currentFloor = floors.find(f => f.id === selectedFloor);
  const locationFloors = floors.filter(f => f.location_id === selectedLocation && f.active);
  const floorZones = zones.filter(z => z.floor_id === selectedFloor && z.active);
  const allFloorWorkspaces = workspaces.filter(w => {
    const zone = zones.find(z => z.id === w.zone_id);
    return zone && zone.floor_id === selectedFloor && w.active;
  });
  const floorWorkspaces = getFilteredWorkspaces(allFloorWorkspaces);


  return (
    <>
      <Toaster />
      <div className="p-6 md:p-8 gradient-bg min-h-screen">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Floor Plans</h1>
            <p className="text-slate-600 mt-1">
              {currentLocation && currentFloor ? (
                <>View workspace layouts for {currentLocation.name} - {currentFloor.name}</>
              ) : (
                "Select a location and floor to view details."
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={refreshData}
              variant="outline"
              size="sm"
              disabled={dataLoading}
              className="border-blue-500 text-blue-600 bg-white flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} />
              {dataLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button
              variant={viewMode === 'visual' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('visual')}
              className={viewMode === 'visual' ? 'bg-blue-600 text-white' : 'border-blue-500 text-blue-600 bg-white'}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-blue-600 text-white' : 'border-blue-500 text-blue-600 bg-white'}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedLocation} onValueChange={handleLocationChange}>
              <SelectTrigger className="bg-white border-slate-300">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {activeLocations.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {location.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedFloor} onValueChange={setSelectedFloor}>
              <SelectTrigger className="bg-white border-slate-300">
                <SelectValue placeholder="Select floor" />
              </SelectTrigger>
              <SelectContent>
                {locationFloors.map((floor) => (
                  <SelectItem key={floor.id} value={floor.id}>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {floor.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white border-slate-300"
              />
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search workspaces..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-slate-300"
              />
            </div>
            <Button
              variant={showMyDeskOnly ? "default" : "outline"}
              onClick={handleMyDeskToggle}
              className={
                showMyDeskOnly
                  ? "bg-blue-600 text-white"
                  : "border-blue-500 text-blue-600 bg-white"
              }
            >
              <Users className="w-4 h-4 mr-2" />
              My Desk Only
            </Button>
          </div>
        </div>

        {currentFloor ? (
          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <MapPin className="w-5 h-5 text-slate-600" />
                    {currentFloor.name} Layout
                    {showMyDeskOnly && (
                      <Badge variant="secondary" className="ml-2 bg-slate-100 text-slate-800">
                        My Desk Only
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {viewMode === 'visual' ? (
                     <FloorLayout
                        zones={floorZones}
                        workspaces={floorWorkspaces}
                        getAvailability={getWorkspaceAvailability}
                        onWorkspaceClick={handleWorkspaceClick}
                     />
                  ) : (
                    <WorkspaceGrid
                        workspaces={floorWorkspaces}
                        zones={zones}
                        getAvailability={getWorkspaceAvailability}
                        searchTerm={searchTerm}
                    />
                  )}
                  {showMyDeskOnly && floorWorkspaces.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium">No desk assigned on this floor</p>
                      <p className="text-slate-400 text-sm mt-1">
                        You don't have a workspace assignment on this floor for the selected date.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <AvailabilityLegend />

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">
                    {format(new Date(selectedDate.replace(/-/g, '/')), 'MMM d, yyyy')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(() => {
                    const available = floorWorkspaces.filter(w =>
                      getWorkspaceAvailability(w.id).status === 'available'
                    ).length;
                    const booked = floorWorkspaces.length - available;
                    const total = floorWorkspaces.length;
                    const occupancyRate = total > 0 ? Math.round((booked / total) * 100) : 0;

                    return (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">
                            {showMyDeskOnly ? "Your Workspaces" : "Available"}
                          </span>
                          <span className="font-semibold text-green-600">{available}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Booked</span>
                          <span className="font-semibold text-blue-600">{booked}</span>
                        </div>
                        {!showMyDeskOnly && (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-slate-600">Occupancy</span>
                              <span className="font-semibold text-slate-900">{occupancyRate}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${occupancyRate}%` }}
                              />
                            </div>
                          </>
                        )}
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No Floor Selected</h3>
              <p className="text-slate-500">
                Select a location and floor to view the floor plan and workspace availability.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
