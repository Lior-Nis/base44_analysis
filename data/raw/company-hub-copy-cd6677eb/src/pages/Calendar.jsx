import React, { useState, useEffect } from "react";
import { Event } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Users, 
  Filter,
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { format, parseISO, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState("month");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, filterType]);

  const loadEvents = async () => {
    try {
      const eventData = await Event.list('-start_date');
      setEvents(eventData);
    } catch (error) {
      console.error("Error loading events:", error);
    }
    setLoading(false);
  };

  const filterEvents = () => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter(event => event.type === filterType);
    }

    setFilteredEvents(filtered);
  };

  const getTypeColor = (type) => {
    const colors = {
      training: "bg-green-100 text-green-800 border-green-200",
      shift: "bg-blue-100 text-blue-800 border-blue-200",
      meeting: "bg-purple-100 text-purple-800 border-purple-200",
      company_event: "bg-amber-100 text-amber-800 border-amber-200",
      other: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[type] || colors.other;
  };

  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = [];
    let currentDay = calendarStart;

    while (currentDay <= calendarEnd) {
      days.push(currentDay);
      currentDay = addDays(currentDay, 1);
    }

    return days;
  };

  const getEventsForDay = (day) => {
    return filteredEvents.filter(event => 
      isSameDay(parseISO(event.start_date), day)
    );
  };

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/4"></div>
            <div className="grid grid-cols-7 gap-4">
              {Array(35).fill(0).map((_, i) => (
                <div key={i} className="h-24 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">Company Calendar</h1>
                <p className="text-slate-600 text-lg">Training sessions, shifts, and company events</p>
              </div>
              
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="shift">Shifts</SelectItem>
                    <SelectItem value="meeting">Meetings</SelectItem>
                    <SelectItem value="company_event">Company Events</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Calendar View */}
            <div className="xl:col-span-3">
              <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold text-slate-900">
                      {format(currentDate, "MMMM yyyy")}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigateMonth('prev')}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setCurrentDate(new Date())}
                      >
                        Today
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigateMonth('next')}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="p-3 text-center text-sm font-semibold text-slate-600 bg-slate-50 rounded-lg">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1">
                    {generateCalendarDays().map((day, index) => {
                      const dayEvents = getEventsForDay(day);
                      const isCurrentMonth = isSameMonth(day, currentDate);
                      const isToday = isSameDay(day, new Date());
                      
                      return (
                        <div
                          key={index}
                          className={`min-h-[100px] p-2 border rounded-lg transition-colors ${
                            isCurrentMonth ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100'
                          } ${isToday ? 'ring-2 ring-blue-500 bg-blue-50' : ''} hover:bg-slate-50`}
                        >
                          <div className={`text-sm font-medium mb-1 ${
                            isCurrentMonth ? 'text-slate-900' : 'text-slate-400'
                          } ${isToday ? 'text-blue-600 font-bold' : ''}`}>
                            {format(day, 'd')}
                          </div>
                          <div className="space-y-1">
                            {dayEvents.slice(0, 2).map((event) => (
                              <div
                                key={event.id}
                                onClick={() => setSelectedEvent(event)}
                                className="text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                                style={{
                                  backgroundColor: getTypeColor(event.type).includes('green') ? '#dcfce7' :
                                    getTypeColor(event.type).includes('blue') ? '#dbeafe' :
                                    getTypeColor(event.type).includes('purple') ? '#f3e8ff' :
                                    getTypeColor(event.type).includes('amber') ? '#fef3c7' : '#f3f4f6'
                                }}
                              >
                                <div className="font-medium truncate">{event.title}</div>
                                <div className="text-slate-600">
                                  {format(parseISO(event.start_date), 'h:mm a')}
                                </div>
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-xs text-slate-500 font-medium">
                                +{dayEvents.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Event Details Sidebar */}
            <div className="space-y-6">
              {selectedEvent ? (
                <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-bold text-slate-900">Event Details</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedEvent(null)}
                      >
                        ×
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">{selectedEvent.title}</h3>
                      <Badge className={getTypeColor(selectedEvent.type)}>
                        {selectedEvent.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    {selectedEvent.description && (
                      <div>
                        <h4 className="font-medium text-slate-700 mb-1">Description</h4>
                        <p className="text-sm text-slate-600">{selectedEvent.description}</p>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <span>
                          {format(parseISO(selectedEvent.start_date), "MMM d, yyyy 'at' h:mm a")}
                          {selectedEvent.end_date && (
                            <> - {format(parseISO(selectedEvent.end_date), "h:mm a")}</>
                          )}
                        </span>
                      </div>
                      
                      {selectedEvent.location && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-slate-500" />
                          <span>{selectedEvent.location}</span>
                        </div>
                      )}
                      
                      {selectedEvent.department && (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-slate-500" />
                          <span>{selectedEvent.department}</span>
                        </div>
                      )}
                      
                      {selectedEvent.mandatory && (
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant="destructive" className="text-xs">
                            Mandatory Attendance
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl">
                  <CardContent className="p-6 text-center">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-slate-500">Click on an event to view details</p>
                  </CardContent>
                </Card>
              )}

              {/* Upcoming Events List */}
              <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-900">Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {filteredEvents.slice(0, 5).map((event) => (
                      <div
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-medium text-slate-900 text-sm truncate">{event.title}</h4>
                          <Badge className={`${getTypeColor(event.type)} text-xs`}>
                            {event.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600">
                          {format(parseISO(event.start_date), "MMM d, h:mm a")}
                        </p>
                        {event.location && (
                          <p className="text-xs text-slate-500">{event.location}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}