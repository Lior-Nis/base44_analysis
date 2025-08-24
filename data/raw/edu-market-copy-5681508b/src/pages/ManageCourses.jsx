import React, { useState, useEffect } from "react";
import { Course } from "@/api/entities";
import { Review } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, BookOpen, Users, Eye, MoreVertical, Star, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import CreateCourseModal from "../components/manage/CreateCourseModal";

const subjectColors = {
  mathematics: "bg-blue-100 text-blue-800",
  science: "bg-green-100 text-green-800",
  ela: "bg-purple-100 text-purple-800",
  other: "bg-gray-100 text-gray-800"
};

const difficultyColors = {
  beginner: "bg-emerald-50 text-emerald-700 border-emerald-200",
  intermediate: "bg-amber-50 text-amber-700 border-amber-200",
  advanced: "bg-rose-50 text-rose-700 border-rose-200"
};

const approvalStatusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800"
};

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [coursesData, reviewsData] = await Promise.all([
        Course.list("-created_date"),
        Review.list()
      ]);
      setCourses(coursesData);
      setReviews(reviewsData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handleSaveCourse = async (courseData) => {
    try {
      if (editingCourse) {
        await Course.update(editingCourse.id, courseData);
      } else {
        await Course.create(courseData);
      }
      setShowCreateModal(false);
      setEditingCourse(null);
      loadData();
    } catch (error) {
      console.error("Error saving course:", error);
    }
  };

  const handleToggleActive = async (course) => {
    try {
      await Course.update(course.id, { is_active: !course.is_active });
      loadData();
    } catch (error) {
      console.error("Error toggling course status:", error);
    }
  };
  
  const handleToggleApproval = async (course) => {
     try {
      const newStatus = course.approval_status === 'approved' ? 'pending' : 'approved';
      await Course.update(course.id, { approval_status: newStatus });
      loadData();
    } catch (error)
    {
        console.error("Error updating approval status:", error);
    }
  };

  const getCourseReviews = (courseId) => {
    return reviews.filter(r => r.course_id === courseId);
  };

  const getAverageRating = (courseId) => {
    const courseReviews = getCourseReviews(courseId);
    if (courseReviews.length === 0) return 0;
    const sum = courseReviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / courseReviews.length).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Course Management</h1>
            <p className="text-slate-600">Create and manage your educational content</p>
          </div>
          <Button 
            onClick={() => { setEditingCourse(null); setShowCreateModal(true); }}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Course
          </Button>
        </div>

        <AnimatePresence>
          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="animate-pulse bg-white/80 rounded-xl shadow-lg p-6 space-y-4">
                        <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-200 rounded w-full"></div>
                        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                        <div className="flex justify-between items-center pt-4">
                            <div className="h-8 bg-slate-200 rounded w-1/4"></div>
                            <div className="h-8 bg-slate-200 rounded w-1/4"></div>
                        </div>
                    </div>
                ))}
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <motion.div
                  key={course.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="h-full bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <Badge className={`${subjectColors[course.subject]} border`}>{course.subject}</Badge>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="w-8 h-8">
                                        <MoreVertical className="w-4 h-4"/>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => { setEditingCourse(course); setShowCreateModal(true); }}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        <span>Edit</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleToggleActive(course)}>
                                        {course.is_active ? "Deactivate" : "Activate"}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleToggleApproval(course)}>
                                        {course.approval_status === "approved" ? "Unapprove" : "Approve"}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                      <CardTitle className="text-xl font-bold text-slate-900 mt-2">{course.title}</CardTitle>
                      <p className="text-sm text-slate-600 line-clamp-2">{course.description}</p>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col justify-between">
                        <div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <Badge variant="outline" className={`text-xs ${difficultyColors[course.difficulty]}`}>{course.difficulty}</Badge>
                                <Badge variant="outline">{course.grade_level?.replace("_", " ")}</Badge>
                                <Badge variant="outline" className={`${approvalStatusColors[course.approval_status]}`}>
                                    {course.approval_status}
                                </Badge>
                            </div>
                             <div className="text-sm text-slate-500 space-y-2">
                                <div className="flex items-center gap-2"><FileText className="w-4 h-4" /><span>{course.materials?.length || 0} Materials</span></div>
                                <div className="flex items-center gap-2"><Star className="w-4 h-4" /><span>{getAverageRating(course.id)} ({getCourseReviews(course.id).length} reviews)</span></div>
                                <div className="flex items-center gap-2"><Eye className="w-4 h-4" /><span>{course.total_views || 0} Views</span></div>
                            </div>
                        </div>
                        <div className="flex justify-between items-end mt-4 pt-4 border-t">
                            <div className="text-2xl font-bold text-slate-900">
                                ${course.price}
                            </div>
                            <Badge className={course.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                {course.is_active ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 col-span-full"
            >
              <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No courses yet</h3>
              <p className="text-slate-500 mb-6">Create your first course to get started</p>
              <Button 
                onClick={() => { setEditingCourse(null); setShowCreateModal(true); }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Course
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <CreateCourseModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={handleSaveCourse}
          editingCourse={editingCourse}
        />
      </div>
    </div>
  );
}