import React, { useState, useEffect } from "react";
import { Message } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Send, MessageCircle, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const ADMIN_EMAIL = "alzfaryamr@gmail.com";

  useEffect(() => {
    loadUserAndMessages();
  }, []);

  const loadUserAndMessages = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      await loadMessages(currentUser.email);
    } catch (error) {
      console.error("Error loading user and messages:", error);
    }
    setLoading(false);
  };

  const loadMessages = async (userEmail) => {
    try {
      const allMessages = await Message.list("-created_date");
      
      // Filter messages for current user
      const userMessages = allMessages.filter(msg => 
        msg.sender_email === userEmail || msg.receiver_email === userEmail
      );
      
      setMessages(userMessages);
      
      // Group messages into conversations
      const conversationMap = {};
      userMessages.forEach(msg => {
        const otherUser = msg.sender_email === userEmail ? msg.receiver_email : msg.sender_email;
        const convId = [userEmail, otherUser].sort().join('-');
        
        if (!conversationMap[convId]) {
          conversationMap[convId] = {
            id: convId,
            otherUser: otherUser,
            messages: [],
            lastMessage: null,
            unreadCount: 0
          };
        }
        
        conversationMap[convId].messages.push(msg);
        if (!conversationMap[convId].lastMessage || 
            new Date(msg.created_date) > new Date(conversationMap[convId].lastMessage.created_date)) {
          conversationMap[convId].lastMessage = msg;
        }
        
        if (!msg.is_read && msg.receiver_email === userEmail) {
          conversationMap[convId].unreadCount++;
        }
      });
      
      const conversationList = Object.values(conversationMap).sort((a, b) => 
        new Date(b.lastMessage?.created_date || 0) - new Date(a.lastMessage?.created_date || 0)
      );
      
      setConversations(conversationList);
      
      // Auto-select admin conversation or first conversation
      if (conversationList.length > 0) {
        const adminConv = conversationList.find(conv => conv.otherUser === ADMIN_EMAIL);
        setSelectedConversation(adminConv || conversationList[0]);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const createConversationId = (email1, email2) => {
    return [email1, email2].sort().join('-');
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;
    
    try {
      const receiverEmail = user.email === ADMIN_EMAIL && selectedConversation 
        ? selectedConversation.otherUser 
        : ADMIN_EMAIL;
        
      const conversationId = createConversationId(user.email, receiverEmail);
      
      await Message.create({
        sender_email: user.email,
        receiver_email: receiverEmail,
        message_content: newMessage,
        conversation_id: conversationId,
        is_read: false
      });
      
      setNewMessage("");
      await loadMessages(user.email);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const markMessagesAsRead = async (conversation) => {
    try {
      const unreadMessages = conversation.messages.filter(
        msg => !msg.is_read && msg.receiver_email === user.email
      );
      
      for (const msg of unreadMessages) {
        await Message.update(msg.id, { is_read: true });
      }
      
      await loadMessages(user.email);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const selectConversation = async (conversation) => {
    setSelectedConversation(conversation);
    if (conversation.unreadCount > 0) {
      await markMessagesAsRead(conversation);
    }
  };

  const startNewConversation = async () => {
    if (!user || user.email === ADMIN_EMAIL) return;
    
    // For students, automatically create/select admin conversation
    const adminConversationId = createConversationId(user.email, ADMIN_EMAIL);
    
    let adminConv = conversations.find(conv => conv.otherUser === ADMIN_EMAIL);
    
    if (!adminConv) {
      adminConv = {
        id: adminConversationId,
        otherUser: ADMIN_EMAIL,
        messages: [],
        lastMessage: null,
        unreadCount: 0
      };
    }
    
    setSelectedConversation(adminConv);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Private Messages</h1>
          <p className="text-slate-600">
            {user?.email === ADMIN_EMAIL ? "Communicate with your students" : "Direct communication with your instructor"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Conversations
                </CardTitle>
                {user?.email !== ADMIN_EMAIL && (
                  <Button size="sm" onClick={startNewConversation}>
                    New Message
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {conversations.map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      onClick={() => selectConversation(conversation)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedConversation?.id === conversation.id
                          ? 'bg-blue-100 border-blue-300 border'
                          : 'hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {conversation.otherUser === ADMIN_EMAIL ? "Instructor" : conversation.otherUser}
                            </p>
                            {conversation.lastMessage && (
                              <p className="text-xs text-slate-500 truncate max-w-32">
                                {conversation.lastMessage.message_content}
                              </p>
                            )}
                          </div>
                        </div>
                        {conversation.unreadCount > 0 && (
                          <Badge className="bg-red-500 text-white">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {conversations.length === 0 && (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No conversations yet</p>
                    {user?.email !== ADMIN_EMAIL && (
                      <Button size="sm" onClick={startNewConversation} className="mt-3">
                        Start Conversation
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Message Thread */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                {selectedConversation 
                  ? `Chat with ${selectedConversation.otherUser === ADMIN_EMAIL ? "Instructor" : selectedConversation.otherUser}`
                  : "Select a conversation"
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedConversation ? (
                <div className="h-96 flex flex-col">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                    {selectedConversation.messages
                      .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
                      .map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${message.sender_email === user.email ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender_email === user.email
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-200 text-slate-900'
                          }`}>
                            <p className="text-sm">{message.message_content}</p>
                            <p className={`text-xs mt-1 ${
                              message.sender_email === user.email ? 'text-blue-100' : 'text-slate-500'
                            }`}>
                              {new Date(message.created_date).toLocaleTimeString()}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                  
                  {/* Message Input */}
                  <div className="flex gap-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      rows={2}
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}