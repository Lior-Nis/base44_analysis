
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Users, X } from "lucide-react";

const zoneTypes = [
  { value: 'open_desk', label: 'Open Desk Area' },
  { value: 'private_office', label: 'Private Office' },
  { value: 'meeting_room', label: 'Meeting Room' },
  { value: 'collaboration_space', label: 'Collaboration Space' },
  { value: 'phone_booth', label: 'Phone Booth' }
];

export default function ZoneForm({ zone, floorId, floors, locations, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: zone?.name || '',
    description: zone?.description || '',
    zone_type: zone?.zone_type || 'open_desk',
    capacity: zone?.capacity || 1,
    active: zone?.active ?? true,
    floor_id: zone?.floor_id || floorId || ''
  });
  
  const [selectedLocationId, setSelectedLocationId] = useState('');
  
  useEffect(() => {
    if (formData.floor_id) {
      const floor = floors.find(f => f.id === formData.floor_id);
      if (floor) {
        setSelectedLocationId(floor.location_id);
      }
    }
  }, [formData.floor_id, floors]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const { floor_id, ...dataToSubmit } = formData;
    onSubmit({ ...dataToSubmit, floor_id: formData.floor_id });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationChange = (locationId) => {
    setSelectedLocationId(locationId);
    handleInputChange('floor_id', ''); // Reset floor when location changes
  };

  const filteredFloors = floors?.filter(f => f.location_id === selectedLocationId && f.active);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="w-5 h-5 text-slate-600" />
              {zone ? 'Edit Zone' : 'New Zone'}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="max-h-[80vh] overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!floorId && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select value={selectedLocationId} onValueChange={handleLocationChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations?.filter(loc => loc.active).map(loc => (
                        <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floor">Floor</Label>
                  <Select
                    value={formData.floor_id}
                    onValueChange={(value) => handleInputChange('floor_id', value)}
                    disabled={!selectedLocationId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a floor" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredFloors?.map(f => (
                        <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Zone Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Executive Wing, Open Area, etc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zone_type">Zone Type</Label>
              <Select 
                value={formData.zone_type} 
                onValueChange={(value) => handleInputChange('zone_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select zone type" />
                </SelectTrigger>
                <SelectContent>
                  {zoneTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
                placeholder="Maximum number of workspaces"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of this zone..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => handleInputChange('active', checked)}
              />
              <Label htmlFor="active">Active Zone</Label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-slate-900 hover:bg-slate-800 text-white"
                disabled={!formData.floor_id}
              >
                {zone ? 'Update' : 'Create'} Zone
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
