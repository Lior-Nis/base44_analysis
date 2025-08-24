
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, MapPin, Clock, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../ui/theme-provider';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createTutorIcon = (rating) => {
  const color = rating >= 4.5 ? '#10b981' : rating >= 4.0 ? '#f59e0b' : '#6b7280';
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: white;
        font-weight: bold;
      ">⭐</div>
    `,
    className: 'custom-tutor-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 20]
  });
};

const translations = {
  he: {
    tutorsMap: 'מפת מורים',
    noLocation: 'אין נתוני מיקום',
    bookLesson: 'הזמן שיעור',
    perHour: 'לשעה',
    lessons: 'שיעורים',
    rating: 'דירוג',
    responseTime: 'זמן תגובה',
    hours: 'שעות'
  },
  en: {
    tutorsMap: 'Tutors Map',
    noLocation: 'No location data',
    bookLesson: 'Book Lesson',
    perHour: 'per hour',
    lessons: 'lessons',
    rating: 'Rating',
    responseTime: 'Response time',
    hours: 'hours'
  }
};

export default function TutorMapView({ tutors, onTutorClick, language = 'en' }) {
  const [mapCenter, setMapCenter] = useState([32.0853, 34.7818]); // Default to Tel Aviv
  const [selectedTutor, setSelectedTutor] = useState(null);
  const { themeClasses } = useTheme();
  const t = translations[language];

  useEffect(() => {
    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log('Geolocation error:', error);
          // Stay with default location (Tel Aviv)
        }
      );
    }
  }, []);

  // Filter tutors that have location data
  const tutorsWithLocation = tutors.filter(tutor => 
    tutor.primary_location?.coordinates?.lat && 
    tutor.primary_location?.coordinates?.lng
  );

  if (typeof window === 'undefined') {
    return (
      <Card className={themeClasses.cardGlass}>
        <CardContent className="p-8 text-center">
          <div className="h-96 bg-gray-200/20 rounded-lg animate-pulse flex items-center justify-center">
            <MapPin className="w-12 h-12 text-white/30" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className={themeClasses.cardGlass}>
        <CardContent className="p-0">
          <div className="h-full w-full relative">
            <MapContainer 
              center={mapCenter} 
              zoom={8} 
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={true}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
                attribution=''
              />
              
              {tutorsWithLocation.map((tutor) => (
                <Marker
                  key={tutor.id}
                  position={[
                    tutor.primary_location.coordinates.lat,
                    tutor.primary_location.coordinates.lng
                  ]}
                  icon={createTutorIcon(tutor.rating_avg || 0)}
                  eventHandlers={{
                    click: () => setSelectedTutor(tutor)
                  }}
                >
                  <Popup className="custom-popup">
                    <div className="p-3 min-w-64" dir={language === 'he' ? 'rtl' : 'ltr'}>
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar className="w-10 h-10 border-2 border-white">
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-semibold">
                            {tutor.user?.full_name?.[0] || 'T'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {tutor.user?.full_name || 'מורה'}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            {tutor.rating_avg > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                <span className="text-xs text-gray-600">
                                  {tutor.rating_avg.toFixed(1)} ({tutor.rating_count || 0})
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-emerald-600">
                            ₪{tutor.hourly_rate}
                          </div>
                          <div className="text-xs text-gray-500">
                            {t.perHour}
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {tutor.description || (language === 'he' ? 'מורה מנוסה ומסור' : 'Experienced and dedicated tutor')}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          <span>{tutor.completed_lessons || 0} {t.lessons}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{tutor.response_time || 24}{t.hours}</span>
                        </div>
                      </div>

                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onTutorClick(tutor);
                        }}
                        className="w-full bg-purple-500 hover:bg-purple-600 text-white text-xs"
                        size="sm"
                      >
                        {t.bookLesson}
                      </Button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Selected Tutor Info Panel */}
      {selectedTutor && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:relative md:bottom-auto md:left-auto md:right-auto"
        >
          <Card className={`${themeClasses.cardGlass} border-purple-500/30`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border-2 border-white/20">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                      {selectedTutor.user?.full_name?.[0] || 'T'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className={`font-semibold ${themeClasses.textPrimary}`}>
                      {selectedTutor.user?.full_name || 'מורה'}
                    </h3>
                    <div className="flex items-center gap-2">
                      {selectedTutor.rating_avg > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-sm text-yellow-400">
                            {selectedTutor.rating_avg.toFixed(1)}
                          </span>
                        </div>
                      )}
                      <span className="text-sm text-emerald-400 font-medium">
                        ₪{selectedTutor.hourly_rate} {t.perHour}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => onTutorClick(selectedTutor)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  {t.bookLesson}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* No Location Data Message */}
      {tutorsWithLocation.length === 0 && (
        <Card className={themeClasses.cardGlass}>
          <CardContent className="p-8 text-center">
            <MapPin className="w-12 h-12 text-white/30 mx-auto mb-4" />
            <h3 className={`text-lg font-semibold ${themeClasses.textPrimary} mb-2`}>
              {t.noLocation}
            </h3>
            <p className={themeClasses.textMuted}>
              {language === 'he' 
                ? 'אין מורים עם נתוני מיקום כרגע. נסה את תצוגת הרשימה.'
                : 'No tutors with location data available. Try the list view.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
