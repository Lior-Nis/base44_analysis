import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { agentSDK } from "@/agents";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Brain, Sparkles, MessageCircle, History, Plus, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import MessageBubble from "../components/agent/MessageBubble";
import { cn } from "@/lib/utils";

const agentDetails = {
  expense_manager: {
    name: "expense_manager",
    title: "Expense Manager",
    description: "Your AI-powered expense assistant.",
    Icon: Sparkles,
    theme: {
      bg: "bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900",
      primaryText: "text-slate-100",
      secondaryText: "text-slate-400",
      accent: "text-sky-400"
    }
  },
  present_bias_psychologist: {
    name: "present_bias_psychologist",
    title: "Dr. Sarah Chen",
    description: "Present Bias Psychology • CBT",
    Icon: Brain,
    theme: {
      bg: "bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900",
      primaryText: "text-indigo-100",
      secondaryText: "text-indigo-300",
      accent: "text-teal-300"
    }
  }
};

const AGENT_NAMES = Object.keys(agentDetails);

export default function AgentsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [conversation, setConversation] = useState(null);
  const [message, setMessage] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const activeAgentName = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const agentName = params.get("agent");
    return AGENT_NAMES.includes(agentName) ? agentName : AGENT_NAMES[0];
  }, [location.search]);

  const activeAgent = agentDetails[activeAgentName];

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [conversation?.messages]);

  const loadConversations = async () => {
    try {
      const convs = await agentSDK.listConversations({ agent_name: activeAgentName });
      setConversations(convs || []);
      setError(null);
    } catch (err) {
      console.error("Failed to load conversations:", err);
      setError(err.message?.includes('429') ? "Service is temporarily busy. Please try again later." : "Failed to load conversations.");
    }
  };

  useEffect(() => {
    const initializeConversation = async () => {
      try {
        let conv = await agentSDK.createConversation({
          agent_name: activeAgentName,
          metadata: { name: "New Chat Session" }
        });
        setConversation(conv);
        setError(null);
        loadConversations();
      } catch (err) {
        console.error("Failed to initialize conversation:", err);
        setError(err.message?.includes('429') ? "Service is temporarily busy. Please try again later." : "Failed to initialize session.");
      }
    };
    initializeConversation();
  }, [activeAgentName]);

  useEffect(() => {
    if (!conversation?.id) return;
    const unsubscribe = agentSDK.subscribeToConversation(conversation.id, (data) => setConversation(prev => ({ ...prev, messages: data.messages })));
    return () => unsubscribe();
  }, [conversation?.id]);
  
  const isLoading = conversation?.messages?.[conversation.messages.length - 1]?.role === 'user' || false;

  const handleSendMessage = async () => {
    if (!message.trim() || !conversation || isLoading) return;
    const text = message.trim();
    setMessage("");
    try {
      await agentSDK.addMessage(conversation, { role: "user", content: text });
      setError(null);
    } catch (err) {
      console.error("Failed to send message:", err);
      setError(err.message?.includes('429') ? "Service is temporarily busy. Please try again later." : "Failed to send message.");
      setMessage(text);
    }
  };
  
  const handleSelectConversation = async (conv) => {
    setConversation(conv);
    setShowHistory(false);
  };

  const handleNewChat = async () => {
     try {
      const conv = await agentSDK.createConversation({
        agent_name: activeAgentName,
        metadata: { name: "New Chat Session" }
      });
      setConversation(conv);
      setShowHistory(false);
      loadConversations();
    } catch (err) {
       console.error("Failed to create new conversation:", err);
       setError(err.message?.includes('429') ? "Service is temporarily busy. Please try again later." : "Failed to create new chat.");
    }
  };

  const switchAgent = (agentName) => {
    navigate(`${createPageUrl("Agents")}?agent=${agentName}`);
  };

  return (
    <div className={cn("flex h-screen text-white", activeAgent.theme.bg)}>
      {/* Agent Selection Sidebar */}
      <div className="w-20 bg-black/20 flex flex-col items-center py-8 gap-6">
        {AGENT_NAMES.map(name => {
          const agent = agentDetails[name];
          return (
            <button
              key={name}
              onClick={() => switchAgent(name)}
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                "hover:bg-white/20",
                activeAgentName === name ? "bg-white/20 ring-2 ring-white/50" : "bg-white/10"
              )}
              title={agent.title}
            >
              <agent.Icon className="w-6 h-6" />
            </button>
          );
        })}
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 flex-shrink-0">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black/20 rounded-xl flex items-center justify-center">
                    <activeAgent.Icon className={cn("w-7 h-7", activeAgent.theme.accent)} />
                </div>
                <div>
                    <h1 className={cn("text-2xl font-bold", activeAgent.theme.primaryText)}>{activeAgent.title}</h1>
                    <p className={cn("text-sm", activeAgent.theme.secondaryText)}>{activeAgent.description}</p>
                </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => { setShowHistory(true); loadConversations(); }} className="bg-black/20 hover:bg-black/30 rounded-lg">
                <History className="w-5 h-5" />
            </Button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-4">
            {conversation?.messages?.map((msg, idx) => <MessageBubble key={idx} message={msg} />) ?? (
              <div className="flex items-center justify-center h-full">
                <p className={activeAgent.theme.secondaryText}>
                  {error || `Loading session for ${activeAgent.title}...`}
                </p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="relative flex-shrink-0">
            {error && <p className="text-red-400 text-xs text-center mb-2">{error}</p>}
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Send a message..."
              className="w-full bg-black/30 border-white/20 text-white placeholder:text-gray-400 rounded-lg pr-12 h-12"
              disabled={isLoading}
            />
            <Button size="icon" variant="ghost" onClick={handleSendMessage} disabled={isLoading || !message.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-white/20">
              {isLoading ? <MessageCircle className="w-5 h-5 animate-pulse" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* History Panel */}
        {showHistory && (
          <div className="w-80 bg-black/30 border-l border-white/10 flex flex-col p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">History</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowHistory(false)} className="hover:bg-white/20"><ArrowLeft/></Button>
            </div>
            <Button onClick={handleNewChat} className="w-full bg-white/10 hover:bg-white/20 justify-start mb-4">
              <Plus className="w-4 h-4 mr-2" /> New Chat
            </Button>
            <div className="flex-1 overflow-y-auto space-y-2">
              {conversations.map((conv) => (
                <button key={conv.id} onClick={() => handleSelectConversation(conv)} className="w-full text-left p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <p className="font-medium text-sm truncate">{conv.metadata?.name || 'Chat'}</p>
                  <p className="text-xs text-gray-400">{format(new Date(conv.created_date), 'MMM d, h:mm a')}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}