
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, Edit3, RefreshCw, Check, Languages } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const platformConfig = {
  linkedin: { 
    name: "LinkedIn", 
    gradient: "from-[#1e4a89] to-[#2e5a9a]", 
    bgGradient: "from-white to-[#c0d4ea]/40",
    icon: "💼", 
    maxLength: 3000, 
    description: "Professional Network",
    accentColor: "text-[#1e4a89]"
  },
  facebook: { 
    name: "Facebook", 
    gradient: "from-[#2e5a9a] to-[#6b95c9]", 
    bgGradient: "from-white to-[#c0d4ea]/50",
    icon: "👥", 
    maxLength: 63206, 
    description: "Social Connection",
    accentColor: "text-[#2e5a9a]"
  },
  twitter: { 
    name: "Twitter / X", 
    gradient: "from-[#1e4a89] to-[#1e4a89]", 
    bgGradient: "from-white to-[#c0d4ea]/30",
    icon: "🐦", 
    maxLength: 280, 
    description: "Short & Punchy",
    accentColor: "text-[#1e4a89]"
  },
  reddit: { 
    name: "Reddit", 
    gradient: "from-[#6b95c9] to-[#2e5a9a]", 
    bgGradient: "from-white to-[#c0d4ea]/40",
    icon: "💬", 
    maxLength: 10000, 
    description: "Community Discussion",
    accentColor: "text-[#6b95c9]"
  },
  discord: { 
    name: "Discord", 
    gradient: "from-[#2e5a9a] to-[#6b95c9]", 
    bgGradient: "from-white to-[#c0d4ea]/50",
    icon: "🎮", 
    maxLength: 2000, 
    description: "Casual Chat",
    accentColor: "text-[#2e5a9a]"
  },
  whatsapp: { 
    name: "WhatsApp", 
    gradient: "from-[#6b95c9] to-[#2e5a9a]", 
    bgGradient: "from-white to-[#c0d4ea]/60",
    icon: "📱", 
    maxLength: 4096, 
    description: "Direct Messaging",
    accentColor: "text-[#6b95c9]"
  }
};

export default function PlatformCard({ 
  platform, 
  content, 
  onContentChange, 
  onRegenerate, 
  onTranslate,
  isRegenerating,
  isTranslating 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  useEffect(() => {
    setEditedContent(content);
  }, [content]);

  const config = platformConfig[platform];
  const contentLength = editedContent?.length || 0;
  const isOverLimit = contentLength > config.maxLength;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    onContentChange(platform, editedContent);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -2 }}
    >
      <Card className={`bg-gradient-to-br ${config.bgGradient} hover:shadow-2xl transition-all duration-300 border border-[#c0d4ea]/50 overflow-hidden`}>
        <div className={`h-1 bg-gradient-to-r ${config.gradient}`} />
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 bg-gradient-to-br ${config.gradient} rounded-xl flex items-center justify-center text-xl shadow-lg`}>
                {config.icon}
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">{config.name}</h3>
                <p className={`text-sm font-medium ${config.accentColor}`}>{config.description}</p>
              </div>
            </div>
            <Badge 
              variant={isOverLimit ? "destructive" : "secondary"}
              className={`font-mono text-sm px-3 py-1 ${isOverLimit ? 'bg-red-100 text-red-800' : 'bg-white/80 text-gray-700'}`}
            >
              {contentLength.toLocaleString()}/{config.maxLength.toLocaleString()}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="editing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="min-h-40 border-2 border-[#c0d4ea]/60 focus:border-[#2e5a9a] text-base rounded-xl bg-white"
                  maxLength={config.maxLength}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveEdit}
                    size="sm"
                    className="bg-gradient-to-r from-[#2e5a9a] to-[#1e4a89] hover:from-[#1e4a89] hover:to-[#2e5a9a] text-white"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    variant="ghost"
                    size="sm"
                    className="hover:bg-[#c0d4ea]/40 text-[#1e4a89]"
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="viewing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-[#c0d4ea]/60 min-h-40"
              >
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-base">
                  {content || <span className="text-gray-400 italic">AI-generated content will appear here...</span>}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="border-t border-[#c0d4ea]/50 pt-4">
            <TooltipProvider>
              <div className="flex flex-wrap gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={handleCopy} 
                      size="sm"
                      variant="ghost" 
                      disabled={!content}
                      className="hover:bg-[#c0d4ea]/40 text-[#1e4a89]"
                    >
                      {copied ? <Check className="w-4 h-4 mr-1 text-[#2e5a9a]" /> : <Copy className="w-4 h-4 mr-1" />}
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>{copied ? "Copied!" : "Copy to clipboard"}</p></TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={() => setIsEditing(true)} 
                      size="sm"
                      variant="ghost" 
                      disabled={!content || isEditing}
                      className="hover:bg-[#c0d4ea]/40 text-[#1e4a89]"
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Edit manually</p></TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={() => onRegenerate(platform)} 
                      size="sm"
                      variant="ghost" 
                      disabled={isRegenerating}
                      className="hover:bg-[#c0d4ea]/40 text-[#1e4a89]"
                    >
                      <RefreshCw className={`w-4 h-4 mr-1 ${isRegenerating ? 'animate-spin' : ''}`} />
                      Regenerate
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Generate new version</p></TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={() => onTranslate(platform)} 
                      size="sm"
                      variant="ghost" 
                      disabled={!content || isTranslating}
                      className="hover:bg-[#c0d4ea]/40 text-[#1e4a89]"
                    >
                      <Languages className={`w-4 h-4 mr-1 ${isTranslating ? 'animate-spin' : ''}`} />
                      Translate
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Translate content</p></TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
