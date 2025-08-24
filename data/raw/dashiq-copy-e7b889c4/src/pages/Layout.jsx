

import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { useDevice } from "@/components/utils/DeviceContext";
import MobileNavbar from "@/components/mobile/MobileNavbar";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ErrorBoundary from "@/components/ErrorBoundary";
import FinancialAssistantEnhanced from "@/components/ai/FinancialAssistantEnhanced";
import { LanguageSelector } from "@/components/ui/language-selector";
import { t, getCurrentLanguage, isRTL, getLanguageInfo, useI18n } from "@/components/utils/i18n";
import UserProfileButton from "@/components/ui/user-profile-button";
import { UserPreferencesProvider } from "@/components/utils/UserPreferencesContext";
import { UserProvider } from "@/components/utils/UserContext"; // New import for UserProvider
import {
  AlertCircle,
  LayoutDashboard,
  Upload,
  Settings,
  BookmarkIcon,
  ChevronRight,
  ChevronLeft,
  Menu,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Users,
  Trophy,
  Target,
  List,
  Shapes,
  BarChart,
  BrainCircuit
} from "lucide-react";
import AccessibilityWidget from "@/components/accessibility/AccessibilityWidget";
import { Button } from "@/components/ui/button";
import { checkAndInitializeUser } from '@/components/utils/initializeUser';

export default function Layout({ children, currentPageName }) {
  const { isMobile, isTablet } = useDevice();
  const [networkError, setNetworkError] = useState(false);
  // currentUser state and memoizedCurrentUser removed as user data will be managed by UserProvider
  const [appName, setAppName] = useState('Dash:IQ');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    localStorage.getItem("sidebarCollapsed") === "true"
  );
  const [isAdditionalToolsOpen, setIsAdditionalToolsOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const currentLang = getCurrentLanguage();
  const isRTLLayout = isRTL();
  const langInfo = getLanguageInfo();

  const { currentLanguage, changeLanguage, availableLanguages } = useI18n();
  
  const languagesArray = Array.isArray(availableLanguages) 
    ? availableLanguages 
    : Object.values(availableLanguages || {});

  // The dynamic useEffect for setting appName has been removed to ensure consistency.

  // Initialize user only once when app loads
  useEffect(() => {
    const initializeUserOnce = async () => {
      if (!sessionStorage.getItem('userInitChecked')) {
        try {
          // Add a small delay to prevent rate limiting issues during startup
          await new Promise(resolve => setTimeout(resolve, 100));
          const initResult = await checkAndInitializeUser();
          if (initResult.needsInitialization && initResult.initializationResult.success) {
            console.log(`Auto-initialized user with ${initResult.categoryCount} categories`);
          }
          sessionStorage.setItem('userInitChecked', 'true');
        } catch (error) {
          console.warn('User initialization error:', error);
        }
      }
    };

    initializeUserOnce();
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    const handleOnline = () => setNetworkError(false);
    const handleOffline = () => setNetworkError(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setNetworkError(!window.navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", isSidebarCollapsed);
  }, [isSidebarCollapsed]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
    if (!isSidebarCollapsed) {
      setIsAdditionalToolsOpen(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);

      toast({
        title: t('auth.signingOut'),
        description: t('auth.signingOutDescription'),
      });

      await User.logout();

      localStorage.removeItem('sidebarCollapsed');
      localStorage.removeItem('userInitialized');
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('financialInsights') || key.startsWith('userPreferences')) {
          localStorage.removeItem(key);
        }
      });
      sessionStorage.removeItem('userInitChecked');

      setTimeout(() => {
        window.location.href = '/';
      }, 1000);

    } catch (error) {
      console.error('Error during sign out:', error);
      setIsSigningOut(false);

      toast({
        variant: "destructive",
        title: t('auth.signOutError'),
        description: t('auth.signOutErrorDescription'),
      });
    }
  };

  // handleSettingsClick removed as UserProfileButton now handles navigation internally
  // (assuming it gets navigate from UserContext or directly uses useNavigate internally)

  const menuItems = [
    { name: t('navigation.dashboard'), icon: LayoutDashboard, path: "/Dashboard" },
    { name: t('navigation.upload'), icon: Upload, path: "/Upload" },
    { name: t('navigation.transactions'), icon: List, path: "/Transactions" },
    { name: t('navigation.budget'), icon: Target, path: "/Budget" },
    { name: t('navigation.categoryManagement'), icon: Shapes, path: "/CategoryManagement" },
    { name: t('navigation.insights'), icon: BarChart, path: "/Insights" },
    { name: t('aiAssistant.intelligentTitle'), icon: BrainCircuit, onClick: () => setIsAIAssistantOpen(true), isButton: true },
  ];

  const additionalToolsItems = [
    { icon: "TrendingUp", label: t('navigation.forecast'), page: "Forecast" },
    { icon: "Users", label: t('navigation.peerComparison'), page: "PeerComparison" },
    { icon: "Trophy", label: t('navigation.successStories'), page: "SuccessStories" },
    { icon: "Target", label: t('navigation.savings'), page: "Savings" }
  ];

  const settingsMenuItem = {
    page: "Settings",
    label: t('navigation.systemSettings'),
    icon: "Settings",
    order: 999
  };

  const iconMap = {
    Settings,
    TrendingUp,
    Users,
    Trophy,
    Target
  };

  if (isMobile || isTablet) {
    return (
      <UserProvider>
        <UserPreferencesProvider>
          <div className={`min-h-screen bg-white text-black ${isRTLLayout ? 'rtl' : 'ltr'}`} dir={langInfo.direction}>
            <MobileNavbar
              currentPageName={currentPageName}
              menuItems={[...menuItems, ...additionalToolsItems, settingsMenuItem]}
              onSignOut={handleSignOut}
              isSigningOut={isSigningOut}
              appName={appName}
              setIsAIAssistantOpen={setIsAIAssistantOpen}
            />

            <div className={`fixed bottom-20 ${isRTLLayout ? 'right-4' : 'left-4'} z-40`}>
              <Button
                onClick={() => setIsAIAssistantOpen(true)}
                className="rounded-full w-14 h-14 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 shadow-lg border-2 border-yellow-300"
                title={t('aiAssistant.title')}
              >
                <BrainCircuit className="w-6 h-6 text-yellow-900" />
              </Button>
            </div>

            <main className="pb-20">
              {networkError && (
                <Alert variant="destructive" className="m-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {t('errors.network')}
                  </AlertDescription>
                </Alert>
              )}
              <div className="p-4">
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </div>
            </main>

            <FinancialAssistantEnhanced
              isOpen={isAIAssistantOpen}
              onClose={() => setIsAIAssistantOpen(false)}
            />
            <AccessibilityWidget />
          </div>
        </UserPreferencesProvider>
      </UserProvider>
    );
  }

  return (
    <UserProvider>
      <UserPreferencesProvider>
        <div className={`flex h-screen bg-white text-black ${isRTLLayout ? 'rtl' : 'ltr'}`} dir={langInfo.direction}>
          <aside
            className={`${isSidebarCollapsed ? 'w-16' : 'w-64'} ${isRTLLayout ? 'border-r' : 'border-l'} border-gray-200 bg-gray-50 text-gray-800 transition-all duration-300 ease-in-out flex flex-col`}
            aria-label={appName}
          >
            <div className="p-4 flex items-center justify-between border-b border-gray-200">
              {!isSidebarCollapsed && (
                <div className="flex items-center justify-between w-full">
                  <h1 className="text-xl font-bold">{appName}</h1>
                  {/* UserProfileButton now consumes UserContext internally */}
                  <UserProfileButton
                    variant="compact"
                    showRole={false}
                    className="ml-2"
                  />
                </div>
              )}
              <button
                onClick={toggleSidebar}
                className={`p-1 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors ${!isSidebarCollapsed ? "" : "ml-auto"}`}
                aria-label={isSidebarCollapsed ? t('common.expand') : t('common.collapse')}
              >
                {isSidebarCollapsed ? (
                  isRTLLayout ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />
                ) : (
                  isRTLLayout ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                )}
              </button>
            </div>

            {isSidebarCollapsed && (
              <div className="px-2 py-2 border-b border-gray-200">
                <div className="flex justify-center">
                  {/* UserProfileButton now consumes UserContext internally */}
                  <UserProfileButton
                    variant="compact"
                    showRole={false}
                  />
                </div>
              </div>
            )}

            <nav
              className={`${isSidebarCollapsed ? 'px-2' : 'px-4'} py-4 flex-1 space-y-1 overflow-y-auto`}
              aria-label={t('navigation.dashboard')}
            >
              {menuItems.map((item) => {
                const IconComponent = item.icon;

                if (item.isButton) {
                  return (
                    <button
                      key={item.name}
                      onClick={item.onClick}
                      className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : (isRTLLayout ? 'justify-start' : 'justify-start')}
                        gap-3 px-3 py-3 rounded-lg transition-colors duration-200
                        bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700
                        group relative w-full shadow-lg border border-purple-400 hover:shadow-xl transform hover:scale-105`}
                      title={item.name}
                    >
                      <IconComponent className={`${isSidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`} />
                      {!isSidebarCollapsed && <span className="font-medium">{item.name}</span>}
                      {isSidebarCollapsed && (
                        <div
                          className={`absolute ${isRTLLayout ? 'left-full' : 'right-full'} top-1/2 transform -translate-y-1/2 ${isRTLLayout ? 'ml-2' : 'mr-2'} px-2 py-1 bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-300 pointer-events-none border border-gray-600`}
                          role="tooltip"
                        >
                          {item.name}
                        </div>
                      )}
                    </button>
                  );
                }

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : (isRTLLayout ? 'justify-start' : 'justify-start')}
                      gap-3 px-3 py-3 rounded-lg transition-colors duration-200
                      ${currentPageName === item.path.substring(1)
                        ? "bg-blue-600 text-white hover:bg-blue-500"
                        : "hover:bg-gray-200"}
                      group relative`}
                    title={item.name}
                    aria-current={currentPageName === item.path.substring(1) ? "page" : undefined}
                  >
                    <IconComponent
                      className={`${isSidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`}
                    />
                    {!isSidebarCollapsed && <span>{item.name}</span>}
                    {isSidebarCollapsed && (
                      <div
                        className={`absolute ${isRTLLayout ? 'left-full' : 'right-full'} top-1/2 transform -translate-y-1/2 ${isRTLLayout ? 'ml-2' : 'mr-2'} px-2 py-1 bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-300 pointer-events-none border border-gray-600`}
                        role="tooltip"
                      >
                        {item.name}
                      </div>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div
              className={`${isSidebarCollapsed ? 'px-2' : 'px-4'} py-4 border-t border-gray-200 space-y-1`}
              aria-label={t('navigation.settings')}
            >
              <div className="relative">
                <button
                  onClick={() => setIsAdditionalToolsOpen(!isAdditionalToolsOpen)}
                  className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}
                    w-full gap-3 px-3 py-3 rounded-lg transition-colors duration-200
                    hover:bg-gray-200 group relative`}
                  aria-expanded={isAdditionalToolsOpen}
                  title={t('common.additionalTools')}
                >
                  <div className="flex items-center gap-3">
                    <BookmarkIcon
                      className={`${isSidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`}
                    />
                    {!isSidebarCollapsed && <span>{t('common.additionalTools')}</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    isAdditionalToolsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                  )}
                  {isSidebarCollapsed && (
                    <div
                      className={`absolute ${isRTLLayout ? 'left-full' : 'right-full'} top-1/2 transform -translate-y-1/2 ${isRTLLayout ? 'ml-2' : 'mr-2'} px-2 py-1 bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-300 pointer-events-none border border-gray-600`}
                      role="tooltip"
                    >
                      {t('common.additionalTools')}
                    </div>
                  )}
                </button>
                {isAdditionalToolsOpen && (
                  <div
                    className={`${isSidebarCollapsed
                      ? `absolute top-0 z-50 w-48 bg-gray-50 border border-gray-200 rounded-md shadow-lg ${
                          isRTLLayout
                            ? 'right-full mr-2'
                            : 'left-full ml-2'
                        }`
                      : 'mt-1 space-y-1 bg-white'
                    }`}
                  >
                    {additionalToolsItems.map((item) => {
                      const IconComponent = iconMap[item.icon];
                      return (
                        <Link
                          key={item.page}
                          to={createPageUrl(item.page)}
                          onClick={() => setIsAdditionalToolsOpen(false)}
                          className={`flex items-center ${isSidebarCollapsed ? 'justify-start px-3 py-2' : `justify-start ${isRTLLayout ? 'pr-8 pl-3' : 'pl-8 pr-3'} py-2`}
                            gap-3 rounded-lg transition-colors duration-200
                            ${currentPageName === item.page
                              ? "bg-blue-600 text-white hover:bg-blue-500"
                              : "hover:bg-gray-200"}
                            group relative w-full text-sm`}
                          title={item.label}
                          aria-current={currentPageName === item.page ? "page" : undefined}
                        >
                          {IconComponent && (
                            <IconComponent className="w-4 h-4 flex-shrink-0" />
                          )}
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              <Link
                to={createPageUrl(settingsMenuItem.page)}
                className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : (isRTLLayout ? 'justify-start' : 'justify-start')}
                  gap-3 px-3 py-3 rounded-lg transition-colors duration-200
                  ${currentPageName === settingsMenuItem.page
                    ? "bg-blue-600 text-white hover:bg-blue-500"
                    : "hover:bg-gray-200"}
                  group relative`}
                title={settingsMenuItem.label}
                aria-current={currentPageName === settingsMenuItem.page ? "page" : undefined}
              >
                <Settings
                  className={`${isSidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'}`}
                />
                {!isSidebarCollapsed && <span>{settingsMenuItem.label}</span>}
                {isSidebarCollapsed && (
                  <div
                    className={`absolute ${isRTLLayout ? 'left-full' : 'right-full'} top-1/2 transform -translate-y-1/2 ${isRTLLayout ? 'ml-2' : 'mr-2'} px-2 py-1 bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-300 pointer-events-none border border-gray-600`}
                    role="tooltip"
                  >
                    {settingsMenuItem.label}
                  </div>
                )}
              </Link>

              <div className={`${isSidebarCollapsed ? 'px-1' : 'px-3'} py-2`}>
                {!isSidebarCollapsed ? (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      {t('settings.language')}
                    </div>
                    <LanguageSelector variant="select" className="w-full" />
                  </div>
                ) : (
                  <div className="relative group">
                    <div className="flex justify-center">
                      <LanguageSelector variant="compact" className="text-xs" />
                    </div>
                    <div
                      className={`absolute ${isRTLLayout ? 'left-full' : 'right-full'} top-1/2 transform -translate-y-1/2 ${isRTLLayout ? 'ml-2' : 'mr-2'} px-2 py-1 bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-300 pointer-events-none border border-gray-600`}
                      role="tooltip"
                    >
                      {t('settings.language')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>

          <main className="flex-1 p-6 overflow-y-auto">
            {networkError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {t('errors.network')}
                </AlertDescription>
              </Alert>
            )}
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </main>

          <FinancialAssistantEnhanced
            isOpen={isAIAssistantOpen}
            onClose={() => setIsAIAssistantOpen(false)}
          />
          <AccessibilityWidget />
        </div>
      </UserPreferencesProvider>
    </UserProvider>
  );
}

