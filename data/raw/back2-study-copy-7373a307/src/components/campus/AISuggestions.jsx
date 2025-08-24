import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { CampusEvent } from "@/api/entities";
import { Subject } from "@/api/entities";
import { SkillProfile } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw, MapPin, Users, Clock, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const translations = {
  he: {
    aiSuggestions: "הצעות AI מותאמות אישית",
    refreshing: "מחדש הצעות...",
    refresh: "חדש הצעות",
    noSuggestions: "אין הצעות כרגע",
    tryLater: "נסה שוב מאוחר יותר",
    recommendedForYou: "מומלץ עבורך",
    basedOn: "מבוסס על:",
    yourInterests: "התחומי עניין שלך",
    studyHistory: "היסטוריית הלמידה",
    location: "מיקום",
    skillMatch: "התאמת כישורים",
    joinNow: "הצטרף עכשיו",
    participants: "משתתפים",
    startingSoon: "מתחיל בקרוב",
    perfect: "מושלם!",
    good: "טוב",
    relevant: "רלוונטי"
  },
  en: {
    aiSuggestions: "AI Personalized Suggestions",
    refreshing: "Refreshing suggestions...",
    refresh: "Refresh Suggestions",
    noSuggestions: "No suggestions at the moment",
    tryLater: "Try again later",
    recommendedForYou: "Recommended for You",
    basedOn: "Based on:",
    yourInterests: "Your interests",
    studyHistory: "Study history",
    location: "Location",
    skillMatch: "Skill match",
    joinNow: "Join Now",
    participants: "Participants",
    startingSoon: "Starting Soon",
    perfect: "Perfect!",
    good: "Good",
    relevant: "Relevant"
  }
};

const matchStrengthColors = {
  perfect: "from-green-500 to-emerald-600",
  good: "from-blue-500 to-indigo-600",
  relevant: "from-purple-500 to-violet-600"
};

const matchStrengthText = {
  perfect: { he: "התאמה מושלמת", en: "Perfect Match" },
  good: { he: "התאמה טובה", en: "Good Match" },
  relevant: { he: "רלוונטי", en: "Relevant" }
};

export default function AISuggestions({ language = 'he', onEventJoin }) {
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const t = translations[language];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      const [subjectsData, profilesData] = await Promise.all([
        Subject.filter({ created_by: userData.email }),
        SkillProfile.filter({ user_id: userData.id })
      ]);
      
      setSubjects(subjectsData);
      setUserProfile(profilesData[0] || null);
      
      await generateSuggestions(userData, subjectsData, profilesData[0]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSuggestions = async (userData, userSubjects, profile, forceRefresh = false) => {
    if (isRefreshing && !forceRefresh) return;
    
    setIsRefreshing(true);
    try {
      // Get current active events
      const events = await CampusEvent.list('-start_time', 20);
      const now = new Date();
      const activeEvents = events.filter(event => {
        const endTime = new Date(event.end_time);
        const startTime = new Date(event.start_time);
        return endTime > now && event.is_active &&
               !event.current_participants?.some(p => p.user_id === userData.id); // Not already joined
      });

      if (activeEvents.length === 0) {
        setSuggestions([]);
        return;
      }

      // Create user context for AI
      const userContext = {
        subjects: userSubjects.map(s => s.name),
        strong_skills: profile?.strong_skills?.map(s => s.skill_name) || [],
        help_needed: profile?.help_needed?.map(s => s.skill_name) || [],
        learning_style: userData.learning_style || 'mixed',
        study_goals: userData.study_goals || []
      };

      const prompt = `אתה מומחה בהמלצות לימודיות חכמות. נתח את הפרופיל הבא של תלמיד והמלץ על 3 האירועים הכי מתאימים עבורו מתוך רשימת האירועים הפעילים.

פרופיל התלמיד:
- מקצועות: ${userContext.subjects.join(', ')}
- כישורים חזקים: ${userContext.strong_skills.join(', ')}
- זקוק לעזרה ב: ${userContext.help_needed.join(', ')}
- סגנון למידה: ${userContext.learning_style}
- יעדי לימוד: ${userContext.study_goals.join(', ')}

אירועים פעילים:
${JSON.stringify(activeEvents.map(e => ({
  id: e.id,
  title: e.title,
  description: e.description,
  event_type: e.event_type,
  subject_id: e.subject_id,
  start_time: e.start_time,
  participants: e.current_participants?.length || 0,
  max_participants: e.max_participants
})))}

עבור כל המלצה, ספק:
1. חוזק ההתאמה (perfect/good/relevant)
2. סיבות מפורטות למה זה מתאים לתלמיד
3. איך זה יכול לעזור לו להשיג את יעדיו`;

      const aiResponse = await InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommendations: {
              type: "array",
              maxItems: 3,
              items: {
                type: "object",
                properties: {
                  event_id: { type: "string" },
                  match_strength: { type: "string", enum: ["perfect", "good", "relevant"] },
                  reasons: { type: "array", items: { type: "string" } },
                  expected_benefit: { type: "string" },
                  why_now: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Enrich recommendations with event details
      const enrichedSuggestions = (aiResponse.recommendations || [])
        .map(rec => {
          const event = activeEvents.find(e => e.id === rec.event_id);
          if (!event) return null;
          
          const subject = userSubjects.find(s => s.id === event.subject_id);
          
          return {
            ...rec,
            event: event,
            subject: subject
          };
        })
        .filter(Boolean);

      setSuggestions(enrichedSuggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const refreshSuggestions = () => {
    generateSuggestions(user, subjects, userProfile, true);
  };

  const formatTimeUntilStart = (startTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const diffMs = start.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins <= 0) return "מתחיל עכשיו";
    if (diffMins < 60) return `מתחיל בעוד ${diffMins} דקות`;
    if (diffMins < 1440) return `מתחיל בעוד ${Math.floor(diffMins / 60)} שעות`;
    return `מתחיל ב-${start.toLocaleDateString('he')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          {t.aiSuggestions}
        </h3>
        <Button
          size="sm"
          onClick={refreshSuggestions}
          disabled={isRefreshing}
          className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-400/30"
        >
          {isRefreshing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin mr-1" />
              {t.refreshing}
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-1" />
              {t.refresh}
            </>
          )}
        </Button>
      </div>

      {suggestions.length === 0 ? (
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-lg">
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white/40" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">{t.noSuggestions}</h4>
            <p className="text-white/70">{t.tryLater}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {suggestions.map((suggestion, index) => (
              <motion.div
                key={suggestion.event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/15 backdrop-blur-xl border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-102">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg font-bold text-white">
                            {suggestion.event.title}
                          </CardTitle>
                          <Badge className={`bg-gradient-to-r ${matchStrengthColors[suggestion.match_strength]} text-white border-0`}>
                            {matchStrengthText[suggestion.match_strength][language]}
                          </Badge>
                        </div>
                        {suggestion.subject && (
                          <Badge variant="outline" className="text-white/70 border-white/30 mb-2">
                            {suggestion.subject.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {suggestion.event.description && (
                      <p className="text-sm text-white/80">
                        {suggestion.event.description}
                      </p>
                    )}

                    {/* Event Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm text-white/80">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{formatTimeUntilStart(suggestion.event.start_time)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>
                          {suggestion.event.current_participants?.length || 0}/{suggestion.event.max_participants}
                        </span>
                      </div>
                    </div>

                    {/* AI Reasoning */}
                    <div className="bg-white/10 rounded-lg p-3">
                      <h5 className="text-sm font-semibold text-purple-300 mb-2">
                        {t.recommendedForYou}:
                      </h5>
                      <ul className="text-sm text-white/90 space-y-1">
                        {suggestion.reasons.slice(0, 2).map((reason, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-purple-400 mt-1">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                      {suggestion.expected_benefit && (
                        <p className="text-sm text-green-300 mt-2 font-medium">
                          💡 {suggestion.expected_benefit}
                        </p>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-end pt-2">
                      <Button
                        onClick={() => onEventJoin?.(suggestion.event.id)}
                        className={`bg-gradient-to-r ${matchStrengthColors[suggestion.match_strength]} hover:opacity-90 text-white border-0`}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        {t.joinNow}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}