import React, { useState, useEffect, useRef } from "react";
import { StudyMessage } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Paperclip, Smile, MoreVertical, Heart, ThumbsUp, Laugh } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadFile } from "@/api/integrations";

const translations = {
  he: {
    typeMessage: "כתוב הודעה...",
    send: "שלח",
    uploadFile: "העלה קובץ",
    noMessages: "אין הודעות עדיין",
    startConversation: "התחל שיחה",
    you: "אתה",
    now: "עכשיו",
    today: "היום",
    yesterday: "אתמול"
  },
  en: {
    typeMessage: "Type a message...",
    send: "Send",
    uploadFile: "Upload File",
    noMessages: "No messages yet",
    startConversation: "Start a conversation",
    you: "You",
    now: "now",
    today: "today",
    yesterday: "yesterday"
  }
};

const reactions = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

export default function StudyChat({ circleId, chatType = 'study_circle', language = 'he' }) {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const t = translations[language];
  const isRTL = language === 'he';

  useEffect(() => {
    loadData();
    // Auto-refresh messages every 5 seconds
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [circleId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      await loadMessages();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const messagesData = await StudyMessage.filter(
        { circle_id: circleId },
        '-created_date',
        50
      );
      setMessages(messagesData.reverse()); // Show oldest first
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || isSending) return;

    setIsSending(true);
    try {
      await StudyMessage.create({
        circle_id: circleId,
        sender_id: user.id,
        sender_name: user.full_name,
        message: newMessage.trim(),
        message_type: 'text',
        reactions: []
      });

      setNewMessage('');
      await loadMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      
      await StudyMessage.create({
        circle_id: circleId,
        sender_id: user.id,
        sender_name: user.full_name,
        message: `שיתף קובץ: ${file.name}`,
        message_type: 'file',
        file_url: file_url,
        file_name: file.name,
        reactions: []
      });

      await loadMessages();
      fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReaction = async (messageId, reaction) => {
    if (!user) return;

    try {
      const message = messages.find(m => m.id === messageId);
      if (!message) return;

      const existingReactions = message.reactions || [];
      const userReactionIndex = existingReactions.findIndex(r => r.user_id === user.id);
      
      let updatedReactions;
      if (userReactionIndex >= 0) {
        // User already reacted, update or remove
        if (existingReactions[userReactionIndex].reaction === reaction) {
          // Remove reaction
          updatedReactions = existingReactions.filter(r => r.user_id !== user.id);
        } else {
          // Update reaction
          updatedReactions = [...existingReactions];
          updatedReactions[userReactionIndex].reaction = reaction;
        }
      } else {
        // Add new reaction
        updatedReactions = [...existingReactions, { user_id: user.id, reaction }];
      }

      await StudyMessage.update(messageId, {
        ...message,
        reactions: updatedReactions
      });

      await loadMessages();
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const formatMessageTime = (dateString) => {
    const messageDate = new Date(dateString);
    const now = new Date();
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return t.now;
    if (diffMins < 60) return `${diffMins} דקות`;
    if (diffHours < 24) return `${diffHours} שעות`;
    if (diffDays === 1) return t.yesterday;
    if (diffDays < 7) return `${diffDays} ימים`;
    
    return messageDate.toLocaleDateString(language === 'he' ? 'he' : 'en');
  };

  const groupReactions = (reactions) => {
    const grouped = {};
    reactions.forEach(r => {
      if (!grouped[r.reaction]) {
        grouped[r.reaction] = [];
      }
      grouped[r.reaction].push(r.user_id);
    });
    return grouped;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-gray-400" />
            </div>
            <p className="mb-2">{t.noMessages}</p>
            <p className="text-sm">{t.startConversation}</p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message, index) => {
              const isOwnMessage = message.sender_id === user?.id;
              const showSender = index === 0 || messages[index - 1].sender_id !== message.sender_id;
              const reactionGroups = groupReactions(message.reactions || []);
              
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                    {showSender && !isOwnMessage && (
                      <div className="text-xs text-gray-500 mb-1 px-3">
                        {message.sender_name}
                      </div>
                    )}
                    
                    <div className="group relative">
                      <div
                        className={`p-3 rounded-2xl shadow-sm ${
                          isOwnMessage
                            ? 'bg-blue-500 text-white rounded-br-sm'
                            : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
                        }`}
                      >
                        {message.message_type === 'file' ? (
                          <div className="space-y-2">
                            <p className="text-sm">{message.message}</p>
                            {message.file_url && (
                              <a
                                href={message.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`text-sm underline ${
                                  isOwnMessage ? 'text-blue-100' : 'text-blue-600'
                                }`}
                              >
                                <Paperclip className="w-4 h-4 inline mr-1" />
                                {message.file_name || 'קובץ מצורף'}
                              </a>
                            )}
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{message.message}</p>
                        )}
                      </div>

                      {/* Reactions */}
                      {Object.keys(reactionGroups).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(reactionGroups).map(([reaction, userIds]) => (
                            <button
                              key={reaction}
                              onClick={() => handleReaction(message.id, reaction)}
                              className={`px-2 py-1 rounded-full text-xs border transition-colors ${
                                userIds.includes(user?.id)
                                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                                  : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {reaction} {userIds.length}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Quick Reactions (appear on hover) */}
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-1 bg-white rounded-full shadow-lg border border-gray-200 p-1 mt-1">
                          {reactions.map((reaction) => (
                            <button
                              key={reaction}
                              onClick={() => handleReaction(message.id, reaction)}
                              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-sm transition-colors"
                            >
                              {reaction}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className={`text-xs text-gray-400 mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                      {formatMessageTime(message.created_date)}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <form onSubmit={handleSendMessage} className="flex items-end gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
          />
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="text-gray-500 hover:text-gray-700"
          >
            {isUploading ? (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"
              />
            ) : (
              <Paperclip className="w-4 h-4" />
            )}
          </Button>

          <div className="flex-1">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={t.typeMessage}
              className="resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              disabled={isSending}
            />
          </div>

          <Button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isSending ? (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="sr-only">{t.send}</span>
          </Button>
        </form>
      </div>
    </div>
  );
}