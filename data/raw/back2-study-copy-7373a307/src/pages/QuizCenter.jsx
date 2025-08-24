import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Wrench } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../components/ui/theme-provider";

const translations = {
  he: {
    quizCenter: "מרכז חידונים",
    inDevelopment: "בפיתוח",
    comingSoon: "בקרוב...",
    description: "אנחנו עובדים על מרכז חידונים אינטראקטיבי שיאפשר לך ליצור ולפתור חידונים מותאמים אישית, להתחרות עם חברים ולבחון את הידע שלך בדרך מהנה ומאתגרת.",
    features: "תכונות עתידיות:",
    aiQuizGeneration: "יצירת חידונים אוטומטית עם AI",
    multipleFormats: "פורמטים מגוונים של שאלות",
    realTimeCompetition: "תחרויות בזמן אמת",
    progressAnalytics: "ניתוח התקדמות מפורט",
    leaderboards: "לוחות מובילים"
  },
  en: {
    quizCenter: "Quiz Center",
    inDevelopment: "Under Development",
    comingSoon: "Coming Soon...",
    description: "We're building an interactive quiz center that will allow you to create and solve personalized quizzes, compete with friends, and test your knowledge in a fun and challenging way.",
    features: "Upcoming Features:",
    aiQuizGeneration: "AI-powered quiz generation",
    multipleFormats: "Various question formats",
    realTimeCompetition: "Real-time competitions",
    progressAnalytics: "Detailed progress analytics",
    leaderboards: "Leaderboards"
  }
};

export default function QuizCenter() {
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
                  <Brain className="w-8 h-8 text-yellow-400" />
                </div>
                <Wrench className="w-6 h-6 text-yellow-500" />
              </div>
              <CardTitle className={`text-3xl ${themeClasses.textPrimary}`}>
                {t.quizCenter}
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
                    {t.aiQuizGeneration}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    {t.multipleFormats}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    {t.realTimeCompetition}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    {t.progressAnalytics}
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                    {t.leaderboards}
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