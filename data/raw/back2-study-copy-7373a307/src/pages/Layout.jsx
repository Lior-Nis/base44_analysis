

import React, { useState, useEffect, Suspense, memo } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import {
  BookOpen,
  Users,
  Calendar,
  Brain,
  Bell,
  Globe,
  LayoutDashboard,
  Shield,
  Sun,
  Moon,
  User as UserIcon,
  GraduationCap,
  Briefcase,
  Wrench, // Icon for "Under Development"
  Settings, // Added for Content Management
  MessageSquare // Added for Tutor Dashboard icon
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeProvider, useTheme } from "@/components/ui/theme-provider";
import { LazyWrapper } from "@/components/ui/lazy-loading";
import ErrorBoundary from "@/components/ui/error-boundary";
import { Badge } from "@/components/ui/badge"; // Assuming this is where Badge component is located
import { PermissionProvider } from "@/components/permissions/PermissionProvider";
import AccessibilityWidget from "@/components/ui/AccessibilityWidget";

const NotificationCenter = React.lazy(() => import("@/components/ui/notification-center"));

const translations = {
  he: {
    dashboard: "לוח הבקרה",
    parentDashboard: "לוח בקרת הורים",
    tutorDashboard: "לוח בקרת מורים", // Added
    learningHub: "מרכז הלמידה",
    subjects: "מקצועות",
    campus: "קמפוס דינמי",
    studyCircles: "חוגי לימוד",
    quizCenter: "מרכז בחנים",
    aiTutor: "עוזר AI",
    studyPlanner: "תכנית לימודים",
    privateLessons: "שיעורים פרטיים",
    profile: "פרופיל",
    contentManagement: "ניהול תוכן", // Added
    navigation: "ניווט",
    community: "קהילה",
    language: "שפה",
    notifications: "התראות",
    theme: "ערכת נושא",
    darkMode: "מצב כהה",
    lightMode: "מצב בהיר",
    underDevelopment: "בפיתוח",
    termsOfService: "תנאי שימוש",
    privacyPolicy: "מדיניות פרטיות",
    accessibilityStatement: "הצהרת נגישות" // Added
  },
  en: {
    dashboard: "Dashboard",
    parentDashboard: "Parent Dashboard",
    tutorDashboard: "Tutor Dashboard", // Added
    learningHub: "Learning Hub",
    subjects: "Subjects",
    campus: "Dynamic Campus",
    studyCircles: "Study Circles",
    quizCenter: "Quiz Center",
    aiTutor: "AI Tutor",
    studyPlanner: "Study Planner",
    privateLessons: "Private Lessons",
    profile: "Profile",
    contentManagement: "Content Management", // Added
    navigation: "Navigation",
    community: "Community",
    language: "Language",
    notifications: "Notifications",
    theme: "Theme",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    underDevelopment: "Under Development",
    termsOfService: "Terms of Service",
    privacyPolicy: "Privacy Policy",
    accessibilityStatement: "Accessibility Statement" // Added
  }
};

// Accessibility styles to be injected globally
const AccessibilityStyles = () => (
  <style>{`
    :root {
      --font-size-multiplier: 1;
    }
    body {
      font-size: calc(16px * var(--font-size-multiplier));
    }
    h1 { font-size: calc(2.25rem * var(--font-size-multiplier)); }
    h2 { font-size: calc(1.875rem * var(--font-size-multiplier)); }
    h3 { font-size: calc(1.5rem * var(--font-size-multiplier)); }
    p, span, div, a, button, li, label, input, textarea {
      font-size: calc(1rem * var(--font-size-multiplier));
    }

    .accessibility-high-contrast {
      background-color: #000 !important;
      color: #fff !important;
    }
    .accessibility-high-contrast .bg-white\\/10,
    .accessibility-high-contrast .bg-gray-800\\/80,
    .accessibility-high-contrast .bg-gray-900\\/95,
    .accessibility-high-contrast .from-slate-900,
    .accessibility-high-contrast .card,
    .accessibility-high-contrast button {
      background: #000 !important;
      color: #fff !important;
      border: 1px solid #fff !important;
    }
    .accessibility-high-contrast a,
    .accessibility-high-contrast .text-blue-400 {
      color: #00FFFF !important;
      text-decoration: underline;
    }

    .accessibility-highlight-links a,
    .accessibility-highlight-links button {
      text-decoration: underline !important;
      background-color: yellow !important;
      color: black !important;
      padding: 2px;
    }

    .accessibility-readable-font body,
    .accessibility-readable-font * {
      font-family: 'Arial', sans-serif !important;
    }

    .accessibility-stop-animations * {
      animation: none !important;
      transition: none !important;
    }

    .toggle-checkbox {
      appearance: none;
      width: 40px;
      height: 20px;
      background: #4a5568;
      border-radius: 20px;
      position: relative;
      cursor: pointer;
      outline: none;
      transition: background 0.3s;
    }
    .toggle-checkbox:checked {
      background: #3b82f6;
    }
    .toggle-checkbox::before {
      content: '';
      width: 16px;
      height: 16px;
      background: white;
      border-radius: 50%;
      position: absolute;
      top: 2px;
      left: 2px;
      transition: transform 0.3s;
    }
    .toggle-checkbox:checked::before {
      transform: translateX(20px);
    }
  `}</style>
);

const commonNavItems = [
  { titleKey: "learningHub", url: createPageUrl("LearningHub"), icon: GraduationCap },
  { titleKey: "subjects", url: createPageUrl("Subjects"), icon: BookOpen },
  { titleKey: "campus", url: createPageUrl("Campus"), icon: Globe },
  { titleKey: "studyCircles", url: createPageUrl("StudyCircles"), icon: Users },
  { titleKey: "privateLessons", url: createPageUrl("PrivateLessons"), icon: Briefcase },
  { titleKey: "aiTutor", url: createPageUrl("AITutor"), icon: Brain },
  { titleKey: "profile", url: createPageUrl("Profile"), icon: UserIcon },
  // Moved to bottom and marked as WIP
  { titleKey: "quizCenter", url: createPageUrl("QuizCenter"), icon: Wrench, isWIP: true },
  { titleKey: "studyPlanner", url: createPageUrl("StudyPlanner"), icon: Calendar, isWIP: true }
];

const LayoutContent = memo(({ children, currentPageName }) => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const { theme, language, toggleTheme, changeLanguage, themeClasses, isRTL } = useTheme();
  const location = useLocation();

  const t = translations[language];

  useEffect(() => {
    loadUser();
  }, [location]); // Re-load user on location change to get latest status

  const loadUser = async () => {
    setLoadingUser(true);
    try {
      const userData = await User.me();
      setUser(userData);
      if (userData.preferred_language && userData.preferred_language !== language) {
        changeLanguage(userData.preferred_language);
      }
    } catch (error) {
      console.warn('User not authenticated or network error');
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  const handleLanguageChange = async (newLang) => {
    changeLanguage(newLang);
    if (user) {
      try {
        await User.updateMyUserData({ preferred_language: newLang });
      } catch (error) {
        console.error('Failed to update user language preference:', error);
      }
    }
  };

  const getNavItems = () => {
    let items = [];

    // Add main dashboard first
    if(user?.role_in_family === 'parent') {
      items.push({ titleKey: "parentDashboard", url: createPageUrl("ParentDashboard"), icon: Shield });
    } else {
      items.push({ titleKey: "dashboard", url: createPageUrl("Dashboard"), icon: LayoutDashboard });
    }

    // Add common navigation items
    items = [...items, ...commonNavItems];

    // Add special items at the bottom
    if (user?.is_tutor) {
      items.push({ titleKey: "tutorDashboard", url: createPageUrl("TutorDashboard"), icon: MessageSquare });
    }

    if (user?.role === 'admin' || user?.is_tutor) {
      items.push({
        titleKey: "contentManagement",
        url: createPageUrl("ContentManagement"),
        icon: Settings,
        adminOnly: true
      });
    }

    return items;
  };

  const navigationItems = getNavItems();

  // If loading, show a spinner.
  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // If no user is authenticated OR user has not completed onboarding, show the Welcome page.
  if (!user || !user.onboarding_completed) {
    const Welcome = React.lazy(() => import('./pages/Welcome'));
    return (
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-950">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
          />
        </div>
      }>
        <Welcome />
      </Suspense>
    );
  }

  // If user is logged in and onboarded, show the main layout.
  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        <AccessibilityStyles />
        <AccessibilityWidget />
        <SidebarProvider>
          <div className="flex w-full">
            <Sidebar className="bg-gray-900/95 backdrop-blur-xl border-r border-gray-700/50 shadow-2xl">
              <SidebarHeader className="border-b border-gray-700/50 p-6 bg-gray-800/80">
                <motion.div
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-white drop-shadow-sm">Back2study</h2>
                    <p className="text-xs text-gray-400">AI Study Hub</p>
                  </div>
                </motion.div>
              </SidebarHeader>

              <SidebarContent className="p-3 bg-gray-900/50">
                <SidebarGroup>
                  <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider px-3 py-2 text-gray-400">
                    {t.navigation}
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {navigationItems.map((item, index) => (
                        <SidebarMenuItem key={item.titleKey}>
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                          >
                            <SidebarMenuButton
                              asChild={!item.isWIP} // Link only if not WIP
                              className={`group relative hover:bg-gray-700/60 transition-all duration-200 rounded-xl mb-1 backdrop-blur-sm border border-transparent hover:border-gray-600/30 ${
                                location.pathname === item.url && !item.isWIP
                                  ? 'bg-blue-600/20 shadow-lg border-blue-500/30 text-blue-300 hover:bg-blue-600/30'
                                  : item.isWIP
                                  ? 'text-gray-500 cursor-not-allowed opacity-70'
                                  : 'text-gray-300 hover:text-white'
                              }`}
                              disabled={item.isWIP}
                            >
                              <Link to={item.isWIP ? '#' : item.url} className="flex items-center justify-between w-full px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <item.icon className={`w-5 h-5 drop-shadow-sm ${item.isWIP ? 'text-yellow-500' : ''}`} />
                                  <span className="font-medium drop-shadow-sm">{t[item.titleKey]}</span>
                                </div>
                                {item.isWIP && (
                                  <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-400/50">
                                    {t.underDevelopment}
                                  </Badge>
                                )}
                              </Link>
                            </SidebarMenuButton>
                          </motion.div>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>

              <SidebarFooter className="border-t border-gray-700/50 p-4 bg-gray-800/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="font-semibold text-sm text-white drop-shadow-sm">
                        {user?.full_name?.[0] || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate text-white drop-shadow-sm">
                        {user?.full_name || 'User'}
                      </p>
                      <p className="text-xs truncate text-gray-400">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleTheme}
                      className="h-8 w-8 p-0 hover:bg-gray-700/60 border border-gray-600/30 text-gray-300 hover:text-white"
                      title={theme === 'dark' ? t.lightMode : t.darkMode}
                    >
                      {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-gray-700/60 border border-gray-600/30 text-gray-300 hover:text-white"
                        >
                          <Globe className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align={isRTL ? "start" : "end"} className="bg-gray-800 border-gray-600 shadow-xl">
                        <DropdownMenuItem
                          onClick={() => handleLanguageChange('he')}
                          className="text-gray-300 hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white"
                        >
                          עברית
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleLanguageChange('en')}
                          className="text-gray-300 hover:bg-gray-700 hover:text-white focus:bg-gray-700 focus:text-white"
                        >
                          English
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                {/* Legal Links Footer */}
                <div className="mt-4 pt-4 border-t border-gray-700/50 text-center text-xs">
                  <Link to={createPageUrl("TermsOfService")} className="text-gray-400 hover:text-white transition-colors duration-200">
                    {t.termsOfService}
                  </Link>
                  <span className="mx-2 text-gray-500">|</span>
                  <Link to={createPageUrl("PrivacyPolicy")} className="text-gray-400 hover:text-white transition-colors duration-200">
                    {t.privacyPolicy}
                  </Link>
                  <span className="mx-2 text-gray-500">|</span>
                  <Link to={createPageUrl("AccessibilityStatement")} className="text-gray-400 hover:text-white transition-colors duration-200">
                    {t.accessibilityStatement}
                  </Link>
                </div>
              </SidebarFooter>
            </Sidebar>

            <main className="flex-1 flex flex-col">
              {/* Mobile Header */}
              <header className="bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 px-6 py-4 md:hidden shadow-lg">
                <div className="flex items-center justify-between">
                  <SidebarTrigger className="hover:bg-gray-700/60 p-2 rounded-lg transition-colors duration-200 border border-gray-600/30 text-white" />
                  <div className="flex items-center gap-2">
                    <Brain className="w-6 h-6 text-blue-400 drop-shadow-sm" />
                    <h1 className="text-lg font-bold text-white drop-shadow-sm">Back2study</h1>
                  </div>
                  <LazyWrapper>
                    <Suspense fallback={<div className="w-8 h-8" />}>
                      <NotificationCenter language={language} />
                    </Suspense>
                  </LazyWrapper>
                </div>
              </header>

              {/* Desktop Notification Center */}
              <div className="hidden md:block absolute top-4 right-4 z-20">
                <LazyWrapper>
                  <Suspense fallback={<div className="w-8 h-8" />}>
                    <NotificationCenter language={language} />
                  </Suspense>
                </LazyWrapper>
              </div>

              {/* Main Content */}
              <div className="flex-1 overflow-auto">
                <ErrorBoundary>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={location.pathname}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="min-h-full"
                    >
                      <Suspense fallback={
                        <div className="flex items-center justify-center min-h-screen">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
                          />
                        </div>
                      }>
                        {children}
                      </Suspense>
                    </motion.div>
                  </AnimatePresence>
                </ErrorBoundary>
              </div>
            </main>
          </div>
        </SidebarProvider>
      </div>
    </ErrorBoundary>
  );
});

export default function Layout({ children, currentPageName }) {
  return (
    <ThemeProvider>
      <PermissionProvider>
        <LayoutContent children={children} currentPageName={currentPageName} />
      </PermissionProvider>
    </ThemeProvider>
  );
}

