
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Users as UsersIcon, X, Shield } from "lucide-react"; // Added Shield import
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User } from "@/api/entities"; // Added User import

const workDaysOptions = [
{ id: "sunday", label: "Sunday" },
{ id: "monday", label: "Monday" },
{ id: "tuesday", label: "Tuesday" },
{ id: "wednesday", label: "Wednesday" },
{ id: "thursday", label: "Thursday" }];


export default function EmployeeForm({ employee, workspaces, employees, zones, floors, locations, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: employee?.name || '',
    email: employee?.email || '',
    department: employee?.department || '',
    assigned_location_id: employee?.assigned_location_id || '',
    work_days: employee?.work_days || [],
    dedicated_workspace_id: employee?.dedicated_workspace_id || '',
    preferred_zone_id: employee?.preferred_zone_id || '',
    active: employee?.active ?? true
  });

  const [emailError, setEmailError] = useState('');
  const [userRole, setUserRole] = useState('user'); // New state for user role
  const [userExists, setUserExists] = useState(false); // New state to track if user account exists
  const [loadingUserData, setLoadingUserData] = useState(false); // New state for loading user data

  // Check if user exists and get their role when email changes
  useEffect(() => {
    const checkUserExists = async () => {
      if (!formData.email) {
        setUserExists(false);
        setUserRole('user');
        setLoadingUserData(false);
        return;
      }

      setLoadingUserData(true);
      try {
        const users = await User.filter({ email: formData.email });
        if (users.length > 0) {
          setUserExists(true);
          setUserRole(users[0].role || 'user'); // Set existing role or default to 'user'
        } else {
          setUserExists(false);
          setUserRole('user'); // Default to 'user' if no account found
        }
      } catch (error) {
        console.error("Error checking user:", error);
        setUserExists(false);
        setUserRole('user'); // On error, assume no account or default
      }
      setLoadingUserData(false);
    };

    // Only run if email is provided, to avoid checking for empty string on initial render
    if (formData.email) {
      checkUserExists();
    } else {
      // If email becomes empty, reset state
      setUserExists(false);
      setUserRole('user');
      setLoadingUserData(false);
    }
  }, [formData.email]);

  const handleSubmit = async (e) => {// Made async
    e.preventDefault();

    // Check for duplicate email (only when creating new employee or changing email)
    if (!employee || formData.email.toLowerCase() !== employee.email.toLowerCase()) {
      const existingEmployee = employees.find((emp) =>
      emp.email.toLowerCase() === formData.email.toLowerCase() &&
      emp.id !== employee?.id // Ensure we're not checking against the current employee when editing
      );

      if (existingEmployee) {
        setEmailError(`An employee with email ${formData.email} already exists: ${existingEmployee.name}`);
        return; // Prevent form submission
      }
    }

    setEmailError(''); // Clear error if no duplicate found or email hasn't changed (for existing employee)

    // Submit employee data
    await onSubmit(formData);

    // Update user role if user exists and role changed - with proper error handling
    if (userExists) {
      try {
        const users = await User.filter({ email: formData.email });
        if (users.length > 0 && users[0].role !== userRole) {
          // Use the correct method to update user role
          await User.update(users[0].id, { role: userRole });
          console.log(`User role updated for ${formData.email} to ${userRole}`);
        }
      } catch (error) {
        console.warn("Failed to update user role (but employee was saved):", error);
        // Don't block the form submission for role update failures
      }
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear email error when user changes email
    if (field === 'email') {
      setEmailError('');
    }
  };

  const handleWorkDaysChange = (dayId) => {
    const currentDays = formData.work_days;
    const newDays = currentDays.includes(dayId) ?
    currentDays.filter((d) => d !== dayId) :
    [...currentDays, dayId];
    handleInputChange('work_days', newDays);
  };

  const getAvailableWorkspaces = () => {
    const assignedWorkspaceIds = employees.
    filter((e) => e.id !== employee?.id && e.dedicated_workspace_id).
    map((e) => e.dedicated_workspace_id);

    let filteredWorkspaces = workspaces.filter((w) => !assignedWorkspaceIds.includes(w.id));

    // Filter by selected location if one is chosen
    if (formData.assigned_location_id) {
      const locationZoneIds = zones.
      filter((z) => {
        const floor = floors.find((f) => f.id === z.floor_id);
        return floor?.location_id === formData.assigned_location_id;
      }).
      map((z) => z.id);

      filteredWorkspaces = filteredWorkspaces.filter((w) => locationZoneIds.includes(w.zone_id));
    }

    return filteredWorkspaces;
  };

  const getAvailableZones = () => {
    if (!zones || !floors) return []; // Ensure zones and floors are available

    let filteredZones = zones.filter((z) => z.active);

    if (formData.assigned_location_id) {
      const locationFloorIds = floors.
      filter((f) => f.location_id === formData.assigned_location_id).
      map((f) => f.id);

      filteredZones = filteredZones.filter((z) => locationFloorIds.includes(z.floor_id));
    }

    return filteredZones;
  };

  const getWorkspaceDisplayName = (workspace) => {
    if (!zones || !workspace) return workspace?.name || '';
    const zone = zones.find((z) => z.id === workspace.zone_id);
    const zoneName = zone?.name || 'Unknown Zone';
    return `${zoneName} - ${workspace.name}`;
  };

  const getZoneDisplayName = (zone) => {
    if (!floors || !locations || !zone) return zone?.name || '';
    const floor = floors.find((f) => f.id === zone.floor_id);
    const location = floor ? locations.find((l) => l.id === floor.location_id) : null;
    const floorName = floor?.name || 'Unknown Floor';
    const locationName = location ? location.name : 'Unknown Location';
    return `${locationName} - ${floorName} - ${zone.name}`;
  };

  const availableWorkspaces = getAvailableWorkspaces();
  const availableZones = getAvailableZones();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-xl">
              <UsersIcon className="w-5 h-5 text-slate-600" />
              {employee ? 'Edit Employee' : 'New Employee'}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="max-h-[80vh] overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {emailError && // Display error message if emailError exists
            <Alert variant="destructive">
                <AlertDescription>{emailError}</AlertDescription>
              </Alert>
            }

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} required className="bg-stone-50 text-slate-950 px-3 py-2 text-base flex h-10 w-full rounded-md border border-input ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required className="bg-slate-50 text-slate-950 px-3 py-2 text-base flex h-10 w-full rounded-md border border-input ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" />


              </div>
            </div>

            {/* User Role Section */}
            {formData.email && // Only show this section if an email address is provided
            <div className="p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-slate-600" />
                  <Label className="text-base font-medium">User Account Permissions</Label>
                </div>
                
                {loadingUserData ?
              <div className="flex items-center gap-2 text-sm text-slate-500">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-400"></div>
                    Checking user account...
                  </div> :
              userExists ?
              <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      User account exists
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userRole">Account Role</Label>
                      <Select value={userRole} onValueChange={setUserRole}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User - Basic access</SelectItem>
                          <SelectItem value="admin">Admin - Full access</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div> :

              <div className="text-sm text-slate-600">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      No user account found for this email
                    </div>
                    <p className="text-xs text-slate-500">
                      The employee will need to be invited to access the app after creation.
                    </p>
                  </div>
              }
              </div>
            }
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" value={formData.department} onChange={(e) => handleInputChange('department', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assigned_location_id">Assigned Location</Label>
                <Select
                  value={formData.assigned_location_id}
                  onValueChange={(value) => {
                    handleInputChange('assigned_location_id', value === 'none' ? '' : value);
                    // Reset workspace and zone if location changes to avoid conflicts
                    if (value !== formData.assigned_location_id) {
                      handleInputChange('dedicated_workspace_id', '');
                      handleInputChange('preferred_zone_id', '');
                    }
                  }}>

                  <SelectTrigger>
                    <SelectValue placeholder="Select assigned location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {locations?.filter((l) => l.active).map((l) =>
                    <SelectItem key={l.id} value={l.id}>
                        {l.name}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>In-Office Days</Label>
              <div className="flex flex-wrap gap-4">
                {workDaysOptions.map((day) =>
                <div key={day.id} className="flex items-center space-x-2">
                    <Checkbox
                    id={day.id}
                    checked={formData.work_days.includes(day.id)}
                    onCheckedChange={() => handleWorkDaysChange(day.id)} />

                    <label htmlFor={day.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {day.label}
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dedicated_workspace_id">Dedicated Workspace (Optional)</Label>
              <Select
                value={formData.dedicated_workspace_id}
                onValueChange={(value) => handleInputChange('dedicated_workspace_id', value === 'none' ? '' : value)}>

                <SelectTrigger>
                  <SelectValue placeholder="Select a dedicated desk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {availableWorkspaces.map((w) =>
                  <SelectItem key={w.id} value={w.id}>
                       {getWorkspaceDisplayName(w)}
                     </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferred_zone_id">Preferred Zone (Optional)</Label>
              <Select
                value={formData.preferred_zone_id}
                onValueChange={(value) => handleInputChange('preferred_zone_id', value === 'none' ? '' : value)}>

                <SelectTrigger>
                  <SelectValue placeholder="Select a preferred zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {availableZones.map((z) =>
                  <SelectItem key={z.id} value={z.id}>
                       {getZoneDisplayName(z)}
                     </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch id="active" checked={formData.active} onCheckedChange={(checked) => handleInputChange('active', checked)} />
              <Label htmlFor="active">Active Employee</Label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white">
                {employee ? 'Update' : 'Add'} Employee
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>);

}