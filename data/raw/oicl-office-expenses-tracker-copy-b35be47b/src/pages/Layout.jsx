
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  LayoutDashboard, 
  Plus, 
  FileBarChart,
  Building2,
  Wind,
  Atom,
  Heart,
  Zap
} from "lucide-react";

import ThemeSelector from "../components/ThemeSelector";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Add Entry",
    url: createPageUrl("AddEntry"),
    icon: Plus,
  },
  {
    title: "Reports", 
    url: createPageUrl("Reports"),
    icon: FileBarChart,
  },
];

const themes = {
  'notion-clean': {
    icon: Building2,
    background: 'bg-white',
    headerBg: 'bg-white border-b border-gray-200',
    cardBg: 'bg-white border border-gray-200 shadow-sm',
    primaryGradient: 'bg-gray-900',
    navBg: 'bg-white border-t border-gray-200',
    textPrimary: 'text-gray-900',
    textSecondary: 'text-gray-600',
    textMuted: 'text-gray-500',
    hoverCard: 'hover:shadow-md hover:border-gray-300',
    activeNav: 'bg-gray-900 text-white',
    inactiveNav: 'text-gray-600 hover:text-gray-900',
    balanceCard: 'bg-gradient-to-r from-gray-900 to-gray-700 text-white'
  },
  'stripe-modern': {
    icon: Wind,
    background: 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50',
    headerBg: 'bg-white/80 backdrop-blur-xl border-b border-blue-200/50',
    cardBg: 'bg-white/70 backdrop-blur-sm border border-blue-200/30 shadow-lg',
    primaryGradient: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    navBg: 'bg-white/90 backdrop-blur-xl border-t border-blue-200/50',
    textPrimary: 'text-slate-900',
    textSecondary: 'text-slate-700',
    textMuted: 'text-slate-500',
    hoverCard: 'hover:shadow-xl hover:bg-white/80 hover:-translate-y-1',
    activeNav: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg',
    inactiveNav: 'text-slate-600 hover:text-blue-600',
    balanceCard: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl'
  },
  'spotify-dark': {
    icon: Atom,
    background: 'bg-gray-900',
    headerBg: 'bg-gray-800/90 backdrop-blur-xl border-b border-gray-700',
    cardBg: 'bg-gray-800/90 backdrop-blur-sm border border-gray-700 shadow-2xl',
    primaryGradient: 'bg-green-500',
    navBg: 'bg-gray-800/95 backdrop-blur-xl border-t border-gray-700',
    textPrimary: 'text-white',
    textSecondary: 'text-gray-300',
    textMuted: 'text-gray-400',
    hoverCard: 'hover:bg-gray-700/90 hover:shadow-2xl hover:border-green-500/50',
    activeNav: 'bg-green-500 text-black font-bold shadow-lg',
    inactiveNav: 'text-gray-400 hover:text-white',
    balanceCard: 'bg-gradient-to-r from-green-600 to-green-500 text-black shadow-2xl'
  },
  'airbnb-warm': {
    icon: Heart,
    background: 'bg-gradient-to-br from-rose-50 via-orange-50 to-pink-50',
    headerBg: 'bg-white/90 backdrop-blur-xl border-b border-rose-200/50',
    cardBg: 'bg-white/80 backdrop-blur-sm border border-rose-200/40 shadow-lg',
    primaryGradient: 'bg-gradient-to-r from-rose-500 to-pink-500',
    navBg: 'bg-white/90 backdrop-blur-xl border-t border-rose-200/50',
    textPrimary: 'text-rose-900',
    textSecondary: 'text-rose-700',
    textMuted: 'text-rose-500',
    hoverCard: 'hover:shadow-xl hover:bg-white/90 hover:border-rose-300 hover:-translate-y-0.5',
    activeNav: 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg',
    inactiveNav: 'text-rose-600 hover:text-rose-800',
    balanceCard: 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xl'
  },
  'figma-creative': {
    icon: Zap,
    background: 'bg-gradient-to-br from-violet-100 via-pink-50 via-orange-50 to-yellow-100',
    headerBg: 'bg-white/90 backdrop-blur-xl border-b border-purple-200/50',
    cardBg: 'bg-white/80 backdrop-blur-lg border border-purple-200/30 shadow-xl',
    primaryGradient: 'bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500',
    navBg: 'bg-white/90 backdrop-blur-xl border-t border-purple-200/50',
    textPrimary: 'text-gray-900',
    textSecondary: 'text-gray-700',
    textMuted: 'text-gray-500',
    hoverCard: 'hover:shadow-2xl hover:bg-white/90 hover:border-purple-300 hover:scale-[1.02]',
    activeNav: 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-xl',
    inactiveNav: 'text-gray-600 hover:text-purple-600',
    balanceCard: 'bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 text-white shadow-2xl'
  }
};

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [currentTheme, setCurrentTheme] = useState('notion-clean');
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('oicl-theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  const handleThemeChange = (themeId) => {
    setCurrentTheme(themeId);
    localStorage.setItem('oicl-theme', themeId);
  };

  const theme = themes[currentTheme];
  const HeaderIcon = theme.icon;

  return (
    <div className={`min-h-screen ${theme.background} font-sans ${theme.textPrimary}`}>
      <style>{`
        .card-style {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .primary-gradient {
          background: ${currentTheme === 'stripe-modern' ? 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)' :
                      currentTheme === 'airbnb-warm' ? 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)' :
                      currentTheme === 'figma-creative' ? 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 20%, #ec4899 100%)' :
                      currentTheme === 'spotify-dark' ? '#22c55e' : '#111827'};
        }
        .warm-gradient {
          background: ${currentTheme === 'stripe-modern' ? 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)' :
                      currentTheme === 'airbnb-warm' ? 'linear-gradient(135deg, #f43f5e 0%, #ec4899 100%)' :
                      currentTheme === 'figma-creative' ? 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 20%, #ec4899 100%)' :
                      currentTheme === 'spotify-dark' ? '#22c55e' : '#111827'};
        }
      `}</style>
      
      {/* Header */}
      <header className={`py-6 px-4 ${theme.headerBg} sticky top-0 z-40`}>
        <div className="flex items-center justify-center gap-3 relative">
          <div className={`w-12 h-12 ${theme.primaryGradient} rounded-2xl flex items-center justify-center shadow-lg`}>
            <HeaderIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className={`text-xl font-bold ${theme.textPrimary}`}>OICL Office Expenses</h1>
            <p className={`text-sm ${theme.textSecondary} font-medium`}>Smart Expense Management</p>
          </div>
          <div className="absolute right-0">
            <ThemeSelector currentTheme={currentTheme} onThemeChange={handleThemeChange} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-28">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className={`fixed bottom-0 left-0 right-0 ${theme.navBg} z-50`}>
        <div className="flex items-center justify-around py-2.5">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <Link
                key={item.title}
                to={item.url}
                className={`flex flex-col items-center gap-1.5 px-6 py-2.5 rounded-2xl transition-all duration-300 transform ${
                  isActive 
                    ? `${theme.activeNav} scale-105` 
                    : `${theme.inactiveNav} hover:bg-white/20`
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-semibold">
                  {item.title}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
