
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { User } from "@/api/entities";
import { StudyCircle } from "@/api/entities";
import { Subject } from "@/api/entities";
import { StudyMessage } from "@/api/entities"; // Added for system messages
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Plus, BookOpen, Globe, Search, Lock, Users2, Info } from "lucide-react"; // Added Info
import { motion, AnimatePresence } from "framer-motion";
import StudyChat from "../components/chat/StudyChat";
import { useTheme } from '../components/ui/theme-provider';
import EmptyState from "../components/ui/empty-state";
import { useToast } from "@/components/ui/use-toast"; // Import useToast

const translations = {
  he: {
    studyCircles: "חוגי לימוד",
    description: "מצא קבוצות לימוד, שתף ידע והתכונן למבחנים ביחד.",
    myCircles: "החוגים שלי",
    discoverCircles: "גלה חוגים חדשים",
    createCircle: "צור חוג חדש",
    searchCircles: "חפש חוגים...",
    members: "חברים",
    public: "ציבורי",
    private: "פרטי",
    join: "הצטרף",
    enter: "כניסה",
    joined: "הצטרפת",
    full: "מלא",
    noCircles: "אין חוגים להצגה",
    beFirst: "היה הראשון ליצור חוג!",
    createDialogTitle: "יצירת חוג לימוד חדש",
    circleName: "שם החוג",
    circleDescription: "תיאור קצר",
    subject: "מקצוע",
    selectSubject: "בחר מקצוע",
    privacy: "פרטיות",
    makePublic: "הפוך לציבורי (כל אחד יכול להצטרף)",
    makePrivate: "הפוך לפרטי (הצטרפות עם הזמנה בלבד)",
    save: "שמור",
    cancel: "ביטול",
    loading: "טוען...",
    maxMembers: "חברים",
    creating: "יוצר...", // New translation
    circleCreatedSuccess: "החוג נוצר בהצלחה!", // New translation
    circleCreatedError: "שגיאה ביצירת החוג", // New translation
    system: "מערכת", // New translation
    back: "חזור" // New translation for back button
  },
  en: {
    studyCircles: "Study Circles",
    description: "Find study groups, share knowledge, and prepare for exams together.",
    myCircles: "My Circles",
    discoverCircles: "Discover New Circles",
    createCircle: "Create New Circle",
    searchCircles: "Search circles...",
    members: "Members",
    public: "Public",
    private: "Private",
    join: "Join",
    enter: "Enter",
    joined: "Joined",
    full: "Full",
    noCircles: "No circles to display",
    beFirst: "Be the first to create one!",
    createDialogTitle: "Create a New Study Circle",
    circleName: "Circle Name",
    circleDescription: "Short Description",
    subject: "Subject",
    selectSubject: "Select Subject",
    privacy: "Privacy",
    makePublic: "Make public (anyone can join)",
    makePrivate: "Make private (join by invitation only)",
    save: "Save",
    cancel: "Cancel",
    loading: "Loading...",
    maxMembers: "Members",
    creating: "Creating...", // New translation
    circleCreatedSuccess: "Circle created successfully!", // New translation
    circleCreatedError: "Error creating circle", // New translation
    system: "System", // New translation
    back: "Back" // New translation for back button
  }
};

const CircleCard = ({ circle, user, onJoin, onEnter, language }) => {
  const { themeClasses } = useTheme();
  const t = translations[language || 'en'];
  const isMember = useMemo(() => circle.members?.some(m => m.user_id === user?.id), [circle.members, user]);
  const isFull = useMemo(() => circle.members?.length >= circle.max_members, [circle.members, circle.max_members]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="group"
    >
      <Card className={`${themeClasses.cardGlass} overflow-hidden h-full flex flex-col transition-all duration-300 group-hover:scale-105 group-hover:shadow-purple-500/10`}>
        <CardHeader className="p-4 border-b border-white/10">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className={`truncate ${themeClasses.textPrimary}`}>{circle.name}</CardTitle>
              <p className={`text-sm mt-1 truncate ${themeClasses.textMuted}`}>
                {circle.subject?.name || (language === 'he' ? "כללי" : "General")}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/10 ${themeClasses.cardSolid}`}>
              <Users2 className="w-6 h-6 text-purple-400"/>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow flex flex-col justify-between">
          <p className={`text-sm mb-4 h-10 line-clamp-2 ${themeClasses.textSecondary}`}>
            {circle.description}
          </p>
          <div className="flex items-center justify-between text-sm mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-white/70" />
              <span className={themeClasses.textSecondary}>{circle.members?.length || 0} / {circle.max_members} {t.maxMembers}</span>
            </div>
            <Badge variant={circle.is_public ? "secondary" : "outline"} className={`border-white/20 text-xs ${circle.is_public ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
              {circle.is_public ? t.public : t.private}
            </Badge>
          </div>
          <Button
            onClick={() => isMember ? onEnter(circle) : onJoin(circle)}
            disabled={!isMember && isFull}
            className="w-full bg-gradient-to-r from-purple-500/80 to-blue-500/80 hover:from-purple-500 hover:to-blue-500 text-white transition-all duration-300"
          >
            {isMember ? t.enter : (isFull ? t.full : t.join)}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};


export default function StudyCircles() {
  const [user, setUser] = useState(null);
  const [allCircles, setAllCircles] = useState([]);
  const [myCircles, setMyCircles] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeCircle, setActiveCircle] = useState(null);
  const [isCreating, setIsCreating] = useState(false); // New state
  const { language, themeClasses } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast(); // Initialize toast
  const t = translations[language || 'en'];

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject_id: '',
    is_public: true,
    max_members: 10 // Default max members
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setUser(userData);

      const [circlesData, subjectsData] = await Promise.all([
        StudyCircle.list('-created_date', 100),
        Subject.list()
      ]);
      
      const subjectsMap = subjectsData.reduce((map, subject) => {
        map[subject.id] = subject;
        return map;
      }, {});

      const circlesWithSubjects = circlesData.map(circle => ({
        ...circle,
        subject: subjectsMap[circle.subject_id]
      }));

      setAllCircles(circlesWithSubjects);
      setSubjects(subjectsData);
      
      const userCircles = circlesWithSubjects.filter(c => c.members?.some(m => m.user_id === userData.id));
      setMyCircles(userCircles);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleJoinCircle = async (circle) => {
    if (!user) return; // Must be logged in to join

    // If the circle is private, prevent direct joining and show a toast
    if (!circle.is_public) {
      toast({
        title: language === 'he' ? 'שגיאה בהצטרפות' : 'Error joining circle',
        description: language === 'he' ? 'לא ניתן להצטרף לחוג פרטי ללא הזמנה.' : 'Cannot join a private circle without an invitation.',
        variant: "destructive",
      });
      return; // Stop execution
    }

    try {
      // Check if user is already a member to prevent duplicate entries
      if (circle.members?.some(m => m.user_id === user.id)) {
        console.warn('User is already a member of this circle.');
        return;
      }
      
      const updatedMembers = [...(circle.members || []), { 
        user_id: user.id, 
        role: 'member', 
        joined_date: new Date().toISOString() 
      }];
      
      // Update the circle's members list
      await StudyCircle.update(circle.id, { members: updatedMembers });
      
      // Add a system message to the new circle's chat
      await StudyMessage.create({
        circle_id: circle.id,
        sender_id: 'system',
        sender_name: t.system,
        message: `${user.full_name} ${language === 'he' ? 'הצטרף/ה לחוג' : 'has joined the circle'}.`,
        message_type: 'system'
      });

      loadData(); // Reload all data to reflect the changes (new membership)
    } catch (error) {
      console.error('Error joining circle:', error);
      // Generic error toast for other types of errors during join
      toast({
        title: language === 'he' ? 'שגיאה בהצטרפות' : 'Error joining circle',
        description: language === 'he' ? 'אירעה שגיאה בעת הניסיון להצטרף לחוג. אנא נסה/נסי שוב.' : 'An error occurred while trying to join the circle. Please try again.',
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.subject_id) return;

    setIsCreating(true);
    try {
      const newCircleData = { 
        ...formData, 
        members: [{ 
          user_id: user.id, 
          role: 'admin', 
          joined_date: new Date().toISOString() 
        }],
        max_members: 20 // Set max members as per outline
      };
      
      const newCircle = await StudyCircle.create(newCircleData);
      
      // Add a system message to the new circle
      await StudyMessage.create({
        circle_id: newCircle.id,
        sender_id: 'system',
        sender_name: t.system,
        message: `${user.full_name} ${language === 'he' ? 'יצר/ה את החוג' : 'created the circle'} "${newCircle.name}".`,
        message_type: 'system'
      });

      toast({
        title: t.circleCreatedSuccess,
        description: `${language === 'he' ? `כעת תוכל/י להזמין חברים להצטרף ל"${newCircle.name}".` : `You can now invite friends to join "${newCircle.name}".`}`,
        variant: "success",
      });

      setIsDialogOpen(false);
      setFormData({ name: '', description: '', subject_id: '', is_public: true, max_members: 10 }); // Reset formData, including default max_members
      loadData(); // Reload all data
    } catch (error) {
      console.error('Error creating circle:', error);
      toast({
        title: t.circleCreatedError,
        description: `${language === 'he' ? "אנא נסה/נסי שוב." : "Please try again."}`,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEnterCircle = (circle) => {
    setActiveCircle(circle);
  };
  
  const filteredMyCircles = useMemo(() => 
    myCircles.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.subject?.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [myCircles, searchTerm]);
  
  const filteredDiscoverCircles = useMemo(() => 
    allCircles.filter(c => 
      !myCircles.some(mc => mc.id === c.id) &&
      (c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.subject?.name.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [allCircles, myCircles, searchTerm]);

  if (isLoading) {
    return <EmptyState type="loading" language={language} />;
  }

  if (activeCircle) {
    return (
      <div className="h-screen flex flex-col">
        <header className="p-4 border-b border-white/20 bg-gray-900/50 backdrop-blur-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Users2 className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <h2 className="font-bold text-white">{activeCircle.name}</h2>
              <p className="text-xs text-gray-400">{activeCircle.subject?.name || (language === 'he' ? "כללי" : "General")}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={() => setActiveCircle(null)}>
            {t.back}
          </Button>
        </header>
        <StudyChat circle={activeCircle} user={user} language={language} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeClasses.background} p-4 md:p-8`}>
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <div className="inline-block bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20 mb-3">
              <Users className="w-10 h-10 text-purple-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">{t.studyCircles}</h1>
            <p className={`mt-2 text-lg ${themeClasses.textSecondary}`}>{t.description}</p>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <Input
                placeholder={t.searchCircles}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-offset-background focus-visible:ring-purple-500"
              />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                  <Plus className="w-5 h-5 mr-2" /> {t.createCircle}
                </Button>
              </DialogTrigger>
              <DialogContent className={`${themeClasses.cardSolid} border-gray-700`}>
                <DialogHeader>
                  <DialogTitle className={themeClasses.textPrimary}>{t.createDialogTitle}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">{t.circleName}</Label>
                    <Input 
                      id="name" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">{t.circleDescription}</Label>
                    <Textarea 
                      id="description" 
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})} 
                    />
                  </div>
                  <div>
                    <Label>{t.subject}</Label>
                    <Select onValueChange={value => setFormData({...formData, subject_id: value})} required>
                      <SelectTrigger>
                        <SelectValue placeholder={t.selectSubject} />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t.privacy}</Label>
                    <div className="flex gap-4 mt-2">
                      <Button 
                        type="button" 
                        variant={formData.is_public ? "default" : "outline"} 
                        onClick={() => setFormData({...formData, is_public: true})}
                      >
                        {t.makePublic}
                      </Button>
                      <Button 
                        type="button" 
                        variant={!formData.is_public ? "default" : "outline"} 
                        onClick={() => setFormData({...formData, is_public: false})}
                      >
                        {t.makePrivate}
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                      {t.cancel}
                    </Button>
                    <Button type="submit" disabled={isCreating} className="bg-purple-600 hover:bg-purple-700 text-white">
                      {isCreating ? t.creating : t.save}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        <Tabs defaultValue="discover" className="w-full">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-sm border border-white/20 p-1 h-auto">
              <TabsTrigger value="discover" className="py-2.5 data-[state=active]:bg-purple-500/80 data-[state=active]:text-white data-[state=active]:shadow-lg">{t.discoverCircles}</TabsTrigger>
              <TabsTrigger value="my-circles" className="py-2.5 data-[state=active]:bg-purple-500/80 data-[state=active]:text-white data-[state=active]:shadow-lg">{t.myCircles}</TabsTrigger>
            </TabsList>
          </motion.div>
          
          <AnimatePresence mode="wait">
            <TabsContent value="discover" className="mt-6">
              <motion.div
                key="discover-content" // Unique key for AnimatePresence to work correctly
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {filteredDiscoverCircles.length === 0 ? (
                  <EmptyState 
                    type="noResults" 
                    title={t.noCircles}
                    description={t.searchCircles}
                    language={language} 
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredDiscoverCircles.map((circle) => (
                      <CircleCard key={circle.id} circle={circle} user={user} onJoin={handleJoinCircle} onEnter={handleEnterCircle} language={language} />
                    ))}
                  </div>
                )}
              </motion.div>
            </TabsContent>
            
            <TabsContent value="my-circles" className="mt-6">
              <motion.div
                key="my-circles-content" // Unique key for AnimatePresence to work correctly
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {filteredMyCircles.length === 0 ? (
                  <EmptyState 
                    type="noData"
                    title={t.noCircles}
                    description={language === 'he' ? "הצטרף לחוג או צור אחד חדש!" : "Join a circle or create a new one!"}
                    language={language}
                    actionText={t.discoverCircles}
                    onAction={() => { /* maybe switch tab */ }}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredMyCircles.map((circle) => (
                      <CircleCard key={circle.id} circle={circle} user={user} onJoin={handleJoinCircle} onEnter={handleEnterCircle} language={language} />
                    ))}
                  </div>
                )}
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
