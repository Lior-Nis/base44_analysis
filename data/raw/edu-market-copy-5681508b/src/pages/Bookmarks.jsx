import React, { useState, useEffect } from "react";
import { Bookmark } from "@/api/entities";
import { Course } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Trash2, Star, Clock, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const subjectColors = {
    mathematics: "bg-blue-100 text-blue-800",
    science: "bg-green-100 text-green-800",
    ela: "bg-purple-100 text-purple-800",
    other: "bg-gray-100 text-gray-800"
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const userBookmarks = await Bookmark.filter({ student_email: currentUser.email }, "-created_date");
      setBookmarks(userBookmarks);
      
      if (userBookmarks.length > 0) {
        const courseIds = userBookmarks.map(b => b.course_id);
        const courseData = await Promise.all(
          courseIds.map(id => Course.get(id).catch(() => null))
        );
        setCourses(courseData.filter(Boolean));
      }
    } catch (error) {
      console.error("Error loading bookmarks:", error);
    }
    setLoading(false);
  };

  const getCourseForBookmark = (courseId) => {
    return courses.find(c => c.id === courseId);
  };

  const removeBookmark = async (bookmarkId) => {
    try {
      await Bookmark.delete(bookmarkId);
      loadBookmarks();
    } catch (error) {
      console.error("Error removing bookmark:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Bookmarks</h1>
          <p className="text-slate-600">Courses you've saved for later</p>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="h-6 bg-slate-200 rounded mb-4"></div>
                    <div className="h-4 bg-slate-200 rounded mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded mb-4"></div>
                    <div className="h-10 bg-slate-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : bookmarks.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <AnimatePresence>
                {bookmarks.map((bookmark) => {
                  const course = getCourseForBookmark(bookmark.course_id);
                  if (!course) return null;

                  return (
                    <motion.div
                      key={bookmark.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      layout
                    >
                      <Card className="h-full bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 relative group">
                        <CardHeader>
                          <div className="flex justify-between items-start mb-2">
                            <Badge className={subjectColors[course.subject]}>
                              {course.subject}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeBookmark(bookmark.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <CardTitle className="text-xl font-bold text-slate-900 mb-2">
                            {course.title}
                          </CardTitle>
                          <p className="text-sm text-slate-600 line-clamp-2">
                            {course.description}
                          </p>
                        </CardHeader>

                        <CardContent className="flex-grow flex flex-col justify-between">
                          <div className="space-y-3 mb-4">
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{course.duration || "Self-paced"}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400" />
                                <span>{course.average_rating || "New"}</span>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="text-xs">
                                {course.grade_level?.replace("_", " ")}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {course.difficulty}
                              </Badge>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold text-slate-900">
                                {course.price === 0 ? "Free" : `$${course.price}`}
                              </span>
                            </div>
                            
                            <Link to={createPageUrl("Catalog")} className="w-full">
                              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                                View Course Details
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No bookmarks yet</h3>
              <p className="text-slate-500 mb-6">Start bookmarking courses you're interested in</p>
              <Link to={createPageUrl("Catalog")}>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Browse Courses
                </Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}