
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { SkillProfile } from "@/api/entities";
import { Subject } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
  Users,
  Plus,
  Star,
  Award,
  UserCheck,
  MessageCircle,
  ArrowRight,
  Sparkles,
  Edit,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SkillMatchmaker from "./SkillMatchmaker";
import SafetyMenu from '../safety/SafetyMenu'; // Added import for SafetyMenu

const translations = {
  he: {
    skillSwap: "קמפוס של כישרונות",
    myProfile: "הפרופיל שלי",
    strongSkills: "חזק ב...",
    helpNeeded: "צריך עזרה ב...",
    addSkill: "הוסף כישור",
    editProfile: "ערוך פרופיל",
    skillName: "שם הכישור",
    subject: "מקצוע",
    proficiencyLevel: "רמת מיומנות",
    description: "תיאור",
    urgency: "דחיפות",
    deadline: "תאריך יעד",
    save: "שמור",
    cancel: "ביטול",
    edit: "ערוך",
    delete: "מחק",
    beginner: "מתחיל",
    intermediate: "בינוני",
    advanced: "מתקדם",
    low: "נמוכה",
    medium: "בינונית",
    high: "גבוהה",
    helpedOthers: "עזר לאחרים",
    receivedHelp: "קיבל עזרה",
    times: "פעמים",
    smartMatches: "התאמות חכמות",
    noSkillsYet: "עדיין לא הוספת כישורים",
    addFirstSkill: "הוסף את הכישור הראשון שלך",
    selectSubject: "בחר מקצוע",
    optional: "אופציונלי"
  },
  en: {
    skillSwap: "Skill Swap",
    myProfile: "My Profile",
    strongSkills: "Strong in...",
    helpNeeded: "Need help with...",
    addSkill: "Add Skill",
    editProfile: "Edit Profile",
    skillName: "Skill Name",
    subject: "Subject",
    proficiencyLevel: "Proficiency Level",
    description: "Description",
    urgency: "Urgency",
    deadline: "Deadline",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    low: "Low",
    medium: "Medium",
    high: "High",
    helpedOthers: "Helped Others",
    receivedHelp: "Received Help",
    times: "Times",
    smartMatches: "Smart Matches",
    noSkillsYet: "No skills added yet",
    addFirstSkill: "Add your first skill",
    selectSubject: "Select Subject",
    optional: "Optional"
  }
};

const proficiencyColors = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-blue-100 text-blue-800",
  advanced: "bg-purple-100 text-purple-800"
};

const urgencyColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800"
};

export default function SkillSwap({ language = 'he' }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingSkillType, setEditingSkillType] = useState('strong');
  const [editingSkillIndex, setEditingSkillIndex] = useState(-1);
  const [newSkill, setNewSkill] = useState({
    skill_name: '',
    subject_id: '',
    proficiency_level: 'intermediate',
    description: '',
    urgency: 'medium',
    deadline: ''
  });

  const t = translations[language];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      const [profileData, subjectsData] = await Promise.all([
        SkillProfile.filter({ user_id: userData.id }),
        Subject.filter({ created_by: userData.email })
      ]);

      if (profileData.length > 0) {
        setUserProfile(profileData[0]);
      } else {
        const newProfile = await SkillProfile.create({
          user_id: userData.id,
          strong_skills: [],
          help_needed: [],
          availability: {
            online_available: true,
            preferred_times: []
          },
          interaction_stats: {
            helped_count: 0,
            received_help_count: 0,
            average_rating: 5.0
          }
        });
        setUserProfile(newProfile);
      }

      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setNewSkill({
      skill_name: '',
      subject_id: '',
      proficiency_level: 'intermediate',
      description: '',
      urgency: 'medium',
      deadline: ''
    });
    setEditingSkillIndex(-1);
  };

  const openCreateDialog = (type) => {
    resetForm();
    setEditingSkillType(type);
    setShowEditDialog(true);
  };

  const openEditDialog = (type, index) => {
    setEditingSkillType(type);
    setEditingSkillIndex(index);
    const skillToEdit = userProfile[type === 'strong' ? 'strong_skills' : 'help_needed'][index];
    // Ensure all fields are present, even if null/undefined in the skill object
    setNewSkill({
      skill_name: skillToEdit.skill_name || '',
      subject_id: skillToEdit.subject_id || '',
      proficiency_level: skillToEdit.proficiency_level || 'intermediate',
      description: skillToEdit.description || '',
      urgency: skillToEdit.urgency || 'medium',
      deadline: skillToEdit.deadline || ''
    });
    setShowEditDialog(true);
  };

  const handleSaveSkill = async () => {
    if (!userProfile || !newSkill.skill_name) return;

    let updatedProfile;
    const isEditing = editingSkillIndex > -1;

    try {
      if (editingSkillType === 'strong') {
        const skills = [...(userProfile.strong_skills || [])];
        const skillData = {
          skill_name: newSkill.skill_name,
          subject_id: newSkill.subject_id,
          proficiency_level: newSkill.proficiency_level,
          description: newSkill.description
        };
        if (isEditing) {
          skills[editingSkillIndex] = skillData;
        } else {
          skills.push(skillData);
        }
        updatedProfile = { ...userProfile, strong_skills: skills };
      } else { // help_needed
        const skills = [...(userProfile.help_needed || [])];
        const skillData = {
          skill_name: newSkill.skill_name,
          subject_id: newSkill.subject_id,
          urgency: newSkill.urgency,
          deadline: newSkill.deadline,
          description: newSkill.description
        };
        if (isEditing) {
          skills[editingSkillIndex] = skillData;
        } else {
          skills.push(skillData);
        }
        updatedProfile = { ...userProfile, help_needed: skills };
      }

      await SkillProfile.update(userProfile.id, updatedProfile);
      setUserProfile(updatedProfile);
      setShowEditDialog(false);
      resetForm();

    } catch (error) {
      console.error('Error saving skill:', error);
    }
  };

  const handleDeleteSkill = async (type, index) => {
    if (!userProfile) return;

    try {
      let updatedProfile;
      if (type === 'strong') {
        const skills = (userProfile.strong_skills || []).filter((_, i) => i !== index);
        updatedProfile = { ...userProfile, strong_skills: skills };
      } else {
        const skills = (userProfile.help_needed || []).filter((_, i) => i !== index);
        updatedProfile = { ...userProfile, help_needed: skills };
      }

      await SkillProfile.update(userProfile.id, updatedProfile);
      setUserProfile(updatedProfile);
    } catch (error) {
      console.error('Error deleting skill:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const renderSkillCard = (skill, index, type) => {
    const isStrong = type === 'strong';
    const subject = subjects.find(s => s.id === skill.subject_id);

    return (
      <motion.div
        key={`${type}-${index}`} // Use a more unique key
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="group bg-white/20 backdrop-blur-md p-4 rounded-lg border border-white/30"
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h4 className="font-bold text-white">{skill.skill_name}</h4>
            {subject && (
              <p className="text-xs text-white/80">{subject.name}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              {isStrong ? (
                <Badge className={proficiencyColors[skill.proficiency_level]}>
                  {t[skill.proficiency_level]}
                </Badge>
              ) : (
                <>
                  <Badge className={urgencyColors[skill.urgency]}>
                    {t.urgency}: {t[skill.urgency]}
                  </Badge>
                  {skill.deadline && (
                    <Badge variant="outline" className="text-white/70 border-white/30">
                      {t.deadline}: {new Date(skill.deadline).toLocaleDateString(language)}
                    </Badge>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant="ghost" className="h-8 w-8 text-white/80 hover:bg-white/30 hover:text-white" onClick={() => openEditDialog(type, index)}>
              <Edit className="w-4 h-4" />
            </Button>
            <SafetyMenu
              targetUser={{ id: 'skill', full_name: skill.skill_name }}
              context="skill_swap"
              relatedId={skill.skill_name}
              language={language}
              className="h-8 w-8 p-0"
            />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:bg-red-500/30 hover:text-red-300">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white/95 backdrop-blur-xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
                  <AlertDialogDescription>
                    פעולה זו תמחק את הכישור "{skill.skill_name}" לצמיתות. לא ניתן לבטל פעולה זו.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDeleteSkill(type, index)} className="bg-red-500 hover:bg-red-600 text-white">
                    {t.delete}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        {skill.description && (
          <p className="text-sm text-white/90 mt-2">{skill.description}</p>
        )}
      </motion.div>
    );
  };


  return (
    <div className="space-y-6">
      {/* My Profile Section */}
      <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Users className="w-5 h-5 text-purple-400" />
            {t.myProfile}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Stats */}
          {userProfile?.interaction_stats && (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/15 rounded-lg">
                <div className="text-2xl font-bold text-emerald-400">
                  {userProfile.interaction_stats.helped_count || 0}
                </div>
                <div className="text-sm text-white/80">{t.helpedOthers}</div>
              </div>
              <div className="text-center p-4 bg-white/15 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">
                  {userProfile.interaction_stats.received_help_count || 0}
                </div>
                <div className="text-sm text-white/80">{t.receivedHelp}</div>
              </div>
            </div>
          )}

          {/* Strong Skills */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                {t.strongSkills}
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openCreateDialog('strong')}
                className="text-yellow-300 hover:bg-yellow-400/20"
              >
                <Plus className="w-4 h-4 mr-1" />
                {t.addSkill}
              </Button>
            </div>

            <div className="space-y-3">
              {userProfile?.strong_skills?.length > 0 ? (
                userProfile.strong_skills.map((skill, index) => renderSkillCard(skill, index, 'strong'))
              ) : (
                <div className="text-center py-8 text-white/60">
                  <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t.noSkillsYet}</p>
                  <Button
                    onClick={() => openCreateDialog('strong')}
                    className="mt-3 bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30"
                  >
                    {t.addFirstSkill}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Help Needed */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-400" />
                {t.helpNeeded}
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => openCreateDialog('help')}
                className="text-blue-300 hover:bg-blue-400/20"
              >
                <Plus className="w-4 h-4 mr-1" />
                {t.addSkill}
              </Button>
            </div>

            <div className="space-y-3">
              {userProfile?.help_needed?.length > 0 ? (
                userProfile.help_needed.map((skill, index) => renderSkillCard(skill, index, 'help'))
              ) : (
                <div className="text-center py-8 text-white/60">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{t.noSkillsYet}</p>
                  <Button
                    onClick={() => openCreateDialog('help')}
                    className="mt-3 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                  >
                    {t.addFirstSkill}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Matches */}
      <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5 text-pink-400" />
            {t.smartMatches}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SkillMatchmaker
            userProfile={userProfile}
            language={language}
          />
        </CardContent>
      </Card>

      {/* Edit Skill Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>
              {editingSkillIndex >= 0 ? t.edit : t.addSkill} - {editingSkillType === 'strong' ? t.strongSkills : t.helpNeeded}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="skill-name">{t.skillName}</Label>
              <Input
                id="skill-name"
                value={newSkill.skill_name}
                onChange={(e) => setNewSkill({ ...newSkill, skill_name: e.target.value })}
                placeholder="לדוגמה: אלגברה ליניארית, פיתוח אתרים..."
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            {subjects.length > 0 && (
              <div className="space-y-2">
                <Label>{t.subject} ({t.optional})</Label>
                <Select
                  value={newSkill.subject_id}
                  onValueChange={(value) => setNewSkill({ ...newSkill, subject_id: value })}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder={t.selectSubject} />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 text-white border-gray-700">
                    <SelectItem value={null}>{t.selectSubject}</SelectItem> {/* Changed null to "" for consistency */}
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {editingSkillType === 'strong' && (
              <div className="space-y-2">
                <Label>{t.proficiencyLevel}</Label>
                <Select
                  value={newSkill.proficiency_level}
                  onValueChange={(value) => setNewSkill({ ...newSkill, proficiency_level: value })}
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
            )}

            {editingSkillType === 'help' && (
              <>
                <div className="space-y-2">
                  <Label>{t.urgency}</Label>
                  <Select
                    value={newSkill.urgency}
                    onValueChange={(value) => setNewSkill({ ...newSkill, urgency: value })}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 text-white border-gray-700">
                      <SelectItem value="low">{t.low}</SelectItem>
                      <SelectItem value="medium">{t.medium}</SelectItem>
                      <SelectItem value="high">{t.high}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">{t.deadline} ({t.optional})</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={newSkill.deadline || ''}
                    onChange={(e) => setNewSkill({ ...newSkill, deadline: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">{t.description} ({t.optional})</Label>
              <Textarea
                id="description"
                value={newSkill.description}
                onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
                placeholder="פרטים נוספים..."
                rows={3}
                className="resize-none bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditDialog(false)}
              >
                {t.cancel}
              </Button>
              <Button
                onClick={handleSaveSkill}
                disabled={!newSkill.skill_name}
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
              >
                {t.save}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
