import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/api/entities';

const UserPreferencesContext = createContext();

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    return {
      preferences: {
        displayCurrency: 'ILS',
        dateFormat: 'DD/MM/YYYY',
        theme: 'light',
        fontSize: 'medium',
        highContrast: false,
        reducedMotion: false,
        letterSpacing: 'normal',
        displayMode: 'normal',
        fontFamily: 'default',
        highlightTitles: false,
        highlightLinks: false,
        keyboardNavigation: false,
        focusIndicators: false
      },
      updatePreferences: () => {},
      isLoading: false
    };
  }
  return context;
};

export const UserPreferencesProvider = ({ children }) => {
  const [preferences, setPreferences] = useState({
    displayCurrency: 'ILS',
    dateFormat: 'DD/MM/YYYY',
    theme: 'light',
    fontSize: 'medium',
    highContrast: false,
    reducedMotion: false,
    letterSpacing: 'normal',
    displayMode: 'normal',
    fontFamily: 'default',
    highlightTitles: false,
    highlightLinks: false,
    keyboardNavigation: false,
    focusIndicators: false
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  // Load user preferences on mount
  useEffect(() => {
    loadUserPreferences();
  }, []);

  // Apply preferences to DOM when they change
  useEffect(() => {
    applyPreferencesToDOM();
  }, [preferences]);

  const loadUserPreferences = async () => {
    // Rate limiting: don't fetch more than once every 5 seconds
    const now = Date.now();
    if (now - lastFetchTime < 5000) {
      setIsLoading(false);
      return;
    }

    try {
      const user = await User.me();
      const userPrefs = user?.display_preferences || {};
      
      const newPreferences = {
        displayCurrency: userPrefs.displayCurrency || 'ILS',
        dateFormat: userPrefs.dateFormat || 'DD/MM/YYYY',
        theme: userPrefs.theme || 'light',
        fontSize: userPrefs.fontSize || 'medium',
        highContrast: userPrefs.highContrast || false,
        reducedMotion: userPrefs.reducedMotion || false,
        letterSpacing: userPrefs.letterSpacing || 'normal',
        displayMode: userPrefs.displayMode || 'normal',
        fontFamily: userPrefs.fontFamily || 'default',
        highlightTitles: userPrefs.highlightTitles || false,
        highlightLinks: userPrefs.highlightLinks || false,
        keyboardNavigation: userPrefs.keyboardNavigation || false,
        focusIndicators: userPrefs.focusIndicators || false
      };
      
      setPreferences(newPreferences);
      setLastFetchTime(now);
      
      // Cache preferences for immediate access
      if (typeof window !== 'undefined') {
        localStorage.setItem('userCurrency', newPreferences.displayCurrency);
        localStorage.setItem('userPreferences', JSON.stringify(newPreferences));
      }
      
    } catch (error) {
      console.error('Error loading user preferences:', error);
      
      // Try to load from cache
      if (typeof window !== 'undefined') {
        try {
          const cachedPrefs = localStorage.getItem('userPreferences');
          if (cachedPrefs) {
            const parsed = JSON.parse(cachedPrefs);
            setPreferences(parsed);
          }
        } catch (cacheError) {
          console.error('Error loading cached preferences:', cacheError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (newPrefs) => {
    try {
      const updatedPrefs = { ...preferences, ...newPrefs };
      
      // Update in database
      await User.updateMyUserData({
        display_preferences: updatedPrefs
      });
      
      // Update local state
      setPreferences(updatedPrefs);
      
      // Update cache
      if (typeof window !== 'undefined') {
        localStorage.setItem('userCurrency', updatedPrefs.displayCurrency);
        localStorage.setItem('userPreferences', JSON.stringify(updatedPrefs));
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating preferences:', error);
      return { success: false, error };
    }
  };

  const applyPreferencesToDOM = () => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    
    // Apply theme
    if (preferences.theme === 'dark') {
      root.classList.add('dark');
    } else if (preferences.theme === 'light') {
      root.classList.remove('dark');
    } else { // auto
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // Apply font size
    root.classList.remove('font-small', 'font-medium', 'font-large', 'font-xlarge');
    root.classList.add(`font-${preferences.fontSize}`);

    // Apply accessibility settings
    if (preferences.highContrast) {
      root.classList.add('high-contrast-mode');
    } else {
      root.classList.remove('high-contrast-mode');
    }

    if (preferences.reducedMotion) {
      root.classList.add('reduced-motion-mode');
    } else {
      root.classList.remove('reduced-motion-mode');
    }

    // Apply letter spacing
    root.classList.remove('accessibility-letter-spacing-normal', 'accessibility-letter-spacing-increased', 'accessibility-letter-spacing-wide');
    root.classList.add(`accessibility-letter-spacing-${preferences.letterSpacing}`);

    // Apply display mode
    root.classList.remove('accessibility-high-contrast', 'accessibility-inverted', 'accessibility-grayscale');
    if (preferences.displayMode === 'inverted') {
      root.classList.add('accessibility-inverted');
    } else if (preferences.displayMode === 'grayscale') {
      root.classList.add('accessibility-grayscale');
    }

    // Apply font family
    root.classList.remove('accessibility-dyslexic-font', 'accessibility-readable-font');
    if (preferences.fontFamily === 'dyslexic') {
      root.classList.add('accessibility-dyslexic-font');
    } else if (preferences.fontFamily === 'readable') {
      root.classList.add('accessibility-readable-font');
    }

    // Apply highlight options
    if (preferences.highlightTitles) {
      root.classList.add('accessibility-highlight-titles');
    } else {
      root.classList.remove('accessibility-highlight-titles');
    }

    if (preferences.highlightLinks) {
      root.classList.add('accessibility-highlight-links');
    } else {
      root.classList.remove('accessibility-highlight-links');
    }

    // Apply focus indicators
    if (preferences.focusIndicators) {
      root.classList.add('accessibility-enhanced-focus');
    } else {
      root.classList.remove('accessibility-enhanced-focus');
    }

    // Apply keyboard navigation enhancements
    if (preferences.keyboardNavigation) {
      root.classList.add('accessibility-keyboard-navigation');
    } else {
      root.classList.remove('accessibility-keyboard-navigation');
    }
  };

  const value = {
    preferences,
    updatePreferences,
    isLoading,
    refreshPreferences: loadUserPreferences
  };

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
};