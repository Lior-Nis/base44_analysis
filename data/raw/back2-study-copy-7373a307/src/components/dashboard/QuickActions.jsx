
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Brain, Users, BookOpen, Calendar, Sparkles, MapPin, Briefcase } from "lucide-react";
import { useTheme } from '../ui/theme-provider';

export default function QuickActions({ language }) {
  const { themeClasses } = useTheme();
  
  const messages = {
    he: {
      quickActions: "פעולות מהירות",
      askAI: "שאל את ה-AI",
      joinCircle: "הצטרף לחוג",
      addSubject: "הוסף מקצוע",
      createPlan: "צור תוכנית",
      liveCampus: "קמפוס LIVE",
      privateLessons: "שיעורים פרטיים"
    },
    en: {
      quickActions: "Quick Actions",
      askAI: "Ask AI",
      joinCircle: "Join Circle", 
      addSubject: "Add Subject",
      createPlan: "Create Plan",
      liveCampus: "Live Campus",
      privateLessons: "Private Lessons"
    }
  };
  
  const t = messages[language];

  const actions = [
    { title: t.askAI, icon: Brain, href: createPageUrl("AITutor"), color: "from-orange-400 to-yellow-400", bgColor: "bg-orange-500/10" },
    { title: t.privateLessons, icon: Briefcase, href: createPageUrl("PrivateLessons"), color: "from-emerald-400 to-teal-400", bgColor: "bg-emerald-500/10" },
    { title: t.liveCampus, icon: MapPin, href: createPageUrl("Campus"), color: "from-cyan-400 to-blue-400", bgColor: "bg-cyan-500/10" },
    { title: t.joinCircle, icon: Users, href: createPageUrl("StudyCircles"), color: "from-purple-400 to-pink-400", bgColor: "bg-purple-500/10" },
    { title: t.addSubject, icon: BookOpen, href: createPageUrl("Subjects"), color: "from-blue-400 to-indigo-400", bgColor: "bg-blue-500/10" },
    { title: t.createPlan, icon: Calendar, href: createPageUrl("StudyPlanner"), color: "from-green-400 to-emerald-400", bgColor: "bg-green-500/10" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className={`${themeClasses.cardGlass} mb-6 md:mb-8`}>
        <CardHeader className="pb-3 md:pb-4">
          <CardTitle className={`text-lg md:text-xl font-bold ${themeClasses.textPrimary} flex items-center gap-2`}>
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
            {t.quickActions}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile: 2 columns, Tablet: 3 columns, Desktop: 6 columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {actions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Link to={action.href}>
                  <Button 
                    variant="ghost" 
                    className={`w-full h-20 md:h-24 flex flex-col items-center justify-center gap-1 md:gap-2 ${action.bgColor} hover:bg-white/20 p-2 md:p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300 group hover:scale-105`}
                  >
                    <div className={`w-6 h-6 md:w-8 md:h-8 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className="w-3 h-3 md:w-4 md:h-4 text-white" />
                    </div>
                    <span className={`text-xs text-center font-medium leading-tight ${themeClasses.textSecondary} group-hover:text-white transition-colors duration-300`}>
                      {action.title}
                    </span>
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
