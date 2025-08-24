import React, { createContext, useContext, useState, useEffect } from "react";
import { colors, typography, spacing, componentVariants, animations } from "./design-system";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('en'); // Default to English

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('studysync-theme');
    const savedLanguage = localStorage.getItem('studysync-language');
    
    if (savedTheme) setTheme(savedTheme);
    if (savedLanguage) {
      setLanguage(savedLanguage);
    } else {
      // Set default to English and save it
      localStorage.setItem('studysync-language', 'en');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('studysync-theme', newTheme);
  };

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('studysync-language', newLanguage);
  };

  const getThemeClasses = () => {
    if (theme === 'dark') {
      return {
        background: 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
        cardGlass: 'bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl',
        cardSolid: 'bg-slate-800 border border-slate-700 shadow-lg',
        textPrimary: 'text-white',
        textSecondary: 'text-white/80',
        textMuted: 'text-white/60'
      };
    } else {
      return {
        background: 'bg-gradient-to-br from-blue-50 via-white to-purple-50',
        cardGlass: 'bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg',
        cardSolid: 'bg-white border border-gray-200 shadow-md',
        textPrimary: 'text-gray-900',
        textSecondary: 'text-gray-700',
        textMuted: 'text-gray-500'
      };
    }
  };

  const value = {
    theme,
    language,
    toggleTheme,
    changeLanguage,
    colors,
    typography,
    spacing,
    componentVariants,
    animations,
    themeClasses: getThemeClasses(),
    isRTL: language === 'he'
  };

  return (
    <ThemeContext.Provider value={value}>
      <div 
        className={`${getThemeClasses().background} ${language === 'he' ? 'font-hebrew' : 'font-sans'}`} 
        dir={language === 'he' ? 'rtl' : 'ltr'}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};