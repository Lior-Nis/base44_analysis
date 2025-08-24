import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polygon, Polyline, useMap } from "react-leaflet";
import { motion } from "framer-motion";
import { MapPin, Award, Clock, Square as SquareIcon, Settings, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default markers in React Leaflet
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom markers for different activities
const createCustomIcon = () => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #10B981, #059669); border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
        <div style="width: 12px; height: 12px; background: white; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

// Component to handle live location tracking
function LocationTracker({ isTracking, onLocationUpdate }) {
  const map = useMap();
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (!isTracking) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { lat: latitude, lng: longitude };
        
        setUserLocation(newLocation);
        onLocationUpdate(newLocation);
        
        // Center map on user location
        map.setView([latitude, longitude], map.getZoom());
      },
      (error) => {
        // Silently handle tracking errors - don't throw console errors
        // The main component will handle permission issues
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isTracking, map, onLocationUpdate]);

  return userLocation ? (
    <Marker
      position={[userLocation.lat, userLocation.lng]}
      icon={L.divIcon({
        className: 'live-location-marker',
        html: `
          <div style="position: relative;">
            <div style="width: 16px; height: 16px; background: #3B82F6; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); animation: pulse 2s infinite;"></div>
            <div style="position: absolute; top: -8px; left: -8px; width: 32px; height: 32px; background: rgba(59, 130, 246, 0.3); border-radius: 50%; animation: ping 2s infinite;"></div>
          </div>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      })}
    >
      <Popup>Your current location</Popup>
    </Marker>
  ) : null;
}

export default function MapView({ sessions, currentSession, viewMode, user }) {
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('loading');
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const requestLocation = () => {
    setLocationStatus('loading');
    setErrorMessage('');
    
    if (!navigator.geolocation) {
      setLocationStatus('unavailable');
      setErrorMessage('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
        setLocationStatus('available');
        setErrorMessage('');
      },
      (error) => {
        let message = '';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access was denied. Please enable location permissions to use map features.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable. Please check your connection.';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out. Please try again.';
            break;
          default:
            message = 'An error occurred while retrieving your location.';
            break;
        }
        setErrorMessage(message);
        setLocationStatus('denied');
        
        // Use a default location (major city) so the map still works
        setUserLocation([40.7128, -74.0060]); // New York City
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  const handleLocationUpdate = (newLocation) => {
    if (currentSession) {
      setRouteCoordinates(prev => [...prev, [newLocation.lat, newLocation.lng]]);
    }
  };
  
  if (locationStatus === 'loading') {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="text-center p-8">
          <MapPin className="w-16 h-16 text-emerald-500 animate-bounce mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Finding your location...</h3>
          <p className="text-gray-600">This helps us show your local area and track activities.</p>
        </div>
      </div>
    );
  }

  if (locationStatus === 'unavailable') {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-8 text-center">
        <MapPin className="w-16 h-16 text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-gray-800 mb-2">Geolocation Not Available</h3>
        <p className="text-gray-600 mb-4">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
      
      {/* Location Error Banner */}
      {locationStatus === 'denied' && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                <div>
                  <p className="font-medium">Location Permission Needed</p>
                  <p className="text-sm">{errorMessage}</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={requestLocation}
                className="bg-white hover:bg-yellow-50"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <MapContainer
        center={userLocation || [40.7128, -74.0060]}
        zoom={locationStatus === 'available' ? 15 : 10}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {locationStatus === 'available' && (
          <LocationTracker
            isTracking={currentSession !== null}
            onLocationUpdate={handleLocationUpdate}
          />
        )}

        {routeCoordinates.length > 1 && (
          <Polyline
            positions={routeCoordinates}
            color="#10B981"
            weight={4}
            opacity={0.8}
          />
        )}

        {viewMode === "community" && sessions.map((session) => {
          if (!session.coverage_area || session.coverage_area.length === 0) return null;
          
          const center = session.coverage_area[0];
          
          return (
            <React.Fragment key={session.id}>
              <Polygon
                positions={session.coverage_area.map(coord => [coord.lat, coord.lng])}
                fillColor="#10B981"
                fillOpacity={0.2}
                color="#10B981"
                weight={2}
              />
              
              <Marker
                position={[center.lat, center.lng]}
                icon={createCustomIcon()}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold capitalize mb-2">
                      {session.activity_type.replace(/_/g, ' ')}
                    </h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2"><SquareIcon className="w-3 h-3" /><span>{session.area_covered_sqft?.toLocaleString()} sq ft</span></div>
                      <div className="flex items-center gap-2"><Clock className="w-3 h-3" /><span>{session.duration_minutes} min</span></div>
                      <div className="flex items-center gap-2"><Award className="w-3 h-3" /><span>{session.points_earned} points</span></div>
                      {session.location_name && (<div className="flex items-center gap-2"><MapPin className="w-3 h-3" /><span>{session.location_name}</span></div>)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}

        {viewMode === "personal" && sessions
          .filter(session => session.created_by === user?.email)
          .map((session) => {
            if (!session.coverage_area || session.coverage_area.length === 0) return null;
            
            const center = session.coverage_area[0];
            
            return (
              <React.Fragment key={session.id}>
                <Polygon
                  positions={session.coverage_area.map(coord => [coord.lat, coord.lng])}
                  fillColor="#3B82F6"
                  fillOpacity={0.3}
                  color="#3B82F6"
                  weight={3}
                />
                
                <Marker
                  position={[center.lat, center.lng]}
                  icon={createCustomIcon()}
                >
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-semibold capitalize mb-2">
                        Your {session.activity_type.replace(/_/g, ' ')}
                      </h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2"><SquareIcon className="w-3 h-3" /><span>{session.area_covered_sqft?.toLocaleString()} sq ft</span></div>
                        <div className="flex items-center gap-2"><Clock className="w-3 h-3" /><span>{session.duration_minutes} min</span></div>
                        <div className="flex items-center gap-2"><Award className="w-3 h-3" /><span>{session.points_earned} points</span></div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            );
          })}
      </MapContainer>
    </div>
  );
}