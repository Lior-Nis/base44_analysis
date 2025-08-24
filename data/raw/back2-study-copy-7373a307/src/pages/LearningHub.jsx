
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Subject } from "@/api/entities";
import { LearningPath } from "@/api/entities";
import { LearningSession } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  BookOpen, 
  Brain, 
  Play, 
  Plus, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  Star,
  Lightbulb,
  Target,
  TrendingUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { sendSlackNotification } from "@/api/functions";

import LearningPathViewer from "../components/learning/LearningPathViewer";
import AILearningChat from "../components/learning/AILearningChat";
import { useTheme } from "../components/ui/theme-provider";
import EmptyState from "../components/ui/empty-state"; // New import

const translations = {
  he: {
    learningHub: "מרכז הלמידה",
    myLearningPaths: "מסלולי הלמידה שלי",
    createNewPath: "צור מסלול חדש",
    browse: "עיון",
    topic: "נושא",
    subject: "מקצוע",
    selectSubject: "בחר מקצוע",
    difficulty: "רמת קושי",
    beginner: "מתחיל",
    intermediate: "בינוני",
    advanced: "מתקדם",
    topicPlaceholder: "לדוגמה: חוקי ניוטון, משוואות ריבועיות, מלחמת העולם השנייה...",
    create: "צור מסלול",
    creating: "יוצר מסלול...",
    lessons: "שיעורים",
    hours: "שעות",
    progress: "התקדמות",
    continue: "המשך",
    start: "התחל",
    completed: "הושלם",
    noPathsYet: "אין מסלולי לימוד עדיין",
    createFirst: "צור את המסלול הראשון שלך",
    aiWillCreate: "ה-AI יצור עבורך מסלול לימוד מותאם אישית",
    learningPaths: "מסלולי לימוד",
    availableLessons: "שיעורים זמינים", 
    averageProgress: "התקדמות ממוצעת",
    studyHours: "שעות לימוד",
    cancel: "ביטול"
  },
  en: {
    learningHub: "Learning Hub",
    myLearningPaths: "My Learning Paths",
    createNewPath: "Create New Path",
    browse: "Browse",
    topic: "Topic",
    subject: "Subject",
    selectSubject: "Select Subject",
    difficulty: "Difficulty",
    beginner: "Beginner",
    intermediate: "Intermediate", 
    advanced: "Advanced",
    topicPlaceholder: "e.g: Newton's Laws, Quadratic Equations, World War II...",
    create: "Create Path",
    creating: "Creating Path...",
    lessons: "Lessons",
    hours: "Hours",
    progress: "Progress",
    continue: "Continue",
    start: "Start",
    completed: "Completed",
    noPathsYet: "No learning paths yet",
    createFirst: "Create your first path",
    aiWillCreate: "AI will create a personalized learning path for you",
    learningPaths: "Learning Paths",
    availableLessons: "Available Lessons",
    averageProgress: "Average Progress", 
    studyHours: "Study Hours",
    cancel: "Cancel"
  }
};

export default function LearningHub() {
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [learningPaths, setLearningPaths] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activePathId, setActivePathId] = useState(null);
  
  const [formData, setFormData] = useState({
    topic: '',
    subject_id: '',
    difficulty_level: 'intermediate'
  });

  const { language, theme } = useTheme(); // Destructure theme
  const t = translations[language || 'en'];

  // Define theme-based classes
  const themeClasses = {
    background: theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50',
    textPrimary: theme === 'dark' ? 'text-gray-100' : 'text-gray-900',
    textSecondary: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
    textMuted: theme === 'dark' ? 'text-gray-500' : 'text-gray-600',
    cardGlass: theme === 'dark' ? 'bg-gray-800/70 backdrop-blur-sm border border-gray-700 shadow-lg' : 'bg-white/70 backdrop-blur-sm border-0 shadow-lg',
    cardSolid: theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900',
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      const [subjectsData, pathsData] = await Promise.all([
        Subject.filter({ created_by: userData.email }),
        LearningPath.filter({ created_by: userData.email })
      ]);

      setSubjects(subjectsData);
      setLearningPaths(pathsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createLearningPath = async () => {
    if (!formData.topic.trim()) return;

    setIsCreating(true);

    try {
      const selectedSubject = subjects.find(s => s.id === formData.subject_id);
      
      const prompt = `Create a detailed and structured learning path for the topic: "${formData.topic}"
      ${selectedSubject ? `In subject: ${selectedSubject.name}` : ''}
      Difficulty level: ${formData.difficulty_level}
      
      The path should include:
      1. Clear title and brief description
      2. 5-8 structured lessons in logical order
      3. For each lesson: title, detailed content, examples, key points and comprehension questions
      4. Time estimation in hours for the complete path
      
      Return in exact JSON format according to the schema.`;

      const response = await InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            estimated_hours: { type: "number" },
            lessons: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "string" },
                  title: { type: "string" },
                  content: { type: "string" },
                  examples: { type: "array", items: { type: "string" } },
                  key_points: { type: "array", items: { type: "string" } },
                  comprehension_questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string" },
                        answer: { type: "string" }
                      }
                    }
                  },
                  completed: { type: "boolean", default: false }
                }
              }
            }
          }
        }
      });

      // Add unique IDs to lessons
      response.lessons = response.lessons.map((lesson, index) => ({
        ...lesson,
        id: `lesson_${Date.now()}_${index}`,
        completed: false
      }));

      const pathData = {
        title: response.title,
        topic: formData.topic,
        subject_id: formData.subject_id,
        description: response.description,
        difficulty_level: formData.difficulty_level,
        estimated_hours: response.estimated_hours,
        lessons: response.lessons,
        progress: 0,
        ai_generated: true,
        chat_history: []
      };

      const newPath = await LearningPath.create(pathData);

      // Send Slack notification
      try {
        await sendSlackNotification({
          message: `🎓 New learning path created: "${response.title}"`,
          type: 'study',
          data: {
            'Topic': formData.topic,
            'Subject': selectedSubject?.name || 'General',
            'Difficulty': formData.difficulty_level,
            'Lessons': response.lessons.length,
            'Estimated Time': `${response.estimated_hours} hours`,
            'Creator': user.full_name
          }
        });
      } catch (slackError) {
        console.error('Failed to send Slack notification:', slackError);
      }

      setShowCreateDialog(false);
      setFormData({
        topic: '',
        subject_id: '',
        difficulty_level: 'intermediate'
      });
      loadData();

    } catch (error) {
      console.error('Error creating learning path:', error);
      alert(language === 'he' ? 'שגיאה ביצירת מסלול הלמידה. נסה שוב.' : 'Error creating learning path. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const calculateProgress = (path) => {
    if (!path.lessons || path.lessons.length === 0) return 0;
    const completed = path.lessons.filter(lesson => lesson.completed).length;
    return Math.round((completed / path.lessons.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (activePathId) {
    const activePath = learningPaths.find(p => p.id === activePathId);
    return (
      <LearningPathViewer 
        path={activePath}
        onExit={() => setActivePathId(null)}
        onUpdate={loadData} // Pass loadData to refresh on updates
        language={language || 'en'}
      />
    );
  }

  return (
    <div className={`min-h-screen ${themeClasses.background} p-4 md:p-8`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className={`w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center`}>
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <h1 className={`text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent`}>
              {t.learningHub}
            </h1>
          </div>
          <p className={`${themeClasses.textSecondary}`}>
            {language === 'he' ? 'למד עם AI מותאם אישית - מתחיל ועד מתקדם' : 'Learn with personalized AI - from beginner to advanced'}
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className={themeClasses.cardGlass}>
            <CardContent className="p-6 text-center">
              <div className={`text-2xl font-bold text-emerald-600`}>{learningPaths.length}</div>
              <div className={`text-sm ${themeClasses.textMuted}`}>{t.learningPaths}</div>
            </CardContent>
          </Card>
          
          <Card className={themeClasses.cardGlass}>
            <CardContent className="p-6 text-center">
              <div className={`text-2xl font-bold text-blue-600`}>
                {learningPaths.reduce((total, path) => total + (path.lessons?.length || 0), 0)}
              </div>
              <div className={`text-sm ${themeClasses.textMuted}`}>{t.availableLessons}</div>
            </CardContent>
          </Card>

          <Card className={themeClasses.cardGlass}>
            <CardContent className="p-6 text-center">
              <div className={`text-2xl font-bold text-purple-600`}>
                {learningPaths.length > 0 
                  ? Math.round(learningPaths.reduce((total, path) => total + calculateProgress(path), 0) / learningPaths.length)
                  : 0
                }%
              </div>
              <div className={`text-sm ${themeClasses.textMuted}`}>{t.averageProgress}</div>
            </CardContent>
          </Card>

          <Card className={themeClasses.cardGlass}>
            <CardContent className="p-6 text-center">
              <div className={`text-2xl font-bold text-yellow-600`}>
                {Math.round(learningPaths.reduce((total, path) => total + (path.estimated_hours || 0), 0))}
              </div>
              <div className={`text-sm ${themeClasses.textMuted}`}>{t.studyHours}</div>
            </CardContent>
          </Card>
        </div>

        {/* Create New Path Button */}
        <div className="flex justify-center mb-8">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button 
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-6 text-lg"
                size="lg"
              >
                <Brain className="w-6 h-6 mr-3" />
                {t.createNewPath}
              </Button>
            </DialogTrigger>
            <DialogContent className={`sm:max-w-md ${themeClasses.cardSolid} border-gray-700`}>
              <DialogHeader>
                <DialogTitle className={`flex items-center gap-2 ${themeClasses.textPrimary}`}>
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  {t.createNewPath}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="topic" className={themeClasses.textSecondary}>{t.topic}</Label>
                  <Textarea
                    id="topic"
                    value={formData.topic}
                    onChange={(e) => setFormData({...formData, topic: e.target.value})}
                    placeholder={t.topicPlaceholder}
                    rows={3}
                    className="resize-none bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                {subjects.length > 0 && (
                  <div>
                    <Label className={themeClasses.textSecondary}>{t.subject}</Label>
                    <Select 
                      value={formData.subject_id} 
                      onValueChange={(value) => setFormData({...formData, subject_id: value})}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder={t.selectSubject} />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 text-white border-gray-700">
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label className={themeClasses.textSecondary}>{t.difficulty}</Label>
                  <Select 
                    value={formData.difficulty_level} 
                    onValueChange={(value) => setFormData({...formData, difficulty_level: value})}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 text-white border-gray-700">
                      <SelectItem value="beginner">{t.beginner}</SelectItem>
                      <SelectItem value="intermediate">{t.intermediate}</SelectItem>
                      <SelectItem value="advanced">{t.advanced}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-blue-900/50 p-4 rounded-lg">
                  <p className="text-sm text-blue-300 text-center">
                    <Brain className="w-4 h-4 inline mr-2" />
                    {t.aiWillCreate}
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setShowCreateDialog(false)}
                    disabled={isCreating}
                  >
                    {t.cancel}
                  </Button>
                  <Button 
                    onClick={createLearningPath}
                    disabled={isCreating || !formData.topic.trim()}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                  >
                    {isCreating ? (
                      <>
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                        />
                        {t.creating}
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        {t.create}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Learning Paths */}
        {learningPaths.length === 0 ? (
          <EmptyState
            type="noData"
            title={t.noPathsYet}
            description={t.createFirst}
            actionText={t.createNewPath}
            onAction={() => setShowCreateDialog(true)}
            language={language}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningPaths.map((path, index) => {
              const progress = calculateProgress(path);
              return (
                <motion.div
                  key={path.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`${themeClasses.cardGlass} hover:shadow-xl transition-all duration-300 group hover:scale-105`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <CardTitle className={`text-lg font-bold ${themeClasses.textPrimary} mb-2 line-clamp-2`}>
                            {path.title}
                          </CardTitle>
                          <p className={`text-sm ${themeClasses.textSecondary} line-clamp-2 mb-3`}>
                            {path.description}
                          </p>
                        </div>
                        {progress === 100 && (
                          <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge className={`${getDifficultyColor(path.difficulty_level)}`}>
                          {t[path.difficulty_level]}
                        </Badge>
                        <Badge variant="outline" className={`border-white/20 ${themeClasses.textSecondary}`}>
                          <BookOpen className="w-3 h-3 mr-1" />
                          {path.lessons?.length || 0} {t.lessons}
                        </Badge>
                        <Badge variant="outline" className={`border-white/20 ${themeClasses.textSecondary}`}>
                          <Clock className="w-3 h-3 mr-1" />
                          {path.estimated_hours || 0} {t.hours}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className={themeClasses.textSecondary}>{t.progress}</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <Button
                        onClick={() => setActivePathId(path.id)}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                      >
                        {progress > 0 && progress < 100 ? (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            {t.continue}
                          </>
                        ) : (
                          <>
                            <Star className="w-4 h-4 mr-2" />
                            {progress === 100 ? t.completed : t.start}
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
