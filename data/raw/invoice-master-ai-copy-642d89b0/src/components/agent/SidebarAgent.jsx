
import React, { useState, useEffect, useRef } from "react";
import { agentSDK } from "@/agents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Brain, Sparkles, MessageCircle, History, Plus, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import MessageBubble from "./MessageBubble";
import { cn } from "@/lib/utils";

const agentDetails = {
  expense_manager: {
    name: "expense_manager",
    title: "Alex Riley",
    description: "AI Financial Assistant",
    Icon: Sparkles,
    theme: {
      bg: "glass-light",
      accent: "text-blue-400"
    }
  },
  present_bias_psychologist: {
    name: "present_bias_psychologist",
    title: "Dr. Sarah Chen",
    description: "Present Bias Psychology",
    Icon: Brain,
    theme: {
      bg: "glass-dark",
      accent: "text-purple-400"
    }
  }
};

export default function SidebarAgent() {
  const [activeAgent, setActiveAgent] = useState("expense_manager");
  const [conversation, setConversation] = useState(null);
  const [message, setMessage] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const currentAgent = agentDetails[activeAgent];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  const loadConversations = async () => {
    try {
      const convs = await agentSDK.listConversations({
        agent_name: activeAgent
      });
      setConversations(convs || []);
      setError(null);
    } catch (error) {
      console.error("Failed to load conversations:", error);
      if (error.message?.includes('429')) {
        setError("AI service is temporarily busy. Please try again in a few minutes.");
      }
    }
  };

  useEffect(() => {
    const initializeConversation = async () => {
      try {
        // Always create a new conversation on load, don't get from session storage
        const conv = await agentSDK.createConversation({
          agent_name: activeAgent,
          metadata: {
            name: `${currentAgent.title} Session`,
            description: currentAgent.description
          }
        });
        setConversation(conv);
        setError(null);
        loadConversations();
      } catch (error) {
        console.error("Failed to initialize conversation:", error);
        if (error.message?.includes('429')) {
          setError("AI service is temporarily busy. Please try again in a few minutes.");
        }
      }
    };

    initializeConversation();
  }, [activeAgent]);

  useEffect(() => {
    if (!conversation?.id) return;

    const unsubscribe = agentSDK.subscribeToConversation(conversation.id, (data) => {
      setConversation(prev => {
        return { ...prev, messages: data.messages };
      });
    });

    return () => unsubscribe();
  }, [conversation?.id]);

  const lastMessage = conversation?.messages?.[conversation.messages.length - 1];
  const isLoading = lastMessage?.role === 'user' || (lastMessage?.role === 'assistant' && lastMessage?.tool_calls?.some(tc => tc.status !== 'completed' && tc.status !== 'failed'));

  const handleSendMessage = async () => {
    if (!message.trim() || !conversation || isLoading) return;
    const messageText = message.trim();
    setMessage("");
    try {
      await agentSDK.addMessage(conversation, {
        role: "user",
        content: messageText
      });
      setError(null);
    } catch (error) {
      console.error("Failed to send message:", error);
      if (error.message?.includes('429')) {
        setError("AI service is temporarily busy. Please try again in a few minutes.");
      } else {
        setError("Failed to send message. Please try again.");
      }
      setMessage(messageText);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectConversation = async (conv) => {
    try {
      const fullConv = await agentSDK.getConversation(conv.id);
      setConversation(fullConv);
      // Removed session storage
      setShowHistory(false);
      setError(null);
    } catch (error) {
      console.error("Failed to load conversation:", error);
      if (error.message?.includes('429')) {
        setError("AI service is temporarily busy. Please try again in a few minutes.");
      }
    }
  };

  const handleNewChat = async () => {
    try {
      const conv = await agentSDK.createConversation({
        agent_name: activeAgent,
        metadata: {
          name: `New ${currentAgent.title} Chat`,
          description: currentAgent.description
        }
      });
      setConversation(conv);
      // Removed session storage
      setShowHistory(false);
      setError(null);
      loadConversations();
    } catch (error) {
      console.error("Failed to create new conversation:", error);
      if (error.message?.includes('429')) {
        setError("AI service is temporarily busy. Please try again in a few minutes.");
      }
    }
  };

  const switchAgent = (agentName) => {
    setActiveAgent(agentName);
    setShowHistory(false);
  };

  if (showHistory) {
    return (
      <div className={cn("h-full flex flex-col rounded-r-[20px] p-6", currentAgent.theme.bg)}>
        <div className="flex items-center gap-3 mb-6 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowHistory(false)}
            className="w-8 h-8 glass-light hover:glass-hover rounded-full"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </Button>
          <div className="text-white">
            <div className="text-sm font-medium">Chat History</div>
            <div className="text-xs text-white/60">{currentAgent.title}</div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 glass-darker rounded-xl border border-red-400/30">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto pr-2 -mr-4 space-y-3">
          <Button
            onClick={handleNewChat}
            className="w-full glass-light hover:glass-hover text-white rounded-xl justify-start mb-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>

          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => handleSelectConversation(conv)}
              className="w-full text-left p-3 glass-light hover:glass-hover rounded-xl transition-all duration-200"
            >
              <div className="text-white font-medium text-sm truncate mb-1">
                {conv.metadata?.name || 'Chat Session'}
              </div>
              <div className="text-white/60 text-xs">
                {format(new Date(conv.created_date), 'MMM d, h:mm a')}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full flex flex-col rounded-r-[20px] p-6", currentAgent.theme.bg)}>
      {/* Agent Selector */}
      <div className="flex gap-2 mb-6">
        {Object.entries(agentDetails).map(([key, agent]) => (
          <button
            key={key}
            onClick={() => switchAgent(key)}
            className={cn(
              "flex-1 p-3 rounded-xl transition-all duration-200 text-center",
              activeAgent === key ? "glass-hover ring-2 ring-white/30" : "glass-light hover:glass-hover"
            )}
          >
            <agent.Icon className="w-5 h-5 mx-auto mb-1 text-white" />
            <div className="text-xs text-white/80 font-medium">{agent.title}</div>
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 glass-light rounded-xl flex items-center justify-center">
            <currentAgent.Icon className="w-6 h-6 text-white" />
          </div>
          <div className="text-white">
            <div className="text-sm font-medium">{currentAgent.title}</div>
            <div className="text-xs text-white/60">{currentAgent.description}</div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => { setShowHistory(true); loadConversations(); }}
          className="glass-light hover:glass-hover rounded-xl"
        >
          <History className="w-5 h-5 text-white" />
        </Button>
      </div>

      {/* Current Date */}
      {conversation && (
        <div className="mb-4 text-center">
          <div className="text-xs text-white/60 glass-light rounded-full px-3 py-1 inline-block">
            {format(new Date(conversation.created_date), 'EEEE, MMMM d, yyyy • h:mm a')}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 glass-darker rounded-xl border border-red-400/30">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto pr-2 -mr-4 space-y-4 mb-4">
        {!conversation?.messages?.length ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-white/60 text-sm px-4">
              {activeAgent === 'expense_manager' 
                ? "Ask me to analyze your spending, find invoices, or suggest budget optimizations."
                : "I'm here to help you understand present bias and develop better decision-making strategies."
              }
            </p>
          </div>
        ) : (
          conversation.messages.map((msg, index) => (
            <MessageBubble key={index} message={msg} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0">
        <div className="relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask anything..."
            className="w-full glass-light border-0 text-white placeholder:text-white/60 rounded-xl pr-10 h-12"
            disabled={isLoading}
          />
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 text-white hover:glass-hover rounded-lg"
          >
            {isLoading ? (
              <MessageCircle className="w-5 h-5 animate-pulse" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
