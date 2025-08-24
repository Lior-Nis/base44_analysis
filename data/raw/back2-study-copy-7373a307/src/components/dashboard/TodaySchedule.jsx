
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, BookOpen, CheckCircle2, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useTheme } from '../ui/theme-provider';

export default function TodaySchedule({ plans, language }) {
  const { themeClasses } = useTheme();

  const messages = {
    he: {
      todayPlan: "תוכנית להיום",
      noPlans: "אין תוכניות לימוד להיום",
      createPlan: "צור תוכנית חדשה",
      minutes: "דקות",
      completed: "הושלם",
      pending: "ממתין",
      startNow: "התחל עכשיו"
    },
    en: {
      todayPlan: "Today's Plan",
      noPlans: "No study plans for today", 
      createPlan: "Create New Plan",
      minutes: "minutes",
      completed: "Completed",
      pending: "Pending",
      startNow: "Start Now"
    }
  };
  
  const t = messages[language];

  const getTodaysTasks = () => {
    const today = new Date().toDateString();
    const tasks = [];
    
    plans.forEach(plan => {
      plan.content?.forEach(item => {
        if (new Date(item.date).toDateString() === today) {
          tasks.push({
            ...item,
            planTitle: plan.title,
            subjectId: plan.subject_id
          });
        }
      });
    });
    
    return tasks.sort((a, b) => a.completed - b.completed);
  };

  const todaysTasks = getTodaysTasks();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className={`${themeClasses.cardGlass} h-full`}>
        <CardHeader className="pb-3 md:pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className={`text-lg md:text-xl font-bold ${themeClasses.textPrimary} flex items-center gap-2`}>
              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
              {t.todayPlan}
            </CardTitle>
            <Link to={createPageUrl("StudyPlanner")}>
              <Button variant="ghost" size="icon" className="text-blue-300 hover:text-blue-200 w-6 h-6 md:w-8 md:h-8">
                <Plus className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {todaysTasks.length === 0 ? (
            <div className="text-center py-6 md:py-8">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-white/30" />
              </div>
              <p className={`${themeClasses.textMuted} mb-3 md:mb-4 text-sm md:text-base`}>{t.noPlans}</p>
              <Link to={createPageUrl("StudyPlanner")}>
                <Button variant="outline" className="text-white/80 border-white/20 bg-white/10 hover:bg-white/20 text-xs md:text-sm">
                  {t.createPlan}
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2 md:space-y-3">
              {todaysTasks.slice(0, 4).map((task, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className={`p-2 md:p-3 rounded-lg border transition-all duration-300 ${
                    task.completed 
                      ? 'bg-green-500/10 border-green-500/20' 
                      : 'bg-white/10 border-white/20 hover:bg-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold text-sm md:text-base truncate ${task.completed ? 'text-green-300 line-through' : themeClasses.textPrimary}`}>
                          {task.topic}
                        </h4>
                        <p className={`text-xs md:text-sm truncate ${task.completed ? 'text-green-400/70' : themeClasses.textMuted}`}>{task.planTitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className={`flex items-center gap-1 text-xs ${themeClasses.textMuted}`}>
                        <Clock className="w-3 h-3" />
                        <span className="hidden sm:inline">{task.duration} {t.minutes}</span>
                        <span className="sm:hidden">{task.duration}'</span>
                      </div>
                      {!task.completed && (
                        <Button size="sm" variant="ghost" className="h-6 px-2 text-blue-300 hover:bg-blue-500/20 hover:text-blue-200 text-xs">
                          {t.startNow}
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
