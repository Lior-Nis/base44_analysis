import React, { useState, useEffect, useRef } from 'react';
import { User } from '@/api/entities';
import { TutorProfile } from '@/api/entities';
import { TutorChat } from '@/api/entities';
import { LessonBooking } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Calendar, 
  Clock, 
  MapPin,
  Phone,
  Video,
  CheckCircle,
  XCircle,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

const translations = {
  he: {
    chatWith: "צ'אט עם",
    typeMessage: "כתוב הודעה...",
    send: "שלח",
    bookLesson: "קבע שיעור",
    requestSent: "הבקשה נשלחה",
    acceptBooking: "אשר הזמנה",
    declineBooking: "דחה הזמנה",
    lessonBooked: "השיעור נקבע",
    lessonDeclined: "השיעור נדחה",
    online: "מקוון",
    inPerson: "פנים אל פנים",
    pending: "ממתין לאישור",
    confirmed: "אושר",
    cancelled: "בוטל",
    loadingChat: "טוען צ'אט...",
    startConversation: "התחל שיחה עם"
  },
  en: {
    chatWith: "Chat with",
    typeMessage: "Type a message...",
    send: "Send",
    bookLesson: "Book Lesson",
    requestSent: "Request Sent",
    acceptBooking: "Accept Booking",
    declineBooking: "Decline Booking", 
    lessonBooked: "Lesson Booked",
    lessonDeclined: "Lesson Declined",
    online: "Online",
    inPerson: "In Person",
    pending: "Pending Approval",
    confirmed: "Confirmed",
    cancelled: "Cancelled",
    loadingChat: "Loading chat...",
    startConversation: "Start conversation with"
  }
};

export default function TutorChatComponent({ 
  tutorProfileId, 
  currentUserId, 
  language = 'he',
  onClose 
}) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [tutor, setTutor] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  
  const t = translations[language];

  useEffect(() => {
    loadChatData();
  }, [tutorProfileId, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatData = async () => {
    setIsLoading(true);
    try {
      const [tutorProfile, userData, chatMessages] = await Promise.all([
        TutorProfile.get(tutorProfileId),
        User.me(),
        TutorChat.filter({ 
          tutor_profile_id: tutorProfileId,
          student_id: currentUserId 
        }, 'created_date')
      ]);
      
      const tutorUser = await User.get(tutorProfile.user_id);
      setTutor({ ...tutorProfile, user: tutorUser });
      setCurrentUser(userData);
      setMessages(chatMessages);
    } catch (error) {
      console.error('Error loading chat data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const messageData = {
        tutor_profile_id: tutorProfileId,
        student_id: currentUserId,
        sender_id: currentUserId,
        sender_type: 'student',
        message: newMessage.trim(),
        message_type: 'text'
      };

      const sentMessage = await TutorChat.create(messageData);
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const sendBookingRequest = async (bookingData) => {
    try {
      // Create booking request
      const booking = await LessonBooking.create({
        tutor_profile_id: tutorProfileId,
        student_id: currentUserId,
        ...bookingData
      });

      // Send chat message about the booking
      const messageData = {
        tutor_profile_id: tutorProfileId,
        student_id: currentUserId,
        sender_id: currentUserId,
        sender_type: 'student',
        message: `הגשתי בקשה לשיעור ב-${format(new Date(bookingData.lesson_date), 'dd/MM/yyyy HH:mm', { locale: he })}`,
        message_type: 'booking_request',
        booking_data: bookingData
      };

      const sentMessage = await TutorChat.create(messageData);
      setMessages(prev => [...prev, sentMessage]);
    } catch (error) {
      console.error('Error sending booking request:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderMessage = (message, index) => {
    const isFromCurrentUser = message.sender_id === currentUserId;
    const isBookingRequest = message.message_type === 'booking_request';
    
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`flex gap-3 mb-4 ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
      >
        {!isFromCurrentUser && (
          <Avatar className="w-8 h-8">
            <AvatarImage src={tutor?.user?.avatar_url} />
            <AvatarFallback className="bg-purple-500 text-white">
              {tutor?.user?.full_name?.[0]}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={`max-w-[70%] ${isFromCurrentUser ? 'order-first' : ''}`}>
          <div className={`p-3 rounded-2xl shadow-sm ${
            isFromCurrentUser 
              ? 'bg-blue-500 text-white rounded-br-none'
              : 'bg-white border rounded-bl-none'
          }`}>
            {isBookingRequest ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">בקשת שיעור</span>
                </div>
                {message.booking_data && (
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>{format(new Date(message.booking_data.lesson_date), 'dd/MM/yyyy HH:mm', { locale: he })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3" />
                      <span>{message.booking_data.location_type === 'online' ? t.online : t.inPerson}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm">{message.message}</p>
            )}
          </div>
          
          <div className="text-xs text-gray-500 mt-1 px-1">
            {format(new Date(message.created_date), 'HH:mm', { locale: he })}
            {message.read && isFromCurrentUser && (
              <CheckCircle className="w-3 h-3 inline mr-1 text-blue-500" />
            )}
          </div>
        </div>

        {isFromCurrentUser && (
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-blue-500 text-white">
              {currentUser?.full_name?.[0]}
            </AvatarFallback>
          </Avatar>
        )}
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <Card className="h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>{t.loadingChat}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-96 flex flex-col">
      <CardHeader className="border-b px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={tutor?.user?.avatar_url} />
              <AvatarFallback className="bg-purple-500 text-white">
                {tutor?.user?.full_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-sm">{t.chatWith} {tutor?.user?.full_name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  ₪{tutor?.hourly_rate}/שעה
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {tutor?.user?.phone_number && (
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => window.open(`tel:${tutor.user.phone_number}`, '_self')}
              >
                <Phone className="w-4 h-4" />
              </Button>
            )}
            <Button size="sm" variant="ghost">
              <Video className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>{t.startConversation} {tutor?.user?.full_name}</p>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map(renderMessage)}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </ScrollArea>

        <div className="border-t p-4 flex-shrink-0">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={t.typeMessage}
              onKeyPress={handleKeyPress}
              disabled={isSending}
              className="flex-1"
            />
            <Button 
              onClick={sendMessage}
              disabled={!newMessage.trim() || isSending}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}