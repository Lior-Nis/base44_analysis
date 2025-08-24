
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Calendar,
  Users,
  MapPin,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, isToday, isTomorrow } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

import { Booking } from "@/api/entities";
import { Workspace } from "@/api/entities";
import { Location } from "@/api/entities";
import { User } from "@/api/entities";
import { Zone } from "@/api/entities";
import { Floor } from "@/api/entities";
import { Employee } from "@/api/entities";

import { useCurrentUser } from "@/components/useCurrentUser";
import { useData } from "@/components/DataProvider";
import SystemWalkthrough from "../components/walkthrough/SystemWalkthrough";

import StatsOverview from "../components/dashboard/StatsOverview";
import TodaysBookings from "../components/dashboard/TodaysBookings";
import UpcomingBookings from "../components/dashboard/UpcomingBookings";
import QuickActions from "../components/dashboard/QuickActions";
import MyLocationCard from "../components/dashboard/MyLocationCard";

export default function Dashboard() {
  const { 
    bookings, 
    workspaces, 
    locations, 
    zones, 
    floors, 
    employees, 
    loading: dataLoading, 
    refreshData 
  } = useData();
  const { user, loading: userLoading, isFirstTimeUser, markWalkthroughComplete } = useCurrentUser();
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!userLoading && isFirstTimeUser) {
      setShowWalkthrough(true);
    }
  }, [userLoading, isFirstTimeUser]);

  const handleCheckIn = async (bookingId) => {
    try {
      await Booking.update(bookingId, {
        status: 'checked_in',
        checked_in_at: new Date().toISOString()
      });
      await refreshData(); // Refresh global data
    } catch (error) {
      console.error("Error checking in:", error);
    }
  };

  const handleWalkthroughComplete = () => {
    markWalkthroughComplete();
    setShowWalkthrough(false);
  };

  if (userLoading || dataLoading) {
    return (
      <div className="p-6 md:p-8 gradient-bg min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get current user's employee record and assigned location
  const currentEmployee = employees.find(e => e.email === user?.email);
  const assignedLocation = currentEmployee?.assigned_location_id
    ? locations.find(l => l.id === currentEmployee.assigned_location_id)
    : null;

  return (
    <>
      <Toaster />
      <SystemWalkthrough
        isOpen={showWalkthrough}
        onClose={() => setShowWalkthrough(false)}
        onComplete={handleWalkthroughComplete}
      />
      
      <div className="p-6 md:p-8 gradient-bg min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Welcome back, {user?.full_name?.split(' ')[0] || 'there'}
              </h1>
              <p className="text-slate-600 mt-1">
                {format(new Date(), "EEEE, MMMM d, yyyy")} • Manage your workspace
              </p>
            </div>
            <QuickActions onStartTour={() => setShowWalkthrough(true)} />
          </div>

          {/* Stats Overview */}
          <StatsOverview
            bookings={bookings}
            workspaces={workspaces}
            locations={locations.filter(l => l.active)}
            user={user}
          />

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <TodaysBookings
                bookings={bookings}
                user={user}
                onCheckIn={handleCheckIn}
                workspaces={workspaces}
                zones={zones}
              />

              <UpcomingBookings
                bookings={bookings}
                user={user}
                workspaces={workspaces}
                zones={zones}
              />
            </div>

            <div className="space-y-6">
              {/* My Location Card */}
              <MyLocationCard
                employee={currentEmployee}
                location={assignedLocation}
                bookings={bookings}
                workspaces={workspaces}
                zones={zones}
                floors={floors}
              />

              {/* Office Status */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building2 className="w-5 h-5 text-slate-600" />
                    Office Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {locations.filter(l => l.active).slice(0, 3).map((location) => {
                      const locationBookings = bookings.filter(b =>
                        isToday(new Date(b.booking_date)) &&
                        b.status !== 'cancelled'
                      );
                      // Calculate total workspaces associated with this location.
                      // If the location has floors and zones, we should count workspaces within those.
                      // For now, using a simplified approach, potentially an area for improvement.
                      // This might need a more precise count based on location/floor/zone relationships.
                      const workspacesInLocation = workspaces.filter(ws => {
                        const zone = zones.find(z => z.id === ws.zone_id);
                        const floor = floors.find(f => f.id === zone?.floor_id);
                        return floor?.location_id === location.id;
                      }).length;

                      const totalWorkspacesForOccupancy = workspacesInLocation > 0 ? workspacesInLocation : 1;
                      const occupancy = Math.min(100, Math.round((locationBookings.length / totalWorkspacesForOccupancy) * 100));

                      return (
                        <div key={location.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-slate-700">{location.name}</span>
                            <span className="text-sm text-slate-500">{occupancy}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${occupancy}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-5 h-5 text-slate-600" />
                    This Week
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Your Bookings</span>
                      <span className="font-semibold text-slate-900">
                        {bookings.filter(b =>
                          b.user_email === user?.email &&
                          new Date(b.booking_date) >= new Date() &&
                          b.status !== 'cancelled'
                        ).length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Check-ins</span>
                      <span className="font-semibold text-slate-900">
                        {bookings.filter(b =>
                          b.user_email === user?.email &&
                          b.status === 'checked_in'
                        ).length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Assigned Location</span>
                      <span className="font-semibold text-slate-900">
                        {assignedLocation?.name || 'None set'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
