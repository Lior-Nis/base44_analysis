
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, X, Users, MapPin } from "lucide-react";

export default function ConflictResolution({ 
  conflict, 
  workspaces, 
  zones, 
  onResolve, 
  onCancel, 
  resolving 
}) {
  const [resolutionType, setResolutionType] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] = useState('');

  const getAvailableWorkspaces = () => {
    // For dedicated workspace conflicts, find alternative workspaces
    if (conflict.type === 'dedicated_workspace') {
      return workspaces.filter(w => 
        w.workspace_type === 'desk' && 
        w.id !== conflict.workspace?.id &&
        w.active
      );
    }
    // For dedicated_location_mismatch conflicts where reassigning dedicated, find dedicated workspaces in the correct location
    if (conflict.type === 'dedicated_location_mismatch' && resolutionType === 'reassign_dedicated') {
      // Assuming 'dedicated' workspaces are identified by a property, or are a subset of 'desk'
      // and we need to filter by the desired target location (e.g., conflict.workspaceLocation.id)
      return workspaces.filter(w => 
        w.workspace_type === 'desk' && // Or w.workspace_type === 'dedicated_desk' if it's a specific type
        w.location_id === conflict.workspaceLocation?.id &&
        w.active
      );
    }
    // For reassign_workspace from location_mismatch, find desks in the correct location
    if (conflict.type === 'location_mismatch' && resolutionType === 'reassign_workspace') {
      return workspaces.filter(w =>
        w.workspace_type === 'desk' &&
        w.location_id === conflict.bookingLocation?.id && // Filter by the correct booking location
        w.active
      );
    }
    return workspaces.filter(w => w.workspace_type === 'desk' && w.active);
  };

  const getResolutionOptions = () => {
    switch (conflict.type) {
      case 'dedicated_workspace':
        return [
          { value: 'cancel_booking', label: 'Cancel conflicting booking' },
          { value: 'reassign_workspace', label: 'Reassign to different workspace' },
          { value: 'remove_dedicated', label: 'Remove dedicated workspace assignment' }
        ];
      case 'location_mismatch':
        return [
          { value: 'cancel_booking', label: 'Cancel booking at wrong location' },
          { value: 'reassign_workspace', label: 'Reassign to correct location' },
          { value: 'update_employee_location', label: 'Update employee location assignment' }
        ];
      case 'dedicated_location_mismatch':
        return [
          { value: 'reassign_dedicated', label: 'Reassign dedicated workspace to correct location' },
          { value: 'update_employee_location', label: 'Update employee location assignment' }
        ];
      case 'overcapacity':
        return [
          { value: 'reassign_workspace', label: 'Reassign some bookings' },
          { value: 'cancel_booking', label: 'Cancel some bookings' }
        ];
      case 'insufficient_capacity':
        return [
          { value: 'enable_remote', label: 'Suggest remote work' },
          { value: 'reschedule', label: 'Reschedule some employees' }
        ];
      default:
        return [];
    }
  };

  const handleResolve = () => {
    const resolution = { type: resolutionType };

    switch (resolutionType) {
      case 'cancel_booking':
        if (conflict.conflictingBooking || conflict.booking) {
          resolution.bookingId = (conflict.conflictingBooking || conflict.booking).id;
        }
        break;
      case 'reassign_workspace':
        if (selectedWorkspace) {
          resolution.bookingId = (conflict.conflictingBooking || conflict.booking)?.id;
          resolution.newWorkspaceId = selectedWorkspace;
        }
        break;
      case 'remove_dedicated':
        resolution.employeeId = conflict.employee?.id;
        resolution.updates = { dedicated_workspace_id: null };
        break;
      case 'update_employee_location':
        resolution.employeeId = conflict.employee?.id;
        if (conflict.bookingLocation) { // For location_mismatch
          resolution.updates = { assigned_location_id: conflict.bookingLocation.id };
        } else if (conflict.workspaceLocation) { // For dedicated_location_mismatch
          resolution.updates = { assigned_location_id: conflict.workspaceLocation.id };
        }
        break;
      case 'reassign_dedicated':
        if (selectedWorkspace) {
          resolution.employeeId = conflict.employee?.id;
          resolution.updates = { dedicated_workspace_id: selectedWorkspace };
        }
        break;
    }

    onResolve(conflict, resolution);
  };

  const canResolve = () => {
    if (!resolutionType) return false;
    
    if (resolutionType === 'reassign_workspace' || resolutionType === 'reassign_dedicated') {
      return selectedWorkspace !== '';
    }
    
    return true;
  };

  const availableWorkspaces = getAvailableWorkspaces();
  const resolutionOptions = getResolutionOptions();

  return (
    <Card className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Resolve Conflict
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Conflict Details */}
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="space-y-2">
              <p className="font-medium text-amber-800">{conflict.description}</p>
              <div className="text-sm text-amber-600">
                Date: {new Date(conflict.date).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Resolution Options */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Resolution Method
            </label>
            <Select value={resolutionType} onValueChange={setResolutionType}>
              <SelectTrigger>
                <SelectValue placeholder="Select resolution method" />
              </SelectTrigger>
              <SelectContent>
                {resolutionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(resolutionType === 'reassign_workspace' || resolutionType === 'reassign_dedicated') && (
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                New Workspace
              </label>
              <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new workspace" />
                </SelectTrigger>
                <SelectContent>
                  {availableWorkspaces.map((workspace) => {
                    const zone = zones.find(z => z.id === workspace.zone_id);
                    return (
                      <SelectItem key={workspace.id} value={workspace.id}>
                        {zone?.name} - {workspace.name} {workspace.location_id ? `(${workspace.location_id})` : ''}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Conflict-specific details */}
        {conflict.type === 'dedicated_workspace' && (
          <div className="space-y-3">
            <h4 className="font-medium text-slate-700">Affected Parties</h4>
            <div className="space-y-2">
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span className="font-medium text-slate-700">Employee</span>
                </div>
                <p className="text-sm text-slate-600">
                  {conflict.employee?.name} ({conflict.employee?.email})
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span className="font-medium text-slate-700">Conflicting Booking</span>
                </div>
                <p className="text-sm text-slate-600">
                  {conflict.conflictingBooking?.user_email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Location conflict details */}
        {(conflict.type === 'location_mismatch' || conflict.type === 'dedicated_location_mismatch') && (
          <div className="space-y-3">
            <h4 className="font-medium text-slate-700">Location Details</h4>
            <div className="space-y-2">
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span className="font-medium text-slate-700">Employee</span>
                </div>
                <p className="text-sm text-slate-600">
                  {conflict.employee?.name} assigned to {conflict.assignedLocation?.name || 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-slate-500" />
                  <span className="font-medium text-slate-700">Actual Location</span>
                </div>
                <p className="text-sm text-slate-600">
                  {conflict.bookingLocation?.name || conflict.workspaceLocation?.name || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}

        {conflict.type === 'overcapacity' && (
          <div className="space-y-3">
            <h4 className="font-medium text-slate-700">Zone Details</h4>
            <div className="p-3 bg-slate-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{conflict.zone?.name}</span>
                <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                  Over Capacity
                </Badge>
              </div>
              <div className="text-sm text-slate-600">
                {conflict.bookings?.length} people assigned / {Math.min(conflict.capacity, conflict.workspaceCount)} capacity
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleResolve}
            disabled={!canResolve() || resolving}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {resolving ? 'Resolving...' : 'Resolve Conflict'}
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={resolving}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
