import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TutorProfile } from '@/api/entities';
import { TutorReview } from '@/api/entities';
import { Subject } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, MapPin, BookOpen, Clock, MessageCircle, ArrowLeft } from 'lucide-react';
import { useTheme } from '../components/ui/theme-provider';
import EmptyState from '../components/ui/empty-state';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { createPageUrl } from '@/utils';

const translations = {
  he: {
    tutorProfile: "פרופיל מורה",
    aboutMe: "על עצמי",
    subjects: "מקצועות לימוד",
    reviews: "ביקורות",
    noReviews: "אין ביקורות עדיין",
    beFirstToReview: "היה הראשון להשאיר ביקורת!",
    bookLesson: "הזמן שיעור",
    sendMessage: "שלח הודעה",
    hourlyRate: "₪{rate} לשעה",
    lessonsTaught: "שיעורים שהועברו",
    memberSince: "חבר מאז",
    responseTime: "זמן תגובה ממוצע",
    hours: "שעות",
    backToList: "חזור לרשימה"
  },
  en: {
    tutorProfile: "Tutor Profile",
    aboutMe: "About Me",
    subjects: "Subjects Taught",
    reviews: "Reviews",
    noReviews: "No reviews yet",
    beFirstToReview: "Be the first to leave a review!",
    bookLesson: "Book Lesson",
    sendMessage: "Send Message",
    hourlyRate: "₪{rate} per hour",
    lessonsTaught: "Lessons Taught",
    memberSince: "Member Since",
    responseTime: "Average Response Time",
    hours: "hours",
    backToList: "Back to List"
  }
};

export default function TutorProfilePage() {
  const { tutorProfileId } = useParams();
  const [tutor, setTutor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { themeClasses, language } = useTheme();
  const t = translations[language];

  useEffect(() => {
    loadProfileData();
  }, [tutorProfileId]);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      const [tutorData, reviewsData, subjectsData] = await Promise.all([
        TutorProfile.get(tutorProfileId),
        TutorReview.filter({ tutor_profile_id: tutorProfileId }),
        Subject.list()
      ]);

      const tutorUser = await User.get(tutorData.user_id);
      setTutor({ ...tutorData, user: tutorUser });
      setReviews(reviewsData);
      setAllSubjects(subjectsData);
    } catch (error) {
      console.error("Error loading tutor profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSubjectName = (subjectId) => {
    return allSubjects.find(s => s.id === subjectId)?.name || 'Subject';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!tutor) {
    return <EmptyState type="noResults" title="Tutor not found" language={language} />;
  }

  const tutorSubjects = tutor.subjects_taught.map(id => getSubjectName(id));

  return (
    <div className={`min-h-screen ${themeClasses.background} p-4 md:p-8`}>
      <div className="max-w-4xl mx-auto">
        <Link to={createPageUrl("PrivateLessons")} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4">
          <ArrowLeft className="w-4 h-4" />
          {t.backToList}
        </Link>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="md:col-span-1 space-y-6">
            <Card className={themeClasses.cardGlass}>
              <CardContent className="p-6 text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-purple-500/50">
                  <AvatarFallback className="text-4xl bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                    {tutor.user.full_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold text-white">{tutor.user.full_name}</h2>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-semibold text-yellow-400">{tutor.rating_avg.toFixed(1)}</span>
                  <span className="text-sm text-gray-400">({tutor.reviews_count} {t.reviews})</span>
                </div>
                <Badge className="mt-4 text-emerald-300 bg-emerald-500/20 border-emerald-500/30">
                  {t.hourlyRate.replace('{rate}', tutor.hourly_rate)}
                </Badge>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">{t.bookLesson}</Button>
              <Button variant="outline" className="w-full">{t.sendMessage}</Button>
            </div>

            <Card className={themeClasses.cardGlass}>
              <CardContent className="p-4 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">{t.lessonsTaught}</span>
                  <span className="font-semibold text-white">{tutor.completed_lessons || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{t.memberSince}</span>
                  <span className="font-semibold text-white">{format(new Date(tutor.created_date), 'MMM yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{t.responseTime}</span>
                  <span className="font-semibold text-white">{tutor.response_time || 24} {t.hours}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            <Card className={themeClasses.cardGlass}>
              <CardHeader>
                <CardTitle>{t.aboutMe}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 whitespace-pre-line">{tutor.description}</p>
              </CardContent>
            </Card>

            <Card className={themeClasses.cardGlass}>
              <CardHeader>
                <CardTitle>{t.subjects}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {tutorSubjects.map(subject => (
                  <Badge key={subject} variant="secondary">{subject}</Badge>
                ))}
              </CardContent>
            </Card>
            
            <Card className={themeClasses.cardGlass}>
              <CardHeader>
                <CardTitle>{t.reviews}</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map(review => (
                      <div key={review.id} className="flex gap-4">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>{review.reviewer_user_id?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-white">{review.reviewer_user_id}</h4>
                            <span className="text-xs text-gray-400">{format(new Date(review.created_date), 'PP')}</span>
                          </div>
                          <div className="flex items-center gap-1 my-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
                            ))}
                          </div>
                          <p className="text-gray-300">{review.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState type="noData" title={t.noReviews} description={t.beFirstToReview} language={language} />
                )}
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}