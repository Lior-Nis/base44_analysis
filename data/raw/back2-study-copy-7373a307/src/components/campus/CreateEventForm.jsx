import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Subject } from "@/api/entities";
import { CampusEvent } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin, Calendar as CalendarIcon, Clock, Users } from "lucide-react";
import { format } from "date-fns";
import { he, enUS } from "date-fns/locale";
import { motion } from "framer-motion";

const translations = {
  he: {
    createEvent: "צור אירוע חדש",
    eventTitle: "כותרת האירוע",
    titlePlaceholder: "למשל: קבוצת לימוד למתמטיקה",
    description: "תיאור",
    descPlaceholder: "תאר את האירוע ומה המשתתפים יכולים לצפות...",
    eventType: "סוג אירוע",
    studyGroup: "קבוצת לימוד",
    quietSpot: "מקום שקט ללימוד",
    socialEvent: "אירוע חברתי",
    helpSession: "מפגש עזרה",
    projectMeetup: "פגישת פרויקט",
    academicLecture: "הרצאה אקדמית",
    subject: "מקצוע",
    selectSubject: "בחר מקצוע (אופציונלי)",
    location: "מיקום",
    building: "בניין",
    buildingPlaceholder: "שם הבניין או המיקום",
    room: "חדר/אולם",
    roomPlaceholder: "מספר חדר או שם האולם",
    dateTime: "תאריך ושעה",
    selectDate: "בחר תאריך",
    startTime: "שעת התחלה",
    endTime: "שעת סיום",
    maxParticipants: "מספר משתתפים מקסימלי",
    participants: "משתתפים",
    tags: "תגיות",
    tagsPlaceholder: "הוסף תגיות מופרדות בפסיק (למשל: מתמטיקה, בחינה, קבוצה)",
    create: "צור אירוע",
    creating: "יוצר...",
    cancel: "ביטול",
    required: "שדה חובה",
    invalidTime: "שעת הסיום חייבת להיות אחרי שעת ההתחלה"
  },
  en: {
    createEvent: "Create New Event",
    eventTitle: "Event Title",
    titlePlaceholder: "e.g., Math Study Group",
    description: "Description",
    descPlaceholder: "Describe the event and what participants can expect...",
    eventType: "Event Type",
    studyGroup: "Study Group",
    quietSpot: "Quiet Study Spot",
    socialEvent: "Social Event",
    helpSession: "Help Session",
    projectMeetup: "Project Meetup",
    academicLecture: "Academic Lecture",
    subject: "Subject",
    selectSubject: "Select Subject (optional)",
    location: "Location",
    building: "Building",
    buildingPlaceholder: "Building name or location",
    room: "Room/Hall",
    roomPlaceholder: "Room number or hall name",
    dateTime: "Date & Time",
    selectDate: "Select Date",
    startTime: "Start Time",
    endTime: "End Time",
    maxParticipants: "Maximum Participants",
    participants: "participants",
    tags: "Tags",
    tagsPlaceholder: "Add comma-separated tags (e.g., math, exam, group)",
    create: "Create Event",
    creating: "Creating...",
    cancel: "Cancel",
    required: "Required field",
    invalidTime: "End time must be after start time"
  }
};

export default function CreateEventForm({ isOpen, onClose, onEventCreated, language = 'en' }) {
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'study_group',
    subject_id: '',
    location: {
      building: '',
      room: '',
      coordinates: { lat: 32.0853, lng: 34.7818 }
    },
    start_time: '',
    end_time: '',
    max_participants: 10,
    tags: ''
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [errors, setErrors] = useState({});

  const t = translations[language];
  const locale = language === 'he' ? he : enUS;

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      const subjectsData = await Subject.list();
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = t.required;
    }
    if (!formData.location.building.trim()) {
      newErrors.building = t.required;
    }
    if (!selectedDate) {
      newErrors.date = t.required;
    }
    if (!formData.start_time) {
      newErrors.start_time = t.required;
    }
    if (!formData.end_time) {
      newErrors.end_time = t.required;
    }
    if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
      newErrors.end_time = t.invalidTime;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsCreating(true);
    try {
      const startDateTime = new Date(selectedDate);
      const [startHour, startMinute] = formData.start_time.split(':');
      startDateTime.setHours(parseInt(startHour), parseInt(startMinute));

      const endDateTime = new Date(selectedDate);
      const [endHour, endMinute] = formData.end_time.split(':');
      endDateTime.setHours(parseInt(endHour), parseInt(endMinute));

      const eventData = {
        ...formData,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        organizer_id: user.id,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        current_participants: [{
          user_id: user.id,
          joined_at: new Date().toISOString()
        }],
        is_active: true
      };

      const newEvent = await CampusEvent.create(eventData);
      onEventCreated(newEvent);
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        event_type: 'study_group',
        subject_id: '',
        location: { building: '', room: '', coordinates: { lat: 32.0853, lng: 34.7818 } },
        start_time: '',
        end_time: '',
        max_participants: 10,
        tags: ''
      });
      setSelectedDate(null);
      
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900/95 text-white border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {t.createEvent}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 p-1">
          {/* Event Title */}
          <div>
            <Label className="text-white/80">{t.eventTitle} *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder={t.titlePlaceholder}
              className={`bg-white/10 border-white/20 text-white ${errors.title ? 'border-red-500' : ''}`}
            />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <Label className="text-white/80">{t.description}</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder={t.descPlaceholder}
              rows={3}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>

          {/* Event Type & Subject */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white/80">{t.eventType}</Label>
              <Select 
                value={formData.event_type} 
                onValueChange={(value) => setFormData({...formData, event_type: value})}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white border-gray-700">
                  <SelectItem value="study_group">{t.studyGroup}</SelectItem>
                  <SelectItem value="quiet_spot">{t.quietSpot}</SelectItem>
                  <SelectItem value="social_event">{t.socialEvent}</SelectItem>
                  <SelectItem value="help_session">{t.helpSession}</SelectItem>
                  <SelectItem value="project_meetup">{t.projectMeetup}</SelectItem>
                  <SelectItem value="academic_lecture">{t.academicLecture}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white/80">{t.subject}</Label>
              <Select 
                value={formData.subject_id} 
                onValueChange={(value) => setFormData({...formData, subject_id: value})}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder={t.selectSubject} />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white border-gray-700">
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white/80 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {t.building} *
              </Label>
              <Input
                value={formData.location.building}
                onChange={(e) => setFormData({
                  ...formData, 
                  location: {...formData.location, building: e.target.value}
                })}
                placeholder={t.buildingPlaceholder}
                className={`bg-white/10 border-white/20 text-white ${errors.building ? 'border-red-500' : ''}`}
              />
              {errors.building && <p className="text-red-400 text-xs mt-1">{errors.building}</p>}
            </div>

            <div>
              <Label className="text-white/80">{t.room}</Label>
              <Input
                value={formData.location.room}
                onChange={(e) => setFormData({
                  ...formData, 
                  location: {...formData.location, room: e.target.value}
                })}
                placeholder={t.roomPlaceholder}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-4">
            <Label className="text-white/80 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              {t.dateTime}
            </Label>
            
            {/* Date Picker */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className={`bg-white/10 border-white/20 text-white hover:bg-white/20 justify-start text-left font-normal ${errors.date ? 'border-red-500' : ''}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, 'PPP', { locale }) : t.selectDate}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" align="start" side="bottom" sideOffset={8}>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date().setHours(0, 0, 0, 0)}
                      initialFocus
                      className="text-white"
                    />
                  </PopoverContent>
                </Popover>
                {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
              </div>

              <div>
                <Label className="text-white/60 text-sm">{t.startTime} *</Label>
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                  className={`bg-white/10 border-white/20 text-white ${errors.start_time ? 'border-red-500' : ''}`}
                />
                {errors.start_time && <p className="text-red-400 text-xs mt-1">{errors.start_time}</p>}
              </div>

              <div>
                <Label className="text-white/60 text-sm">{t.endTime} *</Label>
                <Input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                  className={`bg-white/10 border-white/20 text-white ${errors.end_time ? 'border-red-500' : ''}`}
                />
                {errors.end_time && <p className="text-red-400 text-xs mt-1">{errors.end_time}</p>}
              </div>
            </div>
          </div>

          {/* Participants & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white/80 flex items-center gap-2">
                <Users className="w-4 h-4" />
                {t.maxParticipants}
              </Label>
              <Input
                type="number"
                min="2"
                max="50"
                value={formData.max_participants}
                onChange={(e) => setFormData({...formData, max_participants: parseInt(e.target.value)})}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>

            <div>
              <Label className="text-white/80">{t.tags}</Label>
              <Input
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                placeholder={t.tagsPlaceholder}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/20">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="bg-white/10 text-white hover:bg-white/20 border-white/20"
            >
              {t.cancel}
            </Button>
            <Button 
              type="submit" 
              disabled={isCreating}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              {isCreating ? t.creating : t.create}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}