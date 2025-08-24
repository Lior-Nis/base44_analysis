
import React, { useState, useEffect } from "react";
import { CampusEvent } from "@/api/entities";
import { TutorProfile } from "@/api/entities";
import { TutorLocation } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, ArrowRight, Users as UsersIcon, Star, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { usePermissionContext } from '../permissions/PermissionProvider';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const createEventIcon = (color = '#3b82f6') => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: white;
        font-weight: bold;
      ">🎓</div>
    `,
    className: 'custom-div-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 24]
  });
};

const createTutorIcon = (rating) => {
  const color = rating >= 4.5 ? '#10b981' : rating >= 4.0 ? '#f59e0b' : '#8b5cf6';
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: white;
        font-weight: bold;
      ">👨‍🏫</div>
    `,
    className: 'custom-tutor-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 24]
  });
};

const eventTypeColors = {
  study_group: "#3b82f6",
  quiet_spot: "#10b981", 
  social_event: "#ec4899",
  help_session: "#8b5cf6",
  project_meetup: "#f59e0b",
  academic_lecture: "#06b6d4"
};

const eventTypeTranslations = {
  study_group: { he: "קבוצת לימוד", en: "Study Group" },
  quiet_spot: { he: "מקום שקט", en: "Quiet Spot" },
  social_event: { he: "אירוע חברתי", en: "Social Event" },
  help_session: { he: "מפגש עזרה", en: "Help Session" },
  project_meetup: { he: "פגישת פרויקט", en: "Project Meetup" },
  academic_lecture: { he: "הרצאה אקדמית", en: "Academic Lecture" }
};

export default function LiveCampusPreview({ language = 'he' }) {
  const [events, setEvents] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // שינוי למרכז הארץ וזום נמוך יותר לתצוגת כל הארץ
  const [mapCenter, setMapCenter] = useState([31.5, 34.8]); // מרכז ישראל
  const [mapZoom, setMapZoom] = useState(8); // זום נמוך יותר לראיית כל הארץ
  const [totalItems, setTotalItems] = useState(0);

  const { requestPermission, hasPermission } = usePermissionContext();

  const t = {
    he: {
      campusLive: "קמפוס LIVE",
      happeningNow: "פעילות ברחבי הארץ",
      viewFullMap: "צפה במפה המלאה",
      viewFullCampus: "גלה את הקמפוס",
      events: "אירועים",
      tutors: "מורים",
      bookLesson: "הזמן שיעור",
      joinEvent: "הצטרף",
      perHour: "לשעה",
      participants: "משתתפים",
      countryWide: "פעילות ארצית",
      myLocation: "המיקום שלי",
      defaultTutorName: "מורה", // New translation
      lessons: "שיעורים",     // New translation
      defaultLocation: "מיקום",   // New translation
      map: "מפה" // New translation for the map button for mobile
    },
    en: {
      campusLive: "Campus LIVE",
      happeningNow: "Activity across the country",
      viewFullMap: "View Full Map",
      viewFullCampus: "Explore Campus",
      events: "Events",
      tutors: "Tutors",
      bookLesson: "Book Lesson",
      joinEvent: "Join",
      perHour: "per hour",
      participants: "participants",
      countryWide: "Nationwide Activity",
      myLocation: "My Location",
      defaultTutorName: "Tutor", // New translation
      lessons: "lessons",     // New translation
      defaultLocation: "Location",   // New translation
      map: "Map" // New translation for the map button for mobile
    }
  }[language];

  useEffect(() => {
    loadData();
  }, []);

  const getCurrentLocationWithPermission = async () => {
    try {
      // Request location permission first
      const permissionStatus = await requestPermission('location');
      
      if (permissionStatus !== 'granted') {
        console.log('Location permission not granted');
        return;
      }

      // Now get location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setMapCenter([position.coords.latitude, position.coords.longitude]);
            setMapZoom(13); // Zoom in when we have user's location
          },
          (error) => {
            console.log('Geolocation error:', error);
          }
        );
      }
    } catch (error) {
      console.error('Permission request error:', error);
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const userData = await User.me();
      if (!userData) {
        setIsLoading(false);
        return;
      }

      // 1. Load initial data
      const [campusEvents, tutorProfiles] = await Promise.all([
        CampusEvent.list('-start_time', 20).catch(() => []),
        TutorProfile.filter({ profile_status: 'active' }, '-created_date', 15).catch(() => [])
      ]);

      // Filter active events
      const now = new Date();
      const activeEvents = campusEvents.filter(event => {
        const endTime = new Date(event.end_time);
        return endTime > now && event.is_active;
      });

      // If no tutors, set state and return early
      if (!tutorProfiles || tutorProfiles.length === 0) {
        setEvents(activeEvents);
        setTutors([]);
        setTotalItems(activeEvents.length);
        setIsLoading(false);
        return;
      }

      // 2. Collect IDs for batch fetching
      const tutorUserIds = tutorProfiles.map(t => t.user_id).filter(id => id);
      const tutorProfileIds = tutorProfiles.map(t => t.id).filter(id => id);

      // 3. Batch fetch related data
      const [allTutorUsers, allTutorLocations] = await Promise.all([
        tutorUserIds.length > 0 ? User.filter({ id: { '$in': tutorUserIds } }).catch(() => []) : Promise.resolve([]),
        tutorProfileIds.length > 0 ? TutorLocation.filter({ tutor_profile_id: { '$in': tutorProfileIds } }).catch(() => []) : Promise.resolve([])
      ]);
      
      // 4. Create maps for easy lookup
      const usersMap = new Map(allTutorUsers.map(u => [u.id, u]));
      const locationsMap = new Map(allTutorLocations.map(l => [l.tutor_profile_id, l]));

      // 5. Enrich tutor profiles with the fetched data
      const enrichedTutors = tutorProfiles.map(tutor => ({
        ...tutor,
        user: usersMap.get(tutor.user_id) || null,
        location_data: locationsMap.get(tutor.id) || null
      }));

      // Filter tutors with location data
      const tutorsWithLocation = enrichedTutors.filter(tutor => 
        tutor.location_data?.primary_location?.coordinates?.lat && 
        tutor.location_data?.primary_location?.coordinates?.lng
      );

      setEvents(activeEvents);
      setTutors(tutorsWithLocation);
      setTotalItems(activeEvents.length + tutorsWithLocation.length);

    } catch (error) {
      console.error("Error loading campus data:", error);
      setEvents([]);
      setTutors([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Force re-render when coming back to dashboard
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const handleTutorClick = (tutor) => {
    // Navigate to tutor booking or profile
    window.open(createPageUrl(`PrivateLessons`), '_blank');
  };

  // הוספת פונקציה לחזרה לתצוגת כל הארץ
  const resetToCountryView = () => {
    setMapCenter([31.5, 34.8]);
    setMapZoom(8);
  };

  // A simple loading placeholder to avoid map initialization issues
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
    >
      <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl h-full">
        <CardHeader className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex-1">
              <CardTitle className="text-lg md:text-xl font-bold text-white flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-cyan-400" />
                {t.campusLive}
              </CardTitle>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs md:text-sm text-white/70">
                <span>{t.happeningNow}</span>
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="flex items-center gap-1">
                    🎓 {events.length} {t.events}
                  </span>
                  <span className="flex items-center gap-1">
                    👨‍🏫 {tutors.length} {t.tutors}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-cyan-300 hover:text-cyan-200 text-xs px-2 py-1"
                onClick={getCurrentLocationWithPermission}
              >
                📍 <span className="hidden sm:inline">{t.myLocation}</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-cyan-300 hover:text-cyan-200 text-xs px-2 py-1"
                onClick={resetToCountryView}
              >
                🌍 <span className="hidden sm:inline">{t.countryWide}</span>
              </Button>
              <Link to={createPageUrl("Campus")}>
                <Button variant="ghost" size="sm" className="text-cyan-300 hover:text-cyan-200 text-xs md:text-sm">
                  <span className="hidden sm:inline">{t.viewFullCampus}</span>
                  <span className="sm:hidden">{t.map}</span>
                  <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1 md:ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          {/* Mobile: Smaller height, Desktop: Larger height */}
          <div className="h-48 sm:h-56 md:h-64 lg:h-80 rounded-lg overflow-hidden border border-white/20">
            {isLoading ? (
               <div className="flex items-center justify-center h-full bg-slate-800/50">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-6 h-6 md:w-8 md:h-8 border-2 border-cyan-500 border-t-transparent rounded-full"
                />
              </div>
            ) : (
              <MapContainer 
                center={mapCenter} 
                zoom={mapZoom} 
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={true}
                dragging={true}
                key={`map-${events.length}-${tutors.length}`} // Force re-render when data changes
                minZoom={7}
                maxZoom={16}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
                  attribution=''
                />
                
                {/* Campus Events */}
                {events.map((event) => {
                  if (!event.location?.coordinates) return null;
                  return (
                    <Marker
                      key={`event-${event.id}`}
                      position={[event.location.coordinates.lat, event.location.coordinates.lng]}
                      icon={createEventIcon(eventTypeColors[event.event_type])}
                    >
                      <Popup>
                        <div className="text-right min-w-48" dir={language === 'he' ? 'rtl' : 'ltr'}>
                          <h4 className="font-bold text-gray-900 mb-2">{event.title}</h4>
                          <div className="space-y-1 text-sm text-gray-700">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3 h-3" />
                              <span>{event.location.building || event.location.city}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <UsersIcon className="w-3 h-3" />
                              <span>{event.current_participants?.length || 0}/{event.max_participants} {t.participants}</span>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <Badge 
                              style={{ 
                                backgroundColor: eventTypeColors[event.event_type] + '20', 
                                color: eventTypeColors[event.event_type] 
                              }}
                            >
                              {eventTypeTranslations[event.event_type][language]}
                            </Badge>
                            <Button size="sm" className="text-xs">
                              {t.joinEvent}
                            </Button>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}

                {/* Available Tutors */}
                {tutors.map((tutor) => {
                  if (!tutor.location_data?.primary_location?.coordinates) return null;
                  const coords = tutor.location_data.primary_location.coordinates;
                  return (
                    <Marker
                      key={`tutor-${tutor.id}`}
                      position={[coords.lat, coords.lng]}
                      icon={createTutorIcon(tutor.rating_avg || 0)}
                    >
                      <Popup>
                        <div className="text-right min-w-48" dir={language === 'he' ? 'rtl' : 'ltr'}>
                          <h4 className="font-bold text-gray-900 mb-2">{tutor.user?.full_name || t.defaultTutorName}</h4>
                          <div className="space-y-1 text-sm text-gray-700">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-3 h-3" />
                              <span>{tutor.completed_lessons || 0} {t.lessons}</span>
                            </div>
                            {tutor.rating_avg > 0 && (
                              <div className="flex items-center gap-2">
                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                <span>{tutor.rating_avg.toFixed(1)} ({tutor.rating_count || 0})</span>
                              </div>
                            )}
                            <div className="text-lg font-bold text-emerald-600">
                              ₪{tutor.hourly_rate} {t.perHour}
                            </div>
                            <div className="text-xs text-gray-500">
                              📍 {tutor.location_data.primary_location.city || t.defaultLocation}
                            </div>
                          </div>
                          <div className="mt-2">
                            <Button 
                              size="sm" 
                              className="w-full text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTutorClick(tutor);
                              }}
                            >
                              {t.bookLesson}
                            </Button>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            )}
          </div>
          
          {!isLoading && totalItems === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50 rounded-lg">
              <div className="text-center text-white/60">
                <MapPin className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-2 opacity-50" />
                <p className="text-xs md:text-sm">{language === 'he' ? 'אין פעילות ארצית כרגע' : 'No nationwide activity right now'}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
