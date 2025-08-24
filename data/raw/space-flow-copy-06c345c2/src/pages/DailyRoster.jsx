
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, Users, CheckSquare, XSquare, Building2 } from "lucide-react";
import { format, addDays, parseISO, isWithinInterval } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
"@/components/ui/select";
import { Switch } from "@/components/ui/switch"; // This import might be unused after the change but is kept for consistency if other parts of the app use it.
import { Label } from "@/components/ui/label"; // This import might be unused after the change.
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useCurrentUser } from "@/components/useCurrentUser";
import { useData } from "@/components/DataProvider";
import DailyRosterTable from "../components/roster/DailyRosterTable";

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
    const isOutOfOffice = outOfOffice.some((ooo) => {
      if (ooo.employee_email !== e.email || ooo.status !== 'approved') return false;
      // Handle invalid dates from OutOfOffice records
      if (!ooo.start_date || !ooo.end_date) return false;
      const start = parseISO(ooo.start_date);
      const end = parseISO(ooo.end_date);
      return isWithinInterval(checkDate, { start, end });
    });
    return !isOutOfOffice;
  });

  const manuallyBookedEmails = new Set(bookingsForDay.map((b) => b.user_email));
  const manuallyBookedEmployees = employees.filter((e) => manuallyBookedEmails.has(e.email));

  const combinedEmployees = [
  ...scheduledEmployees,
  ...manuallyBookedEmployees.filter((mbe) => !scheduledEmployees.some((se) => se.id === mbe.id))];


  const assignedWorkspaces = new Set();
  bookingsForDay.forEach((b) => {
    assignedWorkspaces.add(b.workspace_id);
  });

  const assignments = [];
  const unassignedEmployees = [];

  combinedEmployees.forEach((employee) => {
    const manualBooking = bookingsForDay.find((b) => b.user_email === employee.email);
    if (manualBooking) {
      const workspace = workspaces.find((w) => w.id === manualBooking.workspace_id);
      assignments.push({ employee, workspace, status: "booked" });
      return;
    }

    if (employee.dedicated_workspace_id) {
      const conflictingBooking = bookingsForDay.find(
        (b) => b.workspace_id === employee.dedicated_workspace_id && b.user_email !== employee.email
      );
      const workspace = workspaces.find((w) => w.id === employee.dedicated_workspace_id);
      if (conflictingBooking) {
        assignments.push({ employee, workspace: null, status: "conflict", conflictReason: `Dedicated workspace booked by ${conflictingBooking.user_email}` });
      } else if (workspace) {
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
    if (employee.preferred_zone_id) {
      const preferredWorkspaces = workspaces.filter((w) =>
      w.active && w.workspace_type === "desk" && w.zone_id === employee.preferred_zone_id && !assignedWorkspaces.has(w.id)
      );
      if (preferredWorkspaces.length > 0) foundWorkspace = preferredWorkspaces[0];
    }
    if (!foundWorkspace) {
      const anyAvailableDesk = workspaces.filter((w) =>
      w.active && w.workspace_type === "desk" && !assignedWorkspaces.has(w.id)
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

  return assignments.sort((a, b) => a.employee.name.localeCompare(b.employee.name));
}


export default function DailyRosterPage() {
  const { loading: dataLoading, ...allData } = useData();
  const { user, loading: userLoading } = useCurrentUser();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [filterByMyDesk, setFilterByMyDesk] = useState(false);
  const { toast } = useToast();

  const seatingPlan = useMemo(() => {
    if (userLoading || dataLoading) return [];

    let fullPlan = calculateSeatingPlan(selectedDate, allData);

    if (selectedLocation !== 'all') {
      fullPlan = fullPlan.filter((assignment) => assignment.employee.assigned_location_id === selectedLocation);
    }

    if (filterByMyDesk && user?.email) {
      fullPlan = fullPlan.filter((assignment) => assignment.employee.email === user.email);
    }

    return fullPlan;
  }, [selectedDate, allData, selectedLocation, filterByMyDesk, user?.email, userLoading, dataLoading]);

  const stats = useMemo(() => {
    const total = seatingPlan.length;
    const seated = seatingPlan.filter(
      (a) => a.status === "dedicated" || a.status === "assigned" || a.status === "booked"
    ).length;
    const conflicts = seatingPlan.filter((a) => a.status === "conflict").length;
    const unassigned = total - seated - conflicts;
    return { total, seated, unassigned, conflicts };
  }, [seatingPlan]);

  const handleDateChange = (e) => {
    setSelectedDate(new Date(e.target.value));
  };

  const setDatePreset = (preset) => {
    const today = new Date();
    if (preset === 'today') setSelectedDate(today);
    if (preset === 'tomorrow') setSelectedDate(addDays(today, 1));
  };

  const handleMyDeskToggle = (checked) => {
    setFilterByMyDesk(checked);

    if (checked) {
      const userAssignment = seatingPlan.find((a) => a.employee.email === user?.email);

      if (userAssignment) {
        toast({
          title: "Showing Your Desk Only",
          description: "Filtered to show only your seating assignment for this date.",
          duration: 3000
        });
      } else {
        toast({
          title: "No Assignment Found",
          description: "You don't have a desk assignment for this date. Contact an admin to set your work schedule.",
          duration: 5000
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
            <div className="h-48 bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      </div>);

  }

  return (
    <>
      <Toaster />
      <div className="p-6 md:p-8 gradient-bg min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Daily Roster</h1>
            <p className="text-slate-600 mt-1">
              Automated seating plan for scheduled employees.
            </p>
          </div>

          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-slate-500" />
                  <Input
                    type="date"
                    value={format(selectedDate, 'yyyy-MM-dd')}
                    onChange={handleDateChange} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-white h-10 px-4 py-2 border-slate-300 text-slate-800 w-full sm:w-auto" />


                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setDatePreset('today')} className="border-blue-500 text-blue-600 bg-white">Today</Button>
                  <Button variant="outline" size="sm" onClick={() => setDatePreset('tomorrow')} className="border-blue-500 text-blue-600 bg-white">Tomorrow</Button>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-slate-500" />
                  <Select
                    value={selectedLocation}
                    onValueChange={setSelectedLocation}>

                    <SelectTrigger className="w-48 bg-white border-slate-300">
                      <SelectValue placeholder="Filter by location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {allData.locations.map((location) =>
                      <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant={filterByMyDesk ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleMyDeskToggle(!filterByMyDesk)}
                  className={
                    filterByMyDesk
                      ? "bg-blue-600 text-white"
                      : "border-blue-500 text-blue-600 bg-white"
                  }
                >
                  My desk only
                </Button>
              </div>
              <div className="flex items-center gap-6 text-sm flex-wrap">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span><span className="font-bold">{stats.total}</span> {filterByMyDesk ? 'Your Assignment' : 'Employees Scheduled'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-green-600" />
                  <span><span className="font-bold">{stats.seated}</span> Seated</span>
                </div>
                {stats.conflicts > 0 &&
                <div className="flex items-center gap-2">
                    <XSquare className="w-5 h-5 text-blue-600" /> 
                    <span><span className="font-bold">{stats.conflicts}</span> Conflicts</span>
                  </div>
                }
                <div className="flex items-center gap-2">
                  <XSquare className="w-5 h-5 text-red-600" />
                  <span><span className="font-bold">{stats.unassigned}</span> Unassigned</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <DailyRosterTable
            seatingPlan={seatingPlan}
            zones={allData.zones}
            floors={allData.floors}
            locations={allData.locations} />

        </div>
      </div>
    </>);

}
