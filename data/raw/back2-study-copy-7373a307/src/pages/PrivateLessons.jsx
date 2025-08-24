
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { TutorProfile } from "@/api/entities";
import { Subject } from "@/api/entities";
import { LessonBooking } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  MapPin,
  Star,
  Clock,
  Filter,
  Map,
  List,
  BookOpen,
  MessageCircle,
  Calendar,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import EnhancedTutorCard from "../components/tutors/EnhancedTutorCard";
import TutorMapView from "../components/tutors/TutorMapView";
import LessonBookingForm from "../components/tutors/LessonBookingForm";
import TutorReviewForm from "../components/tutors/TutorReviewForm";
import EmptyState from "../components/ui/empty-state";
import { useTheme } from "../components/ui/theme-provider";
import { format, isFuture, isPast } from "date-fns";
import { he } from "date-fns/locale";

const translations = {
  he: {
    privateLessons: "שיעורים פרטיים",
    findTutor: "מצא מורה",
    myBookings: "ההזמנות שלי",
    becomeTutor: "הפוך למורה",
    searchPlaceholder: "חפש מורה או מקצוע...",
    allSubjects: "כל המקצועות",
    allLocations: "כל המיקומים",
    sortBy: "מיון לפי",
    rating: "דירוג",
    price: "מחיר",
    distance: "מרחק",
    availability: "זמינות",
    mapView: "תצוגת מפה",
    listView: "תצוגת רשימה",
    filters: "מסננים",
    clearFilters: "נקה מסננים",
    showingResults: "מציג {count} תוצאות",
    noTutorsFound: "לא נמצאו מורים",
    tryDifferentSearch: "נסה חיפוש אחר או שנה את המסננים",
    bookLesson: "הזמן שיעור",
    viewProfile: "צפה בפרופיל",
    online: "מקוון",
    inPerson: "פנים אל פנים",
    both: "שניהם",
    hourly: "שעתי",
    verified: "מאומת",
    newTutor: "מורה חדש",
    topRated: "מדורג גבוה",
    upcoming: "שיעורים קרובים",
    completed: "שיעורים שהושלמו",
    cancelled: "שיעורים מבוטלים",
    noBookings: "אין לך הזמנות עדיין",
    findTutorToStart: "מצא מורה כדי להתחיל ללמוד!",
    leaveReview: "השאר ביקורת",
    reviewSubmitted: "ביקורת נשלחה",
    cancelLesson: "בטל שיעור",
    viewDetails: "פרטים נוספים"
  },
  en: {
    privateLessons: "Private Lessons",
    findTutor: "Find Tutor",
    myBookings: "My Bookings",
    becomeTutor: "Become a Tutor",
    searchPlaceholder: "Search tutor or subject...",
    allSubjects: "All Subjects",
    allLocations: "All Locations",
    sortBy: "Sort by",
    rating: "Rating",
    price: "Price",
    distance: "Distance",
    availability: "Availability",
    mapView: "Map View",
    listView: "List View",
    filters: "Filters",
    clearFilters: "Clear Filters",
    showingResults: "Showing {count} results",
    noTutorsFound: "No tutors found",
    tryDifferentSearch: "Try a different search or change your filters",
    bookLesson: "Book Lesson",
    viewProfile: "View Profile",
    online: "Online",
    inPerson: "In Person",
    both: "Both",
    hourly: "Hourly",
    verified: "Verified",
    newTutor: "New Tutor",
    topRated: "Top Rated",
    upcoming: "Upcoming",
    completed: "Completed",
    cancelled: "Cancelled",
    noBookings: "You have no bookings yet",
    findTutorToStart: "Find a tutor to start learning!",
    leaveReview: "Leave Review",
    reviewSubmitted: "Review Submitted",
    cancelLesson: "Cancel Lesson",
    viewDetails: "View Details"
  }
};

export default function PrivateLessons() {
  const [user, setUser] = useState(null);
  const [tutors, setTutors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [bookings, setBookings] = useState([]); // New state for bookings
  const [filteredTutors, setFilteredTutors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('find');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [sortBy, setSortBy] = useState('rating');
  const [teachingMethod, setTeachingMethod] = useState('');

  // Booking state
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false); // New state for review form
  const [bookingToReview, setBookingToReview] = useState(null); // New state

  const { themeClasses, language } = useTheme();
  const t = translations[language || 'en'];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAndSortTutors();
  }, [tutors, searchTerm, selectedSubject, priceRange, sortBy, teachingMethod]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const userData = await User.me();
      setUser(userData);

      const [tutorsData, subjectsData, bookingsData] = await Promise.all([
        TutorProfile.list('-created_date', 100),
        Subject.list(),
        LessonBooking.filter({ student_id: userData.id }, '-lesson_date')
      ]);

      // Enrich tutors with user data
      const enrichedTutors = await Promise.all(
        tutorsData.map(async (tutor) => {
          try {
            const tutorUser = await User.get(tutor.user_id);
            return { ...tutor, user: tutorUser };
          } catch (error) {
            console.warn(`Failed to load user data for tutor ${tutor.id}:`, error);
            return tutor;
          }
        })
      );
      setTutors(enrichedTutors);

      // Enrich bookings with full tutor profiles (including user data) and subjects
      const enrichedBookings = bookingsData.map(booking => {
        const fullTutorProfile = enrichedTutors.find(t => t.id === booking.tutor_profile_id);
        const subject = subjectsData.find(s => s.id === booking.subject_id);
        return {
          ...booking,
          tutor_profile: fullTutorProfile,
          subject: subject
        };
      });
      setBookings(enrichedBookings);
      setSubjects(subjectsData);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortTutors = () => {
    let filtered = [...tutors];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(tutor =>
        tutor.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.subjects_taught?.some(subjectId => {
          const subject = subjects.find(s => s.id === subjectId);
          return subject?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        }) ||
        tutor.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Subject filter
    if (selectedSubject) {
      filtered = filtered.filter(tutor =>
        tutor.subjects_taught?.includes(selectedSubject)
      );
    }

    // Price filter
    filtered = filtered.filter(tutor =>
      tutor.hourly_rate >= priceRange[0] && tutor.hourly_rate <= priceRange[1]
    );

    // Teaching method filter
    if (teachingMethod) {
      filtered = filtered.filter(tutor =>
        tutor.teaching_methods?.includes(teachingMethod)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating_avg || 0) - (a.rating_avg || 0);
        case 'price_low':
          return a.hourly_rate - b.hourly_rate;
        case 'price_high':
          return b.hourly_rate - a.hourly_rate;
        case 'experience':
          return (b.completed_lessons || 0) - (a.completed_lessons || 0);
        default:
          return 0;
      }
    });

    setFilteredTutors(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSubject('');
    setPriceRange([0, 500]);
    setSortBy('rating');
    setTeachingMethod('');
  };

  const handleBooking = (tutor) => {
    setSelectedTutor(tutor);
    setShowBookingForm(true);
  };

  const handleLeaveReview = (booking) => {
    setBookingToReview(booking);
    setShowReviewForm(true);
  };

  const renderMyBookings = () => {
    const upcomingBookings = bookings.filter(b => isFuture(new Date(b.lesson_date)) && b.status === 'confirmed');
    const completedBookings = bookings.filter(b => isPast(new Date(b.lesson_date)) && b.status === 'completed');
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

    return (
      <Tabs defaultValue="upcoming">
        <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-xl border border-white/20">
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-white/20">{t.upcoming}</TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-white/20">{t.completed}</TabsTrigger>
          <TabsTrigger value="cancelled" className="data-[state=active]:bg-white/20">{t.cancelled}</TabsTrigger>
        </TabsList>
        <AnimatePresence mode="wait">
          <TabsContent value="upcoming">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 mt-4">
              {upcomingBookings.length === 0 ? (
                <EmptyState type="noData" title={t.noBookings} description={t.findTutorToStart} language={language} />
              ) : (
                upcomingBookings.map(booking => <BookingCard key={booking.id} booking={booking} language={language} />)
              )}
            </motion.div>
          </TabsContent>
          <TabsContent value="completed">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 mt-4">
              {completedBookings.length === 0 ? (
                <EmptyState type="noData" title={t.noBookings} description={t.findTutorToStart} language={language} />
              ) : (
                completedBookings.map(booking => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    language={language}
                    onLeaveReview={handleLeaveReview}
                  />
                ))
              )}
            </motion.div>
          </TabsContent>
          <TabsContent value="cancelled">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 mt-4">
              {cancelledBookings.length === 0 ? (
                <EmptyState type="noData" title={t.noBookings} language={language} />
              ) : (
                cancelledBookings.map(booking => <BookingCard key={booking.id} booking={booking} language={language} />)
              )}
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    );
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeClasses.background} p-4 md:p-8`}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/20">
              <BookOpen className="w-7 h-7 text-purple-400" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t.privateLessons}
            </h1>
          </div>
          <p className={`${themeClasses.textSecondary} text-lg`}>
            {language === 'he' ? 'מצא את המורה המושלם עבורך' : 'Find the perfect tutor for you'}
          </p>
        </motion.div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-white/10 backdrop-blur-xl border border-white/20">
            <TabsTrigger value="find" className="data-[state=active]:bg-white/20">
              <Search className="w-4 h-4 mr-2" />
              {t.findTutor}
            </TabsTrigger>
            <TabsTrigger value="bookings" className="data-[state=active]:bg-white/20">
              <Calendar className="w-4 h-4 mr-2" />
              {t.myBookings}
            </TabsTrigger>
            <TabsTrigger value="become" className="data-[state=active]:bg-white/20">
              <Star className="w-4 h-4 mr-2" />
              {t.becomeTutor}
            </TabsTrigger>
          </TabsList>

          {/* Find Tutor Tab */}
          <TabsContent value="find" className="space-y-6">

            {/* Search and Filters */}
            <Card className={themeClasses.cardGlass}>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">

                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                    <Input
                      placeholder={t.searchPlaceholder}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                  </div>

                  {/* Subject Filter */}
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder={t.allSubjects} />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value={null}>{t.allSubjects}</SelectItem>
                      {subjects.map(subject => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Teaching Method Filter */}
                  <Select value={teachingMethod} onValueChange={setTeachingMethod}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder={t.allLocations} />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value={null}>{t.allLocations}</SelectItem>
                      <SelectItem value="online">{t.online}</SelectItem>
                      <SelectItem value="in_person">{t.inPerson}</SelectItem>
                      <SelectItem value="hybrid">{t.both}</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Sort Filter */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder={t.sortBy} />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="rating">{t.rating}</SelectItem>
                      <SelectItem value="price_low">{t.price} (נמוך-גבוה)</SelectItem>
                      <SelectItem value="price_high">{t.price} (גבוה-נמוך)</SelectItem>
                      <SelectItem value="experience">ניסיון</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <span className={`text-sm ${themeClasses.textMuted}`}>
                      {t.showingResults.replace('{count}', filteredTutors.length)}
                    </span>
                    {(searchTerm || selectedSubject || teachingMethod) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-purple-300 hover:text-purple-200"
                      >
                        {t.clearFilters}
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="text-white"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'map' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('map')}
                      className="text-white"
                    >
                      <Map className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            {viewMode === 'list' ? (
              <div className="space-y-6">
                {filteredTutors.length === 0 ? (
                  <EmptyState
                    type="noResults"
                    title={t.noTutorsFound}
                    description={t.tryDifferentSearch}
                    language={language || 'en'}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                      {filteredTutors.map((tutor, index) => (
                        <motion.div
                          key={tutor.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <EnhancedTutorCard
                            tutor={tutor}
                            subjects={subjects}
                            onBook={() => handleBooking(tutor)}
                            language={language || 'en'}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            ) : (
              <TutorMapView tutors={filteredTutors} onTutorSelect={handleBooking} language={language || 'en'} />
            )}
          </TabsContent>

          {/* My Bookings Tab */}
          <TabsContent value="bookings">
            <Card className={themeClasses.cardGlass}>
              <CardContent className="p-4">
                {renderMyBookings()}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Become a Tutor Tab */}
          <TabsContent value="become">
            <Card className={themeClasses.cardGlass}>
              <CardContent className="p-8 text-center">
                <div className="max-w-md mx-auto">
                  <Star className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {language === 'he' ? 'הפוך למורה במערכת' : 'Become a Tutor'}
                  </h3>
                  <p className="text-white/70 mb-6">
                    {language === 'he'
                      ? 'שתף את הידע שלך ועזור לתלמידים להצליח. הצטרף לקהילת המורים שלנו והתחל להרוויח'
                      : 'Share your knowledge and help students succeed. Join our community of tutors and start earning'
                    }
                  </p>
                  <Link to={createPageUrl("TutorProfileSetup")}>
                    <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white">
                      {language === 'he' ? 'התחל עכשיו' : 'Get Started'}
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && selectedTutor && (
        <LessonBookingForm
          tutor={selectedTutor}
          subjects={subjects}
          onClose={() => {
            setShowBookingForm(false);
            setSelectedTutor(null);
          }}
          onBookingCreated={loadData} // Refresh data after booking
          language={language || 'en'}
        />
      )}

      {/* Review Form Modal */}
      {showReviewForm && bookingToReview && (
        <TutorReviewForm
          booking={bookingToReview}
          onClose={() => {
            setShowReviewForm(false);
            setBookingToReview(null);
          }}
          onReviewSubmitted={loadData} // Refresh data after review
          language={language || 'en'}
        />
      )}
    </div>
  );
}

const BookingCard = ({ booking, language, onLeaveReview }) => {
  const t = translations[language];
  const { themeClasses } = useTheme();
  const tutor = booking.tutor_profile;

  // Function to determine badge style based on status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed': return <Badge variant="default" className="bg-blue-500">{language === 'he' ? 'אושר' : 'Confirmed'}</Badge>;
      case 'completed': return <Badge variant="default" className="bg-green-500">{language === 'he' ? 'הושלם' : 'Completed'}</Badge>;
      case 'cancelled': return <Badge variant="destructive">{language === 'he' ? 'בוטל' : 'Cancelled'}</Badge>;
      case 'pending': return <Badge variant="secondary">{language === 'he' ? 'ממתין' : 'Pending'}</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card className={`${themeClasses.cardGlass} p-4`}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex-1">
          <h4 className="font-semibold text-lg text-white">{tutor?.user?.full_name || 'מורה לא ידוע'}</h4>
          <p className="text-sm text-white/70">{booking.subject?.name || (language === 'he' ? 'מקצוע לא ידוע' : 'Unknown Subject')}</p>
          <p className="text-sm text-white/70">
            {format(new Date(booking.lesson_date), 'PPP p', { locale: language === 'he' ? he : undefined })}
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-end md:items-center gap-2 mt-2 md:mt-0">
          {getStatusBadge(booking.status)}
          {booking.status === 'completed' && !booking.student_review_id && onLeaveReview && (
            <Button onClick={() => onLeaveReview(booking)} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
              <Star className="w-4 h-4 mr-1" />
              {t.leaveReview}
            </Button>
          )}
          {booking.status === 'completed' && booking.student_review_id && (
            <Badge variant="secondary" className="bg-gray-700 text-white/80">{t.reviewSubmitted}</Badge>
          )}
          {booking.status === 'confirmed' && isFuture(new Date(booking.lesson_date)) && (
            // Implement cancel lesson logic later
            <Button variant="destructive" size="sm" disabled>
              {t.cancelLesson}
            </Button>
          )}
          <Button variant="outline" size="sm" className="text-white border-white/30 hover:bg-white/10" disabled>
            {t.viewDetails}
          </Button>
        </div>
      </div>
    </Card>
  );
};
