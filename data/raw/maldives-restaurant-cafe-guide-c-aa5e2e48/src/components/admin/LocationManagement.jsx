
import React, { useState, useEffect } from 'react';
import { Location } from '@/api/entities';
import { Plus, Edit3, Trash2, MapPin, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle }
  from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }
  from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle }
  from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
// Removed LocationCombobox as it's no longer used
// import { LocationCombobox } from '@/components/ui/location-combobox'; 

export default function LocationManagement({ locations, onLocationsUpdate }) {
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationForm, setLocationForm] = useState({
    name: '',
    type: 'island',
    parent_id: '',
    latitude: '',
    longitude: '',
    description: '',
    display_on_map: true
  });

  // Derived state for display and combobox
  const atolls = locations.filter(l => l.type === 'atoll').map(atoll => ({
    ...atoll,
    display_name: atoll.name // Add display_name for combobox
  }));
  const islands = locations.filter(l => l.type === 'island');

  const handleAddLocation = () => {
    setEditingLocation(null);
    setLocationForm({
      name: '',
      type: 'island',
      parent_id: '',
      latitude: '',
      longitude: '',
      description: '',
      display_on_map: true
    });
    setShowLocationForm(true);
  };

  const handleEditLocation = (location) => {
    setEditingLocation(location);
    setLocationForm({
      name: location.name,
      type: location.type,
      parent_id: location.parent_id || '',
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      description: location.description || '',
      display_on_map: location.display_on_map
    });
    setShowLocationForm(true);
  };

  const handleDeleteLocation = async (locationId) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      try {
        await Location.delete(locationId);
        const updatedLocations = locations.filter(l => l.id !== locationId);
        onLocationsUpdate(updatedLocations);
      } catch (error) {
        console.error('Error deleting location:', error);
      }
    }
  };

  const handleSubmitLocation = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const locationData = {
        ...locationForm,
        latitude: parseFloat(locationForm.latitude),
        longitude: parseFloat(locationForm.longitude),
        parent_id: locationForm.parent_id || null
      };

      if (editingLocation) {
        await Location.update(editingLocation.id, locationData);
        const updatedLocations = locations.map(l =>
          l.id === editingLocation.id ? { ...l, ...locationData } : l
        );
        onLocationsUpdate(updatedLocations);
      } else {
        const newLocation = await Location.create(locationData);
        onLocationsUpdate([...locations, newLocation]);
      }

      setShowLocationForm(false);
    } catch (error) {
      console.error('Error saving location:', error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Location Management</h2>
          <p className="text-gray-600">Manage atolls and islands in the Maldives</p>
        </div>
        <Button onClick={handleAddLocation} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Location
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="tropical-shadow">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{atolls.length}</div>
            <div className="text-gray-600">Total Atolls</div>
          </CardContent>
        </Card>
        <Card className="tropical-shadow">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{islands.length}</div>
            <div className="text-gray-600">Total Islands</div>
          </CardContent>
        </Card>
        <Card className="tropical-shadow">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {locations.filter(l => l.display_on_map).length}
            </div>
            <div className="text-gray-600">Visible on Map</div>
          </CardContent>
        </Card>
      </div>

      {/* Atolls */}
      <Card className="tropical-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Atolls ({atolls.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {atolls.map((atoll) => (
              <div key={atoll.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{atoll.name}</h3>
                  <Badge variant={atoll.display_on_map ? 'default' : 'secondary'}>
                    {atoll.display_on_map ? 'Visible' : 'Hidden'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {atoll.description || 'No description provided'}
                </p>
                <div className="text-xs text-gray-500 mb-3">
                  {atoll.latitude.toFixed(4)}, {atoll.longitude.toFixed(4)}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditLocation(atoll)}
                  >
                    <Edit3 className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteLocation(atoll.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Islands */}
      <Card className="tropical-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Islands ({islands.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {islands.map((island) => {
              const parentAtoll = atolls.find(a => a.id === island.parent_id);
              return (
                <div key={island.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{island.name}</h3>
                    <Badge variant={island.display_on_map ? 'default' : 'secondary'}>
                      {island.display_on_map ? 'Visible' : 'Hidden'}
                    </Badge>
                  </div>
                  {parentAtoll && (
                    <p className="text-sm text-blue-600 mb-2">
                      Part of {parentAtoll.name}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {island.description || 'No description provided'}
                  </p>
                  <div className="text-xs text-gray-500 mb-3">
                    {island.latitude.toFixed(4)}, {island.longitude.toFixed(4)}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditLocation(island)}
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteLocation(island.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Location Form Dialog */}
      <Dialog open={showLocationForm} onOpenChange={setShowLocationForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? 'Edit Location' : 'Add New Location'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmitLocation} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Location Name *</Label>
                <Input
                  id="name"
                  value={locationForm.name}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter location name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Location Type *</Label>
                <Select
                  value={locationForm.type}
                  onValueChange={(value) => setLocationForm(prev => ({
                    ...prev,
                    type: value,
                    parent_id: value === 'atoll' ? '' : prev.parent_id
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="atoll">Atoll</SelectItem>
                    <SelectItem value="island">Island</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {locationForm.type === 'island' && (
              <div>
                <Label>Parent Atoll *</Label> {/* Removed htmlFor="parent_atoll" */}
                <Select
                  value={locationForm.parent_id}
                  onValueChange={(value) => setLocationForm(prev => ({ ...prev, parent_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent atoll" />
                  </SelectTrigger>
                  <SelectContent>
                    {atolls.map(atoll => (
                      <SelectItem key={atoll.id} value={atoll.id}>
                        {atoll.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={locationForm.description}
                onChange={(e) => setLocationForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the location"
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude *</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={locationForm.latitude}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, latitude: e.target.value }))}
                  placeholder="e.g., 4.1755"
                  required
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude *</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={locationForm.longitude}
                  onChange={(e) => setLocationForm(prev => ({ ...prev, longitude: e.target.value }))}
                  placeholder="e.g., 73.5093"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Display on Map</Label>
                <p className="text-sm text-gray-600">Show this location on the public map</p>
              </div>
              <Switch
                checked={locationForm.display_on_map}
                onCheckedChange={(checked) => setLocationForm(prev => ({ ...prev, display_on_map: checked }))}
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLocationForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !locationForm.name || !locationForm.latitude || !locationForm.longitude}
                className="ocean-gradient text-white"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {editingLocation ? 'Update Location' : 'Add Location'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
