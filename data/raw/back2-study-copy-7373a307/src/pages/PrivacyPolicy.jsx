import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Database, UserCheck, Settings, ArrowLeft } from 'lucide-react';
import { useTheme } from '../components/ui/theme-provider';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const translations = {
  he: {
    title: "מדיניות פרטיות",
    lastUpdated: "עדכון אחרון: 29 ביולי 2024",
    backToApp: "חזור לאפליקציה",
    intro: "הפרטיות שלך חשובה לנו מאוד. מדיניות זו מסבירה איזה מידע אנו אוספים, מדוע, וכיצד אנו מגנים עליו.",
    sections: [
      {
        icon: Database,
        title: "1. איזה מידע אנו אוספים?",
        content: [
          "מידע שאתה מספק: שם, אימייל, גיל/כיתה, העדפות למידה, והתוכן שאתה יוצר באפליקציה (הודעות, הערות).",
          "מידע על שימוש: נתוני אינטראקציה עם האפליקציה, כגון שימוש בתכונות, זמן שהייה והתקדמות למידה.",
          "מידע טכני: סוג מכשיר, מערכת הפעלה וכתובת IP (באופן אנונימי).",
          "מידע אימות למורים: מסמכים לאימות זהות (נשמרים באופן מאובטח ומוצפן ואינם נגישים לאחר תהליך האימות)."
        ]
      },
      {
        icon: UserCheck,
        title: "2. כיצד אנו משתמשים במידע?",
        content: [
          "כדי לספק ולשפר את השירות: תפעול האפליקציה, התאמה אישית של חווית הלמידה, ופיתוח תכונות חדשות.",
          "לצורך בטיחות וביטחון: ניטור ומניעת הונאות, הטרדות והפרות של תנאי השימוש.",
          "שיפור מודלי AI: אינטראקציות עם ה-AI (באופן אנונימי) משמשות לאימון ושיפור יכולותיו, כדי להעניק לך תשובות טובות יותר.",
          "לתקשורת: שליחת עדכונים חשובים על חשבונך או על שינויים בשירות."
        ]
      },
      {
        icon: Lock,
        title: "3. שיתוף מידע ואבטחה",
        content: [
          "אנחנו לא מוכרים את המידע האישי שלך. לעולם.",
          "הפרטים המזהים שלך (שם מלא, אימייל, מספר טלפון) אינם מוצגים למשתמשים אחרים. התקשורת מתבצעת באופן אנונימי דרך הפלטפורמה.",
          "אנו משתמשים באמצעי אבטחה מתקדמים, כולל הצפנה, כדי להגן על המידע שלך.",
          "מידע עשוי להיות משותף עם ספקי שירותים חיצוניים (כמו שירותי ענן) הכפופים גם הם למדיניות פרטיות מחמירה, או אם נידרש לכך על פי חוק."
        ]
      },
      {
        icon: Settings,
        title: "4. הזכויות והבחירות שלך",
        content: [
          "תוכל לגשת, לעדכן או לבקש למחוק את המידע האישי שלך דרך הגדרות הפרופיל או על ידי פנייה אלינו.",
          "האפליקציה אינה מיועדת לילדים מתחת לגיל 14, ואנו לא אוספים ביודעין מידע מקבוצת גיל זו."
        ]
      }
    ]
  },
  en: {
    title: "Privacy Policy",
    lastUpdated: "Last Updated: July 29, 2024",
    backToApp: "Back to App",
    intro: "Your privacy is critically important to us. This policy explains what information we collect, why, and how we protect it.",
    sections: [
      {
        icon: Database,
        title: "1. What Information Do We Collect?",
        content: [
          "Information you provide: Name, email, age/grade, learning preferences, and the content you create in the app (messages, notes).",
          "Usage information: Interaction data with the app, such as feature usage, time spent, and learning progress.",
          "Technical information: Device type, operating system, and IP address (anonymized).",
          "Tutor verification information: Identity verification documents (stored securely, encrypted, and inaccessible after the verification process)."
        ]
      },
      {
        icon: UserCheck,
        title: "2. How Do We Use Your Information?",
        content: [
          "To provide and improve the service: Operating the app, personalizing your learning experience, and developing new features.",
          "For safety and security: Monitoring and preventing fraud, harassment, and violations of our terms.",
          "To improve AI models: Interactions with the AI (anonymized) are used to train and improve its capabilities, to give you better answers.",
          "For communication: Sending you important updates about your account or changes to the service."
        ]
      },
      {
        icon: Lock,
        title: "3. Information Sharing and Security",
        content: [
          "We do not sell your personal information. Ever.",
          "Your identifiable information (full name, email, phone number) is not displayed to other users. Communication is handled anonymously through the platform.",
          "We use advanced security measures, including encryption, to protect your data.",
          "Information may be shared with third-party service providers (like cloud services) who are also subject to strict privacy policies, or if we are required to do so by law."
        ]
      },
      {
        icon: Settings,
        title: "4. Your Rights and Choices",
        content: [
          "You can access, update, or request to delete your personal information through your profile settings or by contacting us.",
          "The application is not intended for children under 14, and we do not knowingly collect data from this age group."
        ]
      }
    ]
  }
};

export default function PrivacyPolicy() {
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
            <p className={`${themeClasses.textSecondary} text-center`}>{t.intro}</p>
            {t.sections.map((section, index) => (
              <div key={index} className="space-y-3">
                <h2 className={`text-xl font-semibold flex items-center gap-3 ${themeClasses.textPrimary}`}>
                  <section.icon className="w-6 h-6 text-purple-400" />
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