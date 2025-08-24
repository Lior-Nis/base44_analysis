import React, { useState, useEffect, useRef } from 'react';
import { User } from '@/api/entities';
import { InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Brain, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../ui/theme-provider';

const translations = {
  he: {
    placeholder: 'שאל משהו על השיעור...',
    initialMessage: 'היי! אני עוזר הלמידה שלך. איך אני יכול לעזור לך עם שיעור זה?'
  },
  en: {
    placeholder: 'Ask something about the lesson...',
    initialMessage: 'Hi! I am your learning assistant. How can I help you with this lesson?'
  }
}

export default function AILearningChat({ path, currentLesson, onHistoryUpdate, language }) {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState(path.chat_history || []);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { themeClasses } = useTheme();
  const t = translations[language];

  useEffect(() => {
    async function fetchUser() {
      try {
        const userData = await User.me();
        setUser(userData);
      } catch (e) {
        console.error("Failed to fetch user", e);
      }
    }
    fetchUser();
    setMessages(path.chat_history || []);
  }, [path]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      message: newMessage,
      timestamp: new Date().toISOString(),
      lesson_context: currentLesson.id
    };

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setNewMessage('');
    setIsLoading(true);

    try {
      const prompt = `The user is studying a lesson titled "${currentLesson.title}".
      The lesson content is:
      ---
      ${currentLesson.content}
      ---
      The user's question is: "${newMessage}"
      
      Please provide a helpful and concise answer based ONLY on the lesson's context. If the question is outside the scope of the lesson, politely state that you can only answer questions related to the current lesson.`;

      const aiResponse = await InvokeLLM({ prompt });
      
      const aiMessage = {
        role: 'ai',
        message: aiResponse,
        timestamp: new Date().toISOString(),
        lesson_context: currentLesson.id
      };
      
      const finalHistory = [...newHistory, aiMessage];
      setMessages(finalHistory);
      onHistoryUpdate(finalHistory);
    } catch (error) {
      console.error('Error with AI response:', error);
      const errorMessage = {
        role: 'ai',
        message: language === 'he' ? 'מצטער, הייתה שגיאה. אנא נסה שוב.' : 'Sorry, there was an error. Please try again.',
        timestamp: new Date().toISOString(),
        lesson_context: currentLesson.id
      };
      const finalHistory = [...newHistory, errorMessage];
      setMessages(finalHistory);
      onHistoryUpdate(finalHistory);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[60vh]">
      <ScrollArea className="flex-1 p-4 bg-gray-800/50 rounded-t-lg">
        <div className="space-y-4">
          <ChatMessage msg={{ role: 'ai', message: t.initialMessage }} themeClasses={themeClasses} />
          {messages.map((msg, index) => (
            <ChatMessage key={index} msg={msg} themeClasses={themeClasses} />
          ))}
          {isLoading && <TypingIndicator themeClasses={themeClasses} />}
        </div>
        <div ref={messagesEndRef} />
      </ScrollArea>
      <div className="p-4 border-t border-white/20 bg-gray-900/50 rounded-b-lg">
        <div className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t.placeholder}
            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading}
          />
          <Button onClick={handleSendMessage} disabled={isLoading || !newMessage.trim()} className="bg-blue-600 hover:bg-blue-700">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

const TypingIndicator = ({ themeClasses }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`flex items-center gap-2 p-2 ${themeClasses.textMuted}`}>
    <Brain className="w-5 h-5 text-blue-500" />
    <div className="flex gap-1 items-center">
      <motion.div className="w-1.5 h-1.5 bg-blue-500 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0 }} />
      <motion.div className="w-1.5 h-1.5 bg-blue-500 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }} />
      <motion.div className="w-1.5 h-1.5 bg-blue-500 rounded-full" animate={{ y: [0, -3, 0] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }} />
    </div>
  </motion.div>
);

const ChatMessage = ({ msg, themeClasses }) => {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-3 ${isUser ? 'justify-end' : ''}`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-purple-500' : 'bg-blue-500'}`}>
        {isUser ? <UserIcon className="w-5 h-5 text-white" /> : <Brain className="w-5 h-5 text-white" />}
      </div>
      <div className={`p-3 rounded-lg max-w-sm ${isUser ? 'bg-purple-600/30' : 'bg-blue-600/30'}`}>
        <p className={themeClasses.textPrimary}>{msg.message}</p>
      </div>
    </motion.div>
  );
};