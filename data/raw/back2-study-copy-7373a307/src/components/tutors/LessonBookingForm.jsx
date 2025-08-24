import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { LessonBooking } from '@/api/entities';
import { TutorChat } from '@/api/entities';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Monitor, 
  CreditCard,
  Star,
  MessageCircle,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { format, addDays, isBefore, isToday } from 'date-fns';
import { he, enUS } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../ui/theme-provider';
import { useToast } from '../ui/use-toast';

const translations = {
  he: {
    bookLesson: 'הזמנת שיעור',
    selectSubject: 'בחר מקצוע',
    selectDate: 'בחר תאריך',
    selectTime: 'בחר שעה',
    duration: 'משך השיעור',
    minutes: 'דקות',
    lessonType: 'סוג השיעור',
    online: 'מקוון',
    inPerson: 'פנים אל פנים',
    location: 'מיקום',
    studentHome: 'בית התלמיד',
    tutorHome: 'בית המורה',
    library: 'ספרייה',
    cafe: 'בית קפה',
    notes: 'הערות נוספות',
    notesPlaceholder: 'תאר את מה שאתה רוצה ללמוד או כל דרישה מיוחדת...',
    paymentSummary: 'סיכום תשלום',
    lessonPrice: 'מחיר השיעור',
    platformFee: 'עמלת פלטפורמה',
    total: 'סה"כ',
    bookNow: 'הזמן עכשיו',
    booking: 'מזמין...',
    cancel: 'ביטול',
    sendMessage: 'שלח הודעה למורה',
    messagePlaceholder: 'כתב הודעה למורה...',
    send: 'שלח',
    bookingSuccess: 'השיעור הוזמן בהצלחה!',
    bookingError: 'שגיאה בהזמנת השיעור',
    invalidDate: 'תאריך לא תקין',
    invalidTime: 'שעה לא תקינה',
    selectAllFields: 'אנא מלא את כל השדות הנדרשים',
    chatWithTutor: 'צ\'אט עם המורה',
    perHour: 'לשעה'
  },
  en: {
    bookLesson: 'Book Lesson',
    selectSubject: 'Select Subject',
    selectDate: 'Select Date',
    selectTime: 'Select Time',
    duration: 'Lesson Duration',
    minutes: 'minutes',
    lessonType: 'Lesson Type',
    online: 'Online',
    inPerson: 'In Person',
    location: 'Location',
    studentHome: 'Student Home',
    tutorHome: 'Tutor Home',
    library: 'Library',
    cafe: 'Cafe',
    notes: 'Additional Notes',
    notesPlaceholder: 'Describe what you want to learn or any special requirements...',
    paymentSummary: 'Payment Summary',
    lessonPrice: 'Lesson Price',
    platformFee: 'Platform Fee',
    total: 'Total',
    bookNow: 'Book Now',
    booking: 'Booking...',
    cancel: 'Cancel',
    sendMessage: 'Send Message to Tutor',
    messagePlaceholder: 'Write a message to the tutor...',
    send: 'Send',
    bookingSuccess: 'Lesson booked successfully!',
    bookingError: 'Error booking lesson',
    invalidDate: 'Invalid date',
    invalidTime: 'Invalid time',
    selectAllFields: 'Please fill in all required fields',
    chatWithTutor: 'Chat with Tutor',
    perHour: 'per hour'
  }
};

export default function LessonBookingForm({ tutor, subjects, onClose, onBookingCreated, language = 'en' }) {
  const [user, setUser] = useState(null);
  const [currentStep, setCurrentStep] = useState('booking'); // 'booking' or 'chat'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Booking form data
  const [bookingData, setBookingData] = useState({
    subject_id: '',
    lesson_date: null,
    lesson_time: '',
    duration_minutes: 60,
    lesson_type: 'online',
    location: {
      type: 'online',
      address: '',
      notes: ''
    },
    notes: '',
    student_notes: ''
  });

  const { themeClasses } = useTheme();
  const { toast } = useToast();
  const t = translations[language];
  const locale = language === 'he' ? he : enUS;

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (currentStep === 'chat') {
      loadChatMessages();
    }
  }, [currentStep]);

  const loadInitialData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadChatMessages = async () => {
    if (!user) return;
    try {
      const chatMessages = await TutorChat.filter({
        tutor_profile_id: tutor.id,
        student_id: user.id
      }, '-created_date', 50);
      setMessages(chatMessages);
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
  };

  const getTutorSubjects = () => {
    return tutor.subjects_taught?.map(subjectId => 
      subjects.find(s => s.id === subjectId)
    ).filter(Boolean) || [];
  };

  const calculateTotalPrice = () => {
    const lessonPrice = (tutor.hourly_rate * bookingData.duration_minutes) / 60;
    const platformFee = lessonPrice * 0.1; // 10% platform fee
    return {
      lessonPrice: Math.round(lessonPrice),
      platformFee: Math.round(platformFee),
      total: Math.round(lessonPrice + platformFee)
    };
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const validateBookingData = () => {
    if (!bookingData.subject_id) {
      toast({
        title: t.selectAllFields,
        description: t.selectSubject,
        variant: "destructive"
      });
      return false;
    }

    if (!bookingData.lesson_date) {
      toast({
        title: t.selectAllFields,
        description: t.selectDate,
        variant: "destructive"
      });
      return false;
    }

    if (!bookingData.lesson_time) {
      toast({
        title: t.selectAllFields,
        description: t.selectTime,
        variant: "destructive"
      });
      return false;
    }

    // Check if date is not in the past
    if (isBefore(bookingData.lesson_date, new Date()) && !isToday(bookingData.lesson_date)) {
      toast({
        title: t.invalidDate,
        description: "Cannot book lessons in the past",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleBooking = async () => {
    if (!validateBookingData() || !user) return;

    setIsSubmitting(true);
    try {
      const pricing = calculateTotalPrice();
      const lessonDateTime = new Date(bookingData.lesson_date);
      const [hours, minutes] = bookingData.lesson_time.split(':');
      lessonDateTime.setHours(parseInt(hours), parseInt(minutes));

      const booking = await LessonBooking.create({
        tutor_profile_id: tutor.id,
        student_id: user.id,
        subject_id: bookingData.subject_id,
        lesson_date: lessonDateTime.toISOString(),
        duration_minutes: bookingData.duration_minutes,
        lesson_type: bookingData.lesson_type,
        location: bookingData.location,
        price: pricing.lessonPrice,
        platform_fee: pricing.platformFee,
        total_amount: pricing.total,
        status: 'pending',
        payment_status: 'pending',
        notes: bookingData.notes,
        student_notes: bookingData.student_notes
      });

      // Send initial message to tutor
      if (bookingData.student_notes.trim()) {
        await TutorChat.create({
          tutor_profile_id: tutor.id,
          student_id: user.id,
          sender_id: user.id,
          sender_type: 'student',
          message: bookingData.student_notes,
          message_type: 'booking_request',
          booking_data: {
            lesson_date: lessonDateTime.toISOString(),
            duration: bookingData.duration_minutes,
            location_type: bookingData.lesson_type,
            price: pricing.total
          }
        });
      }

      toast({
        title: t.bookingSuccess,
        description: language === 'he' 
          ? 'המורה יקבל הודעה ויחזור אליך בקרוב'
          : 'The tutor will be notified and get back to you soon',
        variant: "success"
      });

      onBookingCreated?.(booking);
      onClose();
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: t.bookingError,
        description: error.message || 'Please try again',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const messageData = {
      tutor_profile_id: tutor.id,
      student_id: user.id,
      sender_id: user.id,
      sender_type: 'student',
      message: newMessage,
      message_type: 'text'
    };

    setMessages(prev => [...prev, { ...messageData, id: 'temp-' + Date.now() }]);
    setNewMessage('');

    try {
      const createdMessage = await TutorChat.create(messageData);
      setMessages(prev => prev.map(msg => 
        msg.id.toString().startsWith('temp-') ? createdMessage : msg
      ));
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(msg => !msg.id.toString().startsWith('temp-')));
    }
  };

  const pricing = calculateTotalPrice();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className={`${themeClasses.cardSolid} border-gray-700 max-w-2xl max-h-[90vh] overflow-hidden`}>
        <DialogHeader className="border-b border-white/10 pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className={`text-xl font-bold ${themeClasses.textPrimary}`}>
              {currentStep === 'booking' ? t.bookLesson : t.chatWithTutor}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={currentStep === 'booking' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentStep('booking')}
                className="text-sm"
              >
                <CreditCard className="w-4 h-4 mr-1" />
                {language === 'he' ? 'הזמנה' : 'Booking'}
              </Button>
              <Button
                variant={currentStep === 'chat' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentStep('chat')}
                className="text-sm"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                {language === 'he' ? 'צ\'אט' : 'Chat'}
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tutor Info Header */}
          <div className="flex items-center gap-3 mt-4">
            <Avatar className="w-12 h-12 border-2 border-white/20">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                {tutor.user?.full_name?.[0] || 'T'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className={`font-semibold ${themeClasses.textPrimary}`}>
                {tutor.user?.full_name || 'מורה'}
              </h3>
              <div className="flex items-center gap-2">
                {tutor.rating_avg > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-sm text-yellow-400">
                      {tutor.rating_avg.toFixed(1)}
                    </span>
                  </div>
                )}
                <span className="text-sm text-emerald-400 font-medium">
                  ₪{tutor.hourly_rate} {t.perHour}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {currentStep === 'booking' ? (
              <motion.div
                key="booking"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="overflow-y-auto max-h-[60vh] p-6 space-y-6"
              >
                
                {/* Subject Selection */}
                <div className="space-y-2">
                  <Label>{t.selectSubject} *</Label>
                  <Select 
                    value={bookingData.subject_id} 
                    onValueChange={(value) => setBookingData({...bookingData, subject_id: value})}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder={t.selectSubject} />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {getTutorSubjects().map(subject => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t.selectDate} *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {bookingData.lesson_date ? 
                            format(bookingData.lesson_date, 'PPP', { locale }) : 
                            t.selectDate
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" align="start">
                        <Calendar
                          mode="single"
                          selected={bookingData.lesson_date}
                          onSelect={(date) => setBookingData({...bookingData, lesson_date: date})}
                          disabled={(date) => isBefore(date, new Date()) && !isToday(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>{t.selectTime} *</Label>
                    <Select 
                      value={bookingData.lesson_time} 
                      onValueChange={(value) => setBookingData({...bookingData, lesson_time: value})}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder={t.selectTime} />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 max-h-48">
                        {generateTimeSlots().map(time => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Duration and Lesson Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t.duration}</Label>
                    <Select 
                      value={bookingData.duration_minutes.toString()} 
                      onValueChange={(value) => setBookingData({...bookingData, duration_minutes: parseInt(value)})}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="60">60 {t.minutes}</SelectItem>
                        <SelectItem value="90">90 {t.minutes}</SelectItem>
                        <SelectItem value="120">120 {t.minutes}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t.lessonType}</Label>
                    <Select 
                      value={bookingData.lesson_type} 
                      onValueChange={(value) => setBookingData({...bookingData, lesson_type: value, location: {...bookingData.location, type: value}})}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {tutor.teaching_methods?.includes('online') && (
                          <SelectItem value="online">
                            <div className="flex items-center gap-2">
                              <Monitor className="w-4 h-4" />
                              {t.online}
                            </div>
                          </SelectItem>
                        )}
                        {tutor.teaching_methods?.includes('in_person') && (
                          <SelectItem value="in_person">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {t.inPerson}
                            </div>
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Location (only for in-person lessons) */}
                {bookingData.lesson_type === 'in_person' && (
                  <div className="space-y-2">
                    <Label>{t.location}</Label>
                    <Select 
                      value={bookingData.location.type} 
                      onValueChange={(value) => setBookingData({...bookingData, location: {...bookingData.location, type: value}})}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="student_home">{t.studentHome}</SelectItem>
                        <SelectItem value="tutor_home">{t.tutorHome}</SelectItem>
                        <SelectItem value="library">{t.library}</SelectItem>
                        <SelectItem value="cafe">{t.cafe}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Notes */}
                <div className="space-y-2">
                  <Label>{t.notes}</Label>
                  <Textarea
                    value={bookingData.student_notes}
                    onChange={(e) => setBookingData({...bookingData, student_notes: e.target.value})}
                    placeholder={t.notesPlaceholder}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none"
                    rows={3}
                  />
                </div>

                {/* Payment Summary */}
                <div className="bg-white/5 rounded-lg p-4 space-y-3 border border-white/10">
                  <h4 className={`font-semibold ${themeClasses.textPrimary}`}>{t.paymentSummary}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className={themeClasses.textSecondary}>{t.lessonPrice}:</span>
                      <span className={themeClasses.textPrimary}>₪{pricing.lessonPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={themeClasses.textSecondary}>{t.platformFee}:</span>
                      <span className={themeClasses.textPrimary}>₪{pricing.platformFee}</span>
                    </div>
                    <div className="border-t border-white/20 pt-2 flex justify-between font-semibold">
                      <span className={themeClasses.textPrimary}>{t.total}:</span>
                      <span className="text-emerald-400">₪{pricing.total}</span>
                    </div>
                  </div>
                </div>

              </motion.div>
            ) : (
              <motion.div
                key="chat"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col h-[60vh]"
              >
                
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-white/30 mx-auto mb-3" />
                      <p className={`text-sm ${themeClasses.textMuted}`}>
                        {language === 'he' ? 'אין הודעות עדיין' : 'No messages yet'}
                      </p>
                      <p className={`text-xs ${themeClasses.textMuted} mt-1`}>
                        {t.sendMessage}
                      </p>
                    </div>
                  ) : (
                    messages.map((message, index) => (
                      <div
                        key={message.id || index}
                        className={`flex ${message.sender_type === 'student' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            message.sender_type === 'student'
                              ? 'bg-blue-500 text-white'
                              : 'bg-white/20 text-white'
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          {message.message_type === 'booking_request' && (
                            <Badge className="mt-2 bg-green-500/20 text-green-300">
                              {language === 'he' ? 'בקשת הזמנה' : 'Booking Request'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Chat Input */}
                <div className="border-t border-white/20 p-4">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={t.messagePlaceholder}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      {t.send}
                    </Button>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer - only show for booking step */}
        {currentStep === 'booking' && (
          <div className="border-t border-white/20 p-6">
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                {t.cancel}
              </Button>
              <Button 
                onClick={handleBooking} 
                disabled={isSubmitting}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isSubmitting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                    {t.booking}
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {t.bookNow}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}