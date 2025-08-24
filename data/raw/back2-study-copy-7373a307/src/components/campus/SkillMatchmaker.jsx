import React, { useState, useEffect } from "react";
import { SkillProfile } from "@/api/entities";
import { User } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MessageCircle, Star, Sparkles, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sendSlackNotification } from "@/api/functions";

const translations = {
  he: {
    smartMatches: "התאמות חכמות",
    findingMatches: "מחפש התאמות...",
    noMatches: "לא נמצאו התאמות כרגע",
    refreshMatches: "חדש התאמות",
    suggestMeeting: "הצע פגישה",
    mutualBenefit: "תועלת הדדית",
    canHelp: "יכול לעזור לך ב:",
    youCanHelp: "אתה יכול לעזור ב:",
    matchStrength: "חוזק התאמה",
    contactSent: "הודעת קשר נשלחה!",
    error: "שגיאה בשליחת הודעה"
  },
  en: {
    smartMatches: "Smart Matches",
    findingMatches: "Finding matches...",
    noMatches: "No matches found at the moment",
    refreshMatches: "Refresh Matches",
    suggestMeeting: "Suggest Meeting",
    mutualBenefit: "Mutual Benefit",
    canHelp: "Can help you with:",
    youCanHelp: "You can help with:",
    matchStrength: "Match Strength",
    contactSent: "Contact message sent!",
    error: "Error sending message"
  }
};

export default function SkillMatchmaker({ userProfile, language = 'he' }) {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const t = translations[language];

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (userProfile && currentUser) {
      findMatches();
    }
  }, [userProfile, currentUser]);

  const loadCurrentUser = async () => {
    try {
      const userData = await User.me();
      setCurrentUser(userData);
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const findMatches = async () => {
    if (!userProfile?.strong_skills?.length && !userProfile?.help_needed?.length) return;
    
    setIsLoading(true);
    try {
      // Get all user profiles except current user
      const allProfiles = await SkillProfile.list();
      const otherProfiles = allProfiles.filter(profile => profile.user_id !== userProfile.user_id);
      
      if (otherProfiles.length === 0) {
        setMatches([]);
        return;
      }

      // Use AI to find and analyze matches
      const prompt = `אתה מומחה בהתאמת כישורים וחיבור בין תלמידים. 
      
      פרופיל המשתמש הנוכחי:
      - כישורים חזקים: ${JSON.stringify(userProfile.strong_skills || [])}
      - זקוק לעזרה ב: ${JSON.stringify(userProfile.help_needed || [])}
      
      פרופילי משתמשים אחרים:
      ${JSON.stringify(otherProfiles)}
      
      מצא את 3 ההתאמות הטובות ביותר על בסיס:
      1. תועלת הדדית - איפה המשתמש הנוכחי יכול לעזור לאחר ולהיפך
      2. התאמת כישורים - מישהו שחזק במה שהמשתמש זקוק לעזרה
      3. רלוונטיות - התאמה בין תחומי עניין ומקצועות
      
      החזר רשימה של עד 3 התאמות בפורמט JSON:`;

      const aiResponse = await InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            matches: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  user_id: { type: "string" },
                  match_strength: { type: "number", minimum: 1, maximum: 100 },
                  can_help_with: { type: "array", items: { type: "string" } },
                  you_can_help_with: { type: "array", items: { type: "string" } },
                  mutual_benefit_explanation: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Get user details for matched profiles
      const matchesWithDetails = await Promise.all(
        (aiResponse.matches || []).map(async (match) => {
          try {
            const matchedProfile = otherProfiles.find(p => p.user_id === match.user_id);
            const userData = await User.filter({ id: match.user_id });
            
            return {
              ...match,
              profile: matchedProfile,
              user: userData[0] || { full_name: 'משתמש לא ידוע', email: 'unknown' }
            };
          } catch (error) {
            console.error('Error loading user details:', error);
            return null;
          }
        })
      );

      setMatches(matchesWithDetails.filter(m => m !== null));
    } catch (error) {
      console.error('Error finding matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestMeeting = async (match) => {
    try {
      await sendSlackNotification({
        message: `💡 התאמת כישורים חדשה!`,
        type: 'achievement',
        data: {
          'יוזם הקשר': currentUser.full_name,
          'מתאים': match.user.full_name,
          'חוזק התאמה': `${match.match_strength}%`,
          'יכול לעזור ב': match.can_help_with.join(', '),
          'צריך עזרה ב': match.you_can_help_with.join(', '),
          'הסבר': match.mutual_benefit_explanation
        }
      });

      // Show success feedback
      alert(t.contactSent);
    } catch (error) {
      console.error('Error suggesting meeting:', error);
      alert(t.error);
    }
  };

  const getMatchStrengthColor = (strength) => {
    if (strength >= 80) return 'text-green-400';
    if (strength >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">{t.smartMatches}</h3>
        <Button
          size="sm"
          onClick={findMatches}
          disabled={isLoading}
          className="bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 border border-pink-400/30"
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {t.refreshMatches}
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 border-2 border-pink-400 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-white/80">{t.findingMatches}</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-8 text-white/60">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{t.noMatches}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {matches.map((match, index) => (
              <motion.div
                key={match.user_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/15 border-white/20 hover:bg-white/20 transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-white mb-1">
                          {match.user.full_name}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Star className={`w-4 h-4 ${getMatchStrengthColor(match.match_strength)}`} />
                          <span className={`text-sm font-medium ${getMatchStrengthColor(match.match_strength)}`}>
                            {t.matchStrength}: {match.match_strength}%
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => suggestMeeting(match)}
                        className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-400/30"
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        {t.suggestMeeting}
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 bg-white/10 rounded-lg">
                        <p className="text-sm font-medium text-white/90 mb-2">{t.mutualBenefit}:</p>
                        <p className="text-sm text-white/80">{match.mutual_benefit_explanation}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {match.can_help_with?.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-green-300 mb-2">{t.canHelp}</p>
                            <div className="flex flex-wrap gap-1">
                              {match.can_help_with.map((skill, i) => (
                                <Badge key={i} className="bg-green-100 text-green-800 text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {match.you_can_help_with?.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-blue-300 mb-2">{t.youCanHelp}</p>
                            <div className="flex flex-wrap gap-1">
                              {match.you_can_help_with.map((skill, i) => (
                                <Badge key={i} className="bg-blue-100 text-blue-800 text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
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
  );
}