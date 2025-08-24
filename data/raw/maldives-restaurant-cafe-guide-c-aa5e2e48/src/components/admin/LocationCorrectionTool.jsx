import React, { useState, useEffect } from 'react';
import { Restaurant, Location } from '@/api/entities';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Save, Search, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import L from 'leaflet';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function DraggableMarker({ position, onPositionChange, restaurant }) {
  useMapEvents({
    click(e) {
      onPositionChange(restaurant.id, [e.latlng.lat, e.latlng.lng]);
    },
  });

  return (
    <Marker 
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const position = marker.getLatLng();
          onPositionChange(restaurant.id, [position.lat, position.lng]);
        },
      }}
    />
  );
}

export default function LocationCorrectionTool() {
  const [restaurants, setRestaurants] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [restaurantPositions, setRestaurantPositions] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [mapCenter, setMapCenter] = useState([4.1755, 73.5093]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [restaurantData, locationData] = await Promise.all([
        Restaurant.filter({ status: 'approved' }),
        Location.list()
      ]);

      // Enrich restaurants with location names
      const enrichedRestaurants = restaurantData.map(restaurant => {
        const location = locationData.find(loc => loc.id === restaurant.location_id);
        return {
          ...restaurant,
          location_name: location ? location.name : 'Unknown Location'
        };
      });

      setRestaurants(enrichedRestaurants);
      setLocations(locationData);
      
      // Initialize positions
      const positions = {};
      enrichedRestaurants.forEach(restaurant => {
        positions[restaurant.id] = [restaurant.latitude, restaurant.longitude];
      });
      setRestaurantPositions(positions);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setIsLoading(false);
  };

  const handlePositionChange = (restaurantId, newPosition) => {
    setRestaurantPositions(prev => ({
      ...prev,
      [restaurantId]: newPosition
    }));
  };

  const handleSavePosition = async (restaurantId) => {
    setIsSaving(true);
    try {
      const newPosition = restaurantPositions[restaurantId];
      await Restaurant.update(restaurantId, {
        latitude: newPosition[0],
        longitude: newPosition[1]
      });
      
      // Update local state
      setRestaurants(prev => prev.map(r => 
        r.id === restaurantId 
          ? { ...r, latitude: newPosition[0], longitude: newPosition[1] }
          : r
      ));
      
      alert('Location updated successfully!');
    } catch (error) {
      console.error('Error saving position:', error);
      alert('Error saving location. Please try again.');
    }
    setIsSaving(false);
  };

  const handleRestaurantSelect = (restaurantId) => {
    setSelectedRestaurant(restaurantId);
    const restaurant = restaurants.find(r => r.id === restaurantId);
    if (restaurant) {
      setMapCenter([restaurant.latitude, restaurant.longitude]);
    }
  };

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    restaurant.location_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedRestaurantData = restaurants.find(r => r.id === selectedRestaurant);

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <div className="w-12 h-12 border-4 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[var(--text-muted)]">Loading location correction tool...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Location Correction Tool</h2>
        <p className="text-gray-600">Click on the map or drag markers to correct restaurant locations</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Restaurant Selection */}
        <div className="lg:col-span-1">
          <Card className="tropical-shadow">
            <CardHeader>
              <CardTitle className="text-lg">Select Restaurant</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="search">Search Restaurants</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Search by name or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="restaurant-select">Restaurant</Label>
                <Select value={selectedRestaurant} onValueChange={handleRestaurantSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a restaurant" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredRestaurants.map((restaurant) => (
                      <SelectItem key={restaurant.id} value={restaurant.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{restaurant.name}</span>
                          <span className="text-sm text-gray-500">{restaurant.location_name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedRestaurantData && (
                <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <h4 className="font-medium">{selectedRestaurantData.name}</h4>
                  <div className="text-sm space-y-1">
                    <p><strong>Location:</strong> {selectedRestaurantData.location_name}</p>
                    <p><strong>Current Coordinates:</strong></p>
                    <p className="font-mono text-xs">
                      {restaurantPositions[selectedRestaurant]?.[0].toFixed(6)}, {restaurantPositions[selectedRestaurant]?.[1].toFixed(6)}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleSavePosition(selectedRestaurant)}
                    disabled={isSaving}
                    className="w-full btn-primary"
                    size="sm"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Position
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Map */}
        <div className="lg:col-span-2">
          <Card className="tropical-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Interactive Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 rounded-lg overflow-hidden border">
                <MapContainer
                  center={mapCenter}
                  zoom={selectedRestaurant ? 15 : 8}
                  style={{ height: '100%', width: '100%' }}
                  key={`${mapCenter[0]}-${mapCenter[1]}-${selectedRestaurant}`}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  {selectedRestaurant ? (
                    // Show only selected restaurant with draggable marker
                    <DraggableMarker
                      position={restaurantPositions[selectedRestaurant]}
                      onPositionChange={handlePositionChange}
                      restaurant={selectedRestaurantData}
                    />
                  ) : (
                    // Show all restaurants with static markers
                    restaurants.map((restaurant) => (
                      <Marker
                        key={restaurant.id}
                        position={restaurantPositions[restaurant.id]}
                        eventHandlers={{
                          click: () => handleRestaurantSelect(restaurant.id)
                        }}
                      />
                    ))
                  )}
                </MapContainer>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {selectedRestaurant 
                  ? "Click on the map or drag the marker to reposition the restaurant"
                  : "Click on any marker to select a restaurant, or use the dropdown above"
                }
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}