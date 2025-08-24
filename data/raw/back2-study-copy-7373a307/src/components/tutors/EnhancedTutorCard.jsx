
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Star, 
  MapPin, 
  Clock, 
  BookOpen, 
  MessageCircle, 
  Shield,
  Monitor,
  Users,
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../ui/theme-provider';
import SafetyMenu from '../safety/SafetyMenu';

const translations = {
  he: {
    perHour: 'לשעה',
    hourlyRate: 'תעריף שעתי',
    rating: 'דירוג',
    reviews: 'ביקורות',
    experience: 'ניסיון',
    lessons: 'שיעורים',
    responseTime: 'זמן תגובה',
    hours: 'שעות',
    verified: 'מאומת',
    newTutor: 'מורה חדש',
    topRated: 'מדורג גבוה',
    bookLesson: 'הזמן שיעור',
    sendMessage: 'שלח הודעה',
    viewProfile: 'צפה בפרופיל',
    online: 'מקוון',
    inPerson: 'פנים אל פנים',
    hybrid: 'היברידי',
    subjects: 'מקצועות'
  },
  en: {
    perHour: 'per hour',
    hourlyRate: 'Hourly Rate',
    rating: 'Rating',
    reviews: 'Reviews',
    experience: 'Experience',
    lessons: 'lessons',
    responseTime: 'Response time',
    hours: 'hours',
    verified: 'Verified',
    newTutor: 'New Tutor',
    topRated: 'Top Rated',
    bookLesson: 'Book Lesson',
    sendMessage: 'Send Message',
    viewProfile: 'View Profile',
    online: 'Online',
    inPerson: 'In Person',
    hybrid: 'Hybrid',
    subjects: 'Subjects'
  }
};

export default function EnhancedTutorCard({ tutor, subjects, onBook, language = 'en' }) {
  const { themeClasses } = useTheme();
  const t = translations[language];

  const getTutorSubjects = () => {
    return tutor.subjects_taught?.map(subjectId => 
      subjects.find(s => s.id === subjectId)?.name || subjectId
    ).filter(Boolean) || [];
  };

  const getTeachingMethodIcon = (method) => {
    switch (method) {
      case 'online': return <Monitor className="w-3 h-3" />;
      case 'in_person': return <Users className="w-3 h-3" />;
      case 'hybrid': return <BookOpen className="w-3 h-3" />;
      default: return null;
    }
  };

  const getStatusBadge = () => {
    if (tutor.verification_status === 'verified') {
      return (
        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
          <Shield className="w-3 h-3 mr-1" />
          {t.verified}
        </Badge>
      );
    }
    if ((tutor.rating_avg || 0) >= 4.8 && (tutor.rating_count || 0) >= 10) {
      return (
        <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
          <Award className="w-3 h-3 mr-1" />
          {t.topRated}
        </Badge>
      );
    }
    if ((tutor.completed_lessons || 0) < 5) {
      return (
        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
          {t.newTutor}
        </Badge>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card className={`${themeClasses.cardGlass} overflow-hidden h-full flex flex-col transition-all duration-300 group-hover:scale-105 group-hover:shadow-purple-500/10`}>
        <CardHeader className="p-4 border-b border-white/10">
          <div className="flex justify-between items-start gap-3">
            <div className="flex items-start gap-3">
              <Avatar className="w-12 h-12 border-2 border-white/20">
                <AvatarImage src={tutor.user?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                  {tutor.user?.full_name?.[0] || 'T'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={`font-semibold truncate ${themeClasses.textPrimary}`}>
                      {tutor.user?.full_name || 'מורה'}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {tutor.rating_avg > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-400 fill-current" />
                          <span className="text-sm text-yellow-400 font-medium">
                            {tutor.rating_avg.toFixed(1)}
                          </span>
                          <span className={`text-xs ${themeClasses.textMuted}`}>
                            ({tutor.rating_count || 0})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-emerald-400">
                      ₪{tutor.hourly_rate}
                    </div>
                    <div className={`text-xs ${themeClasses.textMuted}`}>
                      {t.perHour}
                    </div>
                  </div>
                </div>
                
                {getStatusBadge() && (
                  <div className="mt-2">
                    {getStatusBadge()}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/10 ${themeClasses.cardSolid}`}>
                <BookOpen className="w-6 h-6 text-purple-400"/>
              </div>
              <SafetyMenu
                targetUser={tutor.user}
                context="tutor_lesson"
                relatedId={tutor.id}
                language={language}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 flex-grow flex flex-col">
          
          {/* Description */}
          <p className={`text-sm mb-4 line-clamp-2 flex-grow ${themeClasses.textSecondary}`}>
            {tutor.description || (language === 'he' ? 'מורה מנוסה ומסור' : 'Experienced and dedicated tutor')}
          </p>

          {/* Subjects */}
          <div className="mb-4">
            <div className={`text-xs font-medium mb-2 ${themeClasses.textMuted}`}>
              {t.subjects}:
            </div>
            <div className="flex flex-wrap gap-1">
              {getTutorSubjects().slice(0, 3).map((subject, index) => (
                <Badge key={index} variant="outline" className="text-xs border-white/20 text-white/70">
                  {subject}
                </Badge>
              ))}
              {getTutorSubjects().length > 3 && (
                <Badge variant="outline" className="text-xs border-white/20 text-white/70">
                  +{getTutorSubjects().length - 3}
                </Badge>
              )}
            </div>
          </div>

          {/* Teaching Methods */}
          <div className="mb-4">
            <div className="flex gap-2">
              {tutor.teaching_methods?.map((method, index) => (
                <div key={index} className="flex items-center gap-1 text-xs text-white/70">
                  {getTeachingMethodIcon(method)}
                  <span>{t[method]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
            <div className={`flex items-center gap-1 ${themeClasses.textMuted}`}>
              <BookOpen className="w-3 h-3" />
              <span>{tutor.completed_lessons || 0} {t.lessons}</span>
            </div>
            <div className={`flex items-center gap-1 ${themeClasses.textMuted}`}>
              <Clock className="w-3 h-3" />
              <span>{tutor.response_time || 24}{t.hours}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-auto">
            <Button
              onClick={() => onBook(tutor)}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm"
            >
              {t.bookLesson}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="border-white/20 text-white/70 hover:bg-white/10"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
