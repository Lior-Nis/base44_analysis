import React, { useState } from "react";
import { VideoSummary } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Youtube, 
  Sparkles, 
  Clock, 
  User, 
  BookOpen, 
  List,
  Loader2,
  ExternalLink,
  Save
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SummarizerPage() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentSummary, setCurrentSummary] = useState(null);
  const [summaryType, setSummaryType] = useState("quick");
  const [isSaving, setIsSaving] = useState(false);

  const extractVideoId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const summarizeVideo = async () => {
    if (!url) return;
    
    const videoId = extractVideoId(url);
    if (!videoId) {
      alert("Please enter a valid YouTube URL");
      return;
    }

    setIsLoading(true);
    try {
      const prompt = `
        Extract comprehensive information from this YouTube video: ${url}
        
        Please provide:
        1. Video metadata (title, channel, duration)
        2. Full transcript if available
        3. Three types of summaries:
           - Quick summary (2-3 sentences overview)
           - Detailed summary (comprehensive breakdown in paragraphs)
           - Key points (bullet points of main takeaways)
        
        Format the response as structured JSON.
      `;

      const result = await InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            channel: { type: "string" },
            duration: { type: "string" },
            transcript: { type: "string" },
            quick_summary: { type: "string" },
            detailed_summary: { type: "string" },
            key_points: { 
              type: "array", 
              items: { type: "string" } 
            }
          }
        }
      });

      const summaryData = {
        ...result,
        youtube_url: url,
        video_id: videoId,
        thumbnail_url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        summary_type: summaryType
      };

      setCurrentSummary(summaryData);
    } catch (error) {
      console.error("Error summarizing video:", error);
      alert("Failed to summarize video. Please try again.");
    }
    setIsLoading(false);
  };

  const saveSummary = async () => {
    if (!currentSummary) return;
    
    setIsSaving(true);
    try {
      await VideoSummary.create(currentSummary);
      alert("Summary saved to your library!");
    } catch (error) {
      console.error("Error saving summary:", error);
      alert("Failed to save summary. Please try again.");
    }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Video Summarizer
            </h1>
          </div>
          <p className="text-xl text-purple-300 max-w-2xl mx-auto">
            Transform any YouTube video into intelligent summaries powered by AI
          </p>
        </motion.div>

        {/* URL Input */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-white/10 backdrop-blur-xl border-white/20">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Paste YouTube URL here..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-purple-300 h-12 text-lg"
                  />
                </div>
                <Button
                  onClick={summarizeVideo}
                  disabled={isLoading || !url}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 h-12 px-8 text-white font-semibold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Summarize
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Loading State */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
                <Youtube className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Processing your video...
              </h3>
              <p className="text-purple-300">
                This may take a moment while we extract and analyze the content
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary Results */}
        <AnimatePresence>
          {currentSummary && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Video Info Card */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 overflow-hidden">
                <CardContent className="p-0">
                  <div className="md:flex">
                    <div className="md:w-1/3">
                      <img
                        src={currentSummary.thumbnail_url}
                        alt={currentSummary.title}
                        className="w-full h-48 md:h-full object-cover"
                      />
                    </div>
                    <div className="md:w-2/3 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h2 className="text-2xl font-bold text-white mb-2">
                          {currentSummary.title}
                        </h2>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(currentSummary.youtube_url, '_blank')}
                            className="text-purple-300 hover:text-white hover:bg-white/10"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={saveSummary}
                            disabled={isSaving}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {isSaving ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-purple-300">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{currentSummary.channel}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{currentSummary.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Summary Tabs */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardHeader>
                  <h3 className="text-xl font-bold text-white">AI Summary</h3>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="quick" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-black/20">
                      <TabsTrigger value="quick" className="text-white data-[state=active]:bg-white/20">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Quick
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
                          {currentSummary.quick_summary}
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="detailed" className="mt-6">
                      <div className="prose prose-invert max-w-none">
                        <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                          {currentSummary.detailed_summary}
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="key_points" className="mt-6">
                      <div className="space-y-3">
                        {currentSummary.key_points?.map((point, index) => (
                          <div 
                            key={index}
                            className="flex items-start gap-3 p-3 rounded-lg bg-white/5"
                          >
                            <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-white">
                                {index + 1}
                              </span>
                            </div>
                            <p className="text-gray-300">{point}</p>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}