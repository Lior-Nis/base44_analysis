import React, { useState, useEffect } from "react";
import { ProjectPartnership } from "@/api/entities";
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Briefcase, Users, Plus, Search, Tag, UserPlus, Clock, Edit, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const translations = {
  he: {
    projectPartners: "שותפים לפרויקטים",
    createProject: "צור פרויקט",
    searchProjects: "חפש פרויקטים...",
    noProjectsFound: "לא נמצאו פרויקטים",
    createFirstProject: "צור את הפרויקט הראשון שלך!",
    joinProject: "הצטרף",
    joined: "הצטרפת",
    full: "מלא",
    members: "חברים",
    deadline: "תאריך הגשה",
    requiredSkills: "כישורים נדרשים",
    editProject: "ערוך פרויקט",
    deleteProject: "מחק פרויקט",
    projectName: "שם הפרויקט",
    description: "תיאור",
    courseName: "שם הקורס",
    subject: "מקצוע",
    selectSubject: "בחר מקצוע",
    teamSize: "גודל צוות",
    save: "שמור",
    cancel: "ביטול",
    delete: "מחק",
    open: "פתוח",
    in_progress: "בעבודה",
    completed: "הושלם"
  },
  en: {
    projectPartners: "Project Partners",
    createProject: "Create Project",
    searchProjects: "Search projects...",
    noProjectsFound: "No projects found",
    createFirstProject: "Create your first project!",
    joinProject: "Join",
    joined: "Joined",
    full: "Full",
    members: "Members",
    deadline: "Deadline",
    requiredSkills: "Required Skills",
    editProject: "Edit Project",
    deleteProject: "Delete Project",
    projectName: "Project Name",
    description: "Description",
    courseName: "Course Name",
    subject: "Subject",
    selectSubject: "Select Subject",
    teamSize: "Team Size",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    open: "Open",
    in_progress: "In Progress",
    completed: "Completed"
  }
};

const statusColors = {
  open: "bg-green-100 text-green-800",
  in_progress: "bg-blue-100 text-blue-800",
  full: "bg-yellow-100 text-yellow-800",
  completed: "bg-gray-100 text-gray-800"
};

const initialFormState = {
  title: '',
  description: '',
  course_name: '',
  subject_id: '',
  deadline: '',
  required_skills: '',
  team_size: 2,
};

export default function ProjectPartnerFinder({ language = 'he' }) {
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [searchQuery, setSearchQuery] = useState('');

  const t = translations[language];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchQuery]);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      const [projectsData, subjectsData] = await Promise.all([
        ProjectPartnership.list('-created_date', 50),
        Subject.filter({ created_by: userData.email })
      ]);
      
      setProjects(projectsData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProjects = () => {
    const filtered = projects.filter(project =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.required_skills?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredProjects(filtered);
  };
  
  const openCreateDialog = () => {
    setEditingProject(null);
    setFormData(initialFormState);
    setShowCreateDialog(true);
  };

  const openEditDialog = (project) => {
    setEditingProject(project);
    setFormData({
      ...project,
      deadline: project.deadline ? project.deadline.split('T')[0] : '',
      required_skills: project.required_skills?.join(', ') || ''
    });
    setShowCreateDialog(true);
  };

  const handleSaveProject = async () => {
    if (!formData.title || !formData.course_name) return;

    try {
      const skillsArray = formData.required_skills.split(',').map(s => s.trim()).filter(Boolean);
      const projectData = { ...formData, required_skills: skillsArray };
      
      if (editingProject) {
        await ProjectPartnership.update(editingProject.id, projectData);
      } else {
        await ProjectPartnership.create({
          ...projectData,
          creator_id: user.id,
          current_members: [{ user_id: user.id, role: 'creator', joined_at: new Date().toISOString() }],
          status: 'open'
        });
      }
      
      setShowCreateDialog(false);
      loadData();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await ProjectPartnership.delete(projectId);
      loadData();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const joinProject = async (project) => {
    if (!user || project.current_members.some(m => m.user_id === user.id)) return;

    try {
      const updatedMembers = [
        ...project.current_members,
        { user_id: user.id, role: 'member', joined_at: new Date().toISOString() }
      ];

      await ProjectPartnership.update(project.id, {
        current_members: updatedMembers,
        status: updatedMembers.length >= project.team_size ? 'full' : project.status
      });

      loadData();
    } catch (error) {
      console.error('Error joining project:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Create */}
      <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="flex items-center gap-2 text-white">
              <Briefcase className="w-5 h-5 text-orange-400" />
              {t.projectPartners}
            </CardTitle>
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchProjects}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                />
              </div>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateDialog} className="bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 border border-orange-400/30">
                    <Plus className="w-4 h-4 mr-1" />
                    {t.createProject}
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700 text-white">
                  <DialogHeader>
                    <DialogTitle>{editingProject ? t.editProject : t.createProject}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="space-y-2">
                      <Label>{t.projectName}</Label>
                      <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="bg-gray-700 border-gray-600 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t.description}</Label>
                      <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="bg-gray-700 border-gray-600 text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t.courseName}</Label>
                      <Input value={formData.course_name} onChange={(e) => setFormData({...formData, course_name: e.target.value})} className="bg-gray-700 border-gray-600 text-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t.subject}</Label>
                        <Select value={formData.subject_id} onValueChange={(value) => setFormData({...formData, subject_id: value})}>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white"><SelectValue placeholder={t.selectSubject} /></SelectTrigger>
                          <SelectContent className="bg-gray-800 text-white border-gray-700">
                            {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t.deadline}</Label>
                        <Input type="date" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} className="bg-gray-700 border-gray-600 text-white" />
                      </div>
                    </div>
                    <div className="space-y-2">
                        <Label>{t.requiredSkills}</Label>
                        <Input value={formData.required_skills} onChange={(e) => setFormData({...formData, required_skills: e.target.value})} placeholder="לדוגמה: React, Python, עיצוב" className="bg-gray-700 border-gray-600 text-white" />
                        <p className="text-xs text-gray-400">הפרד כישורים עם פסיק</p>
                    </div>
                    <div className="space-y-2">
                        <Label>{t.teamSize}</Label>
                        <Input type="number" min="2" value={formData.team_size} onChange={(e) => setFormData({...formData, team_size: parseInt(e.target.value)})} className="bg-gray-700 border-gray-600 text-white" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>{t.cancel}</Button>
                    <Button onClick={handleSaveProject}>{t.save}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredProjects.map((project) => {
              const isCreator = project.creator_id === user?.id;
              const isMember = project.current_members.some(m => m.user_id === user?.id);
              const isFull = project.current_members.length >= project.team_size;

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="group"
                >
                  <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col h-full">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-bold text-white line-clamp-1">{project.title}</CardTitle>
                        <Badge className={`${statusColors[project.status]}`}>
                          {t[project.status] || project.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-white/70">{project.course_name}</p>
                    </CardHeader>
                    <CardContent className="space-y-3 flex-1 flex flex-col">
                      <p className="text-sm text-white/80 line-clamp-3 flex-1">{project.description}</p>
                      
                      {project.required_skills?.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-white/70 mb-2">{t.requiredSkills}</h4>
                          <div className="flex flex-wrap gap-2">
                            {project.required_skills.map(skill => (
                              <Badge key={skill} variant="outline" className="text-orange-300 border-orange-300/30">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <div className="p-4 border-t border-white/20 mt-auto">
                      <div className="flex justify-between items-center text-sm text-white/80 mb-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{t.deadline}: {new Date(project.deadline).toLocaleDateString('he-IL')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{project.current_members.length}/{project.team_size} {t.members}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        {isCreator ? (
                          <>
                            <Button size="sm" className="flex-1" onClick={() => openEditDialog(project)}>
                              <Edit className="w-4 h-4 mr-1" /> {t.editProject}
                            </Button>
                             <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="icon" variant="destructive" className="bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-400/30">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    פעולה זו תמחק את הפרויקט "{project.title}" לצמיתות.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>ביטול</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteProject(project.id)}>
                                    מחק
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        ) : isMember ? (
                          <Badge className="bg-green-100 text-green-800 px-3 py-2 w-full justify-center">{t.joined}</Badge>
                        ) : isFull ? (
                          <Badge className="bg-yellow-100 text-yellow-800 px-3 py-2 w-full justify-center">{t.full}</Badge>
                        ) : (
                          <Button size="sm" className="w-full bg-orange-500/30 hover:bg-orange-500/40" onClick={() => joinProject(project)}>
                            <UserPlus className="w-4 h-4 mr-2" />
                            {t.joinProject}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl p-12 text-center">
          <Briefcase className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">{t.noProjectsFound}</h3>
          <p className="text-white/70 mb-6">{t.createFirstProject}</p>
          <Button onClick={openCreateDialog} className="bg-orange-500/20 text-orange-300 hover:bg-orange-500/30 border border-orange-400/30">
            <Plus className="w-4 h-4 mr-2" />
            {t.createProject}
          </Button>
        </Card>
      )}
    </div>
  );
}