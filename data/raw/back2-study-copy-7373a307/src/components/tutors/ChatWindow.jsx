import React, { useState, useEffect, useRef } from 'react';
import { TutorChat } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, ArrowLeft, MoreVertical } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { format, isToday, isYesterday } from 'date-fns';
import { he, enUS } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../ui/theme-provider';

const translations = {
  he: {
    typeMessage: 'הקלד הודעה...',
    send: 'שלח',
    today: 'היום',
    yesterday: 'אתמול',
    online: 'מחובר/ת',
    lastSeen: 'נראה לאחרונה',
    back: 'חזור',
    noMessages: 'אין הודעות עדיין',
    startConversation: 'התחל שיחה עם התלמיד'
  },
  en: {
    typeMessage: 'Type a message...',
    send: 'Send',
    today: 'Today',
    yesterday: 'Yesterday',
    online: 'Online',
    lastSeen: 'Last seen',
    back: 'Back',
    noMessages: 'No messages yet',
    startConversation: 'Start conversation with student'
  }
};

export default function ChatWindow({ 
  currentUser, 
  student, 
  language, 
  onBack, 
  isMobile = false 
}) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const { themeClasses } = useTheme();
  const t = translations[language];
  const locale = language === 'he' ? he : enUS;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (currentUser?.tutor_profile_id && student?.id) {
      loadMessages();
    }
  }, [currentUser?.tutor_profile_id, student?.id]);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const fetchedMessages = await TutorChat.filter({
        tutor_profile_id: currentUser.tutor_profile_id,
        student_id: student.id
      }, 'created_date');
      setMessages(fetchedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const messageData = {
        tutor_profile_id: currentUser.tutor_profile_id,
        student_id: student.id,
        sender_id: currentUser.id,
        sender_type: 'tutor',
        message: newMessage,
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

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, 'HH:mm', { locale });
    } else if (isYesterday(date)) {
      return t.yesterday;
    } else {
      return format(date, 'dd/MM/yy HH:mm', { locale });
    }
  };

  if (!student) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className={`${themeClasses.textSecondary} text-center`}>
          {t.noMessages}
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isMobile && onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-white/80 hover:text-white p-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            
            <Avatar className="w-8 h-8 border border-white/20">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm font-semibold">
                {student.full_name?.charAt(0) || 'S'}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h3 className={`font-semibold ${themeClasses.textPrimary} text-sm`}>
                {student.full_name}
              </h3>
              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                {t.online}
              </Badge>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin w-6 h-6 border-2 border-white/20 border-t-white rounded-full" />
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex ${message.sender_type === 'tutor' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    message.sender_type === 'tutor'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-white/10 text-white rounded-bl-none'
                  }`}>
                    <p className="text-sm">{message.message}</p>
                    <p className={`text-xs mt-1 opacity-70`}>
                      {formatMessageTime(message.created_date)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-white/10 bg-white/5">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t.typeMessage}
            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            disabled={isSending}
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isSending}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4"
          >
            {isSending ? (
              <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}