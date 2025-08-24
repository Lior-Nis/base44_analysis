
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Star, MessageSquare, MapPin, Verified } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useTheme } from '../ui/theme-provider';
import { motion } from 'framer-motion';

const translations = {
  he: {
    specializesIn: "מתמחה ב",
    hour: "שעה",
    viewProfile: "צפה בפרופיל",
    sendMessage: "שלח הודעה",
    online: "מקוון",
    inPerson: "פנים אל פנים",
    distance: "ק״מ ממך",
    available: "זמין",
    verified: "מאומת"
  },
  en: {
    specializesIn: "Specializes in",
    hour: "hour",
    viewProfile: "View Profile",
    sendMessage: "Send Message", 
    online: "Online",
    inPerson: "In Person",
    distance: "km from you",
    available: "Available",
    verified: "Verified"
  }
};

export default function TutorCard({ tutor, subjects, distance, userLocation, language = 'he', onSendMessage }) {
  const t = translations[language];
  const { themeClasses } = useTheme();

  const getSubjectNames = (subjectIds) => {
    if (!subjectIds || !subjects) return [];
    return subjectIds.slice(0, 2).map(id => {
      const subject = subjects.find(s => s.id === id);
      return subject ? subject.name : null;
    }).filter(Boolean);
  };

  const formatDistance = (dist) => {
    if (!dist) return null;
    return dist < 1 ? `${Math.round(dist * 1000)}מ` : `${dist.toFixed(1)} ${t.distance}`;
  };

  const subjectNames = getSubjectNames(tutor.subjects_taught);
  const distanceText = formatDistance(distance);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: "0px 10px 25px rgba(0,0,0,0.15)" }}
      className="h-full"
    >
      <Card className={`${themeClasses.cardGlass} h-full flex flex-col hover:shadow-2xl transition-all duration-300 group`}>
        <CardContent className="p-6 flex-grow">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <Avatar className="h-16 w-16 border-2 border-white/20">
                <AvatarImage src={tutor.user?.avatar_url} />
                <AvatarFallback className="text-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                  {tutor.user?.full_name?.[0]}
                </AvatarFallback>
              </Avatar>
              {/* Verification indicator */}
              {tutor.verification_status === 'verified' && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                  <Verified className="w-3 h-3 text-white" />
                </div>
              )}
              {/* Online status indicator */}
              {tutor.location?.online_available && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white">
                  <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className={`font-bold text-lg ${themeClasses.textPrimary}`}>
                {tutor.user?.full_name || 'מורה פרטי'}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.round(tutor.rating_avg || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className={`text-xs ${themeClasses.textMuted}`}>({tutor.rating_count || 0})</span>
              </div>
              {/* Distance - no personal info */}
              {distanceText && (
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">{distanceText}</span>
                </div>
              )}
            </div>
          </div>
          
          <p className={`text-sm mb-4 line-clamp-2 ${themeClasses.textSecondary}`}>
            {tutor.description || `${t.specializesIn} ${subjectNames.join(', ')}`}
          </p>

          {/* Subjects */}
          <div className="flex flex-wrap gap-2 mb-4">
            {subjectNames.map(name => (
              <Badge key={name} variant="secondary" className="bg-white/10 text-white/80 border-white/20 text-xs">
                {name}
              </Badge>
            ))}
          </div>

          {/* Teaching Options - no personal contact details */}
          <div className="flex flex-wrap gap-2 mb-4">
            {tutor.location?.online_available && (
              <Badge className="bg-green-100 text-green-800 text-xs">
                {t.online}
              </Badge>
            )}
            {tutor.location?.teaching_locations?.includes('student_home') && (
              <Badge className="bg-blue-100 text-blue-800 text-xs">
                {t.inPerson}
              </Badge>
            )}
            {tutor.verification_status === 'verified' && (
              <Badge className="bg-blue-100 text-blue-800 text-xs">
                <Verified className="w-3 h-3 mr-1" />
                {t.verified}
              </Badge>
            )}
          </div>
        </CardContent>
        
        {/* Footer with price and secure actions only */}
        <div className="border-t border-white/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-lg font-bold text-green-400">
              ₪{tutor.hourly_rate}<span className={`text-xs font-normal ${themeClasses.textMuted}`}>/{t.hour}</span>
            </div>
            <Link to={createPageUrl(`TutorProfilePage?tutorProfileId=${tutor.id}`)}>
              <Button size="sm" variant="outline" className={`${themeClasses.textPrimary} border-white/30 bg-white/10 hover:bg-white/20`}>
                {t.viewProfile}
              </Button>
            </Link>
          </div>
          
          {/* Only secure in-app communication */}
          <Button
            size="sm"
            onClick={() => onSendMessage(tutor)}
            className="w-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 hover:from-blue-500/30 hover:to-purple-500/30 border border-blue-400/30"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {t.sendMessage}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
