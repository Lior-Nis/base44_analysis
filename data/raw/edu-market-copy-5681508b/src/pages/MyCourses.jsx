
import React, { useState, useEffect } from "react";
import { Purchase } from "@/api/entities";
import { Course } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Download, ExternalLink, FileText, Presentation, File } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import PurchasedCourseCard from "../components/mycourses/PurchasedCourseCard";

export default function MyCourses() {
  const [purchases, setPurchases] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadMyCourses();
  }, []);

  const loadMyCourses = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const userPurchases = await Purchase.filter({ 
        student_email: currentUser.email,
        access_granted: true
      });
      setPurchases(userPurchases);
      
      const courseIds = userPurchases.map(p => p.course_id);
      if (courseIds.length > 0) {
        const courseData = await Promise.all(
          courseIds.map(id => Course.get(id).catch(() => null))
        );
        setCourses(courseData.filter(Boolean));
      }
    } catch (error) {
      console.error("Error loading courses:", error);
    }
    setLoading(false);
  };

  const getIconForMaterial = (type) => {
    switch (type) {
      case 'powerpoint':
      case 'google_slides':
        return Presentation;
      case 'pdf':
        return FileText;
      case 'google_doc':
        return File;
      default:
        return Download;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Learning Journey</h1>
          <p className="text-slate-600">Access all your purchased courses and materials</p>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="h-6 bg-slate-200 rounded mb-4"></div>
                    <div className="h-4 bg-slate-200 rounded mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-10 bg-slate-200 rounded"></div>
                      <div className="h-10 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : courses.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <AnimatePresence>
                {courses.map((course) => (
                  <PurchasedCourseCard
                    key={course.id}
                    course={course}
                    purchase={purchases.find(p => p.course_id === course.id)}
                    getIconForMaterial={getIconForMaterial}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No courses purchased yet</h3>
              <p className="text-slate-500 mb-6">Browse our catalog to find amazing learning materials</p>
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
