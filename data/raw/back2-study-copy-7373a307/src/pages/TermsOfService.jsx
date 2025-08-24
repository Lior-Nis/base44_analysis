import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Users, Brain, FileText, ArrowLeft } from 'lucide-react';
import { useTheme } from '../components/ui/theme-provider';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const translations = {
  he: {
    title: "תנאי שימוש",
    lastUpdated: "עדכון אחרון: 29 ביולי 2024",
    backToApp: "חזור לאפליקציה",
    welcome: "ברוכים הבאים ל-Back2study! אנו שמחים שהצטרפתם לקהילה שלנו. תנאים אלה נועדו להבטיח חוויה בטוחה, הוגנת ופרודוקטיבית לכולם.",
    sections: [
      {
        icon: ShieldCheck,
        title: "1. חשבון משתמש ואחריות",
        content: [
          "האפליקציה מיועדת למשתמשים בגילאי 14 ומעלה. בעצם השימוש באפליקציה, אתה מצהיר שגילך הוא 14 ומעלה.",
          "אם אתה מתחת לגיל 18, אתה מצהיר שקיבלת אישור מהורה או אפוטרופוס חוקי להשתמש בשירות ושהם קראו והסכימו לתנאים אלה בשמך.",
          "אתה אחראי לשמירה על סודיות סיסמתך וחשבונך. כל פעילות שתתבצע דרך חשבונך היא באחריותך המלאה.",
          "אסור להעביר או למכור את חשבונך לאחר."
        ]
      },
      {
        icon: Users,
        title: "2. כללי התנהגות בקהילה ובשיעורים פרטיים",
        content: [
          "אנו פלטפורמה ללמידה. התנהג בכבוד לכל המשתמשים - תלמידים, מורים והורים.",
          "חל איסור מוחלט על הטרדה, איומים, דברי שטנה, או כל תוכן פוגעני אחר.",
          "שמור על פרטיותך ועל פרטיותם של אחרים. אין לשתף פרטים אישיים מזהים (מספרי טלפון, כתובות, רשתות חברתיות) בצ'אטים הציבוריים או הפרטיים. כל התקשורת צריכה להישאר בתוך האפליקקציה.",
          "השימוש באפליקציה למטרות שאינן לימודיות, לרבות פרסום, שידול או פעילות מסחרית, אסור בהחלט."
        ]
      },
      {
        icon: Brain,
        title: "3. שימוש ב-AI ובשירותי האפליקציה",
        content: [
          "שירותי ה-AI של Back2study נועדו לסייע בלמידה. השימוש בהם להעתקה או לכל סוג של רמאות אקדמית אסור.",
          "Back2study היא פלטפורמה המקשרת בין מורים לתלמידים. איננו צד לכל הסכם בין מורה לתלמיד, ואיננו אחראים על איכות ההוראה או תוצאות הלמידה. אנו מספקים כלים לאימות וביקורות כדי לסייע לך לקבל החלטה מושכלת."
        ]
      },
      {
        icon: FileText,
        title: "4. סיום שימוש ושינויים בתנאים",
        content: [
          "אנו שומרים לעצמנו את הזכות להשעות או לחסום חשבונות המפרים תנאים אלה, ללא הודעה מוקדמת.",
          "אנו עשויים לעדכן תנאים אלה מעת לעת. המשך שימושך באפליקציה לאחר עדכון מהווה הסכמה לתנאים החדשים."
        ]
      }
    ]
  },
  en: {
    title: "Terms of Service",
    lastUpdated: "Last Updated: July 29, 2024",
    backToApp: "Back to App",
    welcome: "Welcome to Back2study! We're excited to have you in our community. These terms are designed to ensure a safe, fair, and productive experience for everyone.",
    sections: [
      {
        icon: ShieldCheck,
        title: "1. User Account and Responsibility",
        content: [
          "The application is intended for users aged 14 and older. By using the app, you confirm that you are 14 years of age or older.",
          "If you are under 18, you represent that you have your parent or legal guardian's permission to use the Service and that they have read and agreed to these Terms on your behalf.",
          "You are responsible for maintaining the confidentiality of your password and account. All activities that occur under your account are your full responsibility.",
          "You may not transfer or sell your account to another person."
        ]
      },
      {
        icon: Users,
        title: "2. Community and Tutoring Conduct",
        content: [
          "We are a learning platform. Behave respectfully to all users—students, tutors, and parents.",
          "Harassment, threats, hate speech, or any other offensive content is strictly prohibited.",
          "Protect your privacy and the privacy of others. Do not share personally identifiable information (phone numbers, addresses, social media) in public or private chats. All communication should remain within the app.",
          "Using the app for non-educational purposes, including advertising, solicitation, or commercial activity, is strictly forbidden."
        ]
      },
      {
        icon: Brain,
        title: "3. Use of AI and App Services",
        content: [
          "Back2study's AI services are for learning assistance. Using them for plagiarism or any form of academic dishonesty is prohibited.",
          "Back2study is a platform connecting tutors and students. We are not a party to any agreement between a tutor and a student and are not responsible for teaching quality or learning outcomes. We provide verification and review tools to help you make informed decisions."
        ]
      },
      {
        icon: FileText,
        title: "4. Termination and Changes to Terms",
        content: [
          "We reserve the right to suspend or terminate accounts that violate these terms, without prior notice.",
          "We may update these terms from time to time. Your continued use of the app after an update constitutes acceptance of the new terms."
        ]
      }
    ]
  }
};

export default function TermsOfService() {
  const { language, themeClasses } = useTheme();
  const t = translations[language || 'en'];

  return (
    <div className={`min-h-screen ${themeClasses.background} p-4 md:p-8`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.backToApp}
          </Button>
        </div>
        
        <Card className={`${themeClasses.cardGlass}`}>
          <CardHeader className="text-center border-b border-white/20">
            <h1 className={`text-3xl md:text-4xl font-bold ${themeClasses.textPrimary}`}>{t.title}</h1>
            <p className={`${themeClasses.textMuted} text-sm`}>{t.lastUpdated}</p>
          </CardHeader>
          <CardContent className="p-6 md:p-8 space-y-6">
            <p className={`${themeClasses.textSecondary} text-center`}>{t.welcome}</p>
            {t.sections.map((section, index) => (
              <div key={index} className="space-y-3">
                <h2 className={`text-xl font-semibold flex items-center gap-3 ${themeClasses.textPrimary}`}>
                  <section.icon className="w-6 h-6 text-blue-400" />
                  {section.title}
                </h2>
                <ul className="list-disc list-inside space-y-2 pl-4 text-white/80">
                  {section.content.map((point, pIndex) => (
                    <li key={pIndex}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}