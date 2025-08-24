import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/components/ui/theme-provider';
import TutorMessages from '@/components/tutors/TutorMessages';
import { MessageSquare, Calendar, BarChart2, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import EmptyState from '@/components/ui/empty-state';

const translations = {
  he: {
    dashboard: 'לוח בקרת מורים',
    welcome: 'ברוך הבא,',
    messages: 'הודעות',
    schedule: 'לוח זמנים',
    analytics: 'סטטיסטיקות',
    profile: 'ניהול פרופיל',
    loading: 'טוען נתונים...',
    notTutor: 'אינך מוגדר/ת כמורה.',
    becomeTutorPrompt: 'רוצה להתחיל ללמד? הגדר את פרופיל המורה שלך',
    manageStudents: 'ניהול תלמידים',
    earnings: 'הכנסות',
    comingSoon: 'בקרוב'
  },
  en: {
    dashboard: 'Tutor Dashboard',
    welcome: 'Welcome,',
    messages: 'Messages',
    schedule: 'Schedule',
    analytics: 'Analytics',
    profile: 'Profile Management',
    loading: 'Loading data...',
    notTutor: 'You are not registered as a tutor.',
    becomeTutorPrompt: 'Want to start teaching? Set up your tutor profile.',
    manageStudents: 'Manage Students',
    earnings: 'Earnings',
    comingSoon: 'Coming Soon'
  },
};

export default function TutorDashboard() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { themeClasses, language } = useTheme();
  const t = translations[language];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState type="loading" language={language} />
      </div>
    );
  }

  if (!user?.is_tutor) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <EmptyState 
          type="noResults" 
          title={t.notTutor} 
          description={t.becomeTutorPrompt}
          language={language}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 md:p-8 ${themeClasses.background}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header - Mobile Responsive */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
            {t.dashboard}
          </h1>
          <p className={`${themeClasses.textSecondary} text-sm md:text-lg`}>
            {t.welcome} {user.full_name}
          </p>
        </motion.div>

        {/* Mobile and Desktop Tabs */}
        <Tabs defaultValue="messages" className="w-full">
          {/* Mobile - Scrollable tabs */}
          <div className="md:hidden">
            <TabsList className="w-full h-auto p-1 bg-white/5 border border-white/10 backdrop-blur-sm grid grid-cols-2 gap-1">
              <TabsTrigger 
                value="messages" 
                className="data-[state=active]:bg-white/10 text-xs p-2 flex flex-col items-center gap-1"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{t.messages}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="schedule" 
                disabled 
                className="text-xs p-2 flex flex-col items-center gap-1 opacity-50"
              >
                <Calendar className="w-4 h-4" />
                <span>{t.schedule}</span>
                <span className="text-xs text-white/40">({t.comingSoon})</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Desktop - Full tabs */}
          <div className="hidden md:block">
            <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10 backdrop-blur-sm">
              <TabsTrigger value="messages" className="data-[state=active]:bg-white/10">
                <MessageSquare className="w-4 h-4 mr-2" />
                {t.messages}
              </TabsTrigger>
              <TabsTrigger value="schedule" disabled className="opacity-50">
                <Calendar className="w-4 h-4 mr-2" />
                {t.schedule}
              </TabsTrigger>
              <TabsTrigger value="analytics" disabled className="opacity-50">
                <BarChart2 className="w-4 h-4 mr-2" />
                {t.analytics}
              </TabsTrigger>
              <TabsTrigger value="profile" disabled className="opacity-50">
                <UserCircle className="w-4 h-4 mr-2" />
                {t.profile}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <TabsContent value="messages" className="mt-4 md:mt-6">
            <TutorMessages user={user} language={language} />
          </TabsContent>

          <TabsContent value="schedule" className="mt-4 md:mt-6">
            <div className="text-center py-12">
              <EmptyState
                type="noData"
                title={t.comingSoon}
                description={t.schedule}
                language={language}
              />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="mt-4 md:mt-6">
            <div className="text-center py-12">
              <EmptyState
                type="noData"
                title={t.comingSoon}
                description={t.analytics}
                language={language}
              />
            </div>
          </TabsContent>

          <TabsContent value="profile" className="mt-4 md:mt-6">
            <div className="text-center py-12">
              <EmptyState
                type="noData"
                title={t.comingSoon}
                description={t.profile}
                language={language}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}