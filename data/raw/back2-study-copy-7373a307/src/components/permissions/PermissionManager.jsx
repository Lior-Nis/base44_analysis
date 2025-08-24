import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  Camera, 
  Mic, 
  Bell, 
  FileText, 
  Users, 
  Phone, 
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../ui/theme-provider';

const translations = {
  he: {
    permissions: "הרשאות",
    subtitle: "נהל את הרשאות האפליקציה כדי לקבל חוויה מיטבית",
    location: "מיקום",
    locationDesc: "נדרש למציאת מורים קרובים ואירועי קמפוס",
    camera: "מצלמה",
    cameraDesc: "לצילום תמונות פרופיל ושיתוף חומרים",
    microphone: "מיקרופון",
    microphoneDesc: "לשיעורים מקוונים ושיחות קוליות",
    notifications: "התראות",
    notificationsDesc: "להתראות על הודעות, שיעורים ועדכונים",
    files: "קבצים",
    filesDesc: "לשיתוף וקריאת חומרי לימוד",
    contacts: "אנשי קשר",
    contactsDesc: "למציאת חברים באפליקציה",
    phone: "טלפון",
    phoneDesc: "לשיעורים בטלפון ואישורי זהות",
    storage: "אחסון מקומי",
    storageDesc: "לשמירת חומרים ועבודה במצב לא מקוון",
    granted: "מאושר",
    denied: "נדחה",
    notRequested: "לא נתבקש",
    pending: "ממתין",
    request: "בקש הרשאה",
    openSettings: "פתח הגדרות",
    essential: "הכרחי",
    recommended: "מומלץ",
    optional: "אופציונלי",
    whyNeeded: "למה זה נדרש?",
    privacyNote: "הפרטיות שלך חשובה לנו - נשתמש בהרשאות רק לשיפור החוויה שלך",
    updatePreferences: "עדכן העדפות"
  },
  en: {
    permissions: "Permissions",
    subtitle: "Manage app permissions for the best experience",
    location: "Location",
    locationDesc: "Required to find nearby tutors and campus events",
    camera: "Camera",
    cameraDesc: "For profile photos and sharing study materials",
    microphone: "Microphone",
    microphoneDesc: "For online lessons and voice calls",
    notifications: "Notifications",
    notificationsDesc: "For messages, lesson alerts and updates",
    files: "Files",
    filesDesc: "For sharing and reading study materials",
    contacts: "Contacts",
    contactsDesc: "To find friends on the app",
    phone: "Phone",
    phoneDesc: "For phone lessons and identity verification",
    storage: "Local Storage",
    storageDesc: "For saving materials and offline work",
    granted: "Granted",
    denied: "Denied",
    notRequested: "Not Requested",
    pending: "Pending",
    request: "Request Permission",
    openSettings: "Open Settings",
    essential: "Essential",
    recommended: "Recommended",
    optional: "Optional",
    whyNeeded: "Why is this needed?",
    privacyNote: "Your privacy matters to us - we only use permissions to improve your experience",
    updatePreferences: "Update Preferences"
  }
};

const PERMISSIONS_CONFIG = [
  {
    id: 'location',
    icon: MapPin,
    apiName: 'geolocation',
    priority: 'essential',
    color: 'text-blue-400'
  },
  {
    id: 'camera',
    icon: Camera,
    apiName: 'camera',
    priority: 'recommended',
    color: 'text-green-400'
  },
  {
    id: 'microphone',
    icon: Mic,
    apiName: 'microphone',
    priority: 'recommended',
    color: 'text-purple-400'
  },
  {
    id: 'notifications',
    icon: Bell,
    apiName: 'notifications',
    priority: 'essential',
    color: 'text-orange-400'
  },
  {
    id: 'storage',
    icon: FileText,
    apiName: 'persistent-storage',
    priority: 'optional',
    color: 'text-cyan-400'
  }
];

const PRIORITY_COLORS = {
  essential: 'bg-red-100 text-red-800 border-red-200',
  recommended: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  optional: 'bg-gray-100 text-gray-700 border-gray-200'
};

const STATUS_ICONS = {
  granted: { icon: CheckCircle, color: 'text-green-500' },
  denied: { icon: XCircle, color: 'text-red-500' },
  pending: { icon: AlertTriangle, color: 'text-yellow-500' },
  notRequested: { icon: Info, color: 'text-gray-400' }
};

export default function PermissionManager({ language = 'he', onPermissionChange }) {
  const [permissions, setPermissions] = useState({});
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { themeClasses } = useTheme();
  const t = translations[language];

  useEffect(() => {
    loadUserAndPermissions();
  }, []);

  const loadUserAndPermissions = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      await checkAllPermissions();
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAllPermissions = async () => {
    const permissionStates = {};
    
    for (const permission of PERMISSIONS_CONFIG) {
      const status = await checkPermissionStatus(permission.apiName);
      permissionStates[permission.id] = status;
    }
    
    setPermissions(permissionStates);
  };

  const checkPermissionStatus = async (apiName) => {
    try {
      if (!navigator.permissions) {
        return 'notRequested';
      }

      // Special handling for different permission types
      switch (apiName) {
        case 'geolocation':
          if (!navigator.geolocation) return 'denied';
          break;
        case 'camera':
        case 'microphone':
          const mediaPermissions = await navigator.permissions.query({ name: apiName });
          return mediaPermissions.state;
        case 'notifications':
          if ('Notification' in window) {
            const permission = Notification.permission;
            if (permission === 'default') return 'notRequested';
            return permission === 'granted' ? 'granted' : 'denied';
          }
          return 'denied';
        case 'persistent-storage':
          if ('storage' in navigator && 'persist' in navigator.storage) {
            const isPersistent = await navigator.storage.persist();
            return isPersistent ? 'granted' : 'notRequested';
          }
          return 'notRequested';
        default:
          const result = await navigator.permissions.query({ name: apiName });
          return result.state;
      }
    } catch (error) {
      console.warn(`Permission check failed for ${apiName}:`, error);
      return 'notRequested';
    }
  };

  const requestPermission = async (permissionId) => {
    const config = PERMISSIONS_CONFIG.find(p => p.id === permissionId);
    if (!config) return;

    setPermissions(prev => ({ ...prev, [permissionId]: 'pending' }));

    try {
      let granted = false;

      switch (config.apiName) {
        case 'geolocation':
          navigator.geolocation.getCurrentPosition(
            () => {
              setPermissions(prev => ({ ...prev, [permissionId]: 'granted' }));
              if (onPermissionChange) onPermissionChange(permissionId, 'granted');
            },
            () => {
              setPermissions(prev => ({ ...prev, [permissionId]: 'denied' }));
              if (onPermissionChange) onPermissionChange(permissionId, 'denied');
            }
          );
          return;

        case 'camera':
        case 'microphone':
          try {
            const constraints = config.apiName === 'camera' 
              ? { video: true } 
              : { audio: true };
            
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            stream.getTracks().forEach(track => track.stop());
            granted = true;
          } catch (error) {
            granted = false;
          }
          break;

        case 'notifications':
          if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            granted = permission === 'granted';
          }
          break;

        case 'persistent-storage':
          if ('storage' in navigator && 'persist' in navigator.storage) {
            granted = await navigator.storage.persist();
          }
          break;
      }

      const newStatus = granted ? 'granted' : 'denied';
      setPermissions(prev => ({ ...prev, [permissionId]: newStatus }));
      if (onPermissionChange) onPermissionChange(permissionId, newStatus);

      // Update user preferences
      if (user) {
        const updatedPermissions = { ...user.permissions || {}, [permissionId]: granted };
        await User.updateMyUserData({ permissions: updatedPermissions });
      }

    } catch (error) {
      console.error(`Permission request failed for ${permissionId}:`, error);
      setPermissions(prev => ({ ...prev, [permissionId]: 'denied' }));
      if (onPermissionChange) onPermissionChange(permissionId, 'denied');
    }
  };

  const openSystemSettings = () => {
    // Guide user to system settings
    const userAgent = navigator.userAgent;
    let message = '';
    
    if (/iPhone|iPad|iPod/.test(userAgent)) {
      message = language === 'he' 
        ? 'לך להגדרות > פרטיות וביטחון > מיקום > Back2study'
        : 'Go to Settings > Privacy & Security > Location > Back2study';
    } else if (/Android/.test(userAgent)) {
      message = language === 'he'
        ? 'לך להגדרות > אפליקציות > Back2study > הרשאות'
        : 'Go to Settings > Apps > Back2study > Permissions';
    } else {
      message = language === 'he'
        ? 'לך להגדרות הדפדפן ובחר להרשות גישה לאתר זה'
        : 'Go to browser settings and allow access for this site';
    }
    
    alert(message);
  };

  if (isLoading) {
    return (
      <Card className={themeClasses.cardGlass}>
        <CardContent className="p-8 text-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className={themeClasses.cardGlass}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <CardTitle className={`text-xl font-bold ${themeClasses.textPrimary}`}>
                {t.permissions}
              </CardTitle>
              <p className={`text-sm ${themeClasses.textMuted} mt-1`}>
                {t.subtitle}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Privacy Note */}
          <Alert className="bg-blue-500/10 border-blue-500/20">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-100 text-sm">
              {t.privacyNote}
            </AlertDescription>
          </Alert>

          {/* Permissions List */}
          <div className="space-y-4">
            {PERMISSIONS_CONFIG.map((permission, index) => {
              const status = permissions[permission.id] || 'notRequested';
              const StatusIcon = STATUS_ICONS[status]?.icon || Info;
              const isEssential = permission.priority === 'essential';
              
              return (
                <motion.div
                  key={permission.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    status === 'granted' 
                      ? 'bg-green-500/10 border-green-500/20' 
                      : isEssential && status === 'denied'
                      ? 'bg-red-500/10 border-red-500/20'
                      : 'bg-white/5 border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/20`}>
                        <permission.icon className={`w-5 h-5 ${permission.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold ${themeClasses.textPrimary}`}>
                            {t[permission.id]}
                          </h3>
                          <Badge className={`text-xs ${PRIORITY_COLORS[permission.priority]}`}>
                            {t[permission.priority]}
                          </Badge>
                        </div>
                        <p className={`text-sm ${themeClasses.textMuted} mb-2`}>
                          {t[permission.id + 'Desc']}
                        </p>
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-4 h-4 ${STATUS_ICONS[status]?.color}`} />
                          <span className={`text-xs font-medium ${STATUS_ICONS[status]?.color}`}>
                            {t[status]}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      {status === 'notRequested' && (
                        <Button
                          onClick={() => requestPermission(permission.id)}
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          {t.request}
                        </Button>
                      )}
                      {status === 'denied' && (
                        <Button
                          onClick={openSystemSettings}
                          size="sm"
                          variant="outline"
                          className="text-white border-white/20"
                        >
                          {t.openSettings}
                        </Button>
                      )}
                      {status === 'pending' && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full"
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}