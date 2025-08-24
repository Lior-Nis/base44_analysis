
import React, { useState, useEffect, useRef, useCallback } from "react";
import { User } from "@/api/entities";
import { StudyMessage } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Smile, ThumbsUp, Heart, Brain, BookOpen, Users, MessageSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTheme } from '../ui/theme-provider';
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import SafetyMenu from '../safety/SafetyMenu';

const translations = {
  he: {
    placeholder: 'כתוב הודעה...',
    system: 'מערכת',
    typing: 'מקליד/ה...',
    online: 'מחובר/ת',
    lastSeen: 'נראה/תה לאחרונה',
    sendMessage: 'שלח הודעה',
    membersOnline: 'חברים מחוברים'
  },
  en: {
    placeholder: 'Type a message...',
    system: 'System',
    typing: 'is typing...',
    online: 'Online',
    lastSeen: 'Last seen',
    sendMessage: 'Send Message',
    membersOnline: 'Members Online'
  }
};

// Simulated WebSocket-like functionality with enhanced polling
const useRealTimeChat = (circleId, user) => {
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef(null);
  const lastMessageTimeRef = useRef(new Date());

  const loadMessages = useCallback(async () => {
    if (!circleId) return;
    
    try {
      // Load messages newer than last known message
      const fetchedMessages = await StudyMessage.filter(
        { circle_id: circleId }, 
        '-created_date', 
        50
      );
      
      const sortedMessages = fetchedMessages.reverse();
      setMessages(prev => {
        // Only update if we have new messages
        const newMessages = sortedMessages.filter(msg => 
          !prev.some(prevMsg => prevMsg.id === msg.id)
        );
        
        if (newMessages.length > 0) {
          lastMessageTimeRef.current = new Date();
          return [...prev, ...newMessages];
        }
        return prev;
      });
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [circleId]);

  // Simulate online status tracking
  const updateOnlineStatus = useCallback(async () => {
    if (!user) return;
    
    // In a real app, this would update user's last_active timestamp
    // and fetch other users' online status from the server
    try {
      await User.updateMyUserData({ 
        last_active: new Date().toISOString() 
      });
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  }, [user]);

  useEffect(() => {
    if (circleId && user) {
      loadMessages();
      updateOnlineStatus();
      
      // Enhanced polling: check for new messages every 2 seconds
      intervalRef.current = setInterval(() => {
        loadMessages();
        updateOnlineStatus();
      }, 2000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [circleId, user, loadMessages, updateOnlineStatus]);

  return { messages, setMessages, onlineUsers, typingUsers, setTypingUsers, isLoading };
};

// Enhanced debounce for typing indicators
const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

export default function StudyChat({ circle, user, language = 'he' }) {
  const [newMessage, setNewMessage] = useState('');
  const { messages, setMessages, onlineUsers, typingUsers, setTypingUsers, isLoading } = useRealTimeChat(circle?.id, user);
  const messagesEndRef = useRef(null);
  const { themeClasses } = useTheme();
  const t = translations[language || 'en'];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  // Enhanced typing indicator with real user simulation
  const debouncedStopTyping = useCallback(
    debounce((userId) => {
      setTypingUsers(prev => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    }, 1500),
    []
  );

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    // Simulate typing indicator
    if (user && e.target.value.trim()) {
      setTypingUsers(prev => ({
        ...prev,
        [user.id]: user.full_name
      }));
      debouncedStopTyping(user.id);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !circle?.id) return;
    
    const tempId = `temp-${Date.now()}`;
    const messageData = {
      circle_id: circle.id,
      sender_id: user.id,
      sender_name: user.full_name,
      message: newMessage.trim(),
      message_type: 'text',
      created_date: new Date().toISOString(),
    };

    // Clear typing indicator immediately
    setTypingUsers(prev => {
      const updated = { ...prev };
      delete updated[user.id];
      return updated;
    });

    // Optimistic UI update
    setMessages(prev => [...prev, { ...messageData, id: tempId, reactions: [] }]);
    setNewMessage('');

    try {
      const createdMessage = await StudyMessage.create(messageData);
      setMessages(prev => 
        prev.map(msg => msg.id === tempId ? createdMessage : msg)
      );
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
    }
  };

  const handleReaction = async (messageId, reactionEmoji) => {
    const message = messages.find(m => m.id === messageId);
    if (!message || !user?.id) return;

    const existingReactions = message.reactions || [];
    const userReactionIndex = existingReactions.findIndex(r => r.user_id === user.id);

    let updatedReactions;

    if (userReactionIndex > -1) {
      if (existingReactions[userReactionIndex].reaction === reactionEmoji) {
        updatedReactions = existingReactions.filter(r => r.user_id !== user.id);
      } else {
        updatedReactions = existingReactions.map((r, index) =>
          index === userReactionIndex ? { ...r, reaction: reactionEmoji } : r
        );
      }
    } else {
      updatedReactions = [...existingReactions, { user_id: user.id, reaction: reactionEmoji }];
    }

    const originalMessages = messages;
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions: updatedReactions } : m));

    try {
      await StudyMessage.update(messageId, { reactions: updatedReactions });
    } catch (error) {
      console.error('Failed to update reaction:', error);
      setMessages(originalMessages);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"
          />
          <p className={themeClasses.textMuted}>
            {language === 'he' ? 'טוען הודעות...' : 'Loading messages...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-transparent">
      
      {/* Chat Header with Online Status */}
      <div className="border-b border-white/20 p-4 bg-gray-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <h3 className={`font-semibold ${themeClasses.textPrimary}`}>{circle.name}</h3>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className={themeClasses.textMuted}>
                  {circle.members?.length || 0} {t.membersOnline}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs border-white/20 text-purple-300">
              {language === 'he' ? 'צ\'אט חי' : 'Live Chat'}
            </Badge>
            <SafetyMenu
              targetUser={{ id: 'circle', full_name: circle.name }}
              context="study_circle"
              relatedId={circle.id}
              language={language}
            />
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                msg={msg}
                currentUser={user}
                onReaction={handleReaction}
                themeClasses={themeClasses}
                language={language}
              />
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Typing Indicators */}
      {Object.keys(typingUsers).length > 0 && (
        <div className="px-4 pb-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-sm text-gray-400"
          >
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>
              {Object.values(typingUsers).join(', ')} {t.typing}
            </span>
          </motion.div>
        </div>
      )}

      {/* Message Input */}
      <div className="border-t border-white/20 p-4 bg-gray-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={handleTyping}
            placeholder={t.placeholder}
            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:ring-2 focus:ring-purple-500/50"
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!newMessage.trim()} 
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Enhanced Chat Message Component
const ReactionButton = ({ onSelect }) => (
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="ghost" size="icon" className="w-6 h-6 text-white/60 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
        <Smile className="w-4 h-4" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-2 bg-gray-800 border-gray-700">
      <div className="flex gap-1">
        {['👍', '❤️', '😂', '😮', '😢', '😡'].map(emoji => (
          <Button 
            key={emoji} 
            variant="ghost" 
            size="sm" 
            className="text-lg hover:bg-gray-700" 
            onClick={() => onSelect(emoji)}
          >
            {emoji}
          </Button>
        ))}
      </div>
    </PopoverContent>
  </Popover>
);

const ChatMessage = ({ msg, currentUser, onReaction, themeClasses, language }) => {
  const isCurrentUser = msg.sender_id === currentUser?.id;
  const isSystemMessage = msg.message_type === 'system';

  if (isSystemMessage) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="text-center text-xs text-white/50 my-4 flex items-center justify-center gap-2"
      >
        <div className="flex-1 h-px bg-white/20"></div>
        <span className="px-3 py-1 bg-white/10 rounded-full">{msg.message}</span>
        <div className="flex-1 h-px bg-white/20"></div>
      </motion.div>
    );
  }

  // Group reactions by emoji
  const groupedReactions = (msg.reactions || []).reduce((acc, r) => {
    acc[r.reaction] = (acc[r.reaction] || 0) + 1;
    return acc;
  }, {});

  const currentUserReaction = (msg.reactions || []).find(r => r.user_id === currentUser?.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className={`flex items-start gap-3 group ${isCurrentUser ? 'justify-end' : ''}`}
    >
      {!isCurrentUser && (
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-xs">
            {msg.sender_name?.[0] || '?'}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-xs md:max-w-md`}>
        <div className={`relative flex items-center gap-2 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
          <div
            className={`p-3 rounded-2xl shadow-md relative ${
              isCurrentUser
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none'
                : 'bg-gray-700 text-white rounded-bl-none border border-gray-600'
            }`}
          >
            {!isCurrentUser && (
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-bold text-purple-300">{msg.sender_name}</p>
                {msg.sender_id !== currentUser?.id && (
                  <SafetyMenu
                    targetUser={{ id: msg.sender_id, full_name: msg.sender_name }}
                    context="chat_message"
                    relatedId={msg.id}
                    language={language}
                    className="w-4 h-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                )}
              </div>
            )}
            <p className="whitespace-pre-wrap break-words">{msg.message}</p>
            <p className="text-xs opacity-70 mt-1">
              {format(new Date(msg.created_date), 'HH:mm')}
            </p>
          </div>
          
          <ReactionButton onSelect={(emoji) => onReaction(msg.id, emoji)} />
        </div>
        
        {/* Reactions Display */}
        {Object.keys(groupedReactions).length > 0 && (
          <div className="flex gap-1 mt-1 px-2">
            {Object.entries(groupedReactions).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => onReaction(msg.id, emoji)}
                className={`text-xs px-2 py-1 rounded-full backdrop-blur-sm transition-all ${
                  currentUserReaction?.reaction === emoji
                    ? 'bg-blue-500 text-white scale-110' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {emoji} {count > 1 && count}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {isCurrentUser && (
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-gradient-to-br from-gray-600 to-gray-700 text-white font-semibold text-xs">
            {currentUser.full_name?.[0] || '?'}
          </AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  );
};
