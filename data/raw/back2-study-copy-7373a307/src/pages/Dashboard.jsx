
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { User } from "@/api/entities";
import { Subject } from "@/api/entities";
import { StudyPlan } from "@/api/entities";
import { StudyCircle } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BookOpen, Users, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { format, isSameDay, addDays } from "date-fns";
import { he } from "date-fns/locale";

import StudyProgress from "../components/dashboard/StudyProgress";
import TodaySchedule from "../components/dashboard/TodaySchedule";
import QuickActions from "../components/dashboard/QuickActions";
import LiveCampusPreview from "../components/dashboard/LiveCampusPreview";
import EmptyState from "../components/ui/empty-state";
import { useTheme } from "../components/ui/theme-provider";
import ErrorBoundary from "../components/ui/error-boundary";

// Simplified FloatingShapes for Dashboard
const SimplifiedFloatingShapes = React.memo(() => (
  <>
    <motion.div
      className="absolute top-20 right-16 w-64 h-64 bg-gradient-to-r from-blue-500/[0.08] to-purple-500/[0.08] rounded-full blur-3xl"
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    />
    <motion.div
      className="absolute bottom-32 left-20 w-48 h-48 bg-gradient-to-r from-purple-500/[0.08] to-pink-500/[0.08] rounded-3xl rotate-45 blur-2xl"
      animate={{ y: [0, -20, 0] }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
    />
  </>
));

const translations = {
  he: {
    welcome: "ברוך הבא",
    todayPlan: "תוכנית היום",
    studyProgress: "התקדמות לימודים",
    recentCircles: "החוגים הפעילים שלך",
    quickActions: "פעולות מהירות",
    viewAll: "צפה בהכל",
    noPlansToday: "אין תוכניות לימוד להיום",
    totalSubjects: "סה״כ מקצועות",
    activeCircles: "חוגים פעילים",
    loadingError: "שגיאה בטעינת הנתונים",
    retryLoad: "נסה שוב",
    student: "תלמיד"
  },
  en: {
    welcome: "Welcome",
    todayPlan: "Today's Plan",
    studyProgress: "Study Progress",
    recentCircles: "Your Active Circles",
    quickActions: "Quick Actions",
    viewAll: "View All",
    noPlansToday: "No study plans for today",
    totalSubjects: "Total Subjects",
    activeCircles: "Active Circles",
    loadingError: "Error loading data",
    retryLoad: "Try Again",
    student: "Student"
  }
};

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [studyPlans, setStudyPlans] = useState([]);
  const [studyCircles, setStudyCircles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const { themeClasses, language } = useTheme();

  const isRTL = language === 'he';
  const t = translations[language || 'en'];
  const locale = language === 'he' ? he : undefined;

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    
    try {
      const userData = await User.me();
      setUser(userData);

      const [subjectsData, plansData, circlesData] = await Promise.all([
        Subject.filter({ created_by: userData.email }, '-created_date', 10).catch(err => { console.error('Error loading subjects:', err); return []; }),
        StudyPlan.filter({ created_by: userData.email }, '-created_date', 50).catch(err => { console.error('Error loading study plans:', err); return []; }),
        StudyCircle.list('-created_date', 10).catch(err => { console.error('Error loading study circles:', err); return []; })
      ]);

      setSubjects(subjectsData);
      setStudyPlans(plansData);
      setStudyCircles(circlesData.filter(c => c.members?.some(m => m.user_id === userData.id)));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoadError(error.message || 'Network error occurred');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Memoized calculations
  const todaysPlans = useMemo(() => {
    const today = new Date();
    return studyPlans.filter(plan => {
      return plan.content?.some(item =>
        isSameDay(new Date(item.date), today)
      );
    });
  }, [studyPlans]);

  const weeklyProgress = useMemo(() => {
    const thisWeekPlans = studyPlans.flatMap(plan =>
      plan.content?.filter(item => {
        const itemDate = new Date(item.date);
        const weekAgo = addDays(new Date(), -7);
        return itemDate >= weekAgo && itemDate <= new Date();
      }) || []
    );

    const completed = thisWeekPlans.filter(item => item.completed).length;
    const total = thisWeekPlans.length;

    return { completed, total, percentage: total > 0 ? (completed / total) * 100 : 0 };
  }, [studyPlans]);

  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <EmptyState
          type="noResults"
          title={t.loadingError}
          description={loadError}
          actionText={t.retryLoad}
          onAction={loadData}
          language={language || 'en'}
          animated={false}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <EmptyState type="loading" language={language || 'en'} animated={true} />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={`min-h-screen relative overflow-hidden ${themeClasses.background}`}>
        <div className="fixed inset-0 pointer-events-none">
          <SimplifiedFloatingShapes />
        </div>

        <div className="relative z-10 p-3 md:p-8">
          <div className="max-w-7xl mx-auto">

            {/* Welcome Section - Mobile Optimized */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 md:mb-8 text-center md:text-left"
            >
              <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2`}>
                {t.welcome}, {user?.full_name?.split(' ')[0] || t.student}!
              </h1>
              <p className={`text-base md:text-lg ${themeClasses.textSecondary} mb-3 md:mb-4`}>
                {format(new Date(), language === 'he' ? 'EEEE, d MMMM yyyy' : 'EEEE, MMMM d, yyyy', { locale })}
              </p>
              
              {/* Stats Bar - Mobile Optimized */}
              <div className="flex items-center justify-center md:justify-start gap-4 md:gap-6 text-xs md:text-sm">
                <div className="flex items-center gap-2 text-white/80">
                    <BookOpen className="w-3 h-3 md:w-4 md:h-4 text-blue-400"/>
                    <span className="hidden sm:inline">{subjects.length} {t.totalSubjects}</span>
                    <span className="sm:hidden">{subjects.length}</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                    <Users className="w-3 h-3 md:w-4 md:h-4 text-purple-400"/>
                    <span className="hidden sm:inline">{studyCircles.length} {t.activeCircles}</span>
                    <span className="sm:hidden">{studyCircles.length}</span>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions - Mobile First */}
            <ErrorBoundary>
              <QuickActions language={language || 'en'} />
            </ErrorBoundary>

            {/* Main Dashboard Layout - Mobile Responsive */}
            <div className="space-y-6 md:space-y-8 mt-6 md:mt-8">
              
              {/* Campus LIVE - Full Width Hero Section */}
              <ErrorBoundary>
                <LiveCampusPreview language={language || 'en'} />
              </ErrorBoundary>

              {/* Secondary Content - Mobile Stack, Desktop Grid */}
              <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">
              
                {/* Main Column - Mobile First, Desktop 2/3 */}
                <div className="lg:col-span-2 space-y-6 lg:space-y-8 order-2 lg:order-1">
                  <ErrorBoundary>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Card className={themeClasses.cardGlass}>
                        <CardHeader className="pb-3 md:pb-4">
                          <div className="flex items-center justify-between">
                            <CardTitle className={`text-lg md:text-xl font-bold ${themeClasses.textPrimary}`}>
                              {t.recentCircles}
                            </CardTitle>
                            <Link to={createPageUrl("StudyCircles")}>
                              <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 text-xs md:text-sm">
                                {t.viewAll}
                                <ChevronLeft className={`w-3 h-3 md:w-4 md:h-4 ${isRTL ? 'mr-1' : 'ml-1'}`} />
                              </Button>
                            </Link>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {studyCircles.length === 0 ? (
                            <EmptyState
                              type="noData"
                              title={language === 'he' ? "אין חוגי לימוד עדיין" : "No study circles yet"}
                              description={language === 'he' ? "הצטרף לחוגי לימוד או צור חוג חדש" : "Join study circles or create a new one"}
                              actionText={language === 'he' ? "גלה חוגים" : "Explore Circles"}
                              onAction={() => window.location.href = createPageUrl("StudyCircles")}
                              language={language || 'en'}
                              className="py-6 md:py-8"
                            />
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                              {studyCircles.map((circle, index) => (
                                <motion.div
                                  key={circle.id}
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.7 + index * 0.1 }}
                                  className="group"
                                >
                                  <Card className={`${themeClasses.cardGlass} opacity-80 hover:opacity-100 hover:shadow-lg transition-all duration-300 group-hover:scale-105`}>
                                    <CardContent className="p-3 md:p-4">
                                      <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                                        <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/10">
                                          <Users className="w-4 h-4 md:w-5 md:h-5 text-purple-300" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h3 className={`font-semibold truncate text-sm md:text-base ${themeClasses.textPrimary}`}>{circle.name}</h3>
                                          <p className={`text-xs md:text-sm ${themeClasses.textMuted}`}>
                                            {circle.members?.length || 0} {language === 'he' ? 'חברים' : 'members'}
                                          </p>
                                        </div>
                                      </div>
                                      <p className={`text-xs md:text-sm line-clamp-2 mb-2 md:mb-3 ${themeClasses.textSecondary}`}>
                                        {circle.description || (language === 'he' ? "חוג לימוד משותף" : "Shared study circle")}
                                      </p>
                                      <Badge variant="secondary" className={`text-xs ${themeClasses.textMuted} border-white/20`}>
                                        {circle.is_public ? (language === 'he' ? "פתוח" : "Public") : (language === 'he' ? "סגור" : "Private")}
                                      </Badge>
                                    </CardContent>
                                  </Card>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </ErrorBoundary>
                </div>

                {/* Sidebar Column - Mobile First, Desktop 1/3 */}
                <div className="space-y-6 lg:space-y-8 order-1 lg:order-2">
                  <ErrorBoundary>
                    <TodaySchedule plans={todaysPlans} language={language || 'en'} />
                  </ErrorBoundary>
                  <ErrorBoundary>
                    <StudyProgress weeklyProgress={weeklyProgress} studyStreak={7} language={language || 'en'} />
                  </ErrorBoundary>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
