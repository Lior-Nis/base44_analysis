import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Phone, Mail, Calendar, FileText, ArrowLeft } from 'lucide-react';
import { useTheme } from '../components/ui/theme-provider';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const translations = {
  he: {
    title: "הצהרת נגישות",
    lastUpdated: "תאריך עדכון אחרון: 15 בדצמבר 2024",
    backToApp: "חזור לאפליקציה",
    intro: "אנו ב-Back2study מחויבים לספק שירות נגיש וזמין לכל המשתמשים, ללא קשר ליכולותיהם הפיזיות או הטכנולוגיות.",
    commitment: "מחויבות הנגישות שלנו",
    commitmentText: "אתר זה מותאם לדרישות חוק שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע״ג-2013, ולתקן הבינלאומי WCAG 2.1 ברמת AA.",
    
    sections: [
      {
        icon: Shield,
        title: "רמת נגישות והתאמות שבוצעו",
        items: [
          "ניווט מלא באמצעות מקלדת - אפשרות לניווט בכל חלקי האתר באמצעות מקלדת בלבד",
          "תאימות לקוראי מסך - האתר מותאם לעבודה עם קוראי מסך כמו JAWS, NVDA וVoiceOver",
          "הדגשת מיקוד - אלמנטים אינטראקטיביים מודגשים בבירור בעת מעבר אליהם",
          "כותרות סמנטיות - שימוש בכותרות H1-H6 באופן היררכי ולוגי",
          "תיאורי תמונות - כל התמונות כוללות תיאור חלופי (Alt text) מפורט",
          "ניגודיות צבעים - עמידה בדרישות הניגודיות הנדרשות לפי התקן",
          "התאמה למכשירים ניידים - האתר מותאם לפעולה על מגוון מכשירים וגדלי מסך",
          "עצירת אנימציות - אפשרות לעצור אנימציות ותנועות מסיחות דעת",
          "שליטה בתוכן המדיה - כל סרטוני ווידאו כוללים כתוביות וכפתורי בקרה"
        ]
      },
      {
        icon: FileText,
        title: "תאימות טכנולוגית",
        items: [
          "דפדפנים נתמכים: Chrome (גרסה 90+), Firefox (גרסה 88+), Safari (גרסה 14+), Edge (גרסה 90+)",
          "קוראי מסך נתמכים: JAWS 2020+, NVDA 2020+, VoiceOver (macOS/iOS), TalkBack (Android)",
          "מכשירים: מחשבים אישיים, מחשבים ניידים, טאבלטים וסמארטפונים",
          "מערכות הפעלה: Windows 10+, macOS 10.15+, iOS 13+, Android 9+"
        ]
      },
      {
        icon: Calendar,
        title: "חלקים שאינם נגישים במלואם",
        items: [
          "מפות אינטראקטיביות - חלק מהמפות עשויות להיות מורכבות לניווט עם קורא מסך. במקרים אלה, אנו מספקים רשימה טקסטואלית של המידע",
          "תוכן וידאו חיצוני - סרטונים המוטמעים מפלטפורמות חיצוניות עשויים לא לכלול כתוביות. אנו פועלים להוסיף תמלילים לכל התוכן",
          "תכונות AI - חלק מהתכונות החדשות של הבינה המלאכותית עדיין בפיתוח לשיפור הנגישות שלהן"
        ]
      }
    ],
    
    contactInfo: {
      title: "פרטי איש הקשר לנושאי נגישות",
      name: "רכז נגישות - Back2study",
      phone: "03-1234567",
      email: "accessibility@back2study.com",
      hours: "ימים א׳-ה׳, 09:00-17:00",
      responseTime: "אנו מתחייבים למענה תוך 48 שעות עבודה"
    },
    
    reportIssue: {
      title: "דיווח על בעיית נגישות",
      description: "אם נתקלת בבעיית נגישות באתר, אנא דווח עליה באמצעות:",
      methods: [
        "שליחת דוא״ל לכתובת accessibility@back2study.com",
        "התקשרות למספר 03-1234567",
        "מילוי טופס הדיווח באתר (קישור בתחתית העמוד)"
      ],
      whatToInclude: "במידע הדיווח, נא לכלול:",
      includeItems: [
        "תיאור מפורט של הבעיה",
        "הדף או הקטע הבעייתי באתר",
        "דפדפן ומערכת הפעלה בשימוש",
        "טכנולוגיה מסייעת בשימוש (אם רלוונטי)"
      ]
    },
    
    footer: {
      verification: "בדיקות נגישות בוצעו על ידי צוות הפיתוח הפנימי בשיתוף עם מומחי נגישות חיצוניים",
      updatePromise: "אנו מתחייבים לעדכן הצהרה זו באופן קבוע ולשפר את הנגישות באתר באופן מתמיד",
      lawCompliance: "הצהרה זו עומדת בדרישות חוק שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע״ג-2013"
    }
  },
  
  en: {
    title: "Accessibility Statement",
    lastUpdated: "Last Updated: December 15, 2024",
    backToApp: "Back to App",
    intro: "At Back2study, we are committed to providing accessible and available service to all users, regardless of their physical or technological abilities.",
    commitment: "Our Accessibility Commitment",
    commitmentText: "This website is adapted to the requirements of the Equal Rights for Persons with Disabilities Law (Service Accessibility Adjustments), 2013, and to the international WCAG 2.1 standard at AA level.",
    
    sections: [
      {
        icon: Shield,
        title: "Accessibility Level and Adaptations Made",
        items: [
          "Full keyboard navigation - ability to navigate all parts of the site using keyboard only",
          "Screen reader compatibility - the site is adapted to work with screen readers like JAWS, NVDA and VoiceOver",
          "Focus highlighting - interactive elements are clearly highlighted when navigated to",
          "Semantic headings - use of H1-H6 headings in a hierarchical and logical manner",
          "Image descriptions - all images include detailed alternative text (Alt text)",
          "Color contrast - compliance with required contrast requirements according to the standard",
          "Mobile device adaptation - the site is adapted for operation on various devices and screen sizes",
          "Animation control - ability to stop distracting animations and movements",
          "Media content control - all videos include captions and control buttons"
        ]
      },
      {
        icon: FileText,
        title: "Technology Compatibility",
        items: [
          "Supported browsers: Chrome (version 90+), Firefox (version 88+), Safari (version 14+), Edge (version 90+)",
          "Supported screen readers: JAWS 2020+, NVDA 2020+, VoiceOver (macOS/iOS), TalkBack (Android)",
          "Devices: Personal computers, laptops, tablets and smartphones",
          "Operating systems: Windows 10+, macOS 10.15+, iOS 13+, Android 9+"
        ]
      },
      {
        icon: Calendar,
        title: "Parts That Are Not Fully Accessible",
        items: [
          "Interactive maps - some maps may be complex to navigate with a screen reader. In such cases, we provide a textual list of the information",
          "External video content - videos embedded from external platforms may not include captions. We are working to add transcripts for all content",
          "AI features - some new artificial intelligence features are still being developed to improve their accessibility"
        ]
      }
    ],
    
    contactInfo: {
      title: "Accessibility Contact Details",
      name: "Accessibility Coordinator - Back2study",
      phone: "03-1234567",
      email: "accessibility@back2study.com",
      hours: "Sunday-Thursday, 09:00-17:00",
      responseTime: "We commit to responding within 48 working hours"
    },
    
    reportIssue: {
      title: "Reporting an Accessibility Issue",
      description: "If you encounter an accessibility issue on the site, please report it by:",
      methods: [
        "Sending an email to accessibility@back2study.com",
        "Calling 03-1234567",
        "Filling out the report form on the site (link at the bottom of the page)"
      ],
      whatToInclude: "In the report information, please include:",
      includeItems: [
        "Detailed description of the problem",
        "The problematic page or section on the site",
        "Browser and operating system in use",
        "Assistive technology in use (if relevant)"
      ]
    },
    
    footer: {
      verification: "Accessibility checks were performed by the internal development team in collaboration with external accessibility experts",
      updatePromise: "We commit to updating this statement regularly and continuously improving website accessibility",
      lawCompliance: "This statement complies with the requirements of the Equal Rights for Persons with Disabilities Law (Service Accessibility Adjustments), 2013"
    }
  }
};

export default function AccessibilityStatement() {
  const { language, themeClasses } = useTheme();
  const t = translations[language || 'en'];

  return (
    <div className={`min-h-screen ${themeClasses.background} p-4 md:p-8`} role="main">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="text-white/80 hover:text-white hover:bg-white/10"
            aria-label={language === 'he' ? 'חזור לעמוד הקודם' : 'Go back to previous page'}
          >
            <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
            {t.backToApp}
          </Button>
        </div>
        
        <Card className={`${themeClasses.cardGlass}`} role="article">
          <CardHeader className="text-center border-b border-white/20">
            <h1 className={`text-3xl md:text-4xl font-bold ${themeClasses.textPrimary}`}>
              {t.title}
            </h1>
            <p className={`${themeClasses.textMuted} text-sm mt-2`} aria-label="תאריך עדכון אחרון">
              {t.lastUpdated}
            </p>
          </CardHeader>
          
          <CardContent className="p-6 md:p-8 space-y-8">
            
            {/* Introduction */}
            <section aria-labelledby="intro-heading">
              <h2 id="intro-heading" className={`text-xl font-semibold ${themeClasses.textPrimary} mb-4`}>
                {t.commitment}
              </h2>
              <p className={`${themeClasses.textSecondary} leading-relaxed mb-4`}>
                {t.intro}
              </p>
              <p className={`${themeClasses.textSecondary} leading-relaxed`}>
                {t.commitmentText}
              </p>
            </section>

            {/* Main Sections */}
            {t.sections.map((section, index) => (
              <section key={index} aria-labelledby={`section-heading-${index}`}>
                <h2 id={`section-heading-${index}`} className={`text-xl font-semibold flex items-center gap-3 ${themeClasses.textPrimary} mb-4`}>
                  <section.icon className="w-6 h-6 text-blue-400" aria-hidden="true" />
                  {section.title}
                </h2>
                <ul className={`list-disc list-inside space-y-3 pl-4 ${themeClasses.textSecondary} leading-relaxed`} role="list">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} role="listitem">{item}</li>
                  ))}
                </ul>
              </section>
            ))}

            {/* Contact Information */}
            <section aria-labelledby="contact-heading" className="bg-blue-500/10 p-6 rounded-lg border border-blue-500/20">
              <h2 id="contact-heading" className={`text-xl font-semibold flex items-center gap-3 ${themeClasses.textPrimary} mb-4`}>
                <Phone className="w-6 h-6 text-blue-400" aria-hidden="true" />
                {t.contactInfo.title}
              </h2>
              <div className="space-y-2">
                <p className={`font-medium ${themeClasses.textPrimary}`}>{t.contactInfo.name}</p>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-400" aria-hidden="true" />
                  <a href={`tel:${t.contactInfo.phone}`} className="text-blue-400 hover:text-blue-300 hover:underline">
                    {t.contactInfo.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-400" aria-hidden="true" />
                  <a href={`mailto:${t.contactInfo.email}`} className="text-blue-400 hover:text-blue-300 hover:underline">
                    {t.contactInfo.email}
                  </a>
                </div>
                <p className={`text-sm ${themeClasses.textSecondary}`}>
                  <strong>{language === 'he' ? 'שעות פעילות:' : 'Hours:'}</strong> {t.contactInfo.hours}
                </p>
                <p className={`text-sm ${themeClasses.textSecondary}`}>
                  {t.contactInfo.responseTime}
                </p>
              </div>
            </section>

            {/* Report Issue Section */}
            <section aria-labelledby="report-heading" className="bg-yellow-500/10 p-6 rounded-lg border border-yellow-500/20">
              <h2 id="report-heading" className={`text-xl font-semibold ${themeClasses.textPrimary} mb-4`}>
                {t.reportIssue.title}
              </h2>
              <p className={`${themeClasses.textSecondary} mb-4`}>
                {t.reportIssue.description}
              </p>
              <ul className={`list-disc list-inside space-y-2 ${themeClasses.textSecondary} mb-4`} role="list">
                {t.reportIssue.methods.map((method, index) => (
                  <li key={index} role="listitem">{method}</li>
                ))}
              </ul>
              
              <h3 className={`font-semibold ${themeClasses.textPrimary} mb-2`}>
                {t.reportIssue.whatToInclude}
              </h3>
              <ul className={`list-disc list-inside space-y-2 ${themeClasses.textSecondary}`} role="list">
                {t.reportIssue.includeItems.map((item, index) => (
                  <li key={index} role="listitem">{item}</li>
                ))}
              </ul>
            </section>

            {/* Footer */}
            <section aria-labelledby="footer-heading" className="border-t border-white/20 pt-6">
              <h2 id="footer-heading" className="sr-only">מידע נוסף על הצהרת הנגישות</h2>
              <div className={`space-y-4 text-sm ${themeClasses.textMuted}`}>
                <p>{t.footer.verification}</p>
                <p>{t.footer.updatePromise}</p>
                <p className="font-medium">{t.footer.lawCompliance}</p>
              </div>
            </section>

          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}