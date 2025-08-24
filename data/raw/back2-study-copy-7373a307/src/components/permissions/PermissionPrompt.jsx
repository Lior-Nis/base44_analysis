import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, MapPin, Camera, Mic, Bell, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../ui/theme-provider';

const translations = {
  he: {
    permissionRequired: "נדרשת הרשאה",
    allow: "אשר",
    deny: "דחה",
    later: "אחר כך",
    whyNeeded: "למה זה נדרש?",
    location: {
      title: "גישה למיקום",
      description: "כדי למצוא מורים ואירועים קרובים אליך",
      reason: "נשתמש במיקום שלך רק כדי להציג לך מורים ואירועי לימוד בקרבתך. המיקום לא יישמר או יישלח לצדדים שלישיים."
    },
    camera: {
      title: "גישה למצלמה", 
      description: "לצילום תמונת פרופיל ושיתוף חומרי לימוד",
      reason: "המצלמה תשמש רק כשתבחר לצלם תמונת פרופיל או לשתף תמונות של חומרי לימוד. לא נצלם אותך בלי אישורך."
    },
    microphone: {
      title: "גישה למיקרופון",
      description: "לשיעורים מקוונים ושיחות קול עם מורים",
      reason: "המיקרופון יופעל רק במהלך שיעורים או שיחות שאתה מתחיל. לא נקליט אותך בלי אישורך המפורש."
    },
    notifications: {
      title: "התראות",
      description: "לעדכונים על הודעות חדשות ושיעורים מתקרבים",
      reason: "נשלח לך התראות רק על דברים חשובים כמו הודעות ממורים, תזכורות לשיעורים ועדכוני מערכת."
    }
  },
  en: {
    permissionRequired: "Permission Required",
    allow: "Allow",
    deny: "Deny", 
    later: "Later",
    whyNeeded: "Why is this needed?",
    location: {
      title: "Location Access",
      description: "To find tutors and events near you",
      reason: "We'll only use your location to show you nearby tutors and study events. Your location is not stored or shared with third parties."
    },
    camera: {
      title: "Camera Access",
      description: "For profile photos and sharing study materials", 
      reason: "Camera will only be used when you choose to take a profile photo or share study material images. We won't take photos without your permission."
    },
    microphone: {
      title: "Microphone Access",
      description: "For online lessons and voice calls with tutors",
      reason: "Microphone will only activate during lessons or calls that you initiate. We won't record you without your explicit consent."
    },
    notifications: {
      title: "Notifications",
      description: "For updates about new messages and upcoming lessons",
      reason: "We'll only send notifications for important things like messages from tutors, lesson reminders, and system updates."
    }
  }
};

const PERMISSION_ICONS = {
  location: MapPin,
  camera: Camera,
  microphone: Mic,
  notifications: Bell
};

const PERMISSION_COLORS = {
  location: 'text-blue-400',
  camera: 'text-green-400', 
  microphone: 'text-purple-400',
  notifications: 'text-orange-400'
};

export default function PermissionPrompt({ 
  permissionType, 
  onAllow, 
  onDeny, 
  onLater, 
  language = 'he',
  isVisible = false 
}) {
  const [showReason, setShowReason] = useState(false);
  const { themeClasses } = useTheme();
  const t = translations[language];
  const permission = t[permissionType];
  const Icon = PERMISSION_ICONS[permissionType] || Shield;
  const iconColor = PERMISSION_COLORS[permissionType] || 'text-gray-400';

  if (!isVisible || !permission) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        onClick={(e) => e.target === e.currentTarget && onLater && onLater()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-md"
        >
          <Card className={`${themeClasses.cardGlass} border-white/20 shadow-2xl`}>
            <CardHeader className="relative">
              {onLater && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 text-white/60 hover:text-white w-8 h-8"
                  onClick={onLater}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
              
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-white/10 to-white/5 rounded-xl flex items-center justify-center border border-white/20">
                  <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                <div>
                  <CardTitle className={`text-lg font-bold ${themeClasses.textPrimary}`}>
                    {permission.title}
                  </CardTitle>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                    {t.permissionRequired}
                  </Badge>
                </div>
              </div>
              
              <p className={`text-sm ${themeClasses.textSecondary} leading-relaxed`}>
                {permission.description}
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              
              {/* Why needed section */}
              <div>
                <Button
                  variant="ghost"
                  className="text-blue-400 hover:text-blue-300 p-0 h-auto font-normal text-sm"
                  onClick={() => setShowReason(!showReason)}
                >
                  {t.whyNeeded}
                </Button>
                
                <AnimatePresence>
                  {showReason && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10"
                    >
                      <p className={`text-sm ${themeClasses.textMuted} leading-relaxed`}>
                        {permission.reason}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                {onDeny && (
                  <Button
                    variant="outline"
                    onClick={onDeny}
                    className="flex-1 text-white/70 border-white/20 hover:bg-white/10 hover:text-white"
                  >
                    {t.deny}
                  </Button>
                )}
                {onLater && (
                  <Button
                    variant="outline"
                    onClick={onLater}
                    className="flex-1 text-white/70 border-white/20 hover:bg-white/10 hover:text-white"
                  >
                    {t.later}
                  </Button>
                )}
                <Button
                  onClick={onAllow}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium"
                >
                  {t.allow}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}