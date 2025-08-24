import React, { useState, useEffect } from "react";
import { Review } from "@/api/entities";
import { Course } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, MessageCircle, Edit, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(5);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const userReviews = await Review.filter({ student_email: currentUser.email }, "-created_date");
      setReviews(userReviews);
      
      const courseIds = userReviews.map(r => r.course_id);
      if (courseIds.length > 0) {
        const courseData = await Promise.all(
          courseIds.map(id => Course.get(id).catch(() => null))
        );
        setCourses(courseData.filter(Boolean));
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
    }
    setLoading(false);
  };

  const getCourseForReview = (courseId) => {
    return courses.find(c => c.id === courseId);
  };

  const handleEditReview = (review) => {
    setEditingReview(review.id);
    setEditText(review.review_text || "");
    setEditRating(review.rating);
  };

  const saveEdit = async () => {
    try {
      await Review.update(editingReview, {
        review_text: editText,
        rating: editRating,
        is_approved: false // Needs re-approval after edit
      });
      setEditingReview(null);
      loadReviews();
    } catch (error) {
      console.error("Error updating review:", error);
    }
  };

  const deleteReview = async (reviewId) => {
    if (confirm("Are you sure you want to delete this review?")) {
      try {
        await Review.delete(reviewId);
        loadReviews();
      } catch (error) {
        console.error("Error deleting review:", error);
      }
    }
  };

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onStarClick && onStarClick(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Course Reviews</h1>
          <p className="text-slate-600">Reviews you've written for courses</p>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <div className="space-y-6">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="h-6 bg-slate-200 rounded mb-4"></div>
                    <div className="h-4 bg-slate-200 rounded mb-2"></div>
                    <div className="h-16 bg-slate-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <AnimatePresence>
                {reviews.map((review) => {
                  const course = getCourseForReview(review.course_id);
                  if (!course) return null;

                  return (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="bg-white/80 backdrop-blur-sm border-slate-200/60 shadow-lg">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-xl font-bold">{course.title}</CardTitle>
                              <div className="flex items-center gap-4 mt-2">
                                {renderStars(review.rating)}
                                <span className="text-sm text-slate-500">
                                  Reviewed on {new Date(review.created_date).toLocaleDateString()}
                                </span>
                                <Badge 
                                  className={review.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                                >
                                  {review.is_approved ? 'Published' : 'Pending Approval'}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditReview(review)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteReview(review.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          {editingReview === review.id ? (
                            <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium mb-2">Your Rating</label>
                                {renderStars(editRating, true, setEditRating)}
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium mb-2">Your Review</label>
                                <Textarea
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  placeholder="Share your experience with this course..."
                                  rows={4}
                                />
                              </div>
                              
                              <div className="flex gap-2">
                                <Button onClick={saveEdit}>Save Changes</Button>
                                <Button variant="outline" onClick={() => setEditingReview(null)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              {review.review_text ? (
                                <p className="text-slate-700 leading-relaxed">{review.review_text}</p>
                              ) : (
                                <p className="text-slate-400 italic">No written review provided</p>
                              )}
                            </div>
                          )}
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
              <MessageCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No reviews yet</h3>
              <p className="text-slate-500 mb-6">Purchase and complete courses to leave reviews</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}