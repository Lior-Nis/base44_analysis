
import React, { useState, useEffect } from "react";
import { UserProfile, Newsletter, User } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Calendar, Edit, Save, Wand2, RefreshCw, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Planner() {
  const [userProfile, setUserProfile] = useState(null);
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [sendResult, setSendResult] = useState(null); // Added sendResult state
  const [currentUser, setCurrentUser] = useState(null); // Added currentUser state
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user); // Set current user

      const profiles = await UserProfile.filter({ created_by: user.email });
      if (profiles.length > 0) {
        setUserProfile(profiles[0]);
      }
      
      // Only load newsletters created by the current user
      const newsletterData = await Newsletter.filter({ created_by: user.email }, '-created_date');
      setNewsletters(newsletterData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const generateContentPlan = async () => {
    if (!userProfile) return;

    setGenerating(true);
    try {
      const prompt = `Generate a weekly content plan for a ${userProfile.frequency} newsletter about ${userProfile.field_of_knowledge}. 
      
      Target audience: ${userProfile.target_audience || 'general audience'}
      Topics of interest: ${userProfile.topics.join(', ')}
      Tone: ${userProfile.writing_tone}
      
      Generate 7 newsletter ideas with:
      - Engaging title
      - Brief description (1-2 sentences)
      - Relevant emoji
      - Suggested publication date (spread over the next 2 weeks)
      
      Make each idea unique, valuable, and actionable for the target audience.`;

      const response = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            newsletters: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  emoji: { type: "string" },
                  scheduled_date: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Create newsletters in database - they will automatically be assigned to current user
      const createdNewsletters = await Newsletter.bulkCreate(
        response.newsletters.map(n => ({
          ...n,
          status: 'planned'
        }))
      );

      setNewsletters(prev => [...createdNewsletters, ...prev]);
    } catch (error) {
      console.error("Error generating content plan:", error);
    }
    setGenerating(false);
  };

  const generateFullDraft = async (newsletter) => {
    if (!userProfile) {
        setSendResult({ success: false, message: "User profile not found. Please set up your profile first." });
        return;
    }

    setGenerating(true);
    try {
      const prompt = `Create a complete structured newsletter for:
      
      Title: ${newsletter.title}
      Description: ${newsletter.description}
      
      Context:
      - Field: ${userProfile.field_of_knowledge}
      - Audience: ${userProfile.target_audience}
      - Tone: ${userProfile.writing_tone}
      - Topics: ${userProfile.topics.join(', ')}
      
      Generate:
      1. A compelling email subject line
      2. An intro_text (2-3 sentences introducing the newsletter)
      3. EXACTLY 4 feature_blocks (this is mandatory), each with:
         - icon (use relevant emojis like 🚀, 💡, 📊, 🔧, 💼, 🎯, 📈, 🛠️, 🌟, 🔍, etc.)
         - title (short, punchy headline - max 6 words)
         - description (2-3 sentences explaining the feature/topic in detail)
      4. call_to_action_text (engaging button text)
      5. call_to_action_url (use placeholder like "https://example.com/learn-more")
      
      IMPORTANT: You must generate exactly 4 feature blocks. Each feature should be valuable, actionable, and engaging for the target audience.`;

      const response = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            subject: { type: "string" },
            intro_text: { type: "string" },
            feature_blocks: {
              type: "array",
              minItems: 4,
              maxItems: 4,
              items: {
                type: "object",
                properties: {
                  icon: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" }
                },
                required: ["icon", "title", "description"]
              }
            },
            call_to_action_text: { type: "string" },
            call_to_action_url: { type: "string" }
          },
          required: ["subject", "intro_text", "feature_blocks", "call_to_action_text", "call_to_action_url"]
        }
      });

      // Ensure we have at least 2 features as a fallback
      // The schema above already enforces 4, but this acts as an extra safeguard
      if (!response.feature_blocks || response.feature_blocks.length < 2) {
        response.feature_blocks = [
          {
            icon: "🚀",
            title: "Key Insight #1",
            description: "This feature provides valuable insights related to " + userProfile.field_of_knowledge + " that will help your " + userProfile.target_audience + " achieve better results."
          },
          {
            icon: "💡",
            title: "Key Insight #2", 
            description: "Another important aspect of " + userProfile.field_of_knowledge + " that offers practical value and actionable steps for your audience."
          },
          {
            icon: "📊",
            title: "Key Insight #3",
            description: "Advanced strategies and techniques that can make a significant difference in how your audience approaches their work."
          },
          {
            icon: "🎯",
            title: "Key Insight #4",
            description: "Expert tips and best practices that will empower your readers to implement these concepts effectively."
          }
        ];
      }

      await Newsletter.update(newsletter.id, {
        subject: response.subject,
        intro_text: response.intro_text,
        feature_blocks: response.feature_blocks,
        call_to_action_text: response.call_to_action_text,
        call_to_action_url: response.call_to_action_url,
        status: 'draft'
      });

      setNewsletters(prev => prev.map(n => 
        n.id === newsletter.id 
          ? { 
              ...n, 
              subject: response.subject,
              intro_text: response.intro_text,
              feature_blocks: response.feature_blocks,
              call_to_action_text: response.call_to_action_text,
              call_to_action_url: response.call_to_action_url,
              status: 'draft' 
            }
          : n
      ));
    } catch (error) {
      console.error("Error generating draft:", error);
    }
    setGenerating(false);
  };

  const handleEdit = (newsletter) => {
    setEditingId(newsletter.id);
    setEditData({
      title: newsletter.title,
      description: newsletter.description,
      scheduled_date: newsletter.scheduled_date
    });
  };

  const handleSave = async (newsletter) => {
    try {
      await Newsletter.update(newsletter.id, editData);
      setNewsletters(prev => prev.map(n => 
        n.id === newsletter.id ? { ...n, ...editData } : n
      ));
      setEditingId(null);
    } catch (error) {
      console.error("Error saving newsletter:", error);
    }
  };

  const handleSendNewsletter = (newsletter) => {
    navigate(`${createPageUrl("Send")}?newsletter=${newsletter.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Content Planner
              </h1>
              <p className="text-gray-600 mt-2">
                Plan and create your newsletter content with AI
              </p>
            </div>
            <Button
              onClick={generateContentPlan}
              disabled={generating || !userProfile}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Content Plan
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Content Grid */}
        <div className="grid gap-6">
          {newsletters.length === 0 ? (
            <Card className="bg-white/20 backdrop-blur-xl border-white/20 shadow-lg">
              <CardContent className="text-center py-16">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No content planned yet</h3>
                <p className="text-gray-500 mb-6">Generate your first content plan to get started</p>
                <Button
                  onClick={generateContentPlan}
                  disabled={generating || !userProfile}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Content Plan
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {newsletters.map((newsletter, index) => (
                  <motion.div
                    key={newsletter.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-white/20 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="text-3xl mb-2">{newsletter.emoji || "📧"}</div>
                          <div className="flex gap-2">
                            {editingId === newsletter.id ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSave(newsletter)}
                                className="bg-white/30 border-white/20"
                              >
                                <Save className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(newsletter)}
                                className="bg-white/30 border-white/20"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {editingId === newsletter.id ? (
                          <div className="space-y-3">
                            <Input
                              value={editData.title}
                              onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                              className="bg-white/30 border-white/20"
                            />
                            <Textarea
                              value={editData.description}
                              onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                              className="bg-white/30 border-white/20"
                              rows={3}
                            />
                            <Input
                              type="date"
                              value={editData.scheduled_date}
                              onChange={(e) => setEditData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                              className="bg-white/30 border-white/20"
                            />
                          </div>
                        ) : (
                          <>
                            <CardTitle className="text-lg font-bold text-gray-800 leading-tight mb-3">
                              {newsletter.title}
                            </CardTitle>
                            <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                              {newsletter.description}
                            </p>
                            
                            {/* Scheduled Date */}
                            {newsletter.scheduled_date && (
                              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                <Calendar className="w-4 h-4" />
                                {format(new Date(newsletter.scheduled_date), 'MMM d, yyyy')}
                              </div>
                            )}
                            
                            {/* Features Section - Always show, even if empty */}
                            <div className="mb-4">
                              <p className="text-xs text-gray-500 mb-2 font-medium">Features:</p>
                              {newsletter.feature_blocks && newsletter.feature_blocks.length > 0 ? (
                                <div className="space-y-2">
                                  {newsletter.feature_blocks.slice(0, 2).map((block, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-sm">
                                      <span className="text-base">{block.icon}</span>
                                      <span className="text-gray-700 font-medium truncate">{block.title}</span>
                                    </div>
                                  ))}
                                  {newsletter.feature_blocks.length > 2 && (
                                    <p className="text-xs text-gray-500">+{newsletter.feature_blocks.length - 2} more</p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-xs text-gray-400 italic">No features generated yet</p>
                              )}
                            </div>
                          </>
                        )}
                      </CardHeader>
                      
                      <CardContent className="pt-0 flex-1 flex flex-col justify-end">
                        <div className="space-y-3">
                          {/* Generate Content Button for planned newsletters */}
                          {newsletter.status === 'planned' && (
                            <Button
                              onClick={() => generateFullDraft(newsletter)}
                              disabled={generating}
                              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                            >
                              <Wand2 className="w-4 h-4 mr-2" />
                              Generate Full Draft
                            </Button>
                          )}
                          
                          {/* Send Newsletter Button - appears for draft and sent newsletters */}
                          {(newsletter.status === 'draft' || newsletter.status === 'sent') && (
                            <Button
                              onClick={() => handleSendNewsletter(newsletter)}
                              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                            >
                              <Send className="w-4 h-4 mr-2" />
                              {newsletter.status === 'sent' ? 'Send Again' : 'Send Newsletter'}
                            </Button>
                          )}
                          
                          {/* Status */}
                          <div className="text-xs text-center text-gray-500">
                            Status: <span className="font-semibold capitalize">{newsletter.status}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
