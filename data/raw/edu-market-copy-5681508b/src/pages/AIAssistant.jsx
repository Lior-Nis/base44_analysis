import React, { useState, useEffect } from "react";
import { Course } from "@/api/entities";
import { Purchase } from "@/api/entities";
import { User } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Sparkles, BookOpen, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AIAssistant() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [userPurchases, setUserPurchases] = useState([]);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const allCourses = await Course.filter({ is_active: true, approval_status: "approved" });
      setCourses(allCourses);
      
      const purchases = await Purchase.filter({ student_email: currentUser.email });
      setUserPurchases(purchases);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const getRecommendations = async () => {
    if (!query.trim() || !user) return;
    
    setLoading(true);
    try {
      // Prepare context about user's purchased courses
      const purchasedCourseIds = userPurchases.map(p => p.course_id);
      const purchasedCourses = courses.filter(c => purchasedCourseIds.includes(c.id));
      
      const userContext = {
        purchased_courses: purchasedCourses.map(c => ({
          title: c.title,
          subject: c.subject,
          grade_level: c.grade_level,
          difficulty: c.difficulty
        })),
        available_courses: courses.filter(c => !purchasedCourseIds.includes(c.id)).map(c => ({
          id: c.id,
          title: c.title,
          subject: c.subject,
          grade_level: c.grade_level,
          difficulty: c.difficulty,
          price: c.price,
          description: c.description
        }))
      };

      const prompt = `You are an AI educational assistant for Academic Zone, a professional development platform for educators.

User Query: "${query}"

User Context:
- Purchased Courses: ${JSON.stringify(userContext.purchased_courses)}
- Available Courses: ${JSON.stringify(userContext.available_courses)}

Based on the user's query and their learning history, recommend 3-5 relevant courses from the available courses. 
Consider their educational background, current courses, and learning goals.

Provide personalized explanations for why each course would benefit them specifically.`;

      const response = await InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommended_courses: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  course_id: { type: "string" },
                  title: { type: "string" },
                  reason: { type: "string" },
                  relevance_score: { type: "number" }
                }
              }
            },
            general_advice: { type: "string" }
          }
        }
      });

      setRecommendations(response);
    } catch (error) {
      console.error("Error getting recommendations:", error);
    }
    setLoading(false);
  };

  const getCourseById = (courseId) => {
    return courses.find(c => c.id === courseId);
  };

  const subjectColors = {
    mathematics: "bg-blue-100 text-blue-800",
    science: "bg-green-100 text-green-800", 
    ela: "bg-purple-100 text-purple-800",
    other: "bg-gray-100 text-gray-800"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">AI Learning Assistant</h1>
              <p className="text-slate-600">Get personalized course recommendations based on your goals</p>
            </div>
          </div>
        </div>

        {/* Query Input */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              What would you like to learn?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., 'I want to improve my math teaching skills for high school' or 'Help me find science courses for beginners'"
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && getRecommendations()}
              />
              <Button 
                onClick={getRecommendations}
                disabled={loading || !query.trim()}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            {/* Quick Suggestions */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-slate-600">Try asking:</span>
              {[
                "Beginner math courses",
                "Advanced science teaching",
                "Professional development",
                "Creative writing skills"
              ].map((suggestion) => (
                <Button
                  key={suggestion}
                  size="sm"
                  variant="outline"
                  onClick={() => setQuery(suggestion)}
                  className="text-xs"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <AnimatePresence>
          {recommendations && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* General Advice */}
              {recommendations.general_advice && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Bot className="w-6 h-6 text-purple-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-2">AI Recommendation</h3>
                        <p className="text-slate-700 leading-relaxed">{recommendations.general_advice}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Course Recommendations */}
              <div className="grid gap-6">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Recommended Courses for You
                </h3>
                
                {recommendations.recommended_courses?.map((rec, index) => {
                  const course = getCourseById(rec.course_id);
                  if (!course) return null;

                  return (
                    <motion.div
                      key={rec.course_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-xl font-bold text-slate-900">{course.title}</h4>
                                <Badge className={subjectColors[course.subject]}>
                                  {course.subject}
                                </Badge>
                                <Badge variant="outline">
                                  {Math.round(rec.relevance_score * 100)}% match
                                </Badge>
                              </div>
                              <p className="text-slate-600 mb-3">{course.description}</p>
                              <div className="bg-purple-50 p-4 rounded-lg mb-4">
                                <p className="text-sm font-medium text-purple-800 mb-1">Why this course is perfect for you:</p>
                                <p className="text-sm text-purple-700">{rec.reason}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="text-2xl font-bold text-slate-900">
                              {course.price === 0 ? "Free" : `$${course.price}`}
                            </div>
                            <Link to={createPageUrl("Catalog")}>
                              <Button className="bg-purple-600 hover:bg-purple-700">
                                <BookOpen className="w-4 h-4 mr-2" />
                                View Course
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!recommendations && !loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <Bot className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">Ready to help you learn!</h3>
              <p className="text-slate-500">Ask me about your learning goals and I'll recommend the perfect courses for your professional development.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}