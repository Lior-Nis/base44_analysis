import React, { useState, useEffect } from "react";
import { Review } from "@/api/entities";
import { User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CourseRating({ courseId, averageRating, totalReviews, onRatingUpdate }) {
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadReviews();
    loadUser();
  }, [courseId]);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      // User not logged in
    }
  };

  const loadReviews = async () => {
    try {
      const courseReviews = await Review.filter({ course_id: courseId, is_approved: true }, "-created_date");
      setReviews(courseReviews);
      
      if (user) {
        const existingReview = courseReviews.find(r => r.student_email === user.email);
        setUserReview(existingReview);
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
    }
  };

  const submitReview = async () => {
    if (!user) return;
    
    try {
      const reviewData = {
        course_id: courseId,
        student_email: user.email,
        rating: newRating,
        review_text: newReviewText,
        is_approved: false
      };

      if (userReview) {
        await Review.update(userReview.id, reviewData);
      } else {
        await Review.create(reviewData);
      }

      setNewReviewText("");
      setShowReviewForm(false);
      loadReviews();
      
      if (onRatingUpdate) {
        onRatingUpdate();
      }
    } catch (error) {
      console.error("Error submitting review:", error);
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
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5" />
            Course Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            {renderStars(averageRating)}
            <span className="text-lg font-semibold">{averageRating.toFixed(1)}</span>
            <span className="text-slate-500">({totalReviews} reviews)</span>
          </div>
          
          {user && !userReview && (
            <Button 
              onClick={() => setShowReviewForm(!showReviewForm)}
              variant="outline"
              className="mb-4"
            >
              Write a Review
            </Button>
          )}

          <AnimatePresence>
            {showReviewForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 mb-6 p-4 bg-slate-50 rounded-lg"
              >
                <div>
                  <label className="block text-sm font-medium mb-2">Your Rating</label>
                  {renderStars(newRating, true, setNewRating)}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Your Review</label>
                  <Textarea
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="Share your experience with this course..."
                    rows={4}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={submitReview}>Submit Review</Button>
                  <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Reviews List */}
      {reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Student Reviews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-slate-200 pb-4 last:border-b-0">
                <div className="flex items-center gap-3 mb-2">
                  {renderStars(review.rating)}
                  <span className="font-medium">{review.student_email.split('@')[0]}</span>
                  <span className="text-sm text-slate-500">
                    {new Date(review.created_date).toLocaleDateString()}
                  </span>
                </div>
                {review.review_text && (
                  <p className="text-slate-700">{review.review_text}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}