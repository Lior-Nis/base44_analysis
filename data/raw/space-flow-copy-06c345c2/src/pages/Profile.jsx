
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  User as UserIcon, 
  MapPin, 
  Building2,
  Calendar,
  Clock,
  CheckCircle,
  Save,
  ArrowLeft,
  Eye,
  Briefcase, // Added Briefcase icon
  PlayCircle // Added PlayCircle icon
} from "lucide-react";
import { format, addDays, isToday, isTomorrow } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import { User } from "@/api/entities";
import { Employee } from "@/api/entities";
import { Location } from "@/api/entities";
import { Zone } from "@/api/entities";
import { Floor } from "@/api/entities";
import { Workspace } from "@/api/entities";
import { Booking } from "@/api/entities";
import { useCurrentUser } from "@/components/useCurrentUser";
import OutOfOfficeSection from "../components/profile/OutOfOfficeSection";
import SystemWalkthrough from "../components/walkthrough/SystemWalkthrough";

const workDaysOptions = [
  { id: "sunday", label: "Sunday" },
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
];

const scheduleOptions = [ // Kept as it might be used in other contexts or for reference
  { value: "office", label: "Office", color: "bg-blue-100 text-blue-800" },
  { value: "remote", label: "Remote", color: "bg-green-100 text-green-800" },
  { value: "flexible", label: "Flexible", color: "bg-purple-100 text-purple-800" }
];

export default function ProfilePage() {
  const { user: loggedInUser, realUser, loading: userLoading, resetWalkthrough } = useCurrentUser();
  const [user, setUser] = useState(null); // This state will hold the user whose profile is being displayed
  const [employee, setEmployee] = useState(null);
  const [locations, setLocations] = useState([]);
  const [zones, setZones] = useState([]);
  const [floors, setFloors] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [dataLoading, setDataLoading] = useState(true); // Renamed from 'loading'
  const [saving, setSaving] = useState(false);
  const [isReadOnlyView, setIsReadOnlyView] = useState(false);
  const [viewedEmployeeName, setViewedEmployeeName] = useState('');
  const [showWalkthrough, setShowWalkthrough] = useState(false);

  const [profileData, setProfileData] = useState({
    department: '',
    job_title: '',
    preferred_locations: [],
    // work_schedule is removed as it's now derived and managed differently
  });

  const [employeeData, setEmployeeData] = useState({
    work_days: [],
    preferred_zone_id: ''
  });

  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewId = params.get('viewId');
    if (!userLoading) {
      loadData(viewId);
    }
  }, [userLoading, window.location.search]);

  const loadData = async (viewId) => {
    setDataLoading(true);
    try {
      let userToDisplay = loggedInUser;
      
      const allEmployees = await Employee.list();
      await new Promise(res => setTimeout(res, 500)); // Increased delay to 500ms
      const allLocations = await Location.list();
      await new Promise(res => setTimeout(res, 500)); // Increased delay to 500ms
      const allZones = await Zone.list();
      await new Promise(res => setTimeout(res, 500)); // Increased delay to 500ms
      const allFloors = await Floor.list();
      await new Promise(res => setTimeout(res, 500)); // Increased delay to 500ms
      const allWorkspaces = await Workspace.list();
      await new Promise(res => setTimeout(res, 500)); // Increased delay to 500ms
      const allBookings = await Booking.list();

      setLocations(allLocations.filter(l => l.active));
      setZones(allZones.filter(z => z.active));
      setFloors(allFloors.filter(f => f.active));
      setWorkspaces(allWorkspaces.filter(w => w.active));
      setBookings(allBookings);
      setEmployees(allEmployees);

      let employeeToDisplay = allEmployees.find(e => e.email === loggedInUser?.email);
      
      if (viewId && realUser?.role === 'admin') {
        const viewedEmployee = allEmployees.find(e => e.id === viewId);
        if (viewedEmployee) {
          setIsReadOnlyView(true);
          employeeToDisplay = viewedEmployee;
          setViewedEmployeeName(viewedEmployee.name);
          const viewedUsers = await User.filter({ email: viewedEmployee.email });
          if (viewedUsers.length > 0) {
            userToDisplay = viewedUsers[0]; 
          } else {
            userToDisplay = null; // No corresponding user found for the employee
            console.warn(`User record not found for employee ID: ${viewId}`);
          }
        } else {
            // If viewId provided but employee not found, revert to loggedInUser view
            setIsReadOnlyView(false);
            // Default `userToDisplay` and `employeeToDisplay` already set to loggedInUser's data
            console.warn(`Employee ID: ${viewId} not found, displaying current user's profile.`);
        }
      } else {
        setIsReadOnlyView(false); // Ensure it's false if not viewing an employee or not admin
      }
      
      setUser(userToDisplay);
      setEmployee(employeeToDisplay);

      if (userToDisplay) {
        setProfileData({
          department: userToDisplay.department || '',
          job_title: userToDisplay.job_title || '',
          preferred_locations: userToDisplay.preferred_locations || [],
          // work_schedule is no longer set here
        });
      } else {
        // Clear profile data if no userToDisplay (e.g., employee found but no corresponding user)
        setProfileData({
          department: '', job_title: '', preferred_locations: [],
        });
      }

      if (employeeToDisplay) {
        setEmployeeData({
          work_days: employeeToDisplay.work_days || [],
          preferred_zone_id: employeeToDisplay.preferred_zone_id || ''
        });
      } else {
        // Clear employee data if no employeeToDisplay
        setEmployeeData({ work_days: [], preferred_zone_id: '' });
      }

    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      });
    }
    setDataLoading(false);
  };
  
  const handleSave = async () => {
    if (isReadOnlyView) return;
    setSaving(true);
    try {
      // Update user profile data
      await User.updateMyUserData({
        job_title: profileData.job_title,
        preferred_locations: profileData.preferred_locations,
      });

      // Update or create the corresponding employee record
      if (employee) {
        // Update existing employee record
        await Employee.update(employee.id, {
          preferred_zone_id: employeeData.preferred_zone_id,
        });
      } else {
        // Create new employee record if none exists
        // department and work_days are admin managed and not set by user here
        const newEmployeeData = {
          name: user?.full_name || '', 
          email: user?.email || '', 
          preferred_zone_id: employeeData.preferred_zone_id,
          active: true,
        };
        const createdEmployee = await Employee.create(newEmployeeData);
        console.log('Created new employee record:', createdEmployee);
      }

      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });

      // Reload data for the logged-in user to reflect changes
      const params = new URLSearchParams(window.location.search);
      const viewId = params.get('viewId');
      await loadData(viewId);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile changes.",
        variant: "destructive",
      });
    }
    setSaving(false);
  };

  const handleStartTour = () => {
    resetWalkthrough();
    setShowWalkthrough(true);
  };

  const handleWalkthroughComplete = () => {
    setShowWalkthrough(false);
  };
  
  const getMySeatingAssignments = (targetUser, targetEmployee) => {
    if (!targetUser || !targetEmployee) return [];

    const assignments = [];
    
    for (let i = 0; i < 7; i++) {
      const date = addDays(new Date(), i);
      const dateStr = format(date, "yyyy-MM-dd");
      const dayOfWeek = format(date, "EEEE").toLowerCase();

      // Check if employee is scheduled for this day
      if (!targetEmployee?.work_days?.includes(dayOfWeek)) {
        continue;
      }

      // Check manual bookings first
      const manualBooking = bookings.find(b => 
        b.user_email === targetUser.email && 
        b.booking_date === dateStr && 
        b.status !== 'cancelled'
      );

      if (manualBooking) {
        const workspace = workspaces.find(w => w.id === manualBooking.workspace_id);
        assignments.push({
          date,
          dateStr,
          dayOfWeek,
          workspace,
          type: 'manual',
          status: manualBooking.status
        });
        continue;
      }

      // Check daily roster assignment
      // Note: `employees` state contains all employees, not just the target one
      const employeesForDay = employees.filter(
        (e) => e.active && e.work_days?.includes(dayOfWeek)
      );

      const bookingsForDay = bookings.filter(
        (b) => b.booking_date === dateStr && b.status !== "cancelled"
      );

      const assignedWorkspaces = new Set(bookingsForDay.map((b) => b.workspace_id));
      let assignedWorkspace = null;

      // Check dedicated workspace
      if (targetEmployee?.dedicated_workspace_id) {
        const isOccupied = assignedWorkspaces.has(targetEmployee.dedicated_workspace_id);
        if (!isOccupied) {
          assignedWorkspace = workspaces.find(w => w.id === targetEmployee.dedicated_workspace_id);
        }
      } else {
        // Try preferred zone
        if (targetEmployee?.preferred_zone_id) {
          const preferredWorkspaces = workspaces.filter(
            (w) =>
              w.active &&
              w.zone_id === targetEmployee.preferred_zone_id &&
              w.workspace_type === "desk" &&
              !assignedWorkspaces.has(w.id)
          );
          if (preferredWorkspaces.length > 0) {
            assignedWorkspace = preferredWorkspaces[0];
          }
        }

        // Try any available desk
        if (!assignedWorkspace) {
          const anyAvailableDesk = workspaces.filter(
            (w) =>
              w.active &&
              w.workspace_type === "desk" &&
              !assignedWorkspaces.has(w.id)
          );
          if (anyAvailableDesk.length > 0) {
            assignedWorkspace = anyAvailableDesk[0];
          }
        }
      }

      assignments.push({
        date,
        dateStr,
        dayOfWeek,
        workspace: assignedWorkspace,
        type: 'roster',
        status: assignedWorkspace ? 'assigned' : 'unassigned'
      });
    }

    return assignments;
  };

  const getZoneDisplayName = (zoneId) => {
    const zone = zones.find(z => z.id === zoneId);
    if (!zone) return 'Unknown Zone';
    
    const floor = floors.find(f => f.id === zone.floor_id);
    const location = floor ? locations.find(l => l.id === floor.location_id) : null;
    
    return `${location?.name || 'Unknown'} - ${floor?.name || 'Unknown'} - ${zone.name}`;
  };

  const getWorkspaceLocation = (workspace) => {
    if (!workspace) return null;
    
    const zone = zones.find(z => z.id === workspace.zone_id);
    const floor = zone ? floors.find(f => f.id === zone.floor_id) : null;
    const location = floor ? locations.find(l => l.id === floor.location_id) : null;
    
    return {
      zone: zone?.name || 'Unknown Zone',
      floor: floor?.name || 'Unknown Floor',
      location: location?.name || 'Unknown Location'
    };
  };

  if (userLoading || dataLoading) {
    return (
      <div className="p-6 md:p-8 gradient-bg min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-64"></div>
            <div className="h-48 bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  // Use the 'user' and 'employee' states which reflect the current displayed profile
  const seatingAssignments = getMySeatingAssignments(user, employee);
  const assignedLocationName = employee?.assigned_location_id
    ? locations.find(l => l.id === employee.assigned_location_id)?.name || 'Unknown Location'
    : 'Not Assigned';

  return (
    <>
      <SystemWalkthrough
        isOpen={showWalkthrough}
        onClose={() => setShowWalkthrough(false)}
        onComplete={handleWalkthroughComplete}
      />
      <Toaster />
      <div className="p-6 md:p-8 gradient-bg min-h-screen">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                {isReadOnlyView ? <Eye className="w-7 h-7"/> : <UserIcon className="w-7 h-7"/>}
                {isReadOnlyView ? `Viewing: ${viewedEmployeeName}` : 'My Profile'}
              </h1>
              <p className="text-slate-600 mt-1">
                {isReadOnlyView 
                  ? "Viewing employee's work preferences and seating assignments."
                  : "Manage your work preferences and view your seating assignments"
                }
              </p>
            </div>
            <div className="flex gap-2">
              {isReadOnlyView ? (
                <Link to={createPageUrl("Employees")}>
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Employees
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" onClick={handleStartTour}>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Take System Tour
                </Button>
              )}
            </div>
          </div>

          {/* My Seating Assignments */}
          <Card className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Calendar className="w-5 h-5 text-slate-600" />
                Seating Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {seatingAssignments.length > 0 ? (
                <div className="space-y-4">
                  {seatingAssignments.map((assignment) => {
                    const location = getWorkspaceLocation(assignment.workspace);
                    const dateLabel = isToday(assignment.date) ? 'Today' : 
                                    isTomorrow(assignment.date) ? 'Tomorrow' : 
                                    format(assignment.date, 'MMM d');

                    return (
                      <div key={assignment.dateStr} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-500" />
                              <span className="font-medium text-slate-900">{dateLabel}</span>
                              <span className="text-sm text-slate-500">
                                {format(assignment.date, 'EEEE, MMM d')}
                              </span>
                            </div>
                            {assignment.workspace ? (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-slate-500" />
                                <span className="font-medium text-slate-700">
                                  {assignment.workspace.name}
                                </span>
                                <span className="text-sm text-slate-500">
                                  {location?.location} • {location?.floor} • {location?.zone}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-red-400" />
                                <span className="text-red-600">No workspace assigned</span>
                              </div>
                            )}
                          </div>
                          <Badge 
                            variant="outline"
                            className={
                              assignment.type === 'manual' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                              assignment.status === 'assigned' ? 'bg-green-100 text-green-700 border-green-200' :
                              'bg-red-100 text-red-700 border-red-200'
                            }
                          >
                            {assignment.type === 'manual' ? 'Manual Booking' : 
                             assignment.status === 'assigned' ? 'Auto Assigned' : 'Unassigned'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No upcoming office days</p>
                  <p className="text-slate-400 text-sm mt-1">
                    Set office days below to see seating assignments
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Out of Office Section */}
          <OutOfOfficeSection 
            userEmail={user?.email}
            isReadOnly={isReadOnlyView}
            isAdmin={realUser?.role === 'admin'}
          />

          <div className="grid md:grid-cols-2 gap-6">
            {/* Work Details */}
            <Card className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Briefcase className="w-5 h-5 text-slate-600" />
                  Work Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Assigned Location</Label>
                  <Input
                    value={assignedLocationName}
                    disabled={true}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Input
                    value={profileData.department}
                    placeholder="Department managed by admin"
                    disabled={true}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Job Title</Label>
                  <Input
                    value={profileData.job_title}
                    onChange={(e) => setProfileData({...profileData, job_title: e.target.value})}
                    placeholder="Enter job title"
                    disabled={isReadOnlyView}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Office Preferences */}
            <Card className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="w-5 h-5 text-slate-600" />
                  Office Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Preferred Locations</Label>
                  <div className="space-y-2">
                    {locations.map((location) => (
                      <div key={location.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={location.id}
                          checked={profileData.preferred_locations.includes(location.id)}
                          onCheckedChange={(checked) => {
                            if (isReadOnlyView) return;
                            if (checked) {
                              setProfileData({
                                ...profileData,
                                preferred_locations: [...profileData.preferred_locations, location.id]
                              });
                            } else {
                              setProfileData({
                                ...profileData,
                                preferred_locations: profileData.preferred_locations.filter(id => id !== location.id)
                              });
                            }
                          }}
                          disabled={isReadOnlyView}
                        />
                        <label htmlFor={location.id} className="text-sm font-medium">
                          {location.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Office Days</Label>
                  <div className="space-y-2">
                    {workDaysOptions.map((day) => (
                      <div key={day.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`office-${day.id}`}
                          checked={employeeData.work_days.includes(day.id)}
                          disabled={true} // Office days are managed by admin
                        />
                        <label htmlFor={`office-${day.id}`} className="text-sm font-medium text-slate-500 cursor-not-allowed">
                          {day.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Your office days are managed by an administrator. Please contact them to make changes.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Preferred Zone</Label>
                  <Select
                    value={employeeData.preferred_zone_id}
                    onValueChange={(value) => setEmployeeData({
                      ...employeeData,
                      preferred_zone_id: value === 'none' ? '' : value
                    })}
                    disabled={isReadOnlyView}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select preferred zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No preference</SelectItem>
                      {zones.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id}>
                          {getZoneDisplayName(zone.id)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Save Button */}
          {!isReadOnlyView && (
            <div className="flex justify-end">
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="bg-slate-900 hover:bg-slate-800 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
