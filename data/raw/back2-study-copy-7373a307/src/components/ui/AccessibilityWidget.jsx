import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PersonStanding, ZoomIn, Contrast, Link as LinkIcon, StopCircle, Palette } from "lucide-react";

const translations = {
    he: {
        title: "נגישות",
        description: "התאם את האתר לצרכים שלך",
        increaseText: "הגדל טקסט",
        highContrast: "ניגודיות גבוהה",
        highlightLinks: "הדגש קישורים",
        readableFont: "גופן קריא",
        stopAnimations: "עצור אנימציות",
        reset: "איפוס"
    },
    en: {
        title: "Accessibility",
        description: "Customize the site for your needs",
        increaseText: "Increase Text Size",
        highContrast: "High Contrast",
        highlightLinks: "Highlight Links",
        readableFont: "Readable Font",
        stopAnimations: "Stop Animations",
        reset: "Reset"
    }
};

export default function AccessibilityWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [language, setLanguage] = useState('he');
    const [settings, setSettings] = useState({
        fontSize: 1,
        highContrast: false,
        highlightLinks: false,
        readableFont: false,
        stopAnimations: false,
    });

    // Load settings from localStorage
    useEffect(() => {
        const savedSettings = localStorage.getItem("accessibility-settings");
        if (savedSettings) {
            try {
                setSettings(JSON.parse(savedSettings));
            } catch (e) {
                console.warn("Failed to parse accessibility settings");
            }
        }
    }, []);

    // Apply settings changes to the document
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--font-size-multiplier', settings.fontSize);
        document.body.classList.toggle('accessibility-high-contrast', settings.highContrast);
        document.body.classList.toggle('accessibility-highlight-links', settings.highlightLinks);
        document.body.classList.toggle('accessibility-readable-font', settings.readableFont);
        document.body.classList.toggle('accessibility-stop-animations', settings.stopAnimations);
        localStorage.setItem("accessibility-settings", JSON.stringify(settings));
    }, [settings]);

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const resetSettings = () => {
        setSettings({
            fontSize: 1,
            highContrast: false,
            highlightLinks: false,
            readableFont: false,
            stopAnimations: false,
        });
    };

    const handleDragEnd = (event, info) => {
        localStorage.setItem("accessibility-widget-position", JSON.stringify({ x: info.point.x, y: info.point.y }));
    };

    return (
        <motion.div
            drag
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            initial={{ x: 50, y: 50 }} // מיקום התחלתי פשוט
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 999999, // z-index גבוה מאוד
                cursor: 'grab'
            }}
            whileDrag={{ 
                cursor: 'grabbing',
                scale: 1.1,
                zIndex: 9999999
            }}
        >
            <div style={{ position: 'relative' }}>
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                position: 'absolute',
                                bottom: '100%',
                                right: 0,
                                marginBottom: '12px',
                                width: '288px',
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(12px)',
                                borderRadius: '12px',
                                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                border: '1px solid rgba(0, 0, 0, 0.1)',
                                zIndex: 999999
                            }}
                        >
                            <div style={{ padding: '16px', borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
                                <h3 style={{ fontWeight: 'bold', fontSize: '18px', color: '#111827', margin: 0 }}>
                                    {translations[language].title}
                                </h3>
                                <p style={{ fontSize: '14px', color: '#6B7280', margin: '4px 0 0 0' }}>
                                    {translations[language].description}
                                </p>
                            </div>
                            
                            <div style={{ padding: '16px' }}>
                                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                                        <ZoomIn style={{ width: '16px', height: '16px' }} />
                                        <span>{translations[language].increaseText}</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="1" max="1.5" step="0.1"
                                        value={settings.fontSize}
                                        onChange={(e) => updateSetting("fontSize", parseFloat(e.target.value))}
                                        style={{ width: '80px' }}
                                    />
                                </div>
                                
                                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                                        <Contrast style={{ width: '16px', height: '16px' }} />
                                        <span>{translations[language].highContrast}</span>
                                    </label>
                                    <input
                                        type="checkbox"
                                        checked={settings.highContrast}
                                        onChange={(e) => updateSetting("highContrast", e.target.checked)}
                                    />
                                </div>
                                
                                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                                        <LinkIcon style={{ width: '16px', height: '16px' }} />
                                        <span>{translations[language].highlightLinks}</span>
                                    </label>
                                    <input
                                        type="checkbox"
                                        checked={settings.highlightLinks}
                                        onChange={(e) => updateSetting("highlightLinks", e.target.checked)}
                                    />
                                </div>
                                
                                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                                        <Palette style={{ width: '16px', height: '16px' }} />
                                        <span>{translations[language].readableFont}</span>
                                    </label>
                                    <input
                                        type="checkbox"
                                        checked={settings.readableFont}
                                        onChange={(e) => updateSetting("readableFont", e.target.checked)}
                                    />
                                </div>
                                
                                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                                        <StopCircle style={{ width: '16px', height: '16px' }} />
                                        <span>{translations[language].stopAnimations}</span>
                                    </label>
                                    <input
                                        type="checkbox"
                                        checked={settings.stopAnimations}
                                        onChange={(e) => updateSetting("stopAnimations", e.target.checked)}
                                    />
                                </div>
                            </div>
                            
                            <div style={{ padding: '16px', borderTop: '1px solid rgba(0, 0, 0, 0.1)', display: 'flex', justifyContent: 'space-between' }}>
                                <button 
                                    onClick={resetSettings}
                                    style={{ fontSize: '14px', color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    {translations[language].reset}
                                </button>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button 
                                        onClick={() => setLanguage('en')}
                                        style={{ 
                                            fontSize: '14px', 
                                            background: 'none', 
                                            border: 'none', 
                                            cursor: 'pointer',
                                            color: language === 'en' ? '#3B82F6' : '#6B7280',
                                            fontWeight: language === 'en' ? 'bold' : 'normal'
                                        }}
                                    >
                                        EN
                                    </button>
                                    <span style={{ color: '#D1D5DB' }}>|</span>
                                    <button 
                                        onClick={() => setLanguage('he')}
                                        style={{ 
                                            fontSize: '14px', 
                                            background: 'none', 
                                            border: 'none', 
                                            cursor: 'pointer',
                                            color: language === 'he' ? '#3B82F6' : '#6B7280',
                                            fontWeight: language === 'he' ? 'bold' : 'normal'
                                        }}
                                    >
                                        HE
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    onClick={() => setIsOpen(!isOpen)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        width: '56px',
                        height: '56px',
                        backgroundColor: '#3B82F6',
                        color: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#2563EB'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#3B82F6'}
                >
                    <PersonStanding style={{ width: '24px', height: '24px' }} />
                </motion.button>
            </div>
        </motion.div>
    );
}