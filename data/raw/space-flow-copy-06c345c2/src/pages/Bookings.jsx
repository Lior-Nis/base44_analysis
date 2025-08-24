
import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Filter, Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format, parseISO, isWithinInterval } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

import { Booking } from "@/api/entities";
import { Workspace } from "@/api/entities";
import { Zone } from "@/api/entities";
import { Floor } from "@/api/entities";
import { Location } from "@/api/entities";
import { User } from "@/api/entities";
import { Employee } from "@/api/entities";
import { OutOfOffice } from "@/api/entities";
import { useCurrentUser } from "@/components/useCurrentUser";
import { useData } from "@/components/DataProvider"; 

import BookingForm from "../components/bookings/BookingForm";
import BookingsList from "../components/bookings/BookingsList";
import WorkspaceGrid from "../components/bookings/WorkspaceGrid";
import BookingFilters from "../components/bookings/BookingFilters";
import AdminBookingsList from "../components/bookings/AdminBookingsList";

// Seating logic moved directly into the file
function calculateSeatingPlan(selectedDate, allData) {
  const { employees, workspaces, bookings, outOfOffice } = allData;
  if (!employees || !workspaces || !bookings || !outOfOffice) return [];

  const dateStr = format(new Date(selectedDate), "yyyy-MM-dd");
  const dayOfWeek = format(new Date(selectedDate), "eeee").toLowerCase();

  const bookingsForDay = bookings.filter(
    (b) => b.booking_date === dateStr && b.status !== "cancelled"
  );

  const scheduledEmployees = employees.filter((e) => {
    if (!e.active || !e.work_days?.includes(dayOfWeek)) return false;
    const checkDate = parseISO(dateStr);
    const isOutOfOffice = outOfOffice.some((ooo) => {
      if (ooo.employee_email !== e.email || ooo.status !== 'approved') return false;
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

export default function BookingsPage() {
  const {
    bookings,
    workspaces,
    zones,
    floors,
    locations,
    employees,
    outOfOffice,
    loading: dataLoading,
    refreshData
  } = useData();
  const { user, loading: userLoading } = useCurrentUser();
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: 'all',
    zone: 'all'
  });
  const [workspaceLocationMap, setWorkspaceLocationMap] = useState(new Map());
  const { toast } = useToast();

  // Get URL parameters for initial filters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const locationParam = urlParams.get('location');
    if (locationParam) {
      setFilters((prev) => ({ ...prev, location: locationParam }));
    }
  }, []);

  // Effect to build workspaceLocationMap when data is available
  useEffect(() => {
    const newWorkspaceLocationMap = new Map();
    workspaces.forEach((w) => {
      const zone = zones.find((z) => z.id === w.zone_id);
      const floor = zone ? floors.find((f) => f.id === zone.floor_id) : null;
      if (floor) {
        newWorkspaceLocationMap.set(w.id, floor.location_id);
      }
    });
    setWorkspaceLocationMap(newWorkspaceLocationMap);
  }, [workspaces, zones, floors]); // Dependencies ensure this runs when data from useData changes

  const allDataForRoster = useMemo(() => ({
    employees,
    workspaces,
    bookings,
    outOfOffice,
    zones,
    floors,
    locations
  }), [employees, workspaces, bookings, outOfOffice, zones, floors, locations]);

  const seatingPlan = useMemo(() => {
    if (userLoading || dataLoading || !selectedDate) return [];
    return calculateSeatingPlan(selectedDate, allDataForRoster);
  }, [selectedDate, allDataForRoster, userLoading, dataLoading]);

  const currentUserAssignment = useMemo(() => {
    if (!user?.email || seatingPlan.length === 0) return null;
    const assignment = seatingPlan.find((a) => a.employee.email === user.email);
    // Only return a blocking assignment. "unassigned" is not a block.
    if (assignment && assignment.status !== 'unassigned') {
      return assignment;
    }
    return null;
  }, [user, seatingPlan]);

  const handleBookingCreate = async (bookingData) => {
    try {
      console.log('Creating booking for', bookingData.booking_date);

      // NEW: Check for existing assignment from seating plan
      if (currentUserAssignment) {
        alert(`You cannot book a workspace. You already have an assignment for this date: ${currentUserAssignment.status}.`);
        return;
      }

      // Check if workspace is already booked by someone else
      const workspaceBooking = bookings.find((b) =>
      b.workspace_id === bookingData.workspace_id &&
      b.booking_date === bookingData.booking_date &&
      b.status !== 'cancelled'
      );

      if (workspaceBooking) {
        alert(`This workspace is already booked by ${workspaceBooking.user_email} for this date.`);
        return;
      }

      await Booking.create({
        ...bookingData,
        user_email: user.email,
        status: 'confirmed'
      });

      console.log('Booking created successfully');
      setShowForm(false);

      // Refresh data after booking
      await refreshData();
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Error creating booking. Please try again.');
    }
  };

  const handleBookingCancel = async (bookingId) => {
    try {
      console.log('Cancelling booking ID:', bookingId);
      await Booking.update(bookingId, { status: 'cancelled' });
      console.log('Booking cancelled successfully');

      // Refresh data after cancellation
      await refreshData();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Error cancelling booking. Please try again.');
    }
  };

  const getAvailableWorkspaces = () => {
    const bookedWorkspaceIds = bookings.
    filter((b) => {
      const isForSelectedDate = b.booking_date === selectedDate;
      const isActive = b.status !== 'cancelled';
      return isForSelectedDate && isActive;
    }).
    map((b) => b.workspace_id);

    const available = workspaces.filter((w) =>
    !bookedWorkspaceIds.includes(w.id) && (
    searchTerm === '' || w.name.toLowerCase().includes(searchTerm.toLowerCase())) && (
    filters.zone === 'all' || w.zone_id === filters.zone) && (
    filters.location === 'all' || workspaceLocationMap.get(w.id) === filters.location)
    );

    return available;
  };

  const handleDateChange = (newDate) => {
    console.log('Date changed to', newDate);
    setSelectedDate(newDate);
    if (showForm) {
      setShowForm(false);
    }
  };

  if (userLoading || dataLoading) {
    return (
      <div className="p-6 md:p-8 gradient-bg min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="animate-pulse h-8 bg-slate-200 rounded w-64"></div>
            <Button
              onClick={refreshData} // Use refreshData directly
              variant="outline"
              disabled={dataLoading}
              className="border-blue-500 text-blue-600 bg-white">
              <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} />
              {dataLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
          <div className="animate-pulse space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) =>
              <div key={i} className="h-48 bg-slate-200 rounded-xl"></div>
              )}
            </div>
          </div>
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
              <h1 className="text-3xl font-bold text-slate-900">Book Workspace</h1>
              <p className="text-slate-600 mt-1">Reserve your perfect work environment</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={refreshData}
                variant="outline"
                disabled={dataLoading}
                className="border-blue-500 text-blue-600 bg-white hover:bg-white hover:text-blue-600">
                <RefreshCw className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} />
                {dataLoading ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white hover:bg-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                New Booking
              </Button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search workspaces..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white border-slate-300"
                icon={<Search className="w-4 h-4 text-slate-400" />} />

            </div>
            <BookingFilters
              filters={filters}
              onFiltersChange={setFilters}
              locations={locations}
              zones={zones}
              floors={floors} />

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-700">Date:</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-auto bg-white border-slate-300" />

            </div>
          </div>

          {/* Content */}
          {showForm ?
          <BookingForm
            workspaces={getAvailableWorkspaces()}
            zones={zones}
            floors={floors}
            locations={locations}
            selectedDate={selectedDate}
            userBookings={bookings}
            currentUser={user}
            onSubmit={handleBookingCreate}
            onCancel={() => setShowForm(false)}
            currentUserAssignment={currentUserAssignment} /> :


          <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <WorkspaceGrid
                workspaces={getAvailableWorkspaces()}
                zones={zones}
                floors={floors}
                locations={locations}
                selectedDate={selectedDate}
                userBookings={bookings}
                currentUser={user}
                currentUserAssignment={currentUserAssignment}
                onBookNow={(workspace) => {
                  handleBookingCreate({
                    workspace_id: workspace.id,
                    booking_date: selectedDate,
                    start_time: '09:00',
                    end_time: '17:00'
                  });
                }} />

              </div>
              <div>
                <BookingsList
                bookings={bookings.filter((b) => b.user_email === user?.email)}
                workspaces={workspaces}
                onCancel={handleBookingCancel} />

                {user?.role === 'admin' &&
              <div className="mt-6">
                    <AdminBookingsList
                  bookings={bookings}
                  workspaces={workspaces}
                  selectedDate={selectedDate}
                  onCancel={handleBookingCancel} />

                  </div>
              }
              </div>
            </div>
          }
        </div>
      </div>
    </>);

}
