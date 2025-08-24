import React, { useState, useEffect } from "react";
import { VideoSummary } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Clock, 
  User, 
  ExternalLink, 
  BookOpen,
  List,
  Sparkles,
  Calendar
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import SummaryModal from "../components/SummaryModal";

export default function LibraryPage() {
  const [summaries, setSummaries] = useState([]);
  const [filteredSummaries, setFilteredSummaries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSummaries();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = summaries.filter(summary =>
        summary.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        summary.channel?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSummaries(filtered);
    } else {
      setFilteredSummaries(summaries);
    }
  }, [searchQuery, summaries]);

  const loadSummaries = async () => {
    try {
      const data = await VideoSummary.list("-created_date");
      setSummaries(data);
      setFilteredSummaries(data);
    } catch (error) {
      console.error("Error loading summaries:", error);
    }
    setIsLoading(false);
  };

  const getSummaryTypeIcon = (type) => {
    switch (type) {
      case "quick": return BookOpen;
      case "detailed": return List;
      case "key_points": return Sparkles;
      default: return BookOpen;
    }
  };

  const getSummaryTypeBadge = (type) => {
    const colors = {
      quick: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      detailed: "bg-green-500/20 text-green-300 border-green-500/30",
      key_points: "bg-purple-500/20 text-purple-300 border-purple-500/30"
    };
    return colors[type] || colors.quick;
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Your Library</h1>
              <p className="text-purple-300">
                All your saved video summaries in one place
              </p>
            </div>
            <Badge variant="secondary" className="bg-white/10 text-purple-300 border-white/20">
              {filteredSummaries.length} summaries
            </Badge>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 w-4 h-4" />
            <Input
              placeholder="Search summaries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 pl-10"
            />
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <Card key={i} className="bg-white/5 backdrop-blur-xl border-white/10 animate-pulse">
                <CardContent className="p-0">
                  <div className="h-48 bg-white/5 rounded-t-lg" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-white/10 rounded w-3/4" />
                    <div className="h-3 bg-white/10 rounded w-1/2" />
                    <div className="h-3 bg-white/10 rounded w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredSummaries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center opacity-50">
              <BookOpen className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {searchQuery ? "No results found" : "No summaries yet"}
            </h3>
            <p className="text-purple-300 mb-6">
              {searchQuery 
                ? "Try adjusting your search terms" 
                : "Start by summarizing your first YouTube video"
              }
            </p>
          </motion.div>
        ) : (
          /* Summary Grid */
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredSummaries.map((summary) => {
                const IconComponent = getSummaryTypeIcon(summary.summary_type);
                return (
                  <motion.div
                    key={summary.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    whileHover={{ y: -4 }}
                    className="group cursor-pointer"
                    onClick={() => setSelectedSummary(summary)}
                  >
                    <Card className="bg-white/10 backdrop-blur-xl border-white/20 overflow-hidden transition-all duration-300 group-hover:bg-white/15 group-hover:border-white/30">
                      <CardContent className="p-0">
                        <div className="relative">
                          <img
                            src={summary.thumbnail_url}
                            alt={summary.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-4 right-4">
                            <Badge className={`${getSummaryTypeBadge(summary.summary_type)} border`}>
                              <IconComponent className="w-3 h-3 mr-1" />
                              {summary.summary_type?.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        </div>
                        
                        <div className="p-6">
                          <h3 className="font-bold text-white mb-2 line-clamp-2 group-hover:text-purple-200 transition-colors">
                            {summary.title}
                          </h3>
                          
                          <div className="flex items-center gap-4 text-sm text-purple-300 mb-4">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span className="truncate">{summary.channel}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{summary.duration}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-xs text-purple-400">
                              <Calendar className="w-3 h-3" />
                              <span>
                                {format(new Date(summary.created_date), "MMM d, yyyy")}
                              </span>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(summary.youtube_url, '_blank');
                              }}
                              className="text-purple-300 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Summary Modal */}
        <SummaryModal 
          summary={selectedSummary}
          onClose={() => setSelectedSummary(null)}
        />
      </div>
    </div>
  );
}