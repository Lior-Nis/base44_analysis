
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Sparkles, Users, Volume2, Zap } from "lucide-react";
import { motion } from "framer-motion";

const tones = [
  { value: "professional", label: "Professional", desc: "Polished & business-ready", color: "from-[#1e4a89] to-[#2e5a9a]" },
  { value: "casual", label: "Casual", desc: "Relaxed & approachable", color: "from-[#6b95c9] to-[#2e5a9a]" },
  { value: "formal", label: "Formal", desc: "Traditional & respectful", color: "from-[#1e4a89] to-[#1e4a89]" },
  { value: "fun", label: "Fun", desc: "Playful & entertaining", color: "from-[#c0d4ea] to-[#6b95c9]" },
  { value: "persuasive", label: "Persuasive", desc: "Compelling & convincing", color: "from-[#2e5a9a] to-[#6b95c9]" },
  { value: "informative", label: "Informative", desc: "Educational & factual", color: "from-[#2e5a9a] to-[#1e4a89]" },
  { value: "inspiring", label: "Inspiring", desc: "Motivational & uplifting", color: "from-[#6b95c9] to-[#c0d4ea]" }
];

const audiences = [
  { value: "tech_professionals", label: "Tech Professionals", desc: "Developers, engineers, IT experts", color: "from-[#1e4a89] to-[#2e5a9a]" },
  { value: "general_audience", label: "General Audience", desc: "Broad, diverse readership", color: "from-[#6b95c9] to-[#2e5a9a]" },
  { value: "business_leaders", label: "Business Leaders", desc: "Executives, managers, decision-makers", color: "from-[#1e4a89] to-[#1e4a89]" },
  { value: "community_members", label: "Community Members", desc: "Online forums & groups", color: "from-[#c0d4ea] to-[#6b95c9]" },
  { value: "customers", label: "Customers", desc: "Current or potential clients", color: "from-[#2e5a9a] to-[#6b95c9]" },
  { value: "friends_family", label: "Friends & Family", desc: "Personal connections", color: "from-[#6b95c9] to-[#c0d4ea]" },
  { value: "team_colleagues", label: "Team & Colleagues", desc: "Internal work peers", color: "from-[#2e5a9a] to-[#1e4a89]" }
];

export default function IdeaInput({ onGenerate, isGenerating }) {
  const [idea, setIdea] = useState("");
  const [tone, setTone] = useState("");
  const [audience, setAudience] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (idea.trim() && tone && audience) {
      onGenerate({ idea: idea.trim(), tone, audience });
    }
  };

  const isValid = idea.trim().length > 0 && tone && audience;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-white/90 backdrop-blur-xl shadow-2xl border-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#c0d4ea]/20 via-white to-white" />
        <CardHeader className="p-8 relative">
          <CardTitle className="text-2xl font-bold text-[#1e4a89] flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#2e5a9a] to-[#1e4a89] rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            What's your message idea?
          </CardTitle>
          <p className="text-[#2e5a9a]/90 mt-2">Transform your idea into platform-perfect posts with AI magic ✨</p>
        </CardHeader>
        <CardContent className="p-8 pt-0 relative">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <Label htmlFor="idea" className="text-lg font-bold text-[#1e4a89] flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#2e5a9a]" />
                Your Core Idea
              </Label>
              <Textarea
                id="idea"
                placeholder="e.g., Announcing our new AI feature that helps users save 3 hours per day..."
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                className="min-h-40 text-lg border-2 border-[#c0d4ea]/60 focus:border-[#2e5a9a] focus:ring-[#6b95c9]/20 resize-none rounded-xl bg-gradient-to-br from-white to-[#c0d4ea]/20"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{idea.length}/500 characters</span>
                <span className="text-[#2e5a9a] font-medium">Be as detailed as you like!</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label className="text-lg font-bold text-[#1e4a89] flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-[#6b95c9]" />
                  Tone of Voice
                </Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="h-16 text-lg border-2 border-[#c0d4ea]/60 focus:border-[#2e5a9a] rounded-xl bg-white">
                    <SelectValue placeholder="Choose your tone..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {tones.map((t) => (
                      <SelectItem key={t.value} value={t.value} className="py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 bg-gradient-to-r ${t.color} rounded-full`} />
                          <div>
                            <div className="font-semibold text-base">{t.label}</div>
                            <div className="text-sm text-gray-500">{t.desc}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-bold text-[#1e4a89] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#1e4a89]" />
                  Target Audience
                </Label>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger className="h-16 text-lg border-2 border-[#c0d4ea]/60 focus:border-[#1e4a89] rounded-xl bg-white">
                    <SelectValue placeholder="Who are you reaching?" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {audiences.map((a) => (
                      <SelectItem key={a.value} value={a.value} className="py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 bg-gradient-to-r ${a.color} rounded-full`} />
                          <div>
                            <div className="font-semibold text-base">{a.label}</div>
                            <div className="text-sm text-gray-500">{a.desc}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              disabled={!isValid || isGenerating}
              className="w-full h-16 text-lg font-bold bg-gradient-to-r from-[#2e5a9a] via-[#1e4a89] to-[#1e4a89] hover:from-[#1e4a89] hover:via-[#2e5a9a] hover:to-[#6b95c9] text-white transition-all duration-300 shadow-2xl hover:shadow-[#6b95c9]/50 disabled:opacity-60 disabled:shadow-none rounded-xl"
            >
              {isGenerating ? (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  Crafting Your Messages...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6" />
                  Generate Platform Messages
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
