import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, MessageCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, isToday, isYesterday } from 'date-fns';
import { he, enUS } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { useTheme } from '../ui/theme-provider';

const translations = {
  he: {
    conversations: 'שיחות',
    noConversations: 'אין שיחות פתוחות',
    today: 'היום',
    yesterday: 'אתמול',
    online: 'מחובר/ת',
    lastSeen: 'נראה לאחרונה',
    back: 'חזור'
  },
  en: {
    conversations: 'Conversations',
    noConversations: 'No open conversations',
    today: 'Today',
    yesterday: 'Yesterday',
    online: 'Online',
    lastSeen: 'Last seen',
    back: 'Back'
  }
};

export default function ConversationList({ 
  conversations, 
  studentsData, 
  selectedStudentId, 
  onSelectConversation, 
  language,
  isMobile = false,
  onBack 
}) {
  const { themeClasses } = useTheme();
  const t = translations[language];
  const locale = language === 'he' ? he : enUS;

  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, 'HH:mm', { locale });
    } else if (isYesterday(date)) {
      return t.yesterday;
    } else {
      return format(date, 'dd/MM', { locale });
    }
  };

  if (conversations.length === 0) {
    return (
      <div className={`${isMobile ? 'h-[60vh]' : 'w-80 border-r border-white/10'} p-4 flex items-center justify-center`}>
        <div className="text-center">
          <MessageCircle className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className={`${themeClasses.textSecondary} text-sm`}>{t.noConversations}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isMobile ? 'h-[80vh]' : 'w-80 border-r border-white/10'} bg-white/5`}>
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
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
          <h3 className={`font-semibold ${themeClasses.textPrimary} ${isMobile ? 'text-lg' : 'text-xl'}`}>
            {t.conversations}
          </h3>
          <Badge variant="outline" className="bg-white/10 text-white/80 border-white/20">
            {conversations.length}
          </Badge>
        </div>
      </div>

      {/* Conversations List */}
      <div className="overflow-y-auto h-full">
        {conversations.map((conversation, index) => {
          const student = studentsData[conversation.studentId];
          const isSelected = selectedStudentId === conversation.studentId;
          
          return (
            <motion.div
              key={conversation.studentId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`m-2 cursor-pointer transition-all duration-200 border-0 ${
                  isSelected 
                    ? 'bg-white/20 shadow-lg' 
                    : 'bg-white/5 hover:bg-white/10'
                }`}
                onClick={() => onSelectConversation(conversation.studentId)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative">
                      <Avatar className="w-10 h-10 border border-white/20">
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm font-semibold">
                          {student?.full_name?.charAt(0) || 'S'}
                        </AvatarFallback>
                      </Avatar>
                      {/* Online indicator */}
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`font-medium ${themeClasses.textPrimary} text-sm truncate`}>
                          {student?.full_name || 'משתמש לא ידוע'}
                        </h4>
                        <div className="flex items-center gap-2">
                          {conversation.unreadCount > 0 && (
                            <Badge className="bg-blue-500 text-white text-xs px-2 py-1 min-w-[20px] h-5 rounded-full">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                          <span className={`${themeClasses.textMuted} text-xs`}>
                            {conversation.lastMessage && formatMessageTime(conversation.lastMessage.created_date)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Last message preview */}
                      {conversation.lastMessage && (
                        <p className={`${themeClasses.textSecondary} text-xs truncate`}>
                          {conversation.lastMessage.sender_type === 'tutor' && 'אתה: '}
                          {conversation.lastMessage.message}
                        </p>
                      )}
                    </div>

                    {/* Arrow */}
                    <ArrowRight className={`w-4 h-4 ${themeClasses.textMuted} transition-transform ${
                      isSelected ? 'rotate-90' : ''
                    }`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}