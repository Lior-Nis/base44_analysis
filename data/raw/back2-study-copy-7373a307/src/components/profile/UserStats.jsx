import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, BookOpen, Users, Award } from 'lucide-react';
import { useTheme } from '../ui/theme-provider';
import { motion } from 'framer-motion';

const translations = {
  he: {
    statsTitle: "סטטיסטיקות למידה",
    subjects: "מקצועות",
    circles: "חוגים",
    paths: "מסלולים",
    achievements: "הישגים",
  },
  en: {
    statsTitle: "Learning Stats",
    subjects: "Subjects",
    circles: "Circles",
    paths: "Paths",
    achievements: "Achievements",
  }
};

const StatCard = ({ icon: Icon, value, label, color, delay }) => {
  const { themeClasses } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className={`${themeClasses.cardSolid} text-center p-4`}>
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-3 shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <p className={`text-2xl font-bold ${themeClasses.textPrimary}`}>{value}</p>
        <p className={`text-sm ${themeClasses.textMuted}`}>{label}</p>
      </Card>
    </motion.div>
  );
};

export default function UserStats({ subjects = [], circles = [], learningPaths = [], language = 'en' }) {
  const { themeClasses } = useTheme();
  const t = translations[language];

  const stats = useMemo(() => [
    { icon: BookOpen, value: subjects.length, label: t.subjects, color: 'from-blue-400 to-blue-600', delay: 0.1 },
    { icon: Users, value: circles.length, label: t.circles, color: 'from-purple-400 to-purple-600', delay: 0.2 },
    { icon: Award, value: learningPaths.length, label: t.paths, color: 'from-green-400 to-green-600', delay: 0.3 },
    { icon: BarChart, value: 0, label: t.achievements, color: 'from-yellow-400 to-yellow-600', delay: 0.4 }, // Placeholder
  ], [subjects, circles, learningPaths, t]);

  return (
    <Card className={themeClasses.cardGlass}>
      <CardHeader>
        <CardTitle className={`${themeClasses.textPrimary} flex items-center gap-2`}>
          <BarChart className="w-5 h-5 text-blue-400" />
          {t.statsTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(stat => <StatCard key={stat.label} {...stat} />)}
        </div>
      </CardContent>
    </Card>
  );
}