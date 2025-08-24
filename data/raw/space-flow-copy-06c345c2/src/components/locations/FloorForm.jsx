
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, X } from "lucide-react";

export default function FloorForm({ floor, locationId, locations, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: floor?.name || '',
    description: floor?.description || '',
    floor_plan_url: floor?.floor_plan_url || '',
    active: floor?.active ?? true,
    location_id: floor?.location_id || locationId || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const selectedLocation = locations?.find(l => l.id === formData.location_id);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-xl">
              <MapPin className="w-5 h-5 text-slate-600" />
              {floor ? 'Edit Floor' : 'New Floor'}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          {selectedLocation && (
            <p className="text-sm text-slate-500">
              Location: {selectedLocation.name}
            </p>
          )}
        </CardHeader>
        <CardContent className="max-h-[80vh] overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!locationId && (
              <div className="space-y-2">
                <Label htmlFor="location_id">Location</Label>
                <Select
                  value={formData.location_id}
                  onValueChange={(value) => handleInputChange('location_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations?.filter(loc => loc.active).map(location => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Floor Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="2nd Floor, Ground Level, etc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of this floor..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="floor_plan_url">Floor Plan URL (Optional)</Label>
              <Input
                id="floor_plan_url"
                value={formData.floor_plan_url}
                onChange={(e) => handleInputChange('floor_plan_url', e.target.value)}
                placeholder="https://example.com/floorplan.png"
                type="url"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => handleInputChange('active', checked)}
              />
              <Label htmlFor="active">Active Floor</Label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-slate-900 hover:bg-slate-800 text-white"
                disabled={!formData.location_id}
              >
                {floor ? 'Update' : 'Create'} Floor
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
