
import React, { useState, useEffect, useCallback } from "react";
import { LearningPath } from "@/api/entities";
import { LearningSession } from "@/api/entities";
import { Achievement } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Circle, 
  MessageSquare, 
  Clock, 
  BookOpen,
  Lightbulb,
  HelpCircle,
  ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import AILearningChat from "./AILearningChat";
import { useTheme } from '../ui/theme-provider';
import { useToast } from '../ui/use-toast';

const translations = {
  he: {
    backToHub: "חזור למרכז הלמידה",
    lesson: "שיעור",
    of: "מתוך",
    content: "תוכן",
    examples: "דוגמאות",
    keyPoints: "נקודות מפתח",
    questions: "שאלות הבנה",
    aiChat: "צ'אט עם AI",
    markComplete: "סמן כהושלם",
    markIncomplete: "בטל השלמה",
    nextLesson: "השיעור הבא",
    previousLesson: "השיעור הקודם",
    completed: "הושלם",
    progress: "התקדמות",
    askAI: "שאל את ה-AI",
    chatPlaceholder: "שאל שאלה על השיעור או בקש הסבר נוסף...",
    loadingError: "שגיאה בטעינת השיעור"
  },
  en: {
    backToHub: "Back to Learning Hub",
    lesson: "Lesson",
    of: "of",
    content: "Content",
    examples: "Examples", 
    keyPoints: "Key Points",
    questions: "Comprehension Questions",
    aiChat: "AI Chat",
    markComplete: "Mark Complete",
    markIncomplete: "Mark Incomplete",
    nextLesson: "Next Lesson",
    previousLesson: "Previous Lesson",
    completed: "Completed",
    progress: "Progress",
    askAI: "Ask AI",
    chatPlaceholder: "Ask a question about the lesson or request additional explanation...",
    loadingError: "Error loading lesson"
  }
};

export default function LearningPathViewer({ path, onExit, onUpdate, language = 'he' }) {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [sessionStart, setSessionStart] = useState(new Date());
  const [showChat, setShowChat] = useState(false); // This state isn't used in the updated code, can be removed if not planned for future use
  const [localPath, setLocalPath] = useState(path);
  const { toast } = useToast();

  const t = translations[language];
  const { themeClasses } = useTheme();

  useEffect(() => {
    loadUser();
    // Find first incomplete lesson
    const firstIncomplete = path.lessons?.findIndex(lesson => !lesson.completed);
    if (firstIncomplete !== -1) {
      setCurrentLessonIndex(firstIncomplete);
    }
    setLocalPath(path); // Initialize localPath when path prop changes
  }, [path]);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const currentLesson = localPath.lessons?.[currentLessonIndex];
  const progress = localPath.lessons ? Math.round((localPath.lessons.filter(l => l.completed).length / localPath.lessons.length) * 100) : 0;

  const grantPathCompletionAchievement = async (completedPath) => {
    if (!user) return;
    try {
      const existingAchievements = await Achievement.filter({
        user_id: user.id,
        'metadata.path_id': completedPath.id,
        type: 'path_completed'
      });

      if (existingAchievements.length === 0) {
        const achievementTitle = language === 'he' ? `מומחה ב: ${completedPath.title}` : `Mastered: ${completedPath.title}`;
        const achievementDescription = language === 'he' ? `השלמת בהצלחה את מסלול הלמידה בנושא "${completedPath.topic}".` : `You have successfully completed the learning path for "${completedPath.topic}".`;
        
        await Achievement.create({
          user_id: user.id,
          type: 'path_completed',
          title: achievementTitle,
          description: achievementDescription,
          icon: '🎓',
          points: 250,
          date_earned: new Date().toISOString(),
          metadata: {
            path_id: completedPath.id,
            path_title: completedPath.title
          }
        });

        toast({
          title: language === 'he' ? "הישג חדש!" : "New Achievement!",
          description: achievementTitle,
          variant: "success",
        });
      }
    } catch (error) {
      console.error("Failed to grant achievement:", error);
    }
  };

  const toggleLessonComplete = async () => {
    if (!currentLesson || !user) return;

    const wasCompleted = currentLesson.completed;
    const updatedLessons = [...localPath.lessons];
    updatedLessons[currentLessonIndex] = {
      ...currentLesson,
      completed: !wasCompleted,
      completion_date: !wasCompleted ? new Date().toISOString() : null
    };

    const newProgress = Math.round((updatedLessons.filter(l => l.completed).length / updatedLessons.length) * 100);
    const updatedPathData = { ...localPath, lessons: updatedLessons, progress: newProgress };
    
    setLocalPath(updatedPathData);

    // Check for achievement on completion
    if (!wasCompleted && newProgress === 100) {
      grantPathCompletionAchievement(path);
    }

    try {
      // Record learning session only on completion
      if (!wasCompleted) {
        await LearningSession.create({
          learning_path_id: path.id,
          lesson_id: currentLesson.id,
          user_id: user.id,
          start_time: sessionStart.toISOString(),
          end_time: new Date().toISOString(),
          duration_minutes: Math.max(1, Math.round((new Date().getTime() - sessionStart.getTime()) / 60000)),
        });
      }

      await LearningPath.update(path.id, { lessons: updatedLessons, progress: newProgress });
      onUpdate(); // Notify parent to refresh data
    } catch (error) {
      console.error('Error updating lesson:', error);
      setLocalPath(path); // Revert on error
    }
  };

  const navigateLesson = (direction) => {
    const newIndex = currentLessonIndex + direction;
    if (newIndex >= 0 && newIndex < localPath.lessons.length) {
      setCurrentLessonIndex(newIndex);
      setSessionStart(new Date());
    }
  };
  
  const handleChatHistoryUpdate = useCallback((newChatHistory) => {
    const updatedPath = { ...localPath, chat_history: newChatHistory };
    setLocalPath(updatedPath);
    // Debounce this in a real app, for now we save on each message
    LearningPath.update(localPath.id, { chat_history: newChatHistory }).catch(e => console.error("Failed to save chat history", e));
  }, [localPath]);


  if (!currentLesson) {
    return (
      <div className={`min-h-screen ${themeClasses.background} p-8`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`text-2xl font-bold ${themeClasses.textPrimary} mb-4`}>{t.loadingError}</h2>
          <Button onClick={onExit}>{t.backToHub}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeClasses.background}`}>
      {/* Header */}
      <div className={`${themeClasses.cardGlass} sticky top-0 z-20`}>
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={onExit}
              className={`flex items-center gap-2 ${themeClasses.textSecondary}`}
            >
              <ChevronLeft className="w-4 h-4" />
              {t.backToHub}
            </Button>
            
            <div className="text-center">
              <h1 className={`text-xl font-bold ${themeClasses.textPrimary}`}>{localPath.title}</h1>
              <p className={themeClasses.textMuted}>
                {t.lesson} {currentLessonIndex + 1} {t.of} {localPath.lessons.length}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className={`text-sm ${themeClasses.textMuted}`}>{t.progress}</div>
                <div className="font-bold text-emerald-600">{progress}%</div>
              </div>
              <div className="w-24">
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className={themeClasses.cardGlass}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-xl font-bold ${themeClasses.textPrimary} flex items-center gap-2`}>
                    {currentLesson.completed ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400" />
                    )}
                    {currentLesson.title}
                  </CardTitle>
                  <Button
                    onClick={toggleLessonComplete}
                    variant={currentLesson.completed ? "outline" : "default"}
                    className={currentLesson.completed ? "" : "bg-emerald-600 hover:bg-emerald-700 text-white"}
                  >
                    {currentLesson.completed ? t.markIncomplete : t.markComplete}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="content" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="content">{t.content}</TabsTrigger>
                    <TabsTrigger value="examples">{t.examples}</TabsTrigger>
                    <TabsTrigger value="keyPoints">{t.keyPoints}</TabsTrigger>
                    <TabsTrigger value="questions">{t.questions}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="content" className="space-y-4">
                    <div className="prose prose-slate max-w-none">
                      <div className={`whitespace-pre-wrap ${themeClasses.textSecondary} leading-relaxed text-lg`}>
                        {currentLesson.content}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="examples" className="space-y-4">
                    {currentLesson.examples && currentLesson.examples.length > 0 ? (
                      <div className="space-y-4">
                        {currentLesson.examples.map((example, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-blue-500/10 border-l-4 border-blue-400 p-4 rounded-lg"
                          >
                            <div className="flex items-start gap-3">
                              <Lightbulb className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                              <p className={themeClasses.textSecondary}>{example}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className={`text-center py-8 ${themeClasses.textMuted}`}>
                        {language === 'he' ? 'אין דוגמאות זמינות לשיעור זה' : 'No examples available for this lesson'}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="keyPoints" className="space-y-4">
                    {currentLesson.key_points && currentLesson.key_points.length > 0 ? (
                      <div className="space-y-3">
                        {currentLesson.key_points.map((point, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start gap-3 p-3 bg-emerald-500/10 rounded-lg border-l-4 border-emerald-400"
                          >
                            <CheckCircle className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" />
                            <p className={`${themeClasses.textSecondary} font-medium`}>{point}</p>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className={`text-center py-8 ${themeClasses.textMuted}`}>
                        {language === 'he' ? 'אין נקודות מפתח זמינות לשיעור זה' : 'No key points available for this lesson'}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="questions" className="space-y-4">
                    {currentLesson.comprehension_questions && currentLesson.comprehension_questions.length > 0 ? (
                      <div className="space-y-6">
                        {currentLesson.comprehension_questions.map((qa, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4"
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <HelpCircle className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                              <h4 className={`font-semibold ${themeClasses.textPrimary}`}>{qa.question}</h4>
                            </div>
                            <div className={`ml-8 p-3 rounded border ${themeClasses.cardSolid} border-gray-700`}>
                              <p className={themeClasses.textSecondary}>{qa.answer}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className={`text-center py-8 ${themeClasses.textMuted}`}>
                        {language === 'he' ? 'אין שאלות הבנה זמינות לשיעור זה' : 'No comprehension questions available for this lesson'}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                {/* Navigation */}
                <div className="flex justify-between items-center pt-8 border-t border-white/10 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => navigateLesson(-1)}
                    disabled={currentLessonIndex === 0}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {t.previousLesson}
                  </Button>

                  <span className={`text-sm ${themeClasses.textMuted}`}>
                    {currentLessonIndex + 1} / {localPath.lessons.length}
                  </span>

                  <Button
                    onClick={() => navigateLesson(1)}
                    disabled={currentLessonIndex === localPath.lessons.length - 1}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {t.nextLesson}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Chat Sidebar */}
          <div className="lg:col-span-1">
            <Card className={`${themeClasses.cardGlass} h-fit sticky top-24`}>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 text-lg ${themeClasses.textPrimary}`}>
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                  {t.aiChat}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AILearningChat 
                  path={localPath}
                  currentLesson={currentLesson}
                  onHistoryUpdate={handleChatHistoryUpdate}
                  language={language}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
