import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { StudyMaterial } from "@/api/entities";
import { Quiz } from "@/api/entities";
import { Subject } from "@/api/entities";
import { LearningPath } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Trash2, 
  Brain, 
  FileText, 
  HelpCircle,
  Users,
  BarChart3,
  Settings,
  Upload,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../components/ui/theme-provider";
import { useToast } from "@/components/ui/use-toast";
import EmptyState from "../components/ui/empty-state";

const translations = {
  he: {
    contentManagement: "ניהול תוכן",
    materials: "חומרי לימוד",
    quizzes: "בחנים",
    learningPaths: "מסלולי למידה",
    subjects: "מקצועות",
    analytics: "אנליטיקה",
    createMaterial: "צור חומר לימוד",
    createQuiz: "צור בחן",
    createPath: "צור מסלול",
    title: "כותרת",
    description: "תיאור",
    content: "תוכן",
    subject: "מקצוע",
    selectSubject: "בחר מקצוע",
    type: "סוג",
    summary: "סיכום",
    flashcard: "כרטיס זכרון",
    quiz: "בחן",
    notes: "הערות",
    difficulty: "רמת קושי",
    beginner: "מתחיל",
    intermediate: "בינוני",
    advanced: "מתקדם",
    save: "שמור",
    cancel: "ביטול",
    edit: "ערוך",
    delete: "מחק",
    noMaterials: "אין חומרי לימוד",
    noQuizzes: "אין בחנים",
    noPaths: "אין מסלולי למידה",
    createFirst: "צור את הראשון",
    aiGenerated: "נוצר על ידי AI",
    manuallyCreated: "נוצר ידנית",
    published: "פורסם",
    draft: "טיוטה",
    question: "שאלה",
    addQuestion: "הוסף שאלה",
    answer: "תשובה",
    correctAnswer: "תשובה נכונה",
    explanation: "הסבר",
    options: "אפשרויות",
    timeLimit: "זמן מוגבל (דקות)",
    totalMaterials: "סך חומרים",
    totalQuizzes: "סך בחנים",
    totalPaths: "סך מסלולים",
    activeStudents: "תלמידים פעילים"
  },
  en: {
    contentManagement: "Content Management",
    materials: "Study Materials",
    quizzes: "Quizzes",
    learningPaths: "Learning Paths",
    subjects: "Subjects",
    analytics: "Analytics",
    createMaterial: "Create Material",
    createQuiz: "Create Quiz",
    createPath: "Create Path",
    title: "Title",
    description: "Description",
    content: "Content",
    subject: "Subject",
    selectSubject: "Select Subject",
    type: "Type",
    summary: "Summary",
    flashcard: "Flashcard",
    quiz: "Quiz",
    notes: "Notes",
    difficulty: "Difficulty",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    noMaterials: "No materials yet",
    noQuizzes: "No quizzes yet",
    noPaths: "No learning paths yet",
    createFirst: "Create the first one",
    aiGenerated: "AI Generated",
    manuallyCreated: "Manually Created",
    published: "Published",
    draft: "Draft",
    question: "Question",
    addQuestion: "Add Question",
    answer: "Answer",
    correctAnswer: "Correct Answer",
    explanation: "Explanation",
    options: "Options",
    timeLimit: "Time Limit (minutes)",
    totalMaterials: "Total Materials",
    totalQuizzes: "Total Quizzes",
    totalPaths: "Total Paths",
    activeStudents: "Active Students"
  }
};

export default function ContentManagement() {
  const [user, setUser] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [learningPaths, setLearningPaths] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('materials');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form states
  const [materialForm, setMaterialForm] = useState({
    title: '',
    content: '',
    type: 'summary',
    subject_id: '',
    ai_generated: false
  });

  const [quizForm, setQuizForm] = useState({
    title: '',
    subject_id: '',
    questions: [{ question: '', options: ['', '', '', ''], correct_answer: 0, explanation: '' }],
    difficulty: 'medium',
    time_limit: 10
  });

  const { themeClasses, language } = useTheme();
  const { toast } = useToast();
  const t = translations[language || 'en'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const userData = await User.me();
      setUser(userData);

      // Check if user has content management permissions
      if (!userData.role || (userData.role !== 'admin' && !userData.is_tutor)) {
        toast({
          title: language === 'he' ? "אין הרשאה" : "Access Denied",
          description: language === 'he' ? "אין לך הרשאה לגשת לדף זה" : "You don't have permission to access this page",
          variant: "destructive"
        });
        return;
      }

      const [materialsData, quizzesData, pathsData, subjectsData] = await Promise.all([
        StudyMaterial.list('-created_date', 100),
        Quiz.list('-created_date', 100),
        LearningPath.list('-created_date', 50),
        Subject.list()
      ]);

      setMaterials(materialsData);
      setQuizzes(quizzesData);
      setLearningPaths(pathsData);
      setSubjects(subjectsData);

    } catch (error) {
      console.error('Error loading content management data:', error);
      toast({
        title: language === 'he' ? "שגיאה" : "Error",
        description: language === 'he' ? "שגיאה בטעינת הנתונים" : "Error loading data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMaterial = async () => {
    try {
      await StudyMaterial.create(materialForm);
      toast({
        title: language === 'he' ? "נוצר בהצלחה" : "Created Successfully",
        description: language === 'he' ? "החומר נוצר בהצלחה" : "Material created successfully",
        variant: "success"
      });
      setShowCreateDialog(false);
      setMaterialForm({ title: '', content: '', type: 'summary', subject_id: '', ai_generated: false });
      loadData();
    } catch (error) {
      toast({
        title: language === 'he' ? "שגיאה" : "Error",
        description: language === 'he' ? "שגיאה ביצירת החומר" : "Error creating material",
        variant: "destructive"
      });
    }
  };

  const handleCreateQuiz = async () => {
    try {
      await Quiz.create(quizForm);
      toast({
        title: language === 'he' ? "נוצר בהצלחה" : "Created Successfully",
        description: language === 'he' ? "הבחן נוצר בהצלחה" : "Quiz created successfully",
        variant: "success"
      });
      setShowCreateDialog(false);
      setQuizForm({
        title: '', subject_id: '', questions: [{ question: '', options: ['', '', '', ''], correct_answer: 0, explanation: '' }],
        difficulty: 'medium', time_limit: 10
      });
      loadData();
    } catch (error) {
      toast({
        title: language === 'he' ? "שגיאה" : "Error",
        description: language === 'he' ? "שגיאה ביצירת הבחן" : "Error creating quiz",
        variant: "destructive"
      });
    }
  };

  const addQuizQuestion = () => {
    setQuizForm(prev => ({
      ...prev,
      questions: [...prev.questions, { question: '', options: ['', '', '', ''], correct_answer: 0, explanation: '' }]
    }));
  };

  const updateQuizQuestion = (index, field, value) => {
    setQuizForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => i === index ? { ...q, [field]: value } : q)
    }));
  };

  const updateQuizOption = (questionIndex, optionIndex, value) => {
    setQuizForm(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { ...q, options: q.options.map((opt, j) => j === optionIndex ? value : opt) }
          : q
      )
    }));
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${themeClasses.background}`}>
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && !user.is_tutor)) {
    return (
      <div className={`min-h-screen ${themeClasses.background} flex items-center justify-center`}>
        <EmptyState
          type="noPermission"
          title={language === 'he' ? "אין הרשאה" : "Access Denied"}
          description={language === 'he' ? "אין לך הרשאה לגשת לדף זה" : "You don't have permission to access this page"}
          language={language}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeClasses.background} p-4 md:p-8`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {t.contentManagement}
            </h1>
            <p className={`${themeClasses.textSecondary} mt-2`}>
              {language === 'he' ? 'נהל חומרי לימוד, בחנים ומסלולי למידה' : 'Manage study materials, quizzes, and learning paths'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
              {language === 'he' ? `${materials.length + quizzes.length} פריטי תוכן` : `${materials.length + quizzes.length} Content Items`}
            </Badge>
          </div>
        </motion.div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className={themeClasses.cardGlass}>
            <CardContent className="p-6 text-center">
              <FileText className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className={`text-2xl font-bold ${themeClasses.textPrimary}`}>{materials.length}</div>
              <div className={`text-sm ${themeClasses.textMuted}`}>{t.totalMaterials}</div>
            </CardContent>
          </Card>
          
          <Card className={themeClasses.cardGlass}>
            <CardContent className="p-6 text-center">
              <HelpCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className={`text-2xl font-bold ${themeClasses.textPrimary}`}>{quizzes.length}</div>
              <div className={`text-sm ${themeClasses.textMuted}`}>{t.totalQuizzes}</div>
            </CardContent>
          </Card>
          
          <Card className={themeClasses.cardGlass}>
            <CardContent className="p-6 text-center">
              <BookOpen className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className={`text-2xl font-bold ${themeClasses.textPrimary}`}>{learningPaths.length}</div>
              <div className={`text-sm ${themeClasses.textMuted}`}>{t.totalPaths}</div>
            </CardContent>
          </Card>
          
          <Card className={themeClasses.cardGlass}>
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className={`text-2xl font-bold ${themeClasses.textPrimary}`}>0</div>
              <div className={`text-sm ${themeClasses.textMuted}`}>{t.activeStudents}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm border border-white/20">
            <TabsTrigger value="materials" className="data-[state=active]:bg-blue-500/20">
              <FileText className="w-4 h-4 mr-2" />
              {t.materials}
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="data-[state=active]:bg-green-500/20">
              <HelpCircle className="w-4 h-4 mr-2" />
              {t.quizzes}
            </TabsTrigger>
            <TabsTrigger value="paths" className="data-[state=active]:bg-purple-500/20">
              <BookOpen className="w-4 h-4 mr-2" />
              {t.learningPaths}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-yellow-500/20">
              <BarChart3 className="w-4 h-4 mr-2" />
              {t.analytics}
            </TabsTrigger>
          </TabsList>

          {/* Study Materials Tab */}
          <TabsContent value="materials" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl font-semibold ${themeClasses.textPrimary}`}>{t.materials}</h2>
              <Dialog open={showCreateDialog && activeTab === 'materials'} onOpenChange={(open) => setShowCreateDialog(open && activeTab === 'materials')}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    {t.createMaterial}
                  </Button>
                </DialogTrigger>
                <DialogContent className={`${themeClasses.cardSolid} border-gray-700 max-w-2xl`}>
                  <DialogHeader>
                    <DialogTitle className={themeClasses.textPrimary}>{t.createMaterial}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>{t.title}</Label>
                      <Input 
                        value={materialForm.title}
                        onChange={(e) => setMaterialForm({...materialForm, title: e.target.value})}
                        placeholder={t.title}
                      />
                    </div>
                    <div>
                      <Label>{t.subject}</Label>
                      <Select value={materialForm.subject_id} onValueChange={(value) => setMaterialForm({...materialForm, subject_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder={t.selectSubject} />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map(subject => (
                            <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>{t.type}</Label>
                      <Select value={materialForm.type} onValueChange={(value) => setMaterialForm({...materialForm, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="summary">{t.summary}</SelectItem>
                          <SelectItem value="flashcard">{t.flashcard}</SelectItem>
                          <SelectItem value="notes">{t.notes}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>{t.content}</Label>
                      <Textarea 
                        value={materialForm.content}
                        onChange={(e) => setMaterialForm({...materialForm, content: e.target.value})}
                        rows={6}
                        placeholder={t.content}
                      />
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                        {t.cancel}
                      </Button>
                      <Button onClick={handleCreateMaterial} className="bg-blue-600 hover:bg-blue-700">
                        {t.save}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {materials.length === 0 ? (
              <EmptyState
                type="noData"
                title={t.noMaterials}
                description={t.createFirst}
                actionText={t.createMaterial}
                onAction={() => setShowCreateDialog(true)}
                language={language}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {materials.map((material) => (
                  <motion.div
                    key={material.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group"
                  >
                    <Card className={`${themeClasses.cardGlass} h-full hover:shadow-lg transition-all duration-300`}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className={`text-lg ${themeClasses.textPrimary} line-clamp-2`}>
                            {material.title}
                          </CardTitle>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            {t[material.type]}
                          </Badge>
                          {material.ai_generated && (
                            <Badge className="text-xs bg-purple-500/20 text-purple-300">
                              AI
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className={`text-sm ${themeClasses.textMuted} line-clamp-3`}>
                          {material.content.substring(0, 150)}...
                        </p>
                        <div className="mt-4 text-xs text-gray-500">
                          {new Date(material.created_date).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl font-semibold ${themeClasses.textPrimary}`}>{t.quizzes}</h2>
              <Dialog open={showCreateDialog && activeTab === 'quizzes'} onOpenChange={(open) => setShowCreateDialog(open && activeTab === 'quizzes')}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    {t.createQuiz}
                  </Button>
                </DialogTrigger>
                <DialogContent className={`${themeClasses.cardSolid} border-gray-700 max-w-4xl max-h-[80vh] overflow-y-auto`}>
                  <DialogHeader>
                    <DialogTitle className={themeClasses.textPrimary}>{t.createQuiz}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>{t.title}</Label>
                        <Input 
                          value={quizForm.title}
                          onChange={(e) => setQuizForm({...quizForm, title: e.target.value})}
                          placeholder={t.title}
                        />
                      </div>
                      <div>
                        <Label>{t.subject}</Label>
                        <Select value={quizForm.subject_id} onValueChange={(value) => setQuizForm({...quizForm, subject_id: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder={t.selectSubject} />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map(subject => (
                              <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>{t.difficulty}</Label>
                        <Select value={quizForm.difficulty} onValueChange={(value) => setQuizForm({...quizForm, difficulty: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">{t.beginner}</SelectItem>
                            <SelectItem value="medium">{t.intermediate}</SelectItem>
                            <SelectItem value="hard">{t.advanced}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>{t.timeLimit}</Label>
                        <Input 
                          type="number"
                          value={quizForm.time_limit}
                          onChange={(e) => setQuizForm({...quizForm, time_limit: parseInt(e.target.value)})}
                          min="1"
                          max="120"
                        />
                      </div>
                    </div>

                    {/* Questions Section */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <Label className="text-lg">{language === 'he' ? 'שאלות' : 'Questions'}</Label>
                        <Button onClick={addQuizQuestion} variant="outline" size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          {t.addQuestion}
                        </Button>
                      </div>
                      
                      {quizForm.questions.map((question, questionIndex) => (
                        <Card key={questionIndex} className="mb-4 bg-white/5 border-white/10">
                          <CardContent className="p-4">
                            <div className="space-y-4">
                              <div>
                                <Label>{t.question} {questionIndex + 1}</Label>
                                <Input 
                                  value={question.question}
                                  onChange={(e) => updateQuizQuestion(questionIndex, 'question', e.target.value)}
                                  placeholder={`${t.question} ${questionIndex + 1}`}
                                />
                              </div>
                              
                              <div>
                                <Label>{t.options}</Label>
                                {question.options.map((option, optionIndex) => (
                                  <div key={optionIndex} className="flex items-center gap-2 mt-2">
                                    <input
                                      type="radio"
                                      name={`correct-${questionIndex}`}
                                      checked={question.correct_answer === optionIndex}
                                      onChange={() => updateQuizQuestion(questionIndex, 'correct_answer', optionIndex)}
                                      className="text-green-500"
                                    />
                                    <Input 
                                      value={option}
                                      onChange={(e) => updateQuizOption(questionIndex, optionIndex, e.target.value)}
                                      placeholder={`${language === 'he' ? 'אפשרות' : 'Option'} ${optionIndex + 1}`}
                                      className="flex-1"
                                    />
                                  </div>
                                ))}
                              </div>
                              
                              <div>
                                <Label>{t.explanation}</Label>
                                <Textarea 
                                  value={question.explanation}
                                  onChange={(e) => updateQuizQuestion(questionIndex, 'explanation', e.target.value)}
                                  placeholder={t.explanation}
                                  rows={2}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                        {t.cancel}
                      </Button>
                      <Button onClick={handleCreateQuiz} className="bg-green-600 hover:bg-green-700">
                        {t.save}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {quizzes.length === 0 ? (
              <EmptyState
                type="noData"
                title={t.noQuizzes}
                description={t.createFirst}
                actionText={t.createQuiz}
                onAction={() => setShowCreateDialog(true)}
                language={language}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {quizzes.map((quiz) => (
                  <motion.div
                    key={quiz.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group"
                  >
                    <Card className={`${themeClasses.cardGlass} h-full hover:shadow-lg transition-all duration-300`}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className={`text-lg ${themeClasses.textPrimary} line-clamp-2`}>
                            {quiz.title}
                          </CardTitle>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            {quiz.questions?.length || 0} {language === 'he' ? 'שאלות' : 'Questions'}
                          </Badge>
                          <Badge className={`text-xs ${
                            quiz.difficulty === 'easy' ? 'bg-green-500/20 text-green-300' :
                            quiz.difficulty === 'hard' ? 'bg-red-500/20 text-red-300' :
                            'bg-yellow-500/20 text-yellow-300'
                          }`}>
                            {t[quiz.difficulty]}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center text-sm">
                          <span className={themeClasses.textMuted}>
                            {quiz.time_limit} {language === 'he' ? 'דקות' : 'minutes'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(quiz.created_date).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Learning Paths Tab */}
          <TabsContent value="paths" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl font-semibold ${themeClasses.textPrimary}`}>{t.learningPaths}</h2>
            </div>

            {learningPaths.length === 0 ? (
              <EmptyState
                type="noData"
                title={t.noPaths}
                description={language === 'he' ? 'מסלולי הלמידה נוצרים אוטומטית על ידי AI' : 'Learning paths are created automatically by AI'}
                language={language}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {learningPaths.map((path) => (
                  <motion.div
                    key={path.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group"
                  >
                    <Card className={`${themeClasses.cardGlass} h-full hover:shadow-lg transition-all duration-300`}>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className={`text-lg ${themeClasses.textPrimary} line-clamp-2`}>
                            {path.title}
                          </CardTitle>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            {path.lessons?.length || 0} {language === 'he' ? 'שיעורים' : 'Lessons'}
                          </Badge>
                          <Badge className="text-xs bg-purple-500/20 text-purple-300">
                            {path.ai_generated ? t.aiGenerated : t.manuallyCreated}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className={`text-sm ${themeClasses.textMuted} line-clamp-2 mb-3`}>
                          {path.description}
                        </p>
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-purple-500 h-2 rounded-full" 
                                style={{ width: `${path.progress || 0}%` }}
                              ></div>
                            </div>
                            <span className={themeClasses.textMuted}>{path.progress || 0}%</span>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          {new Date(path.created_date).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="mt-6">
            <div className="text-center py-16">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className={`text-xl font-semibold ${themeClasses.textPrimary} mb-2`}>
                {language === 'he' ? 'אנליטיקה מפורטת' : 'Detailed Analytics'}
              </h3>
              <p className={`${themeClasses.textSecondary} mb-6`}>
                {language === 'he' ? 'תכונה זו תהיה זמינה בקרוב' : 'This feature will be available soon'}
              </p>
              <Badge variant="outline" className="text-yellow-400 border-yellow-400/50">
                {language === 'he' ? 'בפיתוח' : 'Coming Soon'}
              </Badge>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}