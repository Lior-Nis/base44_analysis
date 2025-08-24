import React, { useState, useEffect, useRef } from "react";
import { User } from "@/api/entities";
import { Subject } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Brain, MessageSquare, PlusCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../components/ui/theme-provider";
import EmptyState from "../components/ui/empty-state";
import LoadingSpinner from "../components/ui/lazy-loading";
import ErrorBoundary from "../components/ui/error-boundary";
import ReactMarkdown from 'react-markdown';

const FloatingAIElements = React.memo(() => (
  <>
    <motion.div
      className="absolute top-10 left-10 w-48 h-48 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl"
      animate={{ scale: [1, 1.15, 1], y: [0, -10, 0] }}
      transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute bottom-10 right-10 w-64 h-64 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
      animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
      transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
    />
  </>
));

const translations = {
  he: {
    aiTutor: "עוזר AI",
    title: "המדריך האישי שלך ללימודים",
    subtitle: "צ'אט עם ה-AI, קבל עזרה מיידית, ושפר את הלמידה שלך",
    askPlaceholder: "שאל שאלה...",
    ask: "שאל",
    thinking: "חושב...",
    askAnything: "שאל כל דבר!",
    startByAsking: "התחל לשאול שאלות על כל מקצוע שתרצה. אני כאן כדי לעזור לך להבין טוב יותר",
    recommendedQuestions: "שאלות מומלצות:",
    newChat: "שיחה חדשה",
    selectSubject: "בחר מקצוע",
    processingError: "מצטער, אירעה שגיאה. נסה שוב או נסח את השאלה בצורה שונה",
    chatWithAI: "צ'אט עם AI",
    loadingError: "שגיאה בטעינת הנתונים הבסיסיים. אנא רענן את העמוד או נסה שוב מאוחר יותר.",
    tryAgain: "נסה שוב"
  },
  en: {
    aiTutor: "AI Tutor",
    title: "Your Personal Study Guide",
    subtitle: "Chat with the AI, get instant help, and improve your learning",
    askPlaceholder: "Ask a question...",
    ask: "Ask",
    thinking: "Thinking...",
    askAnything: "Ask Anything!",
    startByAsking: "Start asking questions about any subject you want. I'm here to help you understand better",
    recommendedQuestions: "Recommended Questions:",
    newChat: "New Chat",
    selectSubject: "Select Subject",
    processingError: "Sorry, an error occurred. Please try again or rephrase your question",
    chatWithAI: "Chat with AI",
    loadingError: "Error loading basic data. Please refresh the page or try again later.",
    tryAgain: "Try Again"
  }
};

export default function AITutor() {
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Chat states
  const [savedConversations, setSavedConversations] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState('');

  // General States for UI and subject selection
  const [selectedSubject, setSelectedSubject] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const messagesEndRef = useRef(null);
  const { themeClasses, language } = useTheme();
  const t = translations[language || 'en'];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadSavedChatHistory();
    }
  }, [user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoadingAI]);

  useEffect(() => {
    generateSuggestions();
  }, [selectedSubject, subjects, user?.learning_style, language]);

  const loadData = async () => {
    setLoadError(null);
    try {
      const userData = await User.me();
      setUser(userData);

      const subjectsData = await Subject.filter({ created_by: userData.email }).catch(err => {
        console.error('Error loading subjects:', err);
        return [];
      });
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoadError(t.loadingError);
    }
  };

  const loadSavedChatHistory = () => {
    try {
      const saved = localStorage.getItem(`ai_tutor_history_${user?.id}`);
      if (saved) {
        setSavedConversations(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load chat history from localStorage", e);
      setSavedConversations([]);
    }
  };

  const saveChatHistoryToLocalStorage = (historyToSave) => {
    try {
      localStorage.setItem(`ai_tutor_history_${user?.id}`, JSON.stringify(historyToSave));
      setSavedConversations(historyToSave);
    } catch (e) {
      console.error("Failed to save chat history to localStorage", e);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const generateSuggestions = async () => {
    if (!selectedSubject || subjects.length === 0 || !user) {
      setSuggestions([]);
      return;
    }

    const subject = subjects.find(s => s.id === selectedSubject);
    if (!subject) {
      setSuggestions([]);
      return;
    }

    try {
      const prompt = language === 'he' 
        ? `בהתבסס על המקצוע "${subject.name}" וסגנון הלמידה של התלמיד (${user?.learning_style || 'מעורב'}), הצע 3 שאלות מעניינות ורלוונטיות שהתלמיד יכול לשאול. השאלות צריכות להיות:
1. מתאימות לרמת הקושי של המקצוע
2. מעוררות עניין ומעודדות חשיבה
3. מגוונות (תיאוריה, דוגמאות, יישום מעשי)
החזר רשימה של 3 שאלות בפורמט JSON.`
        : `Based on the subject "${subject.name}" and the student's learning style (${user?.learning_style || 'mixed'}), suggest 3 interesting and relevant questions the student can ask. The questions should be:
1. Appropriate for the subject's difficulty level
2. Engaging and thought-provoking
3. Diverse (theory, examples, practical application)
Return a list of 3 questions in JSON format.`;

      const response = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: { type: "string" }
            }
          },
          required: ["suggestions"]
        }
      });
      setSuggestions(response.suggestions || []);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      setSuggestions([]);
    }
  };

  const handleAskAI = async (questionTextParam = userInput) => {
    if (!questionTextParam.trim() || isLoadingAI) return;

    setIsLoadingAI(true);
    setChatHistory(prev => [...prev, { role: 'user', content: questionTextParam, timestamp: new Date().toISOString() }]);
    const currentInput = questionTextParam;
    setUserInput('');

    try {
      const selectedSubjectName = subjects.find(s => s.id === selectedSubject)?.name || '';

      const userContext = language === 'he' 
        ? `משתמש: ${user?.full_name || 'תלמיד'}
סגנון למידה: ${user?.learning_style || 'מעורב'}
כיתה: ${user?.grade_level || 'לא צוין'}
מקצוע נבחר: ${selectedSubjectName || 'לא צוין'}`
        : `User: ${user?.full_name || 'Student'}
Learning style: ${user?.learning_style || 'mixed'}
Grade level: ${user?.grade_level || 'Not specified'}
Selected subject: ${selectedSubjectName || 'Not specified'}`;

      const historyForPrompt = chatHistory.slice(-4).map(msg =>
        `${msg.role === 'user' ? (language === 'he' ? 'תלמיד' : 'Student') : (language === 'he' ? 'מורה' : 'Teacher')}: ${msg.content}`
      ).join('\n');

      const prompt = language === 'he' 
        ? `${userContext}

היסטוריית שיחה:
${historyForPrompt.length > 0 ? historyForPrompt + '\n' : ''}
שאלה חדשה: "${currentInput}"

אתה מורה AI מומחה ועוזר אישי באפליקציית Back2study. השב בצורה:
- אישית ומותאמת לתלמיד
- ברורה ומפורטת
- מעוררת עניין ומעודדת למידה נוספת
- כולל דוגמאות מעשיות כשרלוונטי
- בעברית טובה וברורה`
        : `${userContext}

Chat history:
${historyForPrompt.length > 0 ? historyForPrompt + '\n' : ''}
New question: "${currentInput}"

You are an expert AI teacher and personal assistant in the Back2study app. Answer in a way that is:
- Personal and adapted to the student
- Clear and detailed
- Interesting and encourages further learning
- Includes practical examples when relevant
- In clear and good English`;

      const response = await InvokeLLM({
        prompt: prompt,
        add_context_from_internet: selectedSubjectName.length > 0
      });

      const aiMessage = { role: 'ai', content: response, timestamp: new Date().toISOString() };
      setChatHistory(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('Error asking AI:', error);
      const errorMessage = {
        role: 'ai',
        content: t.processingError,
        timestamp: new Date().toISOString(),
        isError: true
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const startNewConversation = () => {
    if (chatHistory.length > 0) {
      const newConversation = {
        id: Date.now(),
        title: chatHistory[0]?.content?.slice(0, 50) + "..." || t.newChat,
        messages: [...chatHistory],
        timestamp: new Date().toISOString(),
        subject: selectedSubject
      };

      const updatedHistory = [newConversation, ...savedConversations];
      saveChatHistoryToLocalStorage(updatedHistory);
    }

    setChatHistory([]);
    setUserInput('');
    setSuggestions([]);
    setSelectedSubject('');
  };

  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <EmptyState
          type="noResults"
          title={t.loadingError}
          description={loadError}
          actionText={t.tryAgain}
          onAction={loadData}
          language={language || 'en'}
        />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={`min-h-screen relative overflow-hidden ${themeClasses.background}`}>
        {/* Floating AI background elements */}
        <div className="fixed inset-0 pointer-events-none">
          <FloatingAIElements />
        </div>

        <div className="relative z-10 p-4 md:p-8">
          <div className="max-w-7xl mx-auto">

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-yellow-500/20 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/20 relative">
                  <Brain className="w-7 h-7 text-orange-400" />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-yellow-400/20 rounded-xl"
                    animate={{ opacity: [0, 0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                  {t.title}
                </h1>
              </div>
              <p className={`${themeClasses.textSecondary} text-lg`}>{t.subtitle}</p>
            </motion.div>

            {/* Main Chat Interface */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-4xl mx-auto"
            >
              <Card className={`${themeClasses.cardGlass} shadow-2xl h-[600px] flex flex-col`}>
                <CardHeader className="border-b border-white/20 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className={`flex items-center gap-2 ${themeClasses.textPrimary}`}>
                      <MessageSquare className="w-5 h-5 text-orange-400" />
                      {t.chatWithAI}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {subjects.length > 0 && (
                        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                          <SelectTrigger className="w-48 bg-white/10 text-white border-white/20">
                            <SelectValue placeholder={t.selectSubject} />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 text-white border-gray-700">
                            {subjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.id} className="hover:bg-gray-700">
                                {subject.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={startNewConversation}
                        className={`${themeClasses.textSecondary} hover:text-white hover:bg-white/10`}
                      >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        {t.newChat}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 p-0 flex flex-col">
                  {/* Messages Area */}
                  <ScrollArea className="flex-1 p-4">
                    {chatHistory.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center">
                        <div className="text-center mb-6">
                          <Brain className="w-16 h-16 text-orange-400/50 mx-auto mb-4" />
                          <h3 className={`text-xl font-semibold ${themeClasses.textPrimary} mb-2`}>{t.askAnything}</h3>
                          <p className={`${themeClasses.textSecondary}`}>{t.startByAsking}</p>
                        </div>

                        {/* Suggestions */}
                        {suggestions.length > 0 && (
                          <div className="w-full max-w-md space-y-2">
                            <p className={`text-sm ${themeClasses.textSecondary} text-center mb-3`}>{t.recommendedQuestions}</p>
                            {suggestions.map((suggestion, index) => (
                              <motion.button
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => handleAskAI(suggestion)}
                                className={`w-full p-3 text-sm ${themeClasses.textSecondary} bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all duration-200 ${language === 'he' ? 'text-right' : 'text-left'}`}
                              >
                                {suggestion}
                              </motion.button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <AnimatePresence>
                          {chatHistory.map((msg, index) => (
                            <motion.div
                              key={msg.timestamp + index}
                              layout
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              {msg.role === 'ai' && (
                                <Avatar className="w-8 h-8 bg-gradient-to-br from-orange-500 to-yellow-500">
                                  <AvatarFallback>
                                    <Brain className="w-4 h-4 text-white" />
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              
                              <div 
                                className={`max-w-[70%] p-4 rounded-2xl shadow-md ${
                                  msg.role === 'user' 
                                    ? 'bg-blue-500 text-white rounded-br-none'
                                    : 'bg-white/20 text-white backdrop-blur-sm rounded-bl-none'
                                }`}
                                dir={language === 'he' ? 'rtl' : 'ltr'}
                              >
                                <ReactMarkdown className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap leading-relaxed">
                                  {msg.content}
                                </ReactMarkdown>
                              </div>

                              {msg.role === 'user' && (
                                <Avatar className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500">
                                  <AvatarFallback className="text-white font-semibold">
                                    {user?.full_name?.[0] || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </motion.div>
                          ))}
                          {isLoadingAI && (
                            <motion.div
                              key="loading"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex justify-start items-center gap-3 mb-4"
                            >
                              <Avatar className="w-8 h-8 bg-gradient-to-br from-orange-500 to-yellow-500">
                                <AvatarFallback>
                                  <Brain className="w-4 h-4 text-white" />
                                </AvatarFallback>
                              </Avatar>
                              <div className={`${themeClasses.cardGlass} p-4 rounded-2xl rounded-bl-none flex items-center`}>
                                <LoadingSpinner text={t.thinking} size="small" />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  {/* Input Area */}
                  <div className="border-t border-white/20 p-4">
                    <div className="flex items-end gap-3">
                      <div className="flex-1">
                        <Textarea
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          placeholder={t.askPlaceholder}
                          rows={2}
                          className="resize-none bg-white/10 text-white border-white/20 placeholder:text-white/50 focus:ring-orange-500 focus:border-orange-500"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleAskAI();
                            }
                          }}
                          disabled={isLoadingAI}
                          dir={language === 'he' ? 'rtl' : 'ltr'}
                        />
                      </div>
                      <Button
                        onClick={() => handleAskAI()}
                        disabled={isLoadingAI || !userInput.trim()}
                        className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-6"
                      >
                        {isLoadingAI ? t.thinking : t.ask}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}