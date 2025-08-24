
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Building2, Users, Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { isToday } from "date-fns";

export default function MyLocationCard({ employee, location, bookings, workspaces, zones, floors }) {
  if (!employee?.assigned_location_id || !location) {
    return (
      <Card className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="w-5 h-5 text-slate-600" />
            My Location
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 mb-4">No location assigned</p>
          <Link to={createPageUrl("Profile")}>
            <Button variant="outline" size="sm" className="hover:bg-white hover:text-slate-900">
              Update Profile
            </Button>
          </Link>
        </CardContent>
      </Card>);

  }

  // Calculate location stats
  const locationFloors = floors.filter((f) => f.location_id === location.id && f.active);
  const locationFloorIds = locationFloors.map((f) => f.id);
  const locationZones = zones.filter((z) => locationFloorIds.includes(z.floor_id) && z.active);
  const locationZoneIds = locationZones.map((z) => z.id);
  const locationWorkspaces = workspaces.filter((w) => locationZoneIds.includes(w.zone_id) && w.active);

  const todaysBookings = bookings.filter((b) =>
  isToday(new Date(b.booking_date)) &&
  b.status !== 'cancelled'
  );

  // Calculate bookings at this location today
  const locationBookingsToday = todaysBookings.filter((b) => {
    const workspace = workspaces.find((w) => w.id === b.workspace_id);
    if (!workspace) return false;
    const zone = zones.find((z) => z.id === workspace.zone_id);
    if (!zone) return false;
    const floor = floors.find((f) => f.id === zone.floor_id);
    return floor?.location_id === location.id;
  });

  const occupancyRate = locationWorkspaces.length > 0 ?
  Math.round(locationBookingsToday.length / locationWorkspaces.length * 100) :
  0;

  const getOccupancyColor = (rate) => {
    if (rate < 50) return "text-green-600 bg-green-100";
    if (rate < 80) return "text-amber-600 bg-amber-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <Card className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="w-5 h-5 text-slate-600" />
          My Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location Info */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-slate-900 text-lg">{location.name}</h3>
            </div>
            {location.address &&
            <p className="text-sm text-slate-500 ml-7">{location.address}</p>
            }
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Assigned
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">{locationFloors.length}</div>
            <div className="text-sm text-slate-500">Floors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">{locationWorkspaces.length}</div>
            <div className="text-sm text-slate-500">Workspaces</div>
          </div>
        </div>

        {/* Today's Occupancy */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-700">Today's Occupancy</span>
            <Badge className={`text-xs ${getOccupancyColor(occupancyRate)}`}>
              {occupancyRate}%
            </Badge>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
              occupancyRate < 50 ? 'bg-green-500' :
              occupancyRate < 80 ? 'bg-orange-500' : 'bg-red-500'}`
              }
              style={{ width: `${occupancyRate}%` }} />

          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>{locationBookingsToday.length} occupied</span>
            <span>{locationWorkspaces.length - locationBookingsToday.length} available</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Link to={`${createPageUrl("FloorPlans")}?location=${location.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="border-blue-500 text-blue-600 bg-white hover:bg-white hover:text-blue-600 w-full">
              <MapPin className="w-4 h-4 mr-2" />
              View Floor Plans
            </Button>
          </Link>
          <Link to={`${createPageUrl("Bookings")}?location=${location.id}`} className="flex-1">
            <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-600 w-full">
              <Calendar className="w-4 h-4 mr-2" />
              Book Now
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>);

}
