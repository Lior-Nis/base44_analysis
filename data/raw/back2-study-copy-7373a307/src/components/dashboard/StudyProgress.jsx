
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Zap } from "lucide-react";
import { useTheme } from '../ui/theme-provider';

export default function StudyProgress({ weeklyProgress, studyStreak, language }) {
  const { themeClasses } = useTheme();
  
  const messages = {
    he: {
      studyProgress: "ההתקדמות שלי",
      weeklyGoal: "יעד שבועי",
      studyStreak: "רצף לימודים",
      days: "ימים",
      completed: "הושלם",
      excellentWork: "עבודה מעולה!",
      keepGoing: "המשך כך!",
      almostThere: "כמעט שם!",
      getStarted: "בואו נתחיל!"
    },
    en: {
      studyProgress: "My Progress", 
      weeklyGoal: "Weekly Goal",
      studyStreak: "Study Streak",
      days: "days",
      completed: "Completed",
      excellentWork: "Excellent work!",
      keepGoing: "Keep it up!",
      almostThere: "Almost there!",
      getStarted: "Let's get started!"
    }
  };
  
  const t = messages[language];
  
  const getMotivationMessage = (percentage) => {
    if (percentage >= 80) return t.excellentWork;
    if (percentage >= 50) return t.keepGoing;
    if (percentage >= 20) return t.almostThere;
    return t.getStarted;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className={themeClasses.cardGlass}>
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className={`text-lg md:text-xl font-bold ${themeClasses.textPrimary} flex items-center gap-2`}>
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
            {t.studyProgress}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6">
          
          {/* Weekly Goal */}
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <span className={`text-sm font-medium ${themeClasses.textSecondary}`}>{t.weeklyGoal}</span>
              <span className={`text-lg md:text-xl font-bold ${themeClasses.textPrimary}`}>
                {Math.round(weeklyProgress.percentage)}%
              </span>
            </div>
            <Progress 
              value={weeklyProgress.percentage} 
              className="h-2"
              indicatorClassName="bg-gradient-to-r from-green-400 to-cyan-400"
            />
            <p className={`text-xs mt-2 ${themeClasses.textMuted}`}>
              {getMotivationMessage(weeklyProgress.percentage)}
            </p>
          </div>

          {/* Study Streak */}
          <div>
            <div className="flex justify-between items-center">
              <span className={`text-sm font-medium ${themeClasses.textSecondary}`}>{t.studyStreak}</span>
              <div className="flex items-center gap-2">
                <span className={`text-lg md:text-xl font-bold ${themeClasses.textPrimary}`}>
                  {studyStreak} {t.days}
                </span>
                <div className="w-6 h-6 md:w-8 md:h-8 bg-orange-500/20 rounded-full flex items-center justify-center">
                  <Zap className="w-3 h-3 md:w-4 md:h-4 text-orange-400" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
