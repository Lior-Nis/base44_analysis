import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Subject } from "@/api/entities";
import { StudyPlan } from "@/api/entities";
import { QuizResult } from "@/api/entities";
import { Achievement } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday, addDays, differenceInDays } from "date-fns";
import { he } from "date-fns/locale";
import { sendSMS } from "@/api/functions";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  BookOpen,
  Calendar,
  Clock,
  Target,
  Award,
  Zap,
  GraduationCap,
  MessageSquare,
  Send,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useTheme } from '../components/ui/theme-provider';

export default function ParentDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childData, setChildData] = useState({
    plans: [],
    quizResults: [],
    achievements: [],
    subjects: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [reminderMessage, setReminderMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);
  const { language } = useTheme();

  const t = {
    he: {
      parentDashboard: "לוח הבקרה להורים",
      selectChild: "בחר ילד/ה",
      noChildren: "לא נמצאו ילדים המשויכים לחשבונך",
      weeklyProgress: "התקדמות שבועית",
      recentQuizzes: "תוצאות מבחנים אחרונות",
      upcomingDeadlines: "משימות קרובות",
      achievements: "הישגים אחרונים",
      studyTime: "זמן לימוד (השבוע)",
      avgScore: "ציון ממוצע",
      activePlans: "תוכניות פעילות",
      totalAchievements: "סך הישגים",
      hours: "שעות",
      minutes: "דקות",
      daysLeft: "ימים נותרו",
      communicationAndReminders: "תקשורת ותזכורות",
      sendMessagePlaceholder: "כתוב הודעה מעודדת או תזכורת...",
      send: "שלח SMS",
      sending: "שולח...",
      noPhoneNumber: "כדי לשלוח הודעות, יש להגדיר מספר טלפון לילד/ה בהגדרות.",
      messageSentSuccess: "ההודעה נשלחה בהצלחה!",
      messageSentError: "שגיאה בשליחת ההודעה.",
      suggestion1: "בהצלחה במבחן!",
      suggestion2: "זמן ללמוד, אני מאמין בך",
      suggestion3: "כל הכבוד על ההתקדמות!",
      loading: "טוען מידע..."
    },
    en: {
      parentDashboard: "Parent Dashboard",
      selectChild: "Select Child",
      noChildren: "No children found for your account",
      weeklyProgress: "Weekly Progress",
      recentQuizzes: "Recent Quiz Results",
      upcomingDeadlines: "Upcoming Deadlines",
      achievements: "Recent Achievements",
      studyTime: "Study Time (This Week)",
      avgScore: "Average Score",
      activePlans: "Active Plans",
      totalAchievements: "Total Achievements",
      hours: "hours",
      minutes: "minutes",
      daysLeft: "days left",
      communicationAndReminders: "Communication & Reminders",
      sendMessagePlaceholder: "Write an encouraging message or a reminder...",
      send: "Send SMS",
      sending: "Sending...",
      noPhoneNumber: "To send messages, please set a phone number for the child in their settings.",
      messageSentSuccess: "Message sent successfully!",
      messageSentError: "Error sending message.",
      suggestion1: "Good luck on the test!",
      suggestion2: "Time to study, I believe in you",
      suggestion3: "Great job on your progress!",
      loading: "Loading data..."
    }
  }[language || 'en'];

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadChildData(selectedChild.id);
    }
  }, [selectedChild]);

  const loadInitialData = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);

      if (user.role_in_family !== 'parent') {
        setIsLoading(false);
        return;
      }
      
      const familyMembers = await User.filter({ family_id: user.family_id });
      const familyChildren = familyMembers.filter(m => m.role_in_family === 'child');
      setChildren(familyChildren);

      if (familyChildren.length > 0) {
        setSelectedChild(familyChildren[0]);
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChildData = async (childId) => {
    setIsLoading(true);
    try {
      const [plans, quizResults, achievements, subjects] = await Promise.all([
        StudyPlan.filter({ created_by: selectedChild.email }),
        QuizResult.filter({ user_id: childId }),
        Achievement.filter({ user_id: childId }),
        Subject.filter({ created_by: selectedChild.email })
      ]);
      setChildData({ plans, quizResults, achievements, subjects });
    } catch (error) {
      console.error("Error loading child data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getWeeklyStudyTime = () => {
    return childData.plans.reduce((total, plan) => total + (plan.daily_minutes * 7), 0) / 60;
  };
  
  const getAverageScore = () => {
    if(childData.quizResults.length === 0) return 0;
    const total = childData.quizResults.reduce((sum, result) => sum + result.score, 0);
    return Math.round(total / childData.quizResults.length);
  };

  const handleSendReminder = async () => {
    if (!reminderMessage.trim() || !selectedChild?.phone_number) return;
    
    setIsSending(true);
    setSendStatus(null);
    
    try {
      const result = await sendSMS({
        to: selectedChild.phone_number,
        message: `הודעה מהורה: ${reminderMessage}`
      });
      
      if (result.data.status === 'success') {
        setSendStatus({ status: 'success', message: t.messageSentSuccess });
        setReminderMessage('');
      } else {
        setSendStatus({ status: 'error', message: result.data.error_message || t.messageSentError });
      }
    } catch (error) {
      setSendStatus({ status: 'error', message: error.message || t.messageSentError });
    } finally {
      setIsSending(false);
      setTimeout(() => setSendStatus(null), 5000);
    }
  };

  const getUpcomingDeadlines = () => {
    return childData.plans
      .flatMap(plan => plan.content?.map(task => ({ ...task, planTitle: plan.title })) || [])
      .filter(task => !task.completed && new Date(task.date) >= new Date())
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>{t.loading}</p>
      </div>
    );
  }

  if (currentUser?.role_in_family !== 'parent') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>You must be a parent to view this page.</p>
      </div>
    );
  }
  
  if (children.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>{t.noChildren}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t.parentDashboard}
          </h1>
          <div className="w-full md:w-auto mt-4 md:mt-0">
            <Select onValueChange={(value) => setSelectedChild(children.find(c => c.id === value))} defaultValue={selectedChild?.id}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder={t.selectChild} />
              </SelectTrigger>
              <SelectContent>
                {children.map(child => (
                  <SelectItem key={child.id} value={child.id}>{child.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedChild && (
          <AnimatePresence>
            <motion.div
              key={selectedChild.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader><CardTitle>{t.studyTime}</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{getWeeklyStudyTime().toFixed(1)} <span className="text-lg">{t.hours}</span></p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>{t.avgScore}</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{getAverageScore()}%</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>{t.activePlans}</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{childData.plans.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>{t.totalAchievements}</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{childData.achievements.length}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upcoming Deadlines */}
                <Card>
                  <CardHeader><CardTitle>{t.upcomingDeadlines}</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getUpcomingDeadlines().map((task, i) => (
                        <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                          <div>
                            <p className="font-semibold">{task.topic}</p>
                            <p className="text-sm text-gray-500">{task.planTitle}</p>
                          </div>
                          <Badge variant="outline">
                            {differenceInDays(new Date(task.date), new Date())} {t.daysLeft}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Achievements */}
                <Card>
                  <CardHeader><CardTitle>{t.achievements}</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {childData.achievements.slice(0, 5).map((ach, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 bg-yellow-50 rounded-md">
                          <Award className="text-yellow-500" />
                          <div>
                            <p className="font-semibold">{ach.title}</p>
                            <p className="text-sm text-gray-500">{ach.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Communication Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="text-blue-600" />
                      {t.communicationAndReminders}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!selectedChild?.phone_number ? (
                      <div className="text-center text-gray-500 p-4 bg-gray-50 rounded-lg">
                        {t.noPhoneNumber}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <Textarea
                            value={reminderMessage}
                            onChange={(e) => setReminderMessage(e.target.value)}
                            placeholder={t.sendMessagePlaceholder}
                            rows={3}
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" onClick={() => setReminderMessage(t.suggestion1)}>{t.suggestion1}</Button>
                          <Button variant="outline" size="sm" onClick={() => setReminderMessage(t.suggestion2)}>{t.suggestion2}</Button>
                          <Button variant="outline" size="sm" onClick={() => setReminderMessage(t.suggestion3)}>{t.suggestion3}</Button>
                        </div>
                        <Button
                          onClick={handleSendReminder}
                          disabled={isSending || !reminderMessage.trim()}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          {isSending ? (
                            <>
                              <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                              />
                              {t.sending}
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              {t.send}
                            </>
                          )}
                        </Button>
                        {sendStatus && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-3 rounded-lg border text-sm ${
                              sendStatus.status === 'success' 
                                ? 'bg-green-50 border-green-200 text-green-800' 
                                : 'bg-red-50 border-red-200 text-red-800'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {sendStatus.status === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                              <span>{sendStatus.message}</span>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quiz Results Chart */}
              <Card>
                <CardHeader><CardTitle>{t.recentQuizzes}</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={childData.quizResults}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="created_date" tickFormatter={(date) => format(new Date(date), 'd/M')} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}