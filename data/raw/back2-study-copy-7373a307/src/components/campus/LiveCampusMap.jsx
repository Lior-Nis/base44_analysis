import React, { useState, useEffect } from "react";
import { CampusEvent } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Calendar, Users, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { format } from "date-fns";
import { he, enUS } from "date-fns/locale";
import CreateEventForm from "./CreateEventForm";
import SafetyMenu from '../safety/SafetyMenu';

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
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      "></div>
    `,
    className: 'custom-div-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 20]
  });
};

// New icon for tutors
const createTutorIcon = (color = '#ff6347') => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: white;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        "></div>
      </div>
    `,
    className: 'custom-div-icon',
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

const translations = {
  he: {
    liveCampusMap: "מפת הקמפוס החיה",
    createEvent: "צור אירוע",
    currentEvents: "אירועים פעילים",
    joinEvent: "הצטרף",
    eventDetails: "פרטי האירוע",
    organizedBy: "מאורגן על ידי",
    participants: "משתתפים",
    location: "מיקום",
    time: "שעה",
    noEventsYet: "אין אירועים פעילים כרגע",
    beFirst: "היה הראשון ליצור אירוע!",
    studyGroup: "קבוצת לימוד",
    quietSpot: "מקום שקט",
    socialEvent: "אירוע חברתי",
    helpSession: "מפגש עזרה",
    projectMeetup: "פגישת פרויקט",
    academicLecture: "הרצאה אקדמית",
    full: "מלא",
    tutor: "מורה",
  },
  en: {
    liveCampusMap: "Live Campus Map",
    createEvent: "Create Event",
    currentEvents: "Current Events",
    joinEvent: "Join",
    eventDetails: "Event Details",
    organizedBy: "Organized by",
    participants: "Participants",
    location: "Location",
    time: "Time",
    noEventsYet: "No active events right now",
    beFirst: "Be the first to create one!",
    studyGroup: "Study Group",
    quietSpot: "Quiet Spot",
    socialEvent: "Social Event",
    helpSession: "Help Session",
    projectMeetup: "Project Meetup",
    academicLecture: "Academic Lecture",
    full: "Full",
    tutor: "Tutor",
  }
};

const eventTypeTranslations = {
  study_group: { he: "קבוצת לימוד", en: "Study Group" },
  quiet_spot: { he: "מקום שקט", en: "Quiet Spot" },
  social_event: { he: "אירוע חברתי", en: "Social Event" },
  help_session: { he: "מפגש עזרה", en: "Help Session" },
  project_meetup: { he: "פגישת פרויקט", en: "Project Meetup" },
  academic_lecture: { he: "הרצאה אקדמית", en: "Academic Lecture" }
};

export default function LiveCampusMap({ 
  events: initialEvents = [],
  tutors = [], 
  onEventClick, 
  onTutorClick, 
  language = 'he',
  className = "" 
}) {
  const [events, setEvents] = useState(initialEvents);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [mapCenter, setMapCenter] = useState([32.0853, 34.7818]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [mapZoom, setMapZoom] = useState(14);

  const t = translations[language];
  const locale = language === 'he' ? he : enUS;

  useEffect(() => {
    loadInitialData();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMapCenter([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  };

  const loadInitialData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      await loadEvents();
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const eventsList = await CampusEvent.list('-start_time', 50);
      const activeEvents = eventsList.filter(event => {
        const endTime = new Date(event.end_time);
        return endTime > new Date() && event.is_active;
      });
      setEvents(activeEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents([]);
    }
  };

  const handleJoinEvent = async (event) => {
    if (!user || !event) return;
    
    try {
      const isAlreadyJoined = event.current_participants?.some(p => p.user_id === user.id);
      if (isAlreadyJoined) return;

      const updatedParticipants = [
        ...(event.current_participants || []),
        { user_id: user.id, joined_at: new Date().toISOString() }
      ];

      await CampusEvent.update(event.id, {
        current_participants: updatedParticipants
      });

      loadEvents();
    } catch (error) {
      console.error('Error joining event:', error);
    }
  };

  const handleEventCreated = (newEvent) => {
    setEvents(prev => [newEvent, ...prev]);
  };

  if (typeof window === 'undefined') {
    return <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-cyan-400" />
            {t.liveCampusMap}
          </h2>
          <p className="text-white/70 mt-1">{events.length} {t.currentEvents.toLowerCase()}</p>
        </div>
        
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t.createEvent}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Map */}
        <div className="lg:col-span-2">
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardContent className="p-0">
              <div className="h-96 rounded-lg overflow-hidden">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full bg-slate-800/50">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full"
                    />
                  </div>
                ) : (
                  <MapContainer 
                    center={mapCenter} 
                    zoom={mapZoom} 
                    style={{ height: "100%", width: "100%" }}
                    scrollWheelZoom={true}
                    dragging={true}
                    minZoom={6}
                    maxZoom={18}
                  >
                    <TileLayer
                      url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
                      attribution=''
                    />
                    {events.map((event) => {
                      if (!event.location?.coordinates) return null;
                      return (
                        <Marker
                          key={event.id}
                          position={[event.location.coordinates.lat, event.location.coordinates.lng]}
                          icon={createEventIcon(eventTypeColors[event.event_type])}
                          eventHandlers={{
                            click: () => {
                              if (onEventClick) {
                                onEventClick(event);
                              } else {
                                setSelectedEvent(event);
                              }
                            }
                          }}
                        >
                          <Popup>
                            <div className="text-right p-2 min-w-48" dir={language === 'he' ? 'rtl' : 'ltr'}>
                              <h4 className="font-bold text-gray-900 mb-2">{event.title}</h4>
                              <div className="space-y-1 text-sm text-gray-700">
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-3 h-3" />
                                  <span>{event.location.building}{event.location.room ? `, ${event.location.room}` : ''}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-3 h-3" />
                                  <span>{format(new Date(event.start_time), 'HH:mm')}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="w-3 h-3" />
                                  <span>{event.current_participants?.length || 0}/{event.max_participants}</span>
                                </div>
                              </div>
                              <Badge 
                                className="mt-2"
                                style={{ backgroundColor: eventTypeColors[event.event_type] + '20', color: eventTypeColors[event.event_type] }}
                              >
                                {eventTypeTranslations[event.event_type][language]}
                              </Badge>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                    {tutors.map((tutor) => {
                      if (!tutor.location?.coordinates) return null;
                      return (
                        <Marker
                          key={`tutor-${tutor.id}`}
                          position={[tutor.location.coordinates.lat, tutor.location.coordinates.lng]}
                          icon={createTutorIcon()}
                          eventHandlers={{
                            click: () => {
                              if (onTutorClick) {
                                onTutorClick(tutor);
                              }
                            }
                          }}
                        >
                          <Popup>
                            <div className="p-2 text-gray-900" dir={language === 'he' ? 'rtl' : 'ltr'}>
                              <h4 className="font-bold mb-2">{tutor.full_name || t.tutor}</h4>
                              {tutor.bio && <p className="text-sm text-gray-700">{tutor.bio}</p>}
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </MapContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events List */}
        <div>
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardHeader>
              <CardTitle className="text-white">{t.currentEvents}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {events.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60 text-sm mb-2">{t.noEventsYet}</p>
                  <p className="text-white/40 text-xs">{t.beFirst}</p>
                </div>
              ) : (
                events.slice(0, 6).map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-300 group ${
                      selectedEvent?.id === event.id 
                        ? 'bg-white/20 border-cyan-400/50' 
                        : 'bg-white/5 border-white/20 hover:bg-white/10'
                    }`}
                    onClick={() => {
                      if (onEventClick) {
                        onEventClick(event);
                      } else {
                        setSelectedEvent(event);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-white text-sm flex-1">{event.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge 
                          className="text-xs"
                          style={{ backgroundColor: eventTypeColors[event.event_type] + '20', color: eventTypeColors[event.event_type] }}
                        >
                          {eventTypeTranslations[event.event_type][language]}
                        </Badge>
                        <SafetyMenu
                          targetUser={{ id: event.organizer_id, full_name: 'מארגן האירוע' }}
                          context="campus_event"
                          relatedId={event.id}
                          language={language}
                          className="opacity-0 group-hover:opacity-100 transition-opacity w-4 h-4 p-0"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-xs text-white/70">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>{format(new Date(event.start_time), 'HH:mm', { locale })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{event.location.building}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-3 h-3" />
                          <span>{event.current_participants?.length || 0}/{event.max_participants}</span>
                        </div>
                        {user && !event.current_participants?.some(p => p.user_id === user.id) && 
                         (event.current_participants?.length || 0) < event.max_participants && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleJoinEvent(event);
                            }}
                            className="h-6 px-2 text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30"
                          >
                            {t.joinEvent}
                          </Button>
                        )}
                        {(event.current_participants?.length || 0) >= event.max_participants && (
                          <Badge variant="outline" className="text-xs text-orange-400 border-orange-400/30">
                            {t.full}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Create Event Form */}
      <CreateEventForm 
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onEventCreated={handleEventCreated}
        language={language}
      />
    </div>
  );
}