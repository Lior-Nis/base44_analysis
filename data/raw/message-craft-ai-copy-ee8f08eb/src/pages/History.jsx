
import React, { useState, useEffect } from "react";
import { Message } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { History, Search, Calendar, MessageSquare, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function HistoryPage() {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTone, setFilterTone] = useState("all");
  const [filterAudience, setFilterAudience] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    filterMessages();
  }, [messages, searchTerm, filterTone, filterAudience]);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const data = await Message.list("-created_date");
      setMessages(data);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
    setIsLoading(false);
  };

  const filterMessages = () => {
    let filtered = messages;

    if (searchTerm) {
      filtered = filtered.filter(msg => 
        msg.original_idea?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterTone !== "all") {
      filtered = filtered.filter(msg => msg.tone === filterTone);
    }

    if (filterAudience !== "all") {
      filtered = filtered.filter(msg => msg.target_audience === filterAudience);
    }

    setFilteredMessages(filtered);
  };

  const deleteMessage = async (messageId) => {
    try {
      await Message.delete(messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const tones = {
    professional: { label: "Professional", gradient: "from-[#1e4a89] to-[#2e5a9a]", bgColor: "bg-[#c0d4ea]/50 text-[#1e4a89] border-[#c0d4ea]" },
    casual: { label: "Casual", gradient: "from-[#6b95c9] to-[#2e5a9a]", bgColor: "bg-[#c0d4ea]/50 text-[#1e4a89] border-[#c0d4ea]" },
    formal: { label: "Formal", gradient: "from-[#1e4a89] to-[#1e4a89]", bgColor: "bg-[#c0d4ea]/50 text-[#1e4a89] border-[#c0d4ea]" },
    fun: { label: "Fun", gradient: "from-[#c0d4ea] to-[#6b95c9]", bgColor: "bg-[#c0d4ea]/50 text-[#2e5a9a] border-[#c0d4ea]" },
    persuasive: { label: "Persuasive", gradient: "from-[#2e5a9a] to-[#6b95c9]", bgColor: "bg-[#c0d4ea]/50 text-[#1e4a89] border-[#c0d4ea]" },
    informative: { label: "Informative", gradient: "from-[#2e5a9a] to-[#1e4a89]", bgColor: "bg-[#c0d4ea]/50 text-[#1e4a89] border-[#c0d4ea]" },
    inspiring: { label: "Inspiring", gradient: "from-[#6b95c9] to-[#c0d4ea]", bgColor: "bg-[#c0d4ea]/50 text-[#2e5a9a] border-[#c0d4ea]" }
  };

  const audiences = {
    tech_professionals: { label: "Tech Professionals", gradient: "from-[#1e4a89] to-[#2e5a9a]", bgColor: "bg-[#c0d4ea]/50 text-[#1e4a89] border-[#c0d4ea]" },
    general_audience: { label: "General Audience", gradient: "from-[#6b95c9] to-[#2e5a9a]", bgColor: "bg-[#c0d4ea]/50 text-[#1e4a89] border-[#c0d4ea]" },
    business_leaders: { label: "Business Leaders", gradient: "from-[#1e4a89] to-[#1e4a89]", bgColor: "bg-[#c0d4ea]/50 text-[#1e4a89] border-[#c0d4ea]" },
    community_members: { label: "Community", gradient: "from-[#c0d4ea] to-[#6b95c9]", bgColor: "bg-[#c0d4ea]/50 text-[#2e5a9a] border-[#c0d4ea]" },
    customers: { label: "Customers", gradient: "from-[#2e5a9a] to-[#6b95c9]", bgColor: "bg-[#c0d4ea]/50 text-[#1e4a89] border-[#c0d4ea]" },
    friends_family: { label: "Friends/Family", gradient: "from-[#6b95c9] to-[#c0d4ea]", bgColor: "bg-[#c0d4ea]/50 text-[#2e5a9a] border-[#c0d4ea]" },
    team_colleagues: { label: "Team/Colleagues", gradient: "from-[#2e5a9a] to-[#1e4a89]", bgColor: "bg-[#c0d4ea]/50 text-[#1e4a89] border-[#c0d4ea]" }
  };

  return (
    <div className="min-h-screen p-4 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#2e5a9a] via-[#1e4a89] to-[#1e4a89] rounded-2xl flex items-center justify-center shadow-2xl">
              <History className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#1e4a89] via-[#2e5a9a] to-[#6b95c9] bg-clip-text text-transparent mb-2">
            Message History
          </h1>
          <p className="text-lg text-[#2e5a9a]/90">Review, manage, and reuse your past AI generations</p>
        </motion.div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-white/90 backdrop-blur-xl shadow-xl border-0">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search by idea or title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 text-base border-2 border-[#c0d4ea]/60 focus:border-[#2e5a9a] rounded-xl"
                  />
                </div>
                
                <Select value={filterTone} onValueChange={setFilterTone}>
                  <SelectTrigger className="h-14 text-base border-2 border-[#c0d4ea]/60 focus:border-[#2e5a9a] rounded-xl">
                    <SelectValue placeholder="Filter by tone" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    <SelectItem value="all" className="py-3">All Tones</SelectItem>
                    {Object.entries(tones).map(([key, {label, gradient}]) => (
                      <SelectItem key={key} value={key} className="py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 bg-gradient-to-r ${gradient} rounded-full`} />
                          {label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterAudience} onValueChange={setFilterAudience}>
                  <SelectTrigger className="h-14 text-base border-2 border-[#c0d4ea]/60 focus:border-[#2e5a9a] rounded-xl">
                    <SelectValue placeholder="Filter by audience" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    <SelectItem value="all" className="py-3">All Audiences</SelectItem>
                    {Object.entries(audiences).map(([key, {label, gradient}]) => (
                      <SelectItem key={key} value={key} className="py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 bg-gradient-to-r ${gradient} rounded-full`} />
                          {label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4"> {/* Message List */}
            <AnimatePresence mode="wait">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <Card key={i} className="p-4">
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-24 rounded-full" />
                      </div>
                    </div>
                  </Card>
                ))
              ) : filteredMessages.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                  <MessageSquare className="w-16 h-16 text-[#c0d4ea] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-[#1e4a89] mb-2">No Messages Found</h3>
                  <p className="text-[#2e5a9a]/90">{messages.length === 0 ? "Generate your first message to see it here." : "Try adjusting your filters."}</p>
                </motion.div>
              ) : (
                filteredMessages.map((message, index) => (
                  <motion.div key={message.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                    <Card 
                      className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-0 ${selectedMessage?.id === message.id ? 'ring-2 ring-[#6b95c9] bg-[#f5f2e8]/50' : 'bg-white hover:bg-[#f5f2e8]/40'}`}
                      onClick={() => setSelectedMessage(message)}
                    >
                      <CardContent className="p-4">
                        <h3 className="font-bold text-[#1e4a89] line-clamp-1 mb-2">{message.title || "Untitled Message"}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{message.original_idea}</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {message.tone && (
                            <Badge className={`${tones[message.tone]?.bgColor} border`}>
                              {tones[message.tone]?.label}
                            </Badge>
                          )}
                          {message.target_audience && (
                            <Badge className={`${audiences[message.target_audience]?.bgColor} border`}>
                              {audiences[message.target_audience]?.label}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(message.created_date), "MMM d, yyyy")}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={(e) => {e.stopPropagation(); deleteMessage(message.id);}} 
                            className="w-7 h-7 text-gray-400 hover:text-red-500 hover:bg-red-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
          
          <div className="lg:col-span-2"> {/* Message Detail Panel */}
            <div className="sticky top-6">
              <AnimatePresence mode="wait">
                {selectedMessage ? (
                  <motion.div key={selectedMessage.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <Card className="bg-white shadow-2xl border-0">
                      <CardHeader className="bg-gradient-to-r from-[#2e5a9a] via-[#1e4a89] to-[#1e4a89] text-white rounded-t-lg">
                        <CardTitle className="text-xl">Platform Versions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6 max-h-[75vh] overflow-y-auto p-6">
                        {['linkedin', 'facebook', 'twitter', 'reddit', 'discord', 'whatsapp'].map(p => ({key: `${p}_version`, name: p.charAt(0).toUpperCase() + p.slice(1), icon: {linkedin: '💼', facebook: '👥', twitter: '🐦', reddit: '💬', discord: '🎮', whatsapp: '📱'}[p]})).map(platform => (
                          selectedMessage[platform.key] && (
                            <div key={platform.key} className="space-y-3">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{platform.icon}</span>
                                <span className="font-bold text-lg text-[#1e4a89]">{platform.name}</span>
                              </div>
                              <div className="bg-gradient-to-br from-[#f5f2e8]/40 to-white rounded-xl p-4 text-base text-[#1e4a89]/90 border border-[#c0d4ea]/50 whitespace-pre-wrap leading-relaxed shadow-sm">
                                {selectedMessage[platform.key]}
                              </div>
                            </div>
                          )
                        ))}
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <motion.div key="no-message-selected" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Card className="bg-gradient-to-br from-[#f5f2e8]/30 via-[#c0d4ea]/20 to-white border-2 border-dashed border-[#c0d4ea]/60">
                      <CardContent className="p-16 text-center">
                        <MessageSquare className="w-16 h-16 text-[#6b95c9] mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-[#1e4a89] mb-2">Select a Message</h3>
                        <p className="text-[#2e5a9a]/90">Choose a message from the list to view its platform versions</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
