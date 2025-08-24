
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Subject } from '@/api/entities';
import { TutorProfile } from '@/api/entities';
import { TutorLocation } from '@/api/entities'; // New import
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useTheme } from '../components/ui/theme-provider';
import { Save, Sparkles, DollarSign, MapPin, Globe } from 'lucide-react'; // Added MapPin, Globe for icons

const translations = {
  he: {
    title: "הגדר פרופיל מורה",
    subtitle: "הצטרף לקהילת המורים שלנו ועזור לתלמידים להצליח!",
    subjects: "מקצועות לימוד",
    subjectsDesc: "בחר את המקצועות שאתה רוצה ללמד.",
    rate: "תעריף שעתי",
    rateDesc: "קבע את המחיר שלך לשיעור של שעה.",
    description: "ספר על עצמך",
    descriptionDesc: "שתף את הגישה שלך, הניסיון והמומחיות שלך.",
    saveProfile: "שמור פרופיל",
    saving: "שומר...",
    profileSaved: "הפרופיל נשמר בהצלחה!",
    alreadyTutor: "כבר יש לך פרופיל מורה פעיל.",
    locationTitle: "מיקום ושיטות לימוד",
    locationDesc: "הגדר את המיקום שלך ואת הדרכים שבהן תלמד.",
    address: "כתובת עיקרית",
    addressPlaceholder: "לדוגמה: רחוב הרצל 1, תל אביב",
    city: "עיר",
    cityPlaceholder: "לדוגמה: תל אביב",
    radius: "טווח נסיעה (ק\"מ)",
    radiusDesc: "המרחק המרבי שאתה מוכן לנסוע לתלמידים.",
    teachingMethods: "שיטות לימוד",
    teachingMethodsDesc: "בחר היכן תלמד.",
    teachAtStudentHome: "בבית התלמיד",
    teachOnline: "אונליין",
    teachAtTutorHome: "בביתי",
    willingToTravel: "מוכן לנסוע לתלמידים",
    willingToTravelDesc: "האם אתה מוכן לנסוע לבתיהם של תלמידים?",
    availableOnline: "זמין לשיעורים אונליין",
    availableOnlineDesc: "האם אתה זמין ללמד דרך האינטרנט?"
  },
  en: {
    title: "Setup Tutor Profile",
    subtitle: "Join our community of tutors and help students succeed!",
    subjects: "Subjects Taught",
    subjectsDesc: "Choose the subjects you want to teach.",
    rate: "Hourly Rate",
    rateDesc: "Set your price for a one-hour lesson.",
    description: "About You",
    descriptionDesc: "Share your approach, experience, and expertise.",
    saveProfile: "Save Profile",
    saving: "Saving...",
    profileSaved: "Profile saved successfully!",
    alreadyTutor: "You already have an active tutor profile.",
    locationTitle: "Location & Teaching Methods",
    locationDesc: "Define your primary location and how you teach.",
    address: "Primary Address",
    addressPlaceholder: "e.g., Herzl St 1, Tel Aviv",
    city: "City",
    cityPlaceholder: "e.g., Tel Aviv",
    radius: "Travel Radius (km)",
    radiusDesc: "The maximum distance you're willing to travel to students.",
    teachingMethods: "Teaching Methods",
    teachingMethodsDesc: "Choose where you are willing to teach.",
    teachAtStudentHome: "At Student's Home",
    teachOnline: "Online",
    teachAtTutorHome: "At My Home",
    willingToTravel: "Willing to Travel to Students",
    willingToTravelDesc: "Are you willing to travel to students' homes?",
    availableOnline: "Available for Online Lessons",
    availableOnlineDesc: "Are you available to teach via the internet?"
  }
};

export default function TutorProfileSetup() {
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [hourlyRate, setHourlyRate] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // New state for location data
  const [primaryLocationAddress, setPrimaryLocationAddress] = useState('');
  const [primaryLocationCity, setPrimaryLocationCity] = useState('');
  const [primaryLocationRadius, setPrimaryLocationRadius] = useState('');
  const [teachingLocations, setTeachingLocations] = useState([]); // e.g., ['online', 'student_home']
  const [travelWillingness, setTravelWillingness] = useState(false);
  const [onlineAvailable, setOnlineAvailable] = useState(false);
  const [existingLocationId, setExistingLocationId] = useState(null);

  const { language, themeClasses } = useTheme();
  const t = translations[language];
  const navigate = useNavigate();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [currentUser, allSubjects] = await Promise.all([
        User.me(),
        Subject.list()
      ]);
      setUser(currentUser);
      setSubjects(allSubjects);

      if (currentUser.is_tutor && currentUser.tutor_profile_id) {
        const existingProfile = await TutorProfile.get(currentUser.tutor_profile_id);
        setSelectedSubjects(existingProfile.subjects_taught);
        setHourlyRate(existingProfile.hourly_rate.toString());
        setDescription(existingProfile.description);

        // Load location data if exists
        try {
          const locationData = await TutorLocation.filter({ tutor_profile_id: existingProfile.id });
          if (locationData.length > 0) {
            const loc = locationData[0];
            setExistingLocationId(loc.id);
            setPrimaryLocationAddress(loc.primary_location?.address || '');
            setPrimaryLocationCity(loc.primary_location?.city || '');
            setPrimaryLocationRadius(loc.primary_location?.radius_km?.toString() || '');
            setTeachingLocations(loc.teaching_locations || []);
            setTravelWillingness(loc.travel_willingness || false);
            setOnlineAvailable(loc.online_available || false);
          }
        } catch (error) {
          console.error('Error fetching location data (might not exist yet):', error);
          // This might indicate no location data exists, which is fine for first time setup.
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleSubjectToggle = (subjectId) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleTeachingLocationToggle = (method) => {
    setTeachingLocations(prev =>
      prev.includes(method)
        ? prev.filter(m => m !== method)
        : [...prev, method]
    );
  };

  const handleSubmit = async () => {
    if (selectedSubjects.length === 0 || !hourlyRate || !primaryLocationAddress || !primaryLocationCity) {
      alert("אנא מלא את כל שדות החובה (כולל מקצועות, תעריף ופרטי מיקום).");
      return;
    }
    setIsSaving(true);
    try {
      const profileData = {
        user_id: user.id,
        subjects_taught: selectedSubjects,
        hourly_rate: parseFloat(hourlyRate),
        description: description,
        profile_status: 'active'
      };

      let tutorProfile;
      if (user.tutor_profile_id) {
        tutorProfile = await TutorProfile.update(user.tutor_profile_id, profileData);
      } else {
        tutorProfile = await TutorProfile.create(profileData);
        await User.updateMyUserData({ is_tutor: true, tutor_profile_id: tutorProfile.id });
      }

      // Create or update location data
      const locationData = {
        tutor_profile_id: tutorProfile.id,
        primary_location: {
          address: primaryLocationAddress,
          city: primaryLocationCity,
          coordinates: { lat: 32.0853, lng: 34.7818 }, // Default coordinates as per outline
          radius_km: parseFloat(primaryLocationRadius) || 0
        },
        teaching_locations: teachingLocations,
        travel_willingness: travelWillingness,
        online_available: onlineAvailable
      };

      try {
        if (existingLocationId) {
          await TutorLocation.update(existingLocationId, locationData);
        } else {
          await TutorLocation.create(locationData);
        }
      } catch (error) {
        console.error('Error saving location:', error);
        alert('שגיאה בשמירת פרטי מיקום. נסה שוב.'); // Notify user about location save error
      }

      alert(t.profileSaved);
      navigate(createPageUrl(`TutorProfilePage?tutorProfileId=${tutorProfile.id}`));

    } catch (error) {
      console.error("Error saving profile:", error);
      alert('שגיאה בשמירת פרופיל. נסה שוב.'); // Generic profile save error
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`min-h-screen ${themeClasses.background} p-4 md:p-8`}>
      <div className="max-w-3xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <Sparkles className="mx-auto h-12 w-12 mb-4 text-purple-400" />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">{t.title}</h1>
          <p className={`mt-4 text-lg ${themeClasses.textSecondary}`}>{t.subtitle}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className={themeClasses.cardGlass}>
            <CardHeader>
              <CardTitle className={themeClasses.textPrimary}>{t.subjects}</CardTitle>
              <p className={themeClasses.textMuted}>{t.subjectsDesc}</p>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {subjects.map(subject => (
                <div
                  key={subject.id}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={subject.id}
                    checked={selectedSubjects.includes(subject.id)}
                    onCheckedChange={() => handleSubjectToggle(subject.id)}
                  />
                  <label htmlFor={subject.id} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${themeClasses.textPrimary}`}>
                    {subject.name}
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className={themeClasses.cardGlass}>
            <CardHeader>
              <CardTitle className={themeClasses.textPrimary}>{t.rate}</CardTitle>
              <p className={themeClasses.textMuted}>{t.rateDesc}</p>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${themeClasses.textMuted}`} />
                <Input
                  type="number"
                  placeholder="90"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  className={`pl-10 bg-white/10 border-white/20 ${themeClasses.textPrimary}`}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className={themeClasses.cardGlass}>
            <CardHeader>
              <CardTitle className={themeClasses.textPrimary}>{t.description}</CardTitle>
              <p className={themeClasses.textMuted}>{t.descriptionDesc}</p>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="לדוגמה: סטודנט להנדסה עם ניסיון של 3 שנים בהוראת מתמטיקה ופיזיקה..."
                className={`bg-white/10 border-white/20 ${themeClasses.textPrimary}`}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* New Location and Teaching Methods Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className={themeClasses.cardGlass}>
            <CardHeader>
              <CardTitle className={themeClasses.textPrimary}>{t.locationTitle}</CardTitle>
              <p className={themeClasses.textMuted}>{t.locationDesc}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {/* Primary Address */}
                <div>
                  <Label htmlFor="primaryAddress" className={themeClasses.textPrimary}>{t.address}</Label>
                  <Input
                    id="primaryAddress"
                    type="text"
                    placeholder={t.addressPlaceholder}
                    value={primaryLocationAddress}
                    onChange={(e) => setPrimaryLocationAddress(e.target.value)}
                    className={`mt-1 bg-white/10 border-white/20 ${themeClasses.textPrimary}`}
                  />
                </div>
                {/* City */}
                <div>
                  <Label htmlFor="primaryCity" className={themeClasses.textPrimary}>{t.city}</Label>
                  <Input
                    id="primaryCity"
                    type="text"
                    placeholder={t.cityPlaceholder}
                    value={primaryLocationCity}
                    onChange={(e) => setPrimaryLocationCity(e.target.value)}
                    className={`mt-1 bg-white/10 border-white/20 ${themeClasses.textPrimary}`}
                  />
                </div>
                {/* Travel Radius */}
                <div>
                  <Label htmlFor="travelRadius" className={themeClasses.textPrimary}>{t.radius}</Label>
                  <p className={themeClasses.textMuted}>{t.radiusDesc}</p>
                  <div className="relative mt-1">
                    <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 ${themeClasses.textMuted}`} />
                    <Input
                      id="travelRadius"
                      type="number"
                      placeholder="10"
                      value={primaryLocationRadius}
                      onChange={(e) => setPrimaryLocationRadius(e.target.value)}
                      className={`pl-10 bg-white/10 border-white/20 ${themeClasses.textPrimary}`}
                    />
                  </div>
                </div>
              </div>

              {/* Teaching Methods */}
              <div className="space-y-4">
                <h3 className={`font-semibold ${themeClasses.textPrimary}`}>{t.teachingMethods}</h3>
                <p className={themeClasses.textMuted}>{t.teachingMethodsDesc}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="teachAtStudentHome"
                      checked={teachingLocations.includes('student_home')}
                      onCheckedChange={() => handleTeachingLocationToggle('student_home')}
                    />
                    <Label htmlFor="teachAtStudentHome" className={`text-sm font-medium leading-none ${themeClasses.textPrimary}`}>
                      {t.teachAtStudentHome}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="teachOnline"
                      checked={teachingLocations.includes('online')}
                      onCheckedChange={() => handleTeachingLocationToggle('online')}
                    />
                    <Label htmlFor="teachOnline" className={`text-sm font-medium leading-none ${themeClasses.textPrimary}`}>
                      {t.teachOnline}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="teachAtTutorHome"
                      checked={teachingLocations.includes('tutor_home')}
                      onCheckedChange={() => handleTeachingLocationToggle('tutor_home')}
                    />
                    <Label htmlFor="teachAtTutorHome" className={`text-sm font-medium leading-none ${themeClasses.textPrimary}`}>
                      {t.teachAtTutorHome}
                    </Label>
                  </div>
                </div>
              </div>

              {/* Willingness and Online Availability */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="willingToTravel"
                    checked={travelWillingness}
                    onCheckedChange={(checked) => setTravelWillingness(checked)}
                  />
                  <label htmlFor="willingToTravel" className={`text-sm font-medium leading-none ${themeClasses.textPrimary}`}>
                    {t.willingToTravel}
                  </label>
                  <p className={`text-xs ${themeClasses.textMuted}`}>{t.willingToTravelDesc}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="availableOnline"
                    checked={onlineAvailable}
                    onCheckedChange={(checked) => setOnlineAvailable(checked)}
                  />
                  <label htmlFor="availableOnline" className={`text-sm font-medium leading-none ${themeClasses.textPrimary}`}>
                    {t.availableOnline}
                  </label>
                  <p className={`text-xs ${themeClasses.textMuted}`}>{t.availableOnlineDesc}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="flex justify-center">
          <Button size="lg" onClick={handleSubmit} disabled={isSaving}>
            <Save className="mr-2 h-5 w-5" />
            {isSaving ? t.saving : t.saveProfile}
          </Button>
        </div>
      </div>
    </div>
  );
}
