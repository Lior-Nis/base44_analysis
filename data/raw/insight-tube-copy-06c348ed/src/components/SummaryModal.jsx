import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ExternalLink, 
  User, 
  Clock, 
  Calendar,
  BookOpen,
  List,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function SummaryModal({ summary, onClose }) {
  if (!summary) return null;

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

  const IconComponent = getSummaryTypeIcon(summary.summary_type);

  return (
    <Dialog open={!!summary} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-slate-900/95 backdrop-blur-xl border-white/20 text-white overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-white mb-2 leading-tight">
                {summary.title}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-4 text-purple-300">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{summary.channel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{summary.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(summary.created_date), "MMM d, yyyy")}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${getSummaryTypeBadge(summary.summary_type)} border`}>
                <IconComponent className="w-3 h-3 mr-1" />
                {summary.summary_type?.replace('_', ' ')}
              </Badge>
              <Button
                variant="outline"
                size="icon"
                onClick={() => window.open(summary.youtube_url, '_blank')}
                className="border-white/20 hover:bg-white/10"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Video Thumbnail */}
          <div className="relative rounded-xl overflow-hidden">
            <img
              src={summary.thumbnail_url}
              alt={summary.title}
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>

          {/* Summary Content */}
          <Tabs defaultValue="quick" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-black/20">
              <TabsTrigger value="quick" className="text-white data-[state=active]:bg-white/20">
                <BookOpen className="w-4 h-4 mr-2" />
                Quick Summary
              </TabsTrigger>
              <TabsTrigger value="detailed" className="text-white data-[state=active]:bg-white/20">
                <List className="w-4 h-4 mr-2" />
                Detailed
              </TabsTrigger>
              <TabsTrigger value="key_points" className="text-white data-[state=active]:bg-white/20">
                <Sparkles className="w-4 h-4 mr-2" />
                Key Points
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="quick" className="mt-6">
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 text-lg leading-relaxed">
                  {summary.quick_summary}
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="detailed" className="mt-6">
              <div className="prose prose-invert max-w-none">
                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {summary.detailed_summary}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="key_points" className="mt-6">
              <div className="space-y-3">
                {summary.key_points?.map((point, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-white">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Transcript Section */}
          {summary.transcript && (
            <div className="border-t border-white/10 pt-6">
              <h3 className="text-lg font-bold text-white mb-4">Full Transcript</h3>
              <div className="bg-black/20 rounded-lg p-4 max-h-64 overflow-y-auto">
                <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
                  {summary.transcript}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}