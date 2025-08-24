import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { MessageSquare, Send, X, ChevronsDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ADMIN_ID = "ADMIN_SUPPORT_DESK";

export default function SupportChatWidget({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    if (!user) return;
    const userMessages = await ChatMessage.filter({ conversation_id: user.id }, 'created_date');
    setMessages(userMessages);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const messageData = {
      sender_id: user.id,
      receiver_id: ADMIN_ID,
      conversation_id: user.id,
      message: newMessage,
      sender_role: user.role,
      read: false
    };

    await ChatMessage.create(messageData);
    setNewMessage('');
    fetchMessages();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-4 lg:right-8 z-50"
          >
            <Card className="w-[350px] h-[500px] bg-slate-800/80 backdrop-blur-lg border-purple-500/30 flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-purple-500/20">
                <CardTitle className="text-white text-lg">Support Chat</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-white">
                  <X className="w-5 h-5" />
                </Button>
              </CardHeader>
              <CardContent className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      msg.sender_id === user.id 
                        ? 'bg-purple-600 text-white rounded-br-none' 
                        : 'bg-slate-700 text-gray-200 rounded-bl-none'
                    }`}>
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-xs text-gray-400 mt-1 text-right">
                        {new Date(msg.created_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </CardContent>
              <CardFooter className="p-4 border-t border-purple-500/20">
                <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Button type="submit" size="icon" className="bg-purple-600 hover:bg-purple-700">
                    <Send className="w-5 h-5" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 lg:right-8 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center justify-center shadow-lg"
      >
        {isOpen ? <ChevronsDown className="w-8 h-8" /> : <MessageSquare className="w-8 h-8" />}
      </motion.button>
    </>
  );
}