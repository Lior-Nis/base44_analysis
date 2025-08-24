import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Sparkles } from "lucide-react";

export default function WelcomeCard({ user, language }) {
  const isRTL = language === 'he';
  
  const messages = {
    he: {
      welcome: "ברוך הבא",
      subtitle: "בואו נתחיל יום פרודוקטיבי של לימודים!",
      motivation: "כל יום הוא הזדמנות חדשה ללמוד משהו מעניין"
    },
    en: {
      welcome: "Welcome back",
      subtitle: "Let's start a productive day of learning!",
      motivation: "Every day is a new opportunity to learn something amazing"
    }
  };
  
  const t = messages[language];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 border-0 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-4 right-4 opacity-20">
          <Sparkles className="w-24 h-24" />
        </div>
        <CardContent className="p-8 relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-6 h-6 text-yellow-300 fill-current" />
            <h2 className="text-2xl font-bold">
              {t.welcome}, {user?.full_name?.split(' ')[0] || 'Student'}!
            </h2>
          </div>
          <p className="text-blue-100 text-lg mb-2">{t.subtitle}</p>
          <p className="text-blue-200 text-sm">{t.motivation}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}