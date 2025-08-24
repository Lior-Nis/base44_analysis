
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Eye,
  Ear,
  Hand,
  Shuffle,
  Clock,
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
  Globe,
  Rocket,
  Zap
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import PermissionManager from '../components/permissions/PermissionManager';

// Enhanced dynamic background with more impressive animations
const AnimatedBackground = () => (
  <div className="absolute inset-0 w-full h-full overflow-hidden">
    {/* Main gradient orbs */}
    <motion.div
      className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-gradient-to-r from-blue-600/40 to-purple-600/40 rounded-full blur-3xl"
      animate={{
        x: [0, 150, -50, 100, 0],
        y: [0, -100, 80, -30, 0],
        scale: [1, 1.3, 0.8, 1.2, 1],
      }}
      transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-gradient-to-r from-pink-500/30 to-orange-500/30 rounded-full blur-3xl"
      animate={{
        x: [0, -120, 60, -80, 0],
        y: [0, 80, -100, 40, 0],
        rotate: [0, 180, 360],
        scale: [1, 0.9, 1.4, 1]
      }}
      transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
    />

    {/* Additional accent orbs */}
    <motion.div
      className="absolute top-1/3 left-1/4 w-32 h-32 bg-gradient-to-r from-cyan-400/50 to-teal-500/50 rounded-full blur-2xl"
      animate={{
        scale: [1, 1.5, 1],
        opacity: [0.3, 0.8, 0.3]
      }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute bottom-1/4 left-2/3 w-24 h-24 bg-gradient-to-r from-yellow-400/40 to-red-500/40 rounded-full blur-xl"
      animate={{
        x: [0, 50, -30, 0],
        y: [0, -40, 30, 0],
        scale: [1, 1.2, 0.8, 1]
      }}
      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
    />

    {/* Floating particles */}
    {Array.from({ length: 15 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-white/30 rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`
        }}
        animate={{
          y: [0, -20, 20, 0],
          opacity: [0, 1, 0],
          scale: [0, 1, 0]
        }}
        transition={{
          duration: Math.random() * 10 + 5,
          repeat: Infinity,
          delay: Math.random() * 5,
          ease: 'easeInOut'
        }}
      />
    ))}
  </div>
);

// Impressive AI mascot with enhanced animations
const AIBrainMascot = () => (
  <motion.div
    className="relative mx-auto mb-8"
    initial={{ scale: 0, rotate: -180 }}
    animate={{ scale: 1, rotate: 0 }}
    transition={{ duration: 1, ease: 'easeOut' }}
  >
    <motion.div
      className="w-24 h-24 mx-auto relative"
      animate={{
        y: [0, -8, 0],
        rotateY: [0, 10, 0, -10, 0]
      }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Main brain/AI icon with glow */}
      <motion.div
        className="w-full h-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl relative"
        animate={{
          boxShadow: [
            '0 0 20px rgba(59, 130, 246, 0.5)',
            '0 0 40px rgba(168, 85, 247, 0.8)',
            '0 0 20px rgba(236, 72, 153, 0.5)',
            '0 0 40px rgba(59, 130, 246, 0.8)'
          ]
        }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <Brain className="w-12 h-12 text-white" />

        {/* Orbiting particles */}
        {[0, 120, 240].map((angle, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 bg-white rounded-full"
            style={{
              transformOrigin: '0 0'
            }}
            animate={{
              rotate: [angle, angle + 360],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 0.5
            }}
            initial={{
              x: 40,
              y: 40
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  </motion.div>
);

const translations = {
  en: {
    welcome: "Welcome to Back2study",
    subtitle: "The future of learning, personalized for you.",
    startLearning: "Let's Begin",
    processing: "Processing...",
    agreeTerms: "I agree to the",
    termsOfService: "Terms of Service",
    and: "and",
    privacyPolicy: "Privacy Policy",

    permissionsTitle: "Permissions & Notifications",
    permissionsDesc: "To enhance your experience, we'd like to send you notifications and use your location for campus events.",
    allow: "Allow All",
    skip: "Skip for now",

    onboarding: {
      next: "Next",
      previous: "Previous",
      finish: "Finish & Start",
      saving: "Saving...",

      step1Title: "Tell us about yourself",
      gradeLevel: "Grade Level",
      subjects: "Main Subjects",

      // Preserved from original, needed for functionality
      gradeLevels: {
        elementary: "Elementary (1st-6th grade)",
        middle: "Middle School (7th-9th grade)",
        high: "High School (10th-12th grade)",
        college: "College/University",
        other: "Other"
      },
      subjectOptions: ["Mathematics", "Science", "English", "History", "Computer Science", "Languages", "Arts", "Other"],

      step2Title: "Your Learning Style",
      learningStyle: "How do you learn best?", // New key for general subtitle/question
      // Preserved from original, needed for functionality
      learningStyles: {
        visual: { title: "Visual Learner", desc: "I learn best with images, charts, and videos" },
        auditory: { title: "Auditory Learner", desc: "I prefer listening to explanations and discussions" },
        kinesthetic: { title: "Hands-on Learner", desc: "I learn by doing and practicing" },
        mixed: { title: "Mixed Learning", desc: "I use a combination of all methods" }
      },

      step3Title: "Setting Your Goals",
      studyTime: "How much time per day would you like to study?",
      goals: "What are your main goals?",

      // Preserved from original, needed for functionality
      studyTimeOptions: ["30 minutes", "1 hour", "2 hours", "3+ hours"],
      goalOptions: ["Improve grades", "Exam preparation", "Learn new skills", "Academic excellence", "Personal growth"]
    }
  },
  he: {
    welcome: "ברוכים הבאים ל-Back2study",
    subtitle: "העתיד של הלמידה, מותאם אישית עבורך.",
    startLearning: "בואו נתחיל",
    processing: "מעבד...",
    agreeTerms: "אני מאשר/ת את",
    termsOfService: "תנאי השימוש",
    and: "ו",
    privacyPolicy: "מדיניות הפרטיות",

    permissionsTitle: "הרשאות והתראות",
    permissionsDesc: "כדי לשפר את החוויה שלך, נשמח לקבל הרשאה לשלוח התראות ולדעת את מיקומך עבור אירועי קמפוס.",
    allow: "אפשר הכל",
    skip: "דלג בינתיים",

    onboarding: {
      next: "הבא",
      previous: "הקודם",
      finish: "סיום והתחלה",
      saving: "שומר...",

      step1Title: "ספר/י לנו עליך",
      gradeLevel: "רמת לימוד",
      subjects: "מקצועות עיקריים",

      gradeLevels: {
        elementary: "יסודי (כיתות א'-ו')",
        middle: "חטיבת ביניים (כיתות ז'-ט')",
        high: "תיכון (כיתות י'-יב')",
        college: "מכללה/אוניברסיטה",
        other: "אחר"
      },
      subjectOptions: ["מתמטיקה", "מדעים", "אנגלית", "היסטוריה", "מדעי המחשב", "שפות", "אמנויות", "אחר"],

      step2Title: "סגנון הלמידה שלך",
      learningStyle: "איך את/ה לומד/ת הכי טוב?",
      learningStyles: {
        visual: { title: "למידה ויזואלית", desc: "אני לומד/ת הכי טוב עם תמונות וסרטונים" },
        auditory: { title: "למידה שמיעתית", desc: "אני מעדיף/ה הסברים בעל פה ודיונים" },
        kinesthetic: { title: "למידה מעשית", desc: "אני לומד/ת על ידי עשייה ותרגול" },
        mixed: { title: "למידה מעורבת", desc: "אני משתמש/ת בשילוב של כל השיטות" }
      },

      step3Title: "הגדרת מטרות",
      studyTime: "כמה זמן ביום תרצה/י להקדיש ללימודים?",
      goals: "מהן המטרות העיקריות שלך?",

      studyTimeOptions: ["30 דקות", "שעה", "שעתיים", "3+ שעות"],
      goalOptions: ["שיפור ציונים", "הכנה לבחינות", "לימוד כישורים חדשים", "מצוינות אקדמית", "צמיחה אישית"]
    }
  }
};

export default function Welcome() {
  const [currentStep, setCurrentStep] = useState('loading'); // Start with loading to check user status first
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [language, setLanguage] = useState('en'); // Default to English
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({
    gradeLevel: '',
    subjects: [],
    learningStyle: '',
    studyTime: '',
    goals: []
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const t = translations[language];
  const isRTL = language === 'he';

  // This useEffect ensures that if a user is already logged in (e.g., returning from OAuth, or simply
  // reloaded the page), they are directed to the correct step (onboarding or dashboard).
  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const user = await User.me();
        if (user && user.onboarding_completed) {
          // User is logged in and onboarding is completed, redirect to dashboard
          navigate(createPageUrl('Dashboard'));
        } else if (user && !user.onboarding_completed) {
          // User is logged in but hasn't completed onboarding
          setCurrentStep('onboarding');
        } else {
          // No user logged in (or user.me() returned null/undefined without throwing), show welcome
          setCurrentStep('welcome');
        }
      } catch (error) {
        // User is not logged in (e.g., token expired, no session), show welcome
        setCurrentStep('welcome');
      }
    };
    checkUserStatus();
  }, [navigate]);

  const handleStartOnboarding = async () => {
    if (!acceptedTerms || isProcessing) return;
    setIsProcessing(true);

    try {
      // If User.me() fails, attempt to log in. This usually involves a redirect.
      // Upon successful login and redirect back, the useEffect above will catch the logged-in state.
      await User.login();
      // The expectation is that User.login() causes a full page redirect to the auth provider
      // and then back to the app, which re-initializes the component and runs the useEffect.
      // No need to setCurrentStep here as it's handled by the redirect flow.
    } catch (loginError) {
      console.error("Login failed:", loginError);
      alert("Login failed. Please try again."); // Provide user feedback
      setIsProcessing(false); // Re-enable button
    }
  };

  const handleOnboardingNext = () => {
    if (onboardingStep < 3) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      setCurrentStep('permissions');
    }
  };

  const handleOnboardingBack = () => {
    if (onboardingStep > 1) {
      setOnboardingStep(onboardingStep - 1);
    }
  };

  const handleFinishOnboarding = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await User.updateMyUserData({
        onboarding_completed: true,
        preferred_language: language,
        ...onboardingData
      });
      navigate(createPageUrl('Dashboard'));
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
      setIsProcessing(false);
    }
  };

  const GlassCard = ({ children, className = "" }) => (
    <motion.div
      className={`bg-black/30 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {children}
    </motion.div>
  );

  const renderWelcomeScreen = () => (
    <div className="flex flex-col items-center justify-center text-center text-white p-4">
      <AIBrainMascot />
      <motion.h1
        className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {t.welcome}
      </motion.h1>
      <motion.p
        className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {t.subtitle}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <Button
          onClick={handleStartOnboarding}
          disabled={!acceptedTerms || isProcessing}
          size="lg"
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold text-xl px-12 py-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
        >
          <Rocket className="mr-3 h-6 w-6" />
          {isProcessing ? t.processing : t.startLearning}
        </Button>
      </motion.div>

      <motion.div
        className="flex items-center justify-center space-x-3 text-sm text-gray-400 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <Checkbox
          id="terms"
          checked={acceptedTerms}
          onCheckedChange={setAcceptedTerms}
          className="border-gray-500 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-400"
        />
        <label htmlFor="terms" className="cursor-pointer">
          {t.agreeTerms}{' '}
          <Link to={createPageUrl("TermsOfService")} className="text-blue-400 hover:text-blue-300 underline">
            {t.termsOfService}
          </Link>{' '}
          {t.and}{' '}
          <Link to={createPageUrl("PrivacyPolicy")} className="text-blue-400 hover:text-blue-300 underline">
            {t.privacyPolicy}
          </Link>
        </label>
      </motion.div>
    </div>
  );

  const renderOnboardingStep = () => {
    const totalSteps = 3;
    const progress = (onboardingStep / totalSteps) * 100;

    return (
      <GlassCard key={`onboarding-${onboardingStep}`} className="p-8 md:p-12 w-full max-w-lg">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-400">Step {onboardingStep} of {totalSteps}</span>
            <span className="text-sm text-gray-400">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-white/10" />
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          {onboardingStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
            >
              <h2 className="text-3xl font-bold text-white mb-2">{t.onboarding.step1Title}</h2>
              <p className="text-gray-300 mb-8">{t.onboarding.learningStyle}</p> {/* This line refers to step 2's subtitle but is left as per original code structure */}

              <div className="space-y-6 text-left">
                <div>
                  <label className="block text-white font-medium mb-3">{t.onboarding.gradeLevel}</label>
                  <Select value={onboardingData.gradeLevel} onValueChange={(value) => setOnboardingData({ ...onboardingData, gradeLevel: value })}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder={t.onboarding.gradeLevel} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(t.onboarding.gradeLevels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-white font-medium mb-3">{t.onboarding.subjects}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {t.onboarding.subjectOptions.map((subject) => (
                      <label key={subject} className="flex items-center space-x-2 cursor-pointer">
                        <Checkbox
                          checked={onboardingData.subjects.includes(subject)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setOnboardingData({ ...onboardingData, subjects: [...onboardingData.subjects, subject] });
                            } else {
                              setOnboardingData({ ...onboardingData, subjects: onboardingData.subjects.filter(s => s !== subject) });
                            }
                          }}
                        />
                        <span className="text-sm text-gray-300">{subject}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {onboardingStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
            >
              <h2 className="text-3xl font-bold text-white mb-2">{t.onboarding.step2Title}</h2>
              <p className="text-gray-300 mb-8">{t.onboarding.learningStyle}</p>

              <div className="space-y-3">
                {Object.entries(t.onboarding.learningStyles).map(([key, style]) => {
                  const icons = { visual: Eye, auditory: Ear, kinesthetic: Hand, mixed: Shuffle };
                  const Icon = icons[key];

                  return (
                    <motion.button
                      key={key}
                      onClick={() => setOnboardingData({ ...onboardingData, learningStyle: key })}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                        onboardingData.learningStyle === key
                          ? 'border-blue-400 bg-blue-400/20'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className="w-6 h-6 text-blue-400 mt-1" />
                        <div>
                          <h3 className="font-semibold text-white mb-1">{style.title}</h3>
                          <p className="text-sm text-gray-400">{style.desc}</p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {onboardingStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
            >
              <h2 className="text-3xl font-bold text-white mb-2">{t.onboarding.step3Title}</h2>
              <p className="text-gray-300 mb-8">{t.onboarding.learningStyle}</p>

              <div className="space-y-6 text-left">
                <div>
                  <label className="block text-white font-medium mb-3">{t.onboarding.studyTime}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {t.onboarding.studyTimeOptions.map((time) => (
                      <button
                        key={time}
                        onClick={() => setOnboardingData({ ...onboardingData, studyTime: time })}
                        className={`p-3 rounded-lg border-2 transition-all duration-300 ${
                          onboardingData.studyTime === time
                            ? 'border-blue-400 bg-blue-400/20 text-white'
                            : 'border-white/20 bg-white/5 text-gray-300 hover:bg-white/10'
                        }`}
                      >
                        <Clock className="w-4 h-4 mx-auto mb-1" />
                        <span className="text-sm">{time}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-white font-medium mb-3">{t.onboarding.goals}</label>
                  <div className="space-y-2">
                    {t.onboarding.goalOptions.map((goal) => (
                      <label key={goal} className="flex items-center space-x-2 cursor-pointer">
                        <Checkbox
                          checked={onboardingData.goals.includes(goal)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setOnboardingData({ ...onboardingData, goals: [...onboardingData.goals, goal] });
                            } else {
                              setOnboardingData({ ...onboardingData, goals: onboardingData.goals.filter(g => g !== goal) });
                            }
                          }}
                        />
                        <span className="text-sm text-gray-300">{goal}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <Button
            onClick={handleOnboardingBack}
            variant="ghost"
            className="text-gray-400 hover:text-white"
            disabled={onboardingStep === 1 || isProcessing}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.onboarding.previous}
          </Button>

          <Button
            onClick={onboardingStep === totalSteps ? handleFinishOnboarding : handleOnboardingNext}
            className="bg-blue-500 hover:bg-blue-600 text-white"
            disabled={isProcessing}
          >
            {isProcessing ? t.onboarding.saving : (onboardingStep === totalSteps ? t.onboarding.finish : t.onboarding.next)}
            {isProcessing ? null : <ChevronRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </GlassCard>
    );
  };

  const renderPermissionsScreen = () => (
    <PermissionManager
      key="permissions"
      onAllGranted={handleFinishOnboarding}
      onSkip={handleFinishOnboarding}
      render={({ requestAll, status }) => (
        <GlassCard className="p-8 md:p-12 w-full max-w-lg">
          <div className="mx-auto w-20 h-20 mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">{t.permissionsTitle}</h2>
          <p className="text-gray-400 mb-8">{t.permissionsDesc}</p>

          <div className="space-y-4">
            <Button
              onClick={requestAll}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 text-lg"
              disabled={isProcessing}
            >
              <Zap className="w-5 h-5 mr-2" />
              {isProcessing ? t.processing : t.allow}
            </Button>
            <Button
              onClick={handleFinishOnboarding}
              variant="ghost"
              className="w-full text-gray-400 hover:text-white"
              disabled={isProcessing}
            >
              {isProcessing ? t.processing : t.skip}
            </Button>
          </div>
        </GlassCard>
      )}
    />
  );

  const renderLoading = () => (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <AnimatedBackground />
      {/* Language Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setLanguage(language === 'en' ? 'he' : 'en')}
          className="text-white hover:bg-white/20"
        >
          <Globe className="h-4 w-4 mr-2" />
          {language === 'en' ? 'עברית' : 'English'}
        </Button>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <AnimatePresence mode="wait">
          {currentStep === 'loading' && (
            <motion.div key="loading">
              {renderLoading()}
            </motion.div>
          )}
          {currentStep === 'welcome' && (
            <motion.div key="welcome" className="w-full max-w-2xl">
              {renderWelcomeScreen()}
            </motion.div>
          )}
          {currentStep === 'onboarding' && (
            <motion.div key="onboarding" className="w-full max-w-lg">
              {renderOnboardingStep()}
            </motion.div>
          )}
          {currentStep === 'permissions' && (
            <motion.div key="permissions" className="w-full max-w-lg">
              {renderPermissionsScreen()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
