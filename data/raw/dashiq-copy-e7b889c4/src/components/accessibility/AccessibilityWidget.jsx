
import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  EyeOff, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  Type, 
  Zap, 
  Underline, 
  Maximize, 
  Minimize, 
  X, 
  PauseCircle,
  Keyboard,
  Mic,
  ChevronLeft,
  ChevronRight,
  Settings,
  RefreshCw,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { t, isRTL } from '@/components/utils/i18n';

// Helper function to load accessibility settings from localStorage
const loadAccessibilitySettings = () => {
  if (typeof window === 'undefined') return defaultSettings;
  
  try {
    const savedSettings = localStorage.getItem('accessibilitySettings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  } catch (error) {
    console.error('Error loading accessibility settings:', error);
    return defaultSettings;
  }
};

// Default settings
const defaultSettings = {
  fontSize: 'medium', // small, medium, large, x-large
  letterSpacing: 'normal', // normal, increased, wide
  contrast: 'normal', // normal, high, inverted
  background: 'light', // light, dark
  fontFamily: 'default', // default, dyslexic
  animations: true, // enable/disable animations
  highlightTitles: false, // highlight headings
  highlightLinks: false, // highlight links
  readableFont: false, // simplified layout with more readable font
  keyboardNavigation: false, // enhanced keyboard navigation
  focusIndicators: false, // show focus indicators - changed to false
  soundMuted: false, // mute all sounds - NEW
  textToSpeech: false, // enable text-to-speech - NEW
};

// Custom Accessibility Icon Component
const AccessibilityIcon = ({ className = "w-6 h-6" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="accessibilityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00bfff" />
        <stop offset="50%" stopColor="#4169e1" />
        <stop offset="100%" stopColor="#8a2be2" />
      </linearGradient>
    </defs>
    
    {/* Outer circle */}
    <circle 
      cx="12" 
      cy="12" 
      r="11" 
      fill="url(#accessibilityGradient)" 
    />
    
    {/* Inner white circle border */}
    <circle 
      cx="12" 
      cy="12" 
      r="9" 
      fill="none" 
      stroke="white" 
      strokeWidth="1" 
    />
    
    {/* Person icon - made bigger and clearer */}
    {/* Head - increased size */}
    <circle 
      cx="12" 
      cy="7.5" 
      r="2.2" 
      fill="white" 
    />
    
    {/* Body - made wider and taller */}
    <rect 
      x="10" 
      y="10.5" 
      width="4" 
      height="2" 
      rx="2" 
      fill="white" 
    />
    
    {/* Arms - made longer and thicker */}
    <rect 
      x="7" 
      y="11" 
      width="2.5" 
      height="1.2" 
      rx="1.5" 
      fill="white" 
    />
    <rect 
      x="14.5" 
      y="11" 
      width="2.5" 
      height="1.2" 
      rx="1.5" 
      fill="white" 
    />
    
    {/* Legs - made thicker and longer */}
    <rect 
      x="10.2" 
      y="13.5" 
      width="1.3" 
      height="3" 
      rx="2" 
      fill="white" 
    />
    <rect 
      x="12.5" 
      y="13.5" 
      width="1.3" 
      height="3" 
      rx="2" 
      fill="white" 
    />
  </svg>
);

export default function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('visual');
  const [settings, setSettings] = useState(defaultSettings);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const [animation, setAnimation] = useState('');
  const { toast } = useToast();
  const isRTLLayout = isRTL();
  
  // Load settings on mount
  useEffect(() => {
    const savedSettings = loadAccessibilitySettings();
    setSettings(savedSettings);
    applyAccessibilitySettings(savedSettings);
  }, []);
  
  // Save settings when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
      applyAccessibilitySettings(settings);
    }
  }, [settings]);
  
  const applyAccessibilitySettings = (currentSettings) => {
    // Get the HTML root and body elements
    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    
    // Apply font size
    bodyElement.classList.remove('a11y-text-small', 'a11y-text-medium', 'a11y-text-large', 'a11y-text-xlarge');
    bodyElement.classList.add(`a11y-text-${currentSettings.fontSize}`);
    
    // Apply letter spacing
    bodyElement.classList.remove('a11y-letter-normal', 'a11y-letter-increased', 'a11y-letter-wide');
    bodyElement.classList.add(`a11y-letter-${currentSettings.letterSpacing}`);
    
    // Apply contrast - SWITCHED: now 'inverted' applies dark mode
    bodyElement.classList.remove('a11y-contrast-normal', 'a11y-contrast-high', 'a11y-contrast-inverted');
    if (currentSettings.contrast === 'inverted') {
      // Apply dark mode when contrast is inverted
      bodyElement.classList.add('a11y-bg-dark');
      bodyElement.classList.remove('a11y-bg-light');
    } else {
      bodyElement.classList.add(`a11y-contrast-${currentSettings.contrast}`);
    }
    
    // Apply background - SWITCHED: now 'dark' applies inverted colors
    bodyElement.classList.remove('a11y-bg-light', 'a11y-bg-dark');
    if (currentSettings.background === 'dark') {
      // Apply inverted colors when background is dark
      bodyElement.classList.add('a11y-contrast-inverted');
      bodyElement.classList.remove('a11y-contrast-normal', 'a11y-contrast-high');
    } else {
      bodyElement.classList.add(`a11y-bg-${currentSettings.background}`);
    }
    
    // Apply font family
    bodyElement.classList.remove('a11y-font-default', 'a11y-font-dyslexic');
    bodyElement.classList.add(`a11y-font-${currentSettings.fontFamily}`);
    
    // Apply animations
    if (!currentSettings.animations) {
      bodyElement.classList.add('a11y-no-animations');
    } else {
      bodyElement.classList.remove('a11y-no-animations');
    }
    
    // Apply highlighting
    if (currentSettings.highlightTitles) {
      bodyElement.classList.add('a11y-highlight-titles');
    } else {
      bodyElement.classList.remove('a11y-highlight-titles');
    }
    
    if (currentSettings.highlightLinks) {
      bodyElement.classList.add('a11y-highlight-links');
    } else {
      bodyElement.classList.remove('a11y-highlight-links');
    }
    
    // Apply readable font
    if (currentSettings.readableFont) {
      bodyElement.classList.add('a11y-readable');
    } else {
      bodyElement.classList.remove('a11y-readable');
    }
    
    // Apply keyboard navigation
    bodyElement.classList.remove('a11y-keyboard-nav'); // Ensure clean state
    if (currentSettings.keyboardNavigation) {
      bodyElement.classList.add('a11y-keyboard-nav');
    } 
    
    // Apply focus indicators
    bodyElement.classList.remove('a11y-focus-indicators'); // Ensure clean state
    if (currentSettings.focusIndicators) {
      bodyElement.classList.add('a11y-focus-indicators');
    }
    
    // Apply sound mute
    bodyElement.classList.remove('a11y-sound-muted'); // Ensure clean state
    if (currentSettings.soundMuted) {
      bodyElement.classList.add('a11y-sound-muted');
    }
    
    // Apply text-to-speech
    bodyElement.classList.remove('a11y-tts-enabled'); // Ensure clean state
    if (currentSettings.textToSpeech) {
      bodyElement.classList.add('a11y-tts-enabled');
    }
    
    // Add comprehensive CSS for all accessibility features
    if (typeof document !== 'undefined' && !document.getElementById('accessibility-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'accessibility-styles';
      styleElement.textContent = `
        /* Font Size Classes */
        .a11y-text-small { font-size: 0.875rem !important; }
        .a11y-text-medium { font-size: 1rem !important; }
        .a11y-text-large { font-size: 1.125rem !important; }
        .a11y-text-xlarge { font-size: 1.25rem !important; }
        
        /* Letter Spacing Classes */
        .a11y-letter-normal { letter-spacing: normal !important; }
        .a11y-letter-increased { letter-spacing: 0.05em !important; }
        .a11y-letter-wide { letter-spacing: 0.1em !important; }
        
        /* Contrast Classes */
        .a11y-contrast-normal { }
        .a11y-contrast-high { 
          filter: contrast(150%) !important;
          --tw-bg-opacity: 1;
          background-color: rgb(255 255 255 / var(--tw-bg-opacity)) !important;
          color: rgb(0 0 0) !important;
        }
        .a11y-contrast-inverted { 
          filter: invert(1) hue-rotate(180deg) !important;
        }
        
        /* Background Classes - SWITCHED: now dark applies dark theme */
        .a11y-bg-light { 
          background-color: white !important;
          color: black !important;
        }
        .a11y-bg-dark { 
          background-color: #1a1a1a !important;
          color: #e5e5e5 !important;
        }
        
        /* Dark mode specific styles */
        .a11y-bg-dark * {
          border-color: #404040 !important;
        }
        
        .a11y-bg-dark .bg-white,
        .a11y-bg-dark [class*="bg-white"] {
          background-color: #2d2d2d !important;
          color: #e5e5e5 !important;
        }
        
        .a11y-bg-dark .bg-gray-50,
        .a11y-bg-dark [class*="bg-gray-50"] {
          background-color: #262626 !important;
          color: #e5e5e5 !important;
        }
        
        .a11y-bg-dark .bg-gray-100,
        .a11y-bg-dark [class*="bg-gray-100"] {
          background-color: #404040 !important;
          color: #e5e5e5 !important;
        }
        
        .a11y-bg-dark .text-gray-800,
        .a11y-bg-dark [class*="text-gray-800"] {
          color: #e5e5e5 !important;
        }
        
        .a11y-bg-dark .text-gray-600,
        .a11y-bg-dark [class*="text-gray-600"] {
          color: #b3b3b3 !important;
        }
        
        .a11y-bg-dark .text-gray-500,
        .a11y-bg-dark [class*="text-gray-500"] {
          color: #999999 !important;
        }
        
        .a11y-bg-dark .border-gray-200,
        .a11y-bg-dark [class*="border-gray-200"] {
          border-color: #404040 !important;
        }
        
        .a11y-bg-dark .shadow-lg,
        .a11y-bg-dark .shadow-xl,
        .a11y-bg-dark [class*="shadow-"] {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3) !important;
        }
        
        /* Font Family Classes */
        .a11y-font-default { font-family: Inter, system-ui, sans-serif !important; }
        .a11y-font-dyslexic { font-family: 'OpenDyslexic', 'Comic Sans MS', cursive !important; }
        
        /* Animation Classes */
        .a11y-no-animations * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
        
        /* Highlighting Classes */
        .a11y-highlight-titles h1,
        .a11y-highlight-titles h2,
        .a11y-highlight-titles h3,
        .a11y-highlight-titles h4,
        .a11y-highlight-titles h5,
        .a11y-highlight-titles h6 {
          background-color: #ffff00 !important;
          color: #000000 !important;
          padding: 4px 8px !important;
          border-radius: 4px !important;
        }
        
        .a11y-highlight-links a {
          background-color: #ffff00 !important;
          color: #000000 !important;
          text-decoration: underline !important;
          padding: 2px 4px !important;
          border-radius: 2px !important;
        }
        
        /* Readable Font */
        .a11y-readable {
          font-family: 'Verdana', Arial, sans-serif !important;
          line-height: 1.6 !important;
          word-spacing: 0.1em !important;
        }
        
        /* Keyboard Navigation */
        .a11y-keyboard-nav *:focus {
          outline: 3px solid #2563eb !important;
          outline-offset: 2px !important;
        }
        
        /* Focus Indicators */
        .a11y-focus-indicators *:focus {
          outline: 3px solid #2563eb !important;
          outline-offset: 2px !important;
          box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.3) !important;
        }
        
        /* Sound Muted */
        .a11y-sound-muted audio,
        .a11y-sound-muted video {
          /* Note: The 'muted' attribute is a JS property, not a CSS one.
             CSS can only affect visual aspects like display/opacity, not actual sound output.
             This CSS class mainly acts as a flag. Actual muting logic should be in JS. */
          opacity: 0.5; /* Example visual effect */
        }
        
        /* Text-to-Speech */
        .a11y-tts-enabled {
          /* This class is typically a flag for JavaScript-based text-to-speech functionality.
             The 'speak' property is for aural CSS, primarily for screen readers, and is not widely supported for direct browser speech. */
          speak: normal !important; 
        }
      `;
      document.head.appendChild(styleElement);
    }
  };
  
  const togglePanel = () => {
    if (!isPanelVisible) {
      setIsPanelVisible(true);
      setAnimation('a11y-panel-slide-in');
    } else {
      setAnimation('a11y-panel-slide-out');
      setTimeout(() => {
        setIsPanelVisible(false);
      }, 300);
    }
  };
  
  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    toast({
      title: t('accessibility.settingUpdated'),
      description: t('accessibility.settingUpdatedDescription'),
      duration: 2000,
    });
  };
  
  const resetSettings = () => {
    setSettings(defaultSettings);
    toast({
      title: t('accessibility.resetComplete'),
      description: t('accessibility.resetCompleteDescription'),
      duration: 3000,
    });
  };

  return (
    <>
      {/* Accessibility floating button - positioned based on RTL */}
      <div className={`fixed bottom-4 z-50 ${isRTLLayout ? 'left-4' : 'right-4'}`}>
        <button
          onClick={togglePanel}
          className="p-2 rounded-full bg-white shadow-xl hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 border-2 border-gray-100 hover:scale-105"
          aria-label={t('accessibility.openWidget')}
        >
          <AccessibilityIcon className="w-8 h-8" />
        </button>
      </div>

      {/* Accessibility panel - positioned based on RTL */}
      {isPanelVisible && (
        <div 
          className={`fixed bottom-20 z-50 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 ${animation} ${isRTLLayout ? 'left-4' : 'right-4'}`}
          dir={isRTLLayout ? 'rtl' : 'ltr'}
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <AccessibilityIcon className="w-5 h-5" />
              {t('accessibility.title')}
            </h2>
            <button
              onClick={togglePanel}
              className="p-1 rounded-md hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label={t('accessibility.closeWidget')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="visual" className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {t('accessibility.visual')}
                </TabsTrigger>
                <TabsTrigger value="content" className="flex items-center gap-1">
                  <Type className="w-4 h-4" />
                  {t('accessibility.content')}
                </TabsTrigger>
                <TabsTrigger value="navigation" className="flex items-center gap-1">
                  <Keyboard className="w-4 h-4" />
                  {t('accessibility.navigation')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="visual" className="space-y-4">
                {/* Font Size */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('accessibility.fontSize')}</label>
                  <div className="flex gap-2">
                    {['small', 'medium', 'large', 'x-large'].map((size) => (
                      <button
                        key={size}
                        onClick={() => updateSetting('fontSize', size)}
                        className={`px-3 py-1 text-xs rounded ${
                          settings.fontSize === size
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {size === 'x-large' ? t('accessibility.fontSizeXLarge') : 
                         size === 'large' ? t('accessibility.fontSizeLarge') :
                         size === 'medium' ? t('accessibility.fontSizeMedium') :
                         t('accessibility.fontSizeSmall')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background Theme */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('accessibility.background')}</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateSetting('background', 'light')}
                      className={`flex items-center gap-2 px-3 py-2 rounded ${
                        settings.background === 'light'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Sun className="w-4 h-4" />
                      {t('accessibility.backgroundLight')}
                    </button>
                    <button
                      onClick={() => updateSetting('background', 'dark')}
                      className={`flex items-center gap-2 px-3 py-2 rounded ${
                        settings.background === 'dark'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Moon className="w-4 h-4" />
                      {t('accessibility.backgroundDark')}
                    </button>
                  </div>
                </div>

                {/* Contrast */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('accessibility.contrast')}</label>
                  <div className="flex gap-2">
                    {['normal', 'high', 'inverted'].map((contrast) => (
                      <button
                        key={contrast}
                        onClick={() => updateSetting('contrast', contrast)}
                        className={`px-3 py-1 text-xs rounded ${
                          settings.contrast === contrast
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {contrast === 'normal' ? t('accessibility.contrastNormal') :
                         contrast === 'high' ? t('accessibility.contrastHigh') :
                         t('accessibility.contrastInverted')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Letter Spacing */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('accessibility.letterSpacing')}</label>
                  <div className="flex gap-2">
                    {['normal', 'increased', 'wide'].map((spacing) => (
                      <button
                        key={spacing}
                        onClick={() => updateSetting('letterSpacing', spacing)}
                        className={`px-3 py-1 text-xs rounded ${
                          settings.letterSpacing === spacing
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {spacing === 'normal' ? t('accessibility.letterSpacingNormal') :
                         spacing === 'increased' ? t('accessibility.letterSpacingIncreased') :
                         t('accessibility.letterSpacingWide')}
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="content" className="space-y-4">
                {/* Font Family */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('accessibility.dyslexicFont')}</span>
                  </div>
                  <Switch
                    checked={settings.fontFamily === 'dyslexic'}
                    onCheckedChange={(checked) => 
                      updateSetting('fontFamily', checked ? 'dyslexic' : 'default')
                    }
                  />
                </div>

                {/* Readable Font */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('accessibility.readableLayout')}</span>
                  </div>
                  <Switch
                    checked={settings.readableFont}
                    onCheckedChange={(checked) => updateSetting('readableFont', checked)}
                  />
                </div>

                {/* Highlight Titles */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Underline className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('accessibility.highlightTitles')}</span>
                  </div>
                  <Switch
                    checked={settings.highlightTitles}
                    onCheckedChange={(checked) => updateSetting('highlightTitles', checked)}
                  />
                </div>

                {/* Highlight Links */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Underline className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('accessibility.highlightLinks')}</span>
                  </div>
                  <Switch
                    checked={settings.highlightLinks}
                    onCheckedChange={(checked) => updateSetting('highlightLinks', checked)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="navigation" className="space-y-4">
                {/* Keyboard Navigation */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Keyboard className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('accessibility.enhancedKeyboard')}</span>
                  </div>
                  <Switch
                    checked={settings.keyboardNavigation}
                    onCheckedChange={(checked) => updateSetting('keyboardNavigation', checked)}
                  />
                </div>

                {/* Focus Indicators */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('accessibility.enhancedFocus')}</span>
                  </div>
                  <Switch
                    checked={settings.focusIndicators}
                    onCheckedChange={(checked) => updateSetting('focusIndicators', checked)}
                  />
                </div>

                {/* Disable Animations */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PauseCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('accessibility.disableAnimations')}</span>
                  </div>
                  <Switch
                    checked={!settings.animations}
                    onCheckedChange={(checked) => updateSetting('animations', !checked)}
                  />
                </div>
              </TabsContent>
            </Tabs>

            {/* Reset Button */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={resetSettings}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                {t('accessibility.resetToDefault')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Panel animations - RTL support */}
      <style jsx global>{`
        .a11y-panel-slide-in {
          animation: slideIn 0.3s ease-out forwards;
        }

        .a11y-panel-slide-out {
          animation: slideOut 0.3s ease-in forwards;
        }

        @keyframes slideIn {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slideOut {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(100%);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
