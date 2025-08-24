import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Subject } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookOpen, Plus, GraduationCap, Star, Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../components/ui/theme-provider";

const translations = {
  he: {
    subjects: "מקצועות",
    addSubject: "הוסף מקצוע חדש",
    subjectName: "שם המקצוע",
    description: "תיאור",
    teacher: "מורה",
    difficulty: "רמת קושי",
    color: "צבע",
    easy: "קל",
    medium: "בינוני", 
    hard: "קשה",
    save: "שמור",
    cancel: "ביטול",
    noSubjects: "אין מקצועות עדיין",
    addFirst: "הוסף את המקצוע הראשון שלך",
    subjectsCount: "מקצועות"
  },
  en: {
    subjects: "Subjects",
    addSubject: "Add New Subject",
    subjectName: "Subject Name",
    description: "Description",
    teacher: "Teacher",
    difficulty: "Difficulty Level",
    color: "Color",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard", 
    save: "Save",
    cancel: "Cancel",
    noSubjects: "No subjects yet",
    addFirst: "Add your first subject",
    subjectsCount: "Subjects"
  }
};

const colors = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Green", value: "#10b981" },
  { name: "Orange", value: "#f59e0b" },
  { name: "Red", value: "#ef4444" },
  { name: "Pink", value: "#ec4899" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Indigo", value: "#6366f1" }
];

const FloatingSubjectElements = () => (
  <>
    <motion.div
      className="absolute top-20 right-20 w-48 h-32 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl blur-xl rotate-12"
      animate={{
        rotateX: [12, -5, 12],
        rotateY: [0, 15, 0],
        x: [0, 25, 0],
      }}
      transition={{
        duration: 16,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
    <motion.div
      className="absolute bottom-32 left-16 w-36 h-24 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 rounded-xl blur-lg"
      animate={{
        scale: [1, 1.1, 1],
        rotate: [0, 5, 0],
        y: [0, -15, 0],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  </>
);

export default function Subjects() {
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    teacher: '',
    difficulty_level: 'medium',
    color: '#3b82f6'
  });

  const { themeClasses, language } = useTheme();
  const t = translations[language || 'en'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      const subjectsData = await Subject.filter({ created_by: userData.email });
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await Subject.create(formData);
      setIsDialogOpen(false);
      setFormData({
        name: '',
        description: '',
        teacher: '',
        difficulty_level: 'medium',
        color: '#3b82f6'
      });
      loadData();
    } catch (error) {
      console.error('Error creating subject:', error);
    }
  };

  const getDifficultyBadgeColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${themeClasses.background}`}>
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative overflow-hidden ${themeClasses.background}`}>
      <div className="fixed inset-0 pointer-events-none">
        <FloatingSubjectElements />
      </div>
      
      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
          >
            <div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                {t.subjects}
              </h1>
              <p className={`${themeClasses.textSecondary} mt-2`}>
                {subjects.length} {t.subjectsCount}
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-white shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-xl border border-white/20">
                  <Plus className="w-5 h-5 mr-2" />
                  {t.addSubject}
                </Button>
              </DialogTrigger>
              <DialogContent className={`sm:max-w-md ${themeClasses.cardGlass} border-white/20 text-white`}>
                <DialogHeader>
                  <DialogTitle>{t.addSubject}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-white/70">{t.subjectName}</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      className="bg-white/5 text-white placeholder:text-white/50 border border-white/10 focus-visible:ring-offset-background focus-visible:ring-teal-500"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="teacher" className="text-white/70">{t.teacher}</Label>
                    <Input
                      id="teacher"
                      value={formData.teacher}
                      onChange={(e) => setFormData({...formData, teacher: e.target.value})}
                      className="bg-white/5 text-white placeholder:text-white/50 border border-white/10 focus-visible:ring-offset-background focus-visible:ring-teal-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-white/70">{t.description}</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="bg-white/5 text-white placeholder:text-white/50 border border-white/10 focus-visible:ring-offset-background focus-visible:ring-teal-500"
                    />
                  </div>

                  <div>
                    <Label className="text-white/70">{t.difficulty}</Label>
                    <Select 
                      value={formData.difficulty_level} 
                      onValueChange={(value) => setFormData({...formData, difficulty_level: value})}
                    >
                      <SelectTrigger className="bg-white/5 text-white border border-white/10 focus:ring-teal-500">
                        <SelectValue className="text-white" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 text-white border-white/20">
                        <SelectItem value="easy">{t.easy}</SelectItem>
                        <SelectItem value="medium">{t.medium}</SelectItem>
                        <SelectItem value="hard">{t.hard}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white/70">{t.color}</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {colors.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                            formData.color === color.value ? 'border-white scale-110' : 'border-white/20'
                          }`}
                          style={{ backgroundColor: color.value }}
                          onClick={() => setFormData({...formData, color: color.value})}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      className="bg-white/10 text-white hover:bg-white/20 border-white/20"
                    >
                      {t.cancel}
                    </Button>
                    <Button type="submit" className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white">
                      {t.save}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </motion.div>

          {/* Subjects Grid */}
          <AnimatePresence>
            {subjects.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-6 border border-white/20">
                  <BookOpen className="w-12 h-12 text-emerald-400" />
                </div>
                <h3 className={`text-xl font-semibold ${themeClasses.textPrimary} mb-2`}>{t.noSubjects}</h3>
                <p className={`${themeClasses.textSecondary} mb-6`}>{t.addFirst}</p>
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-white backdrop-blur-xl border border-white/20"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {t.addSubject}
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((subject, index) => (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    <Card className={`${themeClasses.cardGlass} shadow-xl hover:shadow-2xl transition-all duration-300 group-hover:scale-105 overflow-hidden hover:bg-white/15`}>
                      <div 
                        className="h-2"
                        style={{ backgroundColor: subject.color + '80' }}
                      />
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className={`text-xl font-bold ${themeClasses.textPrimary} mb-2`}>
                              {subject.name}
                            </CardTitle>
                            {subject.teacher && (
                              <p className={`text-sm ${themeClasses.textSecondary} flex items-center gap-1`}>
                                <GraduationCap className="w-4 h-4" />
                                {subject.teacher}
                              </p>
                            )}
                          </div>
                          <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: subject.color + '20' }}
                          >
                            <BookOpen 
                              className="w-6 h-6" 
                              style={{ color: subject.color }}
                            />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {subject.description && (
                          <p className={`${themeClasses.textSecondary} text-sm mb-4 line-clamp-2`}>
                            {subject.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <Badge className={`${getDifficultyBadgeColor(subject.difficulty_level)} border`}>
                            {t[subject.difficulty_level]}
                          </Badge>
                          <div className="flex items-center gap-1 text-yellow-400">
                            <Star className="w-4 h-4 fill-current" />
                            <span className={`text-sm ${themeClasses.textSecondary}`}>4.8</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}