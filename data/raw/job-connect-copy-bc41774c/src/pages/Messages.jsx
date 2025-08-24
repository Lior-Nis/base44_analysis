import React, { useState, useEffect } from "react";
import { Search, Send, ArrowLeft, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Message, User, Notification } from "@/api/entities";
import { formatDistanceToNow } from "date-fns";
import AppHeader from "../components/common/AppHeader";
import LoginScreen from "../components/auth/LoginScreen";
import { useLocalization } from "@/components/common/Localization";

export default function Messages() {
  const { t } = useLocalization();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    getCurrentUser();
    
    const activeConversation = sessionStorage.getItem('activeConversation');
    if (activeConversation) {
      const conversation = JSON.parse(activeConversation);
      setSelectedConversation(conversation);
      loadMessages(conversation.id);
      sessionStorage.removeItem('activeConversation');
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadConversations();
    }
  }, [currentUser]);

  const getCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("User not logged in");
      setIsAuthenticated(false);
    }
  };

  const loadConversations = async () => {
    if (!currentUser) return;
    
    try {
      const allMessages = await Message.filter(
        {
          "$or": [
            { "created_by": currentUser.email },
            { "recipient_email": currentUser.email }
          ]
        },
        "-created_date",
        100
      );
      
      const conversationMap = new Map();
      
      allMessages.forEach(message => {
        const otherUser = message.created_by === currentUser.email 
          ? { email: message.recipient_email, name: message.recipient_name }
          : { email: message.created_by, name: message.sender_name };
          
        const conversationId = [currentUser.email, otherUser.email].sort().join('_');
        
        if (!conversationMap.has(conversationId)) {
          conversationMap.set(conversationId, {
            id: conversationId,
            name: otherUser.name,
            email: otherUser.email,
            avatar: null,
            lastMessage: message.content,
            lastMessageTime: message.created_date,
            unreadCount: 0,
            isOnline: Math.random() > 0.5 // Mock online status
          });
        }
        
        const conversation = conversationMap.get(conversationId);
        if (new Date(message.created_date) > new Date(conversation.lastMessageTime)) {
          conversation.lastMessage = message.content;
          conversation.lastMessageTime = message.created_date;
        }
        
        if (message.created_by !== currentUser.email && !message.is_read) {
          conversation.unreadCount++;
        }
      });

      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId) => {
    if (!conversationId) return;
    
    try {
      const conversationMessages = await Message.filter(
        { conversation_id: conversationId },
        "created_date"
      );
      setMessages(conversationMessages);
      
      const unreadMessages = conversationMessages.filter(
        msg => msg.recipient_email === currentUser?.email && !msg.is_read
      );
      
      for (const msg of unreadMessages) {
        await Message.update(msg.id, { is_read: true });
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;

    try {
      await Message.create({
        content: newMessage.trim(),
        recipient_email: selectedConversation.email,
        recipient_name: selectedConversation.name,
        sender_name: currentUser.full_name,
        conversation_id: selectedConversation.id
      });

      await Notification.create({
        title: "New Message",
        message: newMessage.trim(),
        type: "message",
        recipient_email: selectedConversation.email,
        sender_name: currentUser.full_name,
        sender_avatar: currentUser.avatar_url
      });

      setNewMessage("");
      loadMessages(selectedConversation.id);
      loadConversations();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.id);
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
    setMessages([]);
  };

  const filteredConversations = conversations.filter(conv =>
    !searchQuery || 
    conv.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated && !loading) {
    return <LoginScreen />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      </div>
    );
  }

  // Chat View
  if (selectedConversation) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
          <div className="px-4 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToList}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="w-6 h-6" />
              </Button>
              
              <Avatar className="w-10 h-10">
                <AvatarImage src={selectedConversation.avatar} />
                <AvatarFallback className="bg-white text-orange-600">
                  {selectedConversation.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h3 className="font-semibold">{selectedConversation.name}</h3>
                <p className="text-sm text-orange-100">
                  {selectedConversation.isOnline ? t('activeNow') : t('lastSeen')}
                </p>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => window.open(`tel:${selectedConversation.phone || ''}`, '_self')}
              >
                <Phone className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => {
            const isOwnMessage = message.created_by === currentUser?.email;
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    isOwnMessage
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-gray-900 shadow-sm'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwnMessage ? 'text-orange-100' : 'text-gray-500'
                    }`}
                  >
                    {formatDistanceToNow(new Date(message.created_date), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
          <div className="flex gap-3">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={t('typeAMessage')}
              className="flex-1 rounded-full border-gray-300 focus:border-orange-500"
            />
            <Button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-orange-500 hover:bg-orange-600 rounded-full px-6"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Conversations List View
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />

      <div className="p-4 pb-24">
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder={t('searchConversations')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-base rounded-full border-gray-300 focus:border-orange-500 focus:ring-orange-500"
          />
        </div>

        <div className="space-y-3">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <Card 
                key={conversation.id} 
                className="cursor-pointer hover:shadow-md transition-all duration-200 border border-gray-100"
                onClick={() => handleConversationClick(conversation)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="w-14 h-14">
                        <AvatarImage src={conversation.avatar} />
                        <AvatarFallback className="bg-orange-100 text-orange-600 font-semibold text-lg">
                          {conversation.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-gray-800 text-lg truncate">
                          {conversation.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-gray-500 whitespace-nowrap">
                            {formatDistanceToNow(new Date(conversation.lastMessageTime), { addSuffix: true })}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge className="bg-orange-500 text-white rounded-full h-6 w-6 flex items-center justify-center p-0">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 truncate mb-1">
                        {conversation.lastMessage}
                      </p>
                      <p className="text-xs text-gray-400">
                        {conversation.isOnline ? t('online') : t('offline')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-16 text-gray-500">
              <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Search className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">{t('noConversations')}</h3>
              <p className="text-gray-600">{t('startMessaging')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}