import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Wrench } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../components/ui/theme-provider";

const translations = {
  he: {
    studyPlanner: "תכנית לימודים",
    inDevelopment: "בפיתוח",
    comingSoon: "בקרוב...",
    description: "אנחנו עובדים על מערכת תכנון לימודים מתקדמת שתאפשר לך ליצור תוכניות לימוד מותאמות אישית עם AI, לתזמן משימות ולעקוב אחר ההתקדמות שלך.",
    features: "תכונות עתידיות:",
    aiPlanGeneration: "יצירת תוכניות לימוד עם AI",
    smartScheduling: "תזמון חכם של משימות",
    progressTracking: "מעקב אחר התקדמות",
    reminders: "תזכורות אוטומטיות",
    analytics: "ניתוח הביצועים שלך"
  },
  en: {
    studyPlanner: "Study Planner",
    inDevelopment: "Under Development",
    comingSoon: "Coming Soon...",
    description: "We're working on an advanced study planning system that will allow you to create personalized study plans with AI, schedule tasks, and track your progress.",
    features: "Upcoming Features:",
    aiPlanGeneration: "AI-powered study plan generation",
    smartScheduling: "Smart task scheduling",
    progressTracking: "Progress tracking",
    reminders: "Automatic reminders",
    analytics: "Performance analytics"
  }
};

export default function StudyPlanner() {
  const { themeClasses, language } = useTheme();
  const t = translations[language || 'en'];

  return (
    <div className={`min-h-screen ${themeClasses.background} p-4 md:p-8`}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <Card className={`${themeClasses.cardGlass} border-yellow-400/30`}>
            <CardHeader className="pb-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-yellow-400" />
                </div>
                <Wrench className="w-6 h-6 text-yellow-500" />
              </div>
              <CardTitle className={`text-3xl ${themeClasses.textPrimary}`}>
                {t.studyPlanner}
              </CardTitle>
              <div className="inline-flex items-center gap-2 bg-yellow-500/10 px-4 py-2 rounded-full border border-yellow-400/30 mt-4">
                <Wrench className="w-4 h-4 text-yellow-500" />
                <span className="text-yellow-400 font-medium">{t.inDevelopment}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <h3 className={`text-xl font-bold ${themeClasses.textPrimary}`}>
                {t.comingSoon}
              </h3>
              
              <p className={`${themeClasses.textSecondary} leading-relaxed max-w-2xl mx-auto`}>
                {t.description}
              </p>

              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h4 className={`font-semibold mb-4 ${themeClasses.textPrimary}`}>
                  {t.features}
                </h4>
                <ul className={`space-y-2 text-left ${themeClasses.textSecondary}`}>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    {t.aiPlanGeneration}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    {t.smartScheduling}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    {t.progressTracking}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    {t.reminders}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                    {t.analytics}
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}