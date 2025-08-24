import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, User as UserIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const ADMIN_ID = "ADMIN_SUPPORT_DESK";

export default function ChatManager({ adminUser }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConvoId, setSelectedConvoId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedConvoId) {
      fetchMessages(selectedConvoId);
      const interval = setInterval(() => fetchMessages(selectedConvoId), 3000);
      return () => clearInterval(interval);
    }
  }, [selectedConvoId]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    const allMessages = await ChatMessage.list('-created_date', 500); // Get recent messages
    const convos = allMessages.reduce((acc, msg) => {
      if (!acc[msg.conversation_id]) {
        acc[msg.conversation_id] = {
          id: msg.conversation_id,
          lastMessage: msg.message,
          lastMessageDate: msg.created_date,
          unreadCount: 0
        };
      }
      if (!msg.read && msg.receiver_id === ADMIN_ID) {
        acc[msg.conversation_id].unreadCount++;
      }
      return acc;
    }, {});
    
    const convoList = Object.values(convos);
    const userIds = convoList.map(c => c.id);
    const users = await User.filter({id: { "$in": userIds }});

    const populatedConvos = convoList.map(convo => {
        const user = users.find(u => u.id === convo.id);
        return { ...convo, user: user || {full_name: 'Unknown User'} };
    });

    setConversations(populatedConvos);
  };

  const fetchMessages = async (convoId) => {
    const convoMessages = await ChatMessage.filter({ conversation_id: convoId }, 'created_date');
    setMessages(convoMessages);

    // Mark messages as read
    convoMessages.forEach(async msg => {
      if (!msg.read && msg.receiver_id === ADMIN_ID) {
        await ChatMessage.update(msg.id, { read: true });
      }
    });
    fetchConversations(); // Refresh unread counts
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConvoId) return;

    await ChatMessage.create({
      sender_id: adminUser.id,
      receiver_id: selectedConvoId,
      conversation_id: selectedConvoId,
      message: newMessage,
      sender_role: 'admin',
      read: false
    });

    setNewMessage('');
    fetchMessages(selectedConvoId);
  };
  
  return (
    <Card className="bg-slate-800/50 border-slate-700/50 h-[70vh] flex">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Conversations</CardTitle>
        </CardHeader>
        <ScrollArea className="h-[calc(70vh-80px)]">
          <CardContent className="p-2">
            {conversations.map(convo => (
              <button
                key={convo.id}
                onClick={() => setSelectedConvoId(convo.id)}
                className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                  selectedConvoId === convo.id ? 'bg-purple-600/30' : 'hover:bg-slate-700/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">{convo.user.full_name}</span>
                  {convo.unreadCount > 0 && (
                    <Badge className="bg-red-500">{convo.unreadCount}</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-400 truncate">{convo.lastMessage}</p>
              </button>
            ))}
          </CardContent>
        </ScrollArea>
      </div>

      {/* Chat Window */}
      <div className="w-2/3 flex flex-col">
        {selectedConvoId ? (
          <>
            <CardHeader className="border-b border-slate-700">
              <CardTitle className="text-white flex items-center gap-2">
                  <UserIcon className="w-5 h-5"/>
                  {conversations.find(c => c.id === selectedConvoId)?.user.full_name}
              </CardTitle>
            </CardHeader>
            <ScrollArea className="flex-1 p-4 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender_role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    msg.sender_role === 'admin' 
                      ? 'bg-blue-600 text-white rounded-br-none' 
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
            </ScrollArea>
            <div className="p-4 border-t border-slate-700">
              <form onSubmit={handleSendMessage} className="flex w-full gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a reply..."
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Button type="submit" size="icon" className="bg-blue-600 hover:bg-blue-700">
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </Card>
  );
}