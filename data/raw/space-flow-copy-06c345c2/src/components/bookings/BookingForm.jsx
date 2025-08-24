
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, X } from "lucide-react";

export default function BookingForm({
  workspaces,
  zones,
  floors,
  locations,
  selectedDate,
  onSubmit,
  onCancel,
  currentUserAssignment
}) {
  const [formData, setFormData] = useState({
    workspace_id: '',
    booking_date: selectedDate,
    start_time: '09:00',
    end_time: '17:00',
    notes: ''
  });

  const getWorkspaceLocation = (workspace) => {
    const zone = zones.find(z => z.id === workspace.zone_id);
    const floor = zone ? floors.find(f => f.id === zone.floor_id) : null;
    const location = floor ? locations.find(l => l.id === floor.location_id) : null;

    return `${location?.name || 'Unknown'} • ${floor?.name || 'Unknown'} • ${zone?.name || 'Unknown'}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validation is now handled by the parent component's `onSubmit`
    onSubmit(formData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const userAlreadyAssigned = !!currentUserAssignment;

  return (
    <Card className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Calendar className="w-5 h-5 text-slate-600" />
            New Booking
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {userAlreadyAssigned && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              <p className="text-orange-800 font-medium">
                You are already scheduled for {formData.booking_date}
              </p>
            </div>
            <p className="text-orange-700 text-sm mt-1">
              Your assignment status is "{currentUserAssignment.status}". You cannot make a new manual booking.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="workspace">Workspace</Label>
            <Select
              value={formData.workspace_id}
              onValueChange={(value) => handleInputChange('workspace_id', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a workspace" />
              </SelectTrigger>
              <SelectContent>
                {workspaces.map((workspace) => (
                  <SelectItem key={workspace.id} value={workspace.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{workspace.name}</span>
                      <span className="text-xs text-slate-500">
                        {getWorkspaceLocation(workspace)}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.booking_date}
                onChange={(e) => handleInputChange('booking_date', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => handleInputChange('start_time', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_time">End Time</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => handleInputChange('end_time', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special requirements or notes..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white"
              disabled={!formData.workspace_id || userAlreadyAssigned}
            >
              {userAlreadyAssigned ? `Already assigned (${currentUserAssignment.status})` : 'Create Booking'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
