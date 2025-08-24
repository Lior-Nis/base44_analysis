import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Edit, Eye, EyeOff, DollarSign, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const subjectColors = {
  mathematics: "bg-blue-100 text-blue-800",
  science: "bg-green-100 text-green-800",
  ela: "bg-purple-100 text-purple-800",
  other: "bg-gray-100 text-gray-800"
};

export default function CourseList({ courses, purchases, loading, onEdit, onToggleActive }) {
  const getCoursePurchases = (courseId) => {
    return purchases.filter(p => p.course_id === courseId);
  };

  const getCourseRevenue = (courseId) => {
    return getCoursePurchases(courseId).reduce((sum, p) => sum + p.amount_paid, 0);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900">All Courses</CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse border rounded-lg p-4">
                  <div className="h-6 bg-slate-200 rounded mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-slate-200 rounded w-16"></div>
                    <div className="h-6 bg-slate-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {courses.map((course) => {
                  const coursePurchases = getCoursePurchases(course.id);
                  const revenue = getCourseRevenue(course.id);
                  
                  return (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-slate-900">{course.title}</h3>
                            <Badge className={subjectColors[course.subject]}>
                              {course.subject}
                            </Badge>
                            {!course.is_active && (
                              <Badge variant="outline" className="text-red-600">
                                Inactive
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-slate-600 mb-3">
                            {course.description || "No description provided"}
                          </p>
                          
                          <div className="flex items-center gap-6 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              <span className="font-medium">${course.price}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{coursePurchases.length} students</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-emerald-600">
                                ${revenue.toFixed(2)} revenue
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Switch 
                              checked={course.is_active}
                              onCheckedChange={() => onToggleActive(course.id, course.is_active)}
                            />
                            <span className="text-sm text-slate-600">
                              {course.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(course)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}