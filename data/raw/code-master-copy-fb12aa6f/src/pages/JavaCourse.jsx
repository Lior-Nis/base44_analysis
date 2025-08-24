
import React, { useEffect, useState } from "react";
import { Course, Lesson, UserProgress, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Play, CheckCircle, Clock, Code } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ReactMarkdown from "react-markdown";
import CodeEditor from "../components/lessons/CodeEditor";

export default function JavaCourse() {
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [userProgress, setUserProgress] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [coursesData, lessonsData, progressData, userData] = await Promise.all([
        Course.filter({ language: "java" }, "order"),
        Lesson.filter({ language: "java" }, "order"), // Changed: Filter lessons by language "java"
        UserProgress.list(),
        User.me().catch(() => null)
      ]);
      
      setCourses(coursesData);
      setLessons(lessonsData); // No longer need to filter lessons here
      setUserProgress(progressData);
      setUser(userData);
      
      // Changed: Use lessonsData directly as it's already filtered
      if (lessonsData.length > 0) {
        setSelectedLesson(lessonsData[0]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const markLessonComplete = async (lessonId) => {
    if (!user) return;
    
    try {
      await UserProgress.create({
        user_email: user.email,
        course_slug: selectedLesson?.course_slug, // Changed: Use course_slug instead of course_id
        lesson_id: lessonId,
        completed: true,
        completion_date: new Date().toISOString()
      });
      
      loadData();
    } catch (error) {
      console.error("Error marking lesson complete:", error);
    }
  };

  const isLessonCompleted = (lessonId) => {
    return userProgress.some(p => p.lesson_id === lessonId && p.completed);
  };

  const getProgressPercentage = () => {
    if (lessons.length === 0) return 0;
    const completed = userProgress.filter(p => p.completed && 
      lessons.some(l => l.id === p.lesson_id)).length;
    return Math.round((completed / lessons.length) * 100);
  };

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" size="icon" className="hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">☕</span>
              <h1 className="text-3xl font-bold text-gray-900">Java Development</h1>
            </div>
            <div className="flex items-center gap-4">
              <Progress value={getProgressPercentage()} className="flex-1 max-w-xs h-2 [&>div]:bg-orange-500" />
              <span className="text-sm font-medium text-orange-600">
                {getProgressPercentage()}% Complete
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Lessons
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {lessons.map((lesson, index) => (
                    <button
                      key={lesson.id}
                      onClick={() => setSelectedLesson(lesson)}
                      className={`w-full text-left p-4 hover:bg-orange-50 transition-colors border-l-4 rounded-r-lg ${
                        selectedLesson?.id === lesson.id 
                          ? 'border-orange-500 bg-orange-100' 
                          : 'border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          isLessonCompleted(lesson.id)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {isLessonCompleted(lesson.id) ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">
                            {lesson.title}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            ~30 min
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-8">
            {selectedLesson ? (
              <>
                <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      {selectedLesson.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-gray max-w-none">
                    <ReactMarkdown>{selectedLesson.content}</ReactMarkdown>
                  </CardContent>
                </Card>

                {selectedLesson.code_example && (
                  <CodeEditor
                    initialCode={selectedLesson.code_example}
                    language="java"
                    expectedOutput={selectedLesson.expected_output}
                  />
                )}

                <div className="flex justify-between items-center">
                  <Button variant="outline" className="hover:bg-gray-100">
                    Previous Lesson
                  </Button>
                  <Button
                    onClick={() => markLessonComplete(selectedLesson.id)}
                    disabled={isLessonCompleted(selectedLesson.id)}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg"
                  >
                    {isLessonCompleted(selectedLesson.id) ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Mark Complete
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <Code className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Lessons Available
                  </h3>
                  <p className="text-gray-600">
                    Java lessons will be added soon. Check back later!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
