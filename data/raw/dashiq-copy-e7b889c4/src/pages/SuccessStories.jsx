import React, { useState, useEffect } from "react";
import { Transaction, Category, Budget, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import {
  Trophy,
  Target,
  TrendingUp,
  TrendingDown,
  Heart,
  Star,
  BookOpen,
  CheckCircle,
  Clock,
  ArrowRight,
  Bookmark,
  Share,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Crown,
  Zap,
  AlertCircle,
  PlusCircle,
  Layers,
  BarChart3,
  AlertTriangle,
  Info,
  Plus,
  DollarSign,
  Award,
  Lightbulb,
  Quote
} from "lucide-react";
import { t, isRTL, getCurrentLanguage, formatCurrency, formatDate, formatNumber } from '@/components/utils/i18n';
import {
  parseISO,
  differenceInMonths
} from "date-fns";

// Israeli success stories - language-aware
const getIsraeliSuccessStories = () => {
  const currentLang = getCurrentLanguage();
  
  return [
    {
      id: 1,
      name: currentLang === 'he' ? 'שרה כהן, 32' : currentLang === 'ar' ? 'سارة كوهين، 32' : 'Sarah Cohen, 32',
      location: currentLang === 'he' ? 'תל אביב' : currentLang === 'ar' ? 'تل أبيب' : 'Tel Aviv',
      category: 'debt',
      timeframe: 18,
      challenge: currentLang === 'he' ? 
        'שרה הייתה עם חובות של ₪85,000 מכרטיסי אשראי ו-3 הלוואות שונות. שכרה היה ₪12,000 לחודש והיא לא הצליחה לחסוך כלום.' :
        currentLang === 'ar' ? 
        'كانت سارة مدينة بـ 85,000 شيكل من بطاقات الائتمان و3 قروض مختلفة. راتبها كان 12,000 شيكل شهرياً ولم تتمكن من الادخار.' :
        'Sarah had ₪85,000 in credit card debt and 3 different loans. Her salary was ₪12,000 per month and she couldn\'t save anything.',
      solution: currentLang === 'he' ? 
        'יצרה תקציב מפורט, עברה לדירה קטנה יותר, לקחה עבודה נוספת בסופי שבוע, וניהלה את החובות לפי שיטת "כדור השלג".' :
        currentLang === 'ar' ? 
        'أنشأت ميزانية مفصلة، انتقلت لشقة أصغر، أخذت عملاً إضافياً في نهايات الأسبوع، وأدارت الديون وفق طريقة "كرة الثلج".' :
        'Created a detailed budget, moved to a smaller apartment, took weekend side jobs, and managed debts using the "snowball" method.',
      result: currentLang === 'he' ? 
        'בתוך 18 חודשים פרעה את כל החובות וחסכה ₪25,000 לקרן חירום. היום היא חיה ללא חובות עם ₪150,000 בחיסכונות.' :
        currentLang === 'ar' ? 
        'في غضون 18 شهراً سددت جميع الديون ووفرت 25,000 شيكل لصندوق الطوارئ. اليوم تعيش بلا ديون مع 150,000 شيكل في المدخرات.' :
        'Within 18 months she paid off all debts and saved ₪25,000 for emergency fund. Today she lives debt-free with ₪150,000 in savings.',
      lessonLearned: currentLang === 'he' ? 
        'משמעת וקביעת עדיפויות ברורות הן המפתח להצלחה פיננסית.' :
        currentLang === 'ar' ? 
        'الانضباط وتحديد الأولويات الواضحة هما مفتاح النجاح المالي.' :
        'Discipline and setting clear priorities are the key to financial success.',
      outcome: '₪235,000',
      isExpanded: false
    },
    {
      id: 2,
      name: currentLang === 'he' ? 'דוד לוי, 28' : currentLang === 'ar' ? 'داود ليفي، 28' : 'David Levy, 28',
      location: currentLang === 'he' ? 'חיפה' : currentLang === 'ar' ? 'حيفا' : 'Haifa',
      category: 'savings',
      timeframe: 24,
      challenge: currentLang === 'he' ? 
        'דוד עבד כמהנדס בחברת היי-טק בשכר של ₪18,000 לחודש, אבל בזבז הכל על בילויים, מכונית יקרה וחופשות. בגיל 26 היה לו 0 בחיסכונות.' :
        currentLang === 'ar' ? 
        'عمل داود كمهندس في شركة هاي-تك براتب 18,000 شيكل شهرياً، لكنه أنفق كل شيء على التسلية وسيارة باهظة والإجازات. في سن 26 كان لديه 0 في المدخرات.' :
        'David worked as an engineer in a hi-tech company earning ₪18,000 monthly, but spent everything on entertainment, expensive car and vacations. At 26 he had 0 savings.',
      solution: currentLang === 'he' ? 
        'החל ליישם את כלל 50/30/20, מכר את המכונית היקרה, עבר לדירה עם שותפים והתחיל להשקיע 20% מהשכר בקרנות מדד.' :
        currentLang === 'ar' ? 
        'بدأ بتطبيق قاعدة 50/30/20، باع السيارة الباهظة، انتقل لشقة مع شركاء وبدأ بالاستثمار 20% من الراتب في صناديق مؤشرات.' :
        'Started implementing the 50/30/20 rule, sold the expensive car, moved to a shared apartment and began investing 20% of salary in index funds.',
      result: currentLang === 'he' ? 
        'תוך שנתיים צבר ₪180,000 בחיסכונות והשקעות. קנה דירה עם משכנתא של 70% בלבד והמשיך לחסוך ₪4,000 לחודש.' :
        currentLang === 'ar' ? 
        'في غضون سنتين جمع 180,000 شيكل في المدخرات والاستثمارات. اشترى شقة بقرض عقاري 70% فقط وواصل الادخار 4,000 شيكل شهرياً.' :
        'Within two years accumulated ₪180,000 in savings and investments. Bought an apartment with only 70% mortgage and continued saving ₪4,000 monthly.',
      lessonLearned: currentLang === 'he' ? 
        'התחלה מוקדמת בחיסכון והשקעה מאפשרת חופש פיננסי גדול יותר בעתיד.' :
        currentLang === 'ar' ? 
        'البداية المبكرة في الادخال والاستثمار تتيح حرية مالية أكبر في المستقبل.' :
        'Early start in saving and investing enables greater financial freedom in the future.',
      outcome: '₪180,000',
      isExpanded: false
    },
    {
      id: 3,
      name: currentLang === 'he' ? 'רחל אברהם, 45' : currentLang === 'ar' ? 'راحيل إبراهيم، 45' : 'Rachel Abraham, 45',
      location: currentLang === 'he' ? 'ירושלים' : currentLang === 'ar' ? 'القدس' : 'Jerusalem',
      category: 'business',
      timeframe: 36,
      challenge: currentLang === 'he' ? 
        'רחל הייתה אמא חד הורית עם 3 ילדים, עבדה כמזכירה בשכר של ₪8,500 לחודש. לא הצליחה לחסוך ופחדה מהעתיד הכלכלי של המשפחה.' :
        currentLang === 'ar' ? 
        'كانت راחيل أماً عازبة مع 3 أطفال، عملت كسكرتيرة براتب 8,500 شيكل شهرياً. لم تتمكن من الادخار وخافت من المستقبل الاقتصادي للعائلة.' :
        'Rachel was a single mother with 3 children, worked as a secretary earning ₪8,500 monthly. Couldn\'t save and feared for the family\'s financial future.',
      solution: currentLang === 'he' ? 
        'החלה לעبוד בערבים כמתורגמת פרילנסר, פتחה עסק קטן לתרגום מהבית, הקפידה על תקציב קפדני והשקיעה בקורסי השכלה מקצועית.' :
        currentLang === 'ar' ? 
        'بدأت العمل مساءً كمترجمة مستقلة، فتحت عملاً صغيراً للترجمة من المنزل، حافظت على ميزانية صارمة واستثمرت في دورات التعليم المهني.' :
        'Started working evenings as a freelance translator, opened a small translation business from home, maintained strict budget and invested in professional education courses.',
      result: currentLang === 'he' ? 
        'תוך 3 שנים הכניסה מהעסק הגיעה ל-₪15,000 לחודש. היום היא מנהלת חברת תרגום עם 8 עובדים ומרוויחה ₪45,000 לחודש.' :
        currentLang === 'ar' ? 
        'في غضون 3 سنوات وصل الدخل من العمل إلى 15,000 شيكل شهرياً. اليوم تدير شركة ترجمة مع 8 موظفين وتكسب 45,000 شيكل شهرياً.' :
        'Within 3 years business income reached ₪15,000 monthly. Today she manages a translation company with 8 employees earning ₪45,000 monthly.',
      lessonLearned: currentLang === 'he' ? 
        'השקעה בעצמך ובכישורים שלך היא ההשקעה הטובה ביותר שיש.' :
        currentLang === 'ar' ? 
        'الاستثمار في نفسك وفي مهاراتك هو أفضل استثمار موجود.' :
        'Investing in yourself and your skills is the best investment there is.',
      outcome: '₪45,000/חודש',
      isExpanded: false
    }
  ];
};

// Motivational quotes - language-aware
const getMotivationalQuotes = () => {
  const currentLang = getCurrentLanguage();
  
  const quotes = [
    {
      quote: currentLang === 'he' ? 
        'עושר אינו מגיע מהכנסה גבוהה, אלא מהוצאות נמוכות יחסית להכנסה' :
        currentLang === 'ar' ? 
        'الثروة لا تأتي من الدخل المرتفع، بل من النفقات المنخفضة نسبياً للدخل' :
        'Wealth comes not from high income, but from expenses low relative to income',
      author: currentLang === 'he' ? 'רוברט קיוסאקי' : currentLang === 'ar' ? 'روبرت كيوساكي' : 'Robert Kiyosaki',
      category: 'wealth'
    },
    {
      quote: currentLang === 'he' ? 
        'זה לא כמה שאתה מרוויח, אלא כמה שאתה חוסך' :
        currentLang === 'ar' ? 
        'الأمر ليس كم تكسب، بل كم توفر' :
        'It\'s not how much you make, but how much you save',
      author: currentLang === 'he' ? 'וורן באפט' : currentLang === 'ar' ? 'وارن بافت' : 'Warren Buffett',
      category: 'success'
    },
    {
      quote: currentLang === 'he' ? 
        'הצעד הראשון לקראת עושר הוא חיסכון' :
        currentLang === 'ar' ? 
        'الخطوة الأولى نحو الثروة هي الادخار' :
        'The first step towards wealth is saving',
      author: currentLang === 'he' ? 'בנג\'מין פרנקלין' : currentLang === 'ar' ? 'بنجامين فرانكلين' : 'Benjamin Franklin',
      category: 'planning'
    },
    {
      quote: currentLang === 'he' ? 
        'משמעת עצמית היא הבסיס של כל הישג' :
        currentLang === 'ar' ? 
        'الانضباط الذاتي هو أساس كل إنجاز' :
        'Self-discipline is the foundation of all achievement',
      author: currentLang === 'he' ? 'ג\'ים רון' : currentLang === 'ar' ? 'جيم رون' : 'Jim Rohn',
      category: 'discipline'
    },
    {
      quote: currentLang === 'he' ? 
        'הזמן הטוב ביותר לשתול עץ היה לפני 20 שנה. הזמן השני הטוב ביותר הוא עכשיו' :
        currentLang === 'ar' ? 
        'أفضل وقت لزراعة شجرة كان قبل 20 عاماً. ثاني أفضل وقت هو الآن' :
        'The best time to plant a tree was 20 years ago. The second best time is now',
      author: currentLang === 'he' ? 'פתגם סיני' : currentLang === 'ar' ? 'مثل صيني' : 'Chinese Proverb',
      category: 'persistence'
    }
  ];

  return quotes;
};

// Practical tips - language-aware
const getPracticalTips = () => {
  const currentLang = getCurrentLanguage();
  
  return {
    budgeting: [
      {
        title: currentLang === 'he' ? 'כלל 50/30/20' : currentLang === 'ar' ? 'قاعدة 50/30/20' : '50/30/20 Rule',
        description: currentLang === 'he' ? 
          'חלק את ההכנסות: 50% צרכים, 30% רצונות, 20% חיסכון' :
          currentLang === 'ar' ? 
          'قسم الدخل: 50% احتياجات، 30% رغبات، 20% ادخار' :
          'Divide income: 50% needs, 30% wants, 20% savings',
        difficulty: 'beginner',
        timeToImplement: currentLang === 'he' ? 'שבוע אחד' : currentLang === 'ar' ? 'أسبوع واحد' : 'One week',
        potentialSavings: currentLang === 'he' ? 'עד 20% מההכנסות' : currentLang === 'ar' ? 'حتى 20% من الدخل' : 'Up to 20% of income',
        steps: currentLang === 'he' ? [
          'חשב את ההכנסה החודשית הנטו',
          'רשום את כל ההוצאות הקבועות (צרכים)',
          'קבע תקציב לבילויים וקניות (רצונות)',
          'הפרש 20% לחיסכון והשקעות',
          'עקוב אחר ההוצאות במשך חודש'
        ] : currentLang === 'ar' ? [
          'احسب الدخل الشهري الصافي',
          'اكتب جميع النفقات الثابتة (الاحتياجات)',
          'حدد ميزانية للترفيه والتسوق (الرغبات)',
          'خصص 20% للادخار والاستثمارات',
          'تتبع النفقات لمدة شهر'
        ] : [
          'Calculate net monthly income',
          'List all fixed expenses (needs)',
          'Set budget for entertainment and shopping (wants)',
          'Allocate 20% for savings and investments',
          'Track expenses for one month'
        ]
      }
    ],
    saving: [
      {
        title: currentLang === 'he' ? 'חיסכון אוטומטי' : currentLang === 'ar' ? 'الادخار التلقائي' : 'Automatic Savings',
        description: currentLang === 'he' ? 
          'הגדר העברה אוטומטית לחיסכונות בתחילת כל חודש' :
          currentLang === 'ar' ? 
          'حدد تحويلاً تلقائياً للمدخرات في بداية كل شهر' :
          'Set up automatic transfer to savings at the beginning of each month',
        difficulty: 'beginner',
        timeToImplement: currentLang === 'he' ? 'יום אחד' : currentLang === 'ar' ? 'يوم واحد' : 'One day',
        potentialSavings: currentLang === 'he' ? '10-20% מההכנסות' : currentLang === 'ar' ? '10-20% من الدخل' : '10-20% of income'
      }
    ]
  };
};

export default function SuccessStoriesPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("stories");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedStory, setExpandedStory] = useState(null);
  const [userProgress, setUserProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [randomQuote, setRandomQuote] = useState(null);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const isRTLLayout = isRTL();

  // Load user data and calculate progress
  useEffect(() => {
    loadUserProgress();
    loadDailyContent();
  }, []);

  const loadUserProgress = async () => {
    setIsLoading(true);
    try {
      const [transactions, budgets, user] = await Promise.all([
        Transaction.list('-date', 200),
        Budget.list(),
        User.me().catch(() => null)
      ]);

      if (transactions.length > 0) {
        calculateUserProgress(transactions, budgets, user);
      }
    } catch (error) {
      console.error("Error loading user progress:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateUserProgress = (transactions, budgets, user) => {
    const now = new Date();
    const firstTransaction = transactions[transactions.length - 1];
    const startDate = firstTransaction ? parseISO(firstTransaction.date) : now;
    const monthsTracking = differenceInMonths(now, startDate);

    // Calculate financial metrics
    const totalIncome = transactions
      .filter(t => t.is_income)
      .reduce((sum, t) => sum + (t.billing_amount || 0), 0);

    const totalExpenses = transactions
      .filter(t => !t.is_income)
      .reduce((sum, t) => sum + (t.billing_amount || 0), 0);

    const totalSaved = Math.max(0, totalIncome - totalExpenses);
    const savingsRate = totalIncome > 0 ? (totalSaved / totalIncome) * 100 : 0;

    // Calculate milestones
    const milestones = {
      firstBudget: budgets.length > 0,
      firstSavings: totalSaved > 0,
      debtReduction: false, // Simplified for now
      emergencyFund: totalSaved > 10000, // Simplified threshold
      investmentStart: false, // Would need investment data
      financialGoals: savingsRate > 20
    };

    const achievedMilestones = Object.values(milestones).filter(Boolean).length;
    const totalMilestones = Object.keys(milestones).length;

    // Determine encouragement level
    let encouragementLevel = 'justStarted';
    if (achievedMilestones >= 4) encouragementLevel = 'excellent';
    else if (achievedMilestones >= 2) encouragementLevel = 'onTrack';
    else if (monthsTracking > 3) encouragementLevel = 'makingProgress';

    setUserProgress({
      startDate,
      monthsTracking,
      totalSaved: Math.round(totalSaved),
      savingsRate: Math.round(savingsRate),
      milestones,
      achievedMilestones,
      totalMilestones,
      encouragementLevel,
      budgetCount: budgets.length,
      transactionCount: transactions.length
    });
  };

  const loadDailyContent = () => {
    const quotes = getMotivationalQuotes();
    const randomQuoteIndex = Math.floor(Math.random() * quotes.length);
    setRandomQuote(quotes[randomQuoteIndex]);

    // Set a default daily challenge based on language
    const currentLang = getCurrentLanguage();
    const defaultChallenge = currentLang === 'he' ?
      'נסה לחסוך 50 שקל היום על ידי הכנת קפה בבית במקום קנייתו' :
      currentLang === 'ar' ?
      'حاول توفير 50 شيكل اليوم من خلال صنع القهوة في المنزل بدلاً من شرائها' :
      'Try to save 50 ILS today by making coffee at home instead of buying it';
    
    setDailyChallenge(defaultChallenge);
  };

  const getStories = () => {
    const stories = getIsraeliSuccessStories();
    if (selectedCategory === 'all') {
      return stories;
    }
    return stories.filter(story => story.category === selectedCategory);
  };

  const toggleStoryExpansion = (storyId) => {
    setExpandedStory(expandedStory === storyId ? null : storyId);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      debt: <TrendingDown className="w-4 h-4" />,
      savings: <DollarSign className="w-4 h-4" />,
      investment: <TrendingUp className="w-4 h-4" />,
      budgeting: <Target className="w-4 h-4" />,
      career: <Award className="w-4 h-4" />,
      business: <Crown className="w-4 h-4" />
    };
    return icons[category] || <Star className="w-4 h-4" />;
  };

  const getCategoryColor = (category) => {
    const colors = {
      debt: 'bg-red-100 text-red-800 border-red-200',
      savings: 'bg-green-100 text-green-800 border-green-200',
      investment: 'bg-blue-100 text-blue-800 border-blue-200',
      budgeting: 'bg-purple-100 text-purple-800 border-purple-200',
      career: 'bg-orange-100 text-orange-800 border-orange-200',
      business: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-2 sm:p-4 md:p-6 overflow-x-hidden" dir={isRTLLayout ? 'rtl' : 'ltr'}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2 sm:p-4 md:p-6 space-y-3 sm:space-y-6 overflow-x-hidden" dir={isRTLLayout ? 'rtl' : 'ltr'}>
      {/* Header - Mobile Optimized */}
      <header className="mb-4 sm:mb-8">
        <div className="flex items-start gap-3">
          <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600 flex-shrink-0 mt-1" />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-1 sm:mb-2 leading-tight break-words">
              {t('successStories.title')}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed break-words">
              {t('successStories.subtitle')}
            </p>
          </div>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3 sm:space-y-6">
        {/* Mobile-Optimized TabsList */}
        <div className="bg-gray-100 p-1 rounded-lg overflow-x-auto">
          <TabsList className="w-full min-w-max bg-transparent p-0 h-auto grid grid-cols-2 sm:grid-cols-4 gap-1">
            <TabsTrigger 
              value="stories" 
              className="w-full px-2 py-2 sm:px-4 sm:py-3 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all text-xs sm:text-sm rounded-md whitespace-nowrap min-w-0"
            >
              <div className="flex items-center gap-1 sm:gap-2 justify-center min-w-0">
                <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">{t('successStories.tabs.stories')}</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="myProgress" 
              className="w-full px-2 py-2 sm:px-4 sm:py-3 data-[state=active]:bg-white data-[state=active]:text-green-600 data-[state=active]:shadow-sm transition-all text-xs sm:text-sm rounded-md whitespace-nowrap min-w-0"
            >
              <div className="flex items-center gap-1 sm:gap-2 justify-center min-w-0">
                <Target className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">{t('successStories.tabs.myProgress')}</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="tips" 
              className="w-full px-2 py-2 sm:px-4 sm:py-3 data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm transition-all text-xs sm:text-sm rounded-md whitespace-nowrap min-w-0"
            >
              <div className="flex items-center gap-1 sm:gap-2 justify-center min-w-0">
                <Lightbulb className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">{t('successStories.tabs.tips')}</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="motivation" 
              className="w-full px-2 py-2 sm:px-4 sm:py-3 data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm transition-all text-xs sm:text-sm rounded-md whitespace-nowrap min-w-0"
            >
              <div className="flex items-center gap-1 sm:gap-2 justify-center min-w-0">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">{t('successStories.tabs.motivation')}</span>
              </div>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Success Stories Tab - Mobile Optimized */}
        <TabsContent value="stories" className="space-y-3 sm:space-y-6">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 break-words">
                  {t('successStories.stories.title')}
                </h2>
                <p className="text-sm sm:text-base text-gray-600 break-words">
                  {t('successStories.stories.description')}
                </p>
              </div>
              
              <div className="w-full sm:w-48 flex-shrink-0">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full bg-white shadow-sm min-h-[44px]">
                    <SelectValue placeholder={t('successStories.stories.filterBy')} className="truncate" />
                  </SelectTrigger>
                  <SelectContent dir={isRTLLayout ? 'rtl' : 'ltr'}>
                    <SelectItem value="all">{t('successStories.stories.allCategories')}</SelectItem>
                    <SelectItem value="debt">{t('successStories.stories.categories.debt')}</SelectItem>
                    <SelectItem value="savings">{t('successStories.stories.categories.savings')}</SelectItem>
                    <SelectItem value="investment">{t('successStories.stories.categories.investment')}</SelectItem>
                    <SelectItem value="budgeting">{t('successStories.stories.categories.budgeting')}</SelectItem>
                    <SelectItem value="career">{t('successStories.stories.categories.career')}</SelectItem>
                    <SelectItem value="business">{t('successStories.stories.categories.business')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3 sm:gap-6">
              {getStories().map((story) => (
                <Card key={story.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b p-3 sm:p-6">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg flex-shrink-0">
                            {story.name.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-base sm:text-lg font-bold text-gray-800 break-words">
                              {story.name}
                            </CardTitle>
                            <p className="text-xs sm:text-sm text-gray-600 break-words">{story.location}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          <Badge className={`${getCategoryColor(story.category)} text-xs whitespace-nowrap`}>
                            {getCategoryIcon(story.category)}
                            <span className="ml-1 truncate">{t(`successStories.stories.categories.${story.category}`)}</span>
                          </Badge>
                          <Badge variant="outline" className="bg-white text-xs whitespace-nowrap">
                            <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{story.timeframe} {t('successStories.stories.months')}</span>
                          </Badge>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs whitespace-nowrap">
                            <TrendingUp className="w-3 h-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{story.outcome}</span>
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-3 sm:p-6">
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2 text-sm sm:text-base">
                          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                          <span className="break-words">{t('successStories.stories.challenge')}</span>
                        </h4>
                        <p className="text-gray-700 leading-relaxed text-sm sm:text-base break-words">{story.challenge}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2 text-sm sm:text-base">
                          <Lightbulb className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                          <span className="break-words">{t('successStories.stories.solution')}</span>
                        </h4>
                        <p className="text-gray-700 leading-relaxed text-sm sm:text-base break-words">{story.solution}</p>
                      </div>

                      {(expandedStory === story.id) && (
                        <div className="space-y-3 sm:space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2 text-sm sm:text-base">
                              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                              <span className="break-words">{t('successStories.stories.result')}</span>
                            </h4>
                            <p className="text-gray-700 leading-relaxed text-sm sm:text-base break-words">{story.result}</p>
                          </div>

                          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                            <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2 text-sm sm:text-base">
                              <Star className="w-4 h-4 flex-shrink-0" />
                              <span className="break-words">{t('successStories.stories.inspiration.title')}</span>
                            </h4>
                            <p className="text-blue-700 font-medium text-sm sm:text-base break-words">{story.lessonLearned}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 sm:pt-4 border-t">
                        <Button
                          variant="ghost"
                          onClick={() => toggleStoryExpansion(story.id)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 text-sm sm:text-base min-h-[44px]"
                        >
                          {expandedStory === story.id ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-2 flex-shrink-0" />
                              <span className="truncate">{t('successStories.common.readLess')}</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-2 flex-shrink-0" />
                              <span className="truncate">{t('successStories.common.readMore')}</span>
                            </>
                          )}
                        </Button>
                        
                        <div className="flex gap-1 sm:gap-2">
                          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800 min-h-[44px] w-11 sm:w-auto">
                            <Bookmark className="w-4 h-4" />
                            <span className="sr-only">Bookmark</span>
                          </Button>
                          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800 min-h-[44px] w-11 sm:w-auto">
                            <Share className="w-4 h-4" />
                            <span className="sr-only">Share</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* My Progress Tab - Mobile Optimized */}
        <TabsContent value="myProgress" className="space-y-3 sm:space-y-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="p-3 sm:p-6">
              <div className="flex items-start gap-2">
                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-green-800 flex-shrink-0 mt-1" />
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg md:text-xl text-green-800 break-words">
                    {t('successStories.myProgress.title')}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-green-700 break-words">
                    {t('successStories.myProgress.description')}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              {userProgress ? (
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                    <div className="text-center p-2 sm:p-4 bg-white rounded-lg border border-green-200">
                      <div className="text-lg sm:text-2xl font-bold text-green-600 break-words">
                        {userProgress.monthsTracking}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 break-words">
                        {t('successStories.myProgress.metrics.monthsTracking')}
                      </div>
                    </div>
                    <div className="text-center p-2 sm:p-4 bg-white rounded-lg border border-green-200">
                      <div className="text-lg sm:text-2xl font-bold text-green-600 break-words">
                        {formatCurrency(userProgress.totalSaved)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 break-words">
                        {t('successStories.myProgress.metrics.totalSaved')}
                      </div>
                    </div>
                    <div className="text-center p-2 sm:p-4 bg-white rounded-lg border border-green-200">
                      <div className="text-lg sm:text-2xl font-bold text-green-600">
                        {userProgress.savingsRate}%
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 break-words">
                        {t('successStories.myProgress.metrics.savingsRate')}
                      </div>
                    </div>
                    <div className="text-center p-2 sm:p-4 bg-white rounded-lg border border-green-200">
                      <div className="text-lg sm:text-2xl font-bold text-green-600">
                        {userProgress.budgetCount}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 break-words">
                        {t('navigation.budget')}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-3 sm:p-6 rounded-lg border border-green-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 break-words">
                      {t('successStories.myProgress.milestones.title')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4">
                      {Object.entries(userProgress.milestones).map(([milestone, achieved]) => (
                        <div key={milestone} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-0">
                          {achieved ? (
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-gray-300 flex-shrink-0"></div>
                          )}
                          <span className={`text-sm sm:text-base break-words min-w-0 flex-1 ${achieved ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                            {t(`successStories.myProgress.milestones.${milestone}`)}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 sm:mt-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs sm:text-sm font-medium text-gray-700 break-words">
                          {t('successStories.myProgress.achievements')}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                          {userProgress.achievedMilestones}/{userProgress.totalMilestones}
                        </span>
                      </div>
                      <Progress 
                        value={(userProgress.achievedMilestones / userProgress.totalMilestones) * 100} 
                        className="h-2 sm:h-3" 
                      />
                    </div>
                  </div>

                  <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2 text-sm sm:text-base">
                      <Heart className="w-4 h-4 flex-shrink-0" />
                      <span className="break-words">{t('successStories.myProgress.encouragement.title')}</span>
                    </h4>
                    <p className="text-green-700 text-sm sm:text-base break-words">
                      {t(`successStories.myProgress.encouragement.${userProgress.encouragementLevel}`)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <Target className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 break-words">
                    {t('successStories.myProgress.noData.title')}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm sm:text-base break-words">
                    {t('successStories.myProgress.noData.description')}
                  </p>
                  <Button className="bg-green-600 hover:bg-green-700 min-h-[44px]">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    {t('successStories.myProgress.noData.cta')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tips Tab - Mobile Optimized */}
        <TabsContent value="tips" className="space-y-3 sm:space-y-6">
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader className="p-3 sm:p-6">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-purple-800 flex-shrink-0 mt-1" />
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg md:text-xl text-purple-800 break-words">
                    {t('successStories.tips.title')}
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-purple-700 break-words">
                    {t('successStories.tips.description')}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="grid gap-4 sm:gap-6">
                {Object.entries(getPracticalTips()).map(([category, tips]) => (
                  <div key={category}>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 capitalize break-words">
                      {t(`successStories.tips.categories.${category}`)}
                    </h3>
                    <div className="grid gap-3 sm:gap-4">
                      {tips.map((tip, index) => (
                        <Card key={index} className="border border-purple-200 hover:shadow-md transition-shadow">
                          <CardContent className="p-3 sm:p-4">
                            <div className="space-y-3 sm:space-y-4">
                              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center sm:justify-between">
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-semibold text-gray-800 text-sm sm:text-base break-words">
                                    {tip.title}
                                  </h4>
                                  <p className="text-gray-600 text-xs sm:text-sm break-words">
                                    {tip.description}
                                  </p>
                                </div>
                                <div className="flex flex-wrap gap-1 sm:gap-2">
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs whitespace-nowrap">
                                    {t(`successStories.tips.difficulty.${tip.difficulty}`)}
                                  </Badge>
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs whitespace-nowrap">
                                    {tip.timeToImplement}
                                  </Badge>
                                </div>
                              </div>
                              
                              {tip.steps && (
                                <div className="bg-purple-50 p-2 sm:p-3 rounded-lg">
                                  <h5 className="font-medium text-purple-800 mb-2 text-xs sm:text-sm break-words">
                                    {t('successStories.tips.tipDetails.steps')}:
                                  </h5>
                                  <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm text-purple-700">
                                    {tip.steps.map((step, stepIndex) => (
                                      <li key={stepIndex} className="break-words">{step}</li>
                                    ))}
                                  </ol>
                                </div>
                              )}
                              
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                                <div className="text-xs sm:text-sm">
                                  <span className="text-gray-600 break-words">
                                    {t('successStories.tips.potentialSavings')}: 
                                  </span>
                                  <span className="font-medium text-green-600 ml-1 break-words">
                                    {tip.potentialSavings}
                                  </span>
                                </div>
                                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 min-h-[44px] sm:min-h-auto">
                                  <ArrowRight className="w-4 h-4 mr-1 flex-shrink-0" />
                                  <span className="truncate">{t('successStories.common.apply')}</span>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Motivation Tab - Mobile Optimized */}
        <TabsContent value="motivation" className="space-y-3 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
            {/* Quote of the Day */}
            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-orange-800 text-base sm:text-lg">
                  <Quote className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                  <span className="break-words">{t('successStories.motivation.quoteOfTheDay')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                {randomQuote && (
                  <div className="space-y-3 sm:space-y-4">
                    <blockquote className="text-sm sm:text-lg font-medium text-gray-800 leading-relaxed italic break-words">
                      "{randomQuote.quote}"
                    </blockquote>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <cite className="text-xs sm:text-sm font-medium text-orange-700 break-words">
                        — {randomQuote.author}
                      </cite>
                      <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs whitespace-nowrap self-start sm:self-auto">
                        {t(`successStories.motivation.categories.${randomQuote.category}`)}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Daily Challenge */}
            <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-indigo-800 text-base sm:text-lg">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                  <span className="break-words">{t('successStories.motivation.dailyChallenge.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <div className="space-y-3 sm:space-y-4">
                  <p className="text-gray-700 leading-relaxed text-sm sm:text-base break-words">
                    {dailyChallenge}
                  </p>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 min-h-[44px]">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {t('successStories.common.getStarted')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* More Quotes */}
          <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-pink-800 text-base sm:text-lg">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                <span className="break-words">{t('successStories.motivation.financialWisdom')}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="grid gap-3 sm:gap-4">
                {getMotivationalQuotes().slice(1).map((quote, index) => (
                  <div key={index} className="p-3 sm:p-4 bg-white rounded-lg border border-pink-200">
                    <blockquote className="text-gray-800 font-medium mb-2 italic text-sm sm:text-base break-words">
                      "{quote.quote}"
                    </blockquote>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <cite className="text-xs sm:text-sm text-pink-700 break-words">— {quote.author}</cite>
                      <Badge className="bg-pink-100 text-pink-800 border-pink-200 text-xs whitespace-nowrap self-start sm:self-auto">
                        {t(`successStories.motivation.categories.${quote.category}`)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}