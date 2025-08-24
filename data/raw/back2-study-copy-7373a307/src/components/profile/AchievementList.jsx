import React, { useState, useEffect } from 'react';
import { Achievement } from '@/api/entities';
import { Award, Star, Zap, CheckCircle, BookOpen, MessageSquare, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import EmptyState from '../ui/empty-state';
import { useTheme } from '../ui/theme-provider';

const translations = {
  he: {
    noAchievements: "אין הישגים עדיין",
    keepLearning: "המשך ללמוד כדי לפתוח הישגים חדשים!",
    earnedOn: "הושג בתאריך:"
  },
  en: {
    noAchievements: "No Achievements Yet",
    keepLearning: "Keep learning to unlock new achievements!",
    earnedOn: "Earned on:"
  }
};

const iconMap = {
  path_completed: <BookOpen className="w-8 h-8 text-yellow-400" />,
  first_contribution: <MessageSquare className="w-8 h-8 text-blue-400" />,
  study_streak: <Zap className="w-8 h-8 text-orange-400" />,
  default: <Award className="w-8 h-8 text-gray-400" />
};

const AchievementIcon = ({ type }) => {
  return iconMap[type] || iconMap.default;
};

export default function AchievementList({ userId, language }) {
  const [achievements, setAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { themeClasses } = useTheme();
  const t = translations[language];

  useEffect(() => {
    async function fetchAchievements() {
      if (!userId) return;
      try {
        setIsLoading(true);
        const userAchievements = await Achievement.filter({ user_id: userId }, '-date_earned');
        setAchievements(userAchievements);
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAchievements();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-40 bg-white/10 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (achievements.length === 0) {
    return (
      <EmptyState
        type="noData"
        title={t.noAchievements}
        description={t.keepLearning}
        icon={Award}
        language={language}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {achievements.map((achievement, index) => (
        <motion.div
          key={achievement.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className={`${themeClasses.cardSolid} border-yellow-500/30 text-center p-6 flex flex-col items-center justify-center h-full`}>
            <div className="mb-4">
              <AchievementIcon type={achievement.type} />
            </div>
            <h3 className={`font-bold text-lg ${themeClasses.textPrimary}`}>{achievement.title}</h3>
            <p className={`text-sm mt-2 ${themeClasses.textSecondary}`}>{achievement.description}</p>
            <Badge variant="outline" className="mt-4 border-yellow-400/50 text-yellow-300">
              +{achievement.points || 100} XP
            </Badge>
            <p className="text-xs mt-2 text-gray-500">
              {t.earnedOn} {new Date(achievement.date_earned).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US')}
            </p>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}