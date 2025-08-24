
import React, { useEffect, useState } from "react";
import { Course, UserProgress, User } from "@/api/entities";
import { Sparkles, BookOpen, Code } from "lucide-react";
import LanguageCard from "../components/dashboard/LanguageCard";
import StatsOverview from "../components/dashboard/StatsOverview";

export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [userProgress, setUserProgress] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [coursesData, userProgressData, userData] = await Promise.all([
        Course.list("order"),
        UserProgress.list(),
        User.me().catch(() => null)
      ]);
      
      setCourses(coursesData);
      setUserProgress(userProgressData);
      setUser(userData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const getLanguageProgress = (language) => {
    const languageCourses = courses.filter(c => c.language === language);
    if (languageCourses.length === 0) return 0;
    
    const totalLessons = languageCourses.length;
    const completedLessons = userProgress.filter(p => 
      languageCourses.some(c => c.slug === p.course_slug) && p.completed
    ).length;
    
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  };

  const getLanguageStats = (language) => {
    const languageCourses = courses.filter(c => c.language === language);
    const completedLessons = userProgress.filter(p => 
      languageCourses.some(c => c.slug === p.course_slug) && p.completed
    ).length;
    
    return {
      totalLessons: languageCourses.length,
      completedLessons,
      estimatedHours: Math.ceil(languageCourses.reduce((sum, c) => sum + (c.duration_minutes || 30), 0) / 60)
    };
  };

  const languages = [
    {
      language: "python",
      title: "Python Programming",
      description: "Learn the most popular programming language for beginners. Perfect for data science, web development, and automation.",
      difficulty: "beginner",
      pageName: "PythonCourse"
    },
    {
      language: "java", 
      title: "Java Development",
      description: "Master object-oriented programming with Java. Build robust applications and understand enterprise development.",
      difficulty: "intermediate",
      pageName: "JavaCourse"
    },
    {
      language: "c",
      title: "C Programming",
      description: "Understand the fundamentals of programming with C. Learn memory management and system-level programming.",
      difficulty: "intermediate", 
      pageName: "CCourse"
    }
  ];

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4 shadow-sm border border-blue-100">
            <Sparkles className="w-4 h-4" />
            Welcome to CodeMaster
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Master Programming
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 gradient-text">One Language at a Time</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Learn Python, Java, and C with interactive lessons, hands-on practice,
            and real-world projects designed for Windows developers.
          </p>
        </div>

        {/* Stats Overview */}
        <StatsOverview 
          totalHoursLearned={Math.floor(userProgress.filter(p => p.completed).length * 0.5)}
          lessonsCompleted={userProgress.filter(p => p.completed).length}
          currentStreak={0}
          totalProjects={0}
        />

        {/* Language Cards */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Choose Your Path</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {languages.map((lang) => {
              const stats = getLanguageStats(lang.language);
              const progress = getLanguageProgress(lang.language);
              
              return (
                <LanguageCard
                  key={lang.language}
                  language={lang.language}
                  title={lang.title}
                  description={lang.description}
                  progress={progress}
                  totalLessons={stats.totalLessons}
                  completedLessons={stats.completedLessons}
                  estimatedHours={stats.estimatedHours}
                  difficulty={lang.difficulty}
                  pageName={lang.pageName}
                />
              );
            })}
          </div>
        </div>

        {/* Quick Start Section */}
        <div className="glass-effect rounded-3xl p-8 border border-blue-100">
          <div className="text-center">
            <Code className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Coding?</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Jump into our interactive practice lab and start experimenting with code right away.
            </p>
            <a href="/practice" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200">
              <Code className="w-4 h-4" />
              Open Practice Lab
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
