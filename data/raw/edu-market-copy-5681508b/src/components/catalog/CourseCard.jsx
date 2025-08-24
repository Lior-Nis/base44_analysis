
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Award, BookOpen, FileText, Presentation, Users, CheckCircle } from "lucide-react";
import BookmarkButton from "./BookmarkButton";

const subjectColors = {
  mathematics: {
    gradient: "bg-gradient-to-r from-slate-800 to-yellow-500",
    badge: "bg-slate-800 text-yellow-400",
    label: "Advanced Mathematics"
  },
  science: {
    gradient: "bg-gradient-to-r from-teal-500 to-purple-400", 
    badge: "bg-teal-600 text-white",
    label: "Scientific Pedagogy"
  },
  ela: {
    gradient: "bg-gradient-to-r from-purple-300 to-green-600",
    badge: "bg-purple-400 text-white", 
    label: "Language Arts Excellence"
  },
  other: {
    gradient: "bg-gradient-to-r from-red-700 to-yellow-400",
    badge: "bg-red-700 text-yellow-100",
    label: "Professional Development"
  }
};

const difficultyColors = {
  beginner: "bg-emerald-50 text-emerald-700 border-emerald-200",
  intermediate: "bg-amber-50 text-amber-700 border-amber-200", 
  advanced: "bg-rose-50 text-rose-700 border-rose-200"
};

const difficultyLabels = {
  beginner: "Foundation Level",
  intermediate: "Advanced Practice",
  advanced: "Expert Mastery"
};

export default function CourseCard({ course, onPurchase, isBookmarked, onBookmarkToggle }) {
  const materialCount = course.materials?.length || 0;
  const subjectStyle = subjectColors[course.subject] || subjectColors.other;
  
  // Enhanced course descriptions
  const getEnhancedDescription = () => {
    if (course.description) return course.description;
    
    const subjectDescriptions = {
      mathematics: "Master advanced mathematical concepts through evidence-based instructional strategies designed for academic excellence.",
      science: "Integrate cutting-edge scientific methodologies with proven pedagogical frameworks for transformative learning experiences.",
      ela: "Elevate language arts instruction through research-backed approaches that foster critical thinking and scholarly communication.",
      other: "Develop specialized expertise in educational best practices with comprehensive, professionally-designed curricula."
    };
    
    return subjectDescriptions[course.subject] || subjectDescriptions.other;
  };

  // Professional learning objectives
  const getProfessionalObjectives = () => {
    if (course.learning_objectives && course.learning_objectives.length > 0) {
      return course.learning_objectives;
    }
    
    const defaultObjectives = {
      mathematics: [
        "Apply research-based mathematical pedagogies",
        "Design engaging problem-solving frameworks", 
        "Implement assessment strategies for deeper learning"
      ],
      science: [
        "Integrate inquiry-based learning methodologies", 
        "Develop hands-on experimental approaches",
        "Create evidence-based curriculum alignments"
      ],
      ela: [
        "Foster advanced literacy through innovative practice",
        "Build critical thinking through structured discourse",
        "Design comprehensive writing assessment frameworks"
      ],
      other: [
        "Implement best-practice instructional strategies",
        "Develop student-centered learning experiences", 
        "Create sustainable educational frameworks"
      ]
    };
    
    return defaultObjectives[course.subject] || defaultObjectives.other;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <Card className="h-full bg-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
        {/* Header with subject-specific gradient background */}
        <div className={`relative h-32 ${subjectStyle.gradient} p-6 text-white overflow-hidden`}>
          <BookmarkButton
            courseId={course.id}
            isBookmarked={isBookmarked}
            onToggle={onBookmarkToggle}
          />
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <Badge className={`${subjectStyle.badge} border-white/30 w-fit text-xs font-bold uppercase tracking-wider`}>
              {subjectStyle.label}
            </Badge>
            <Award className="w-8 h-8 opacity-90" />
          </div>
        </div>
        
        <CardContent className="p-6 space-y-4">
          {/* Course Title */}
          <div>
            <h3 className="text-xl font-bold text-slate-900 leading-tight mb-2">
              {course.title}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {getEnhancedDescription()}
            </p>
          </div>
          
          {/* Professional Indicators */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs font-medium">
              {course.grade_level?.replace(/_/g, ' ') || 'All Levels'}
            </Badge>
            {course.difficulty && (
              <Badge className={`text-xs font-medium border ${difficultyColors[course.difficulty]}`}>
                {difficultyLabels[course.difficulty]}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <FileText className="w-3 h-3" />
              {materialCount} Professional Resources
            </Badge>
          </div>

          {/* Learning Outcomes */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Professional Learning Outcomes
            </p>
            <ul className="space-y-1">
              {getProfessionalObjectives().slice(0, 3).map((objective, index) => (
                <li key={index} className="flex items-start gap-2 text-xs text-slate-600">
                  <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="leading-relaxed">{objective}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Course Duration & Access */}
          {course.duration && (
            <div className="flex items-center gap-4 text-xs text-slate-500 pt-2 border-t">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{course.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>Self-Paced Learning</span>
              </div>
            </div>
          )}

          {/* Investment & CTA */}
          <div className="pt-4 border-t space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">Professional Investment</p>
                <p className="text-2xl font-bold text-slate-900">
                  {course.price === 0 ? "Complimentary Access" : `$${course.price}`}
                </p>
                {course.price > 0 && (
                  <p className="text-xs text-slate-500">Includes certification & lifetime access</p>
                )}
              </div>
            </div>
            
            <Button 
              onClick={() => onPurchase(course)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Begin Your Professional Advancement
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
