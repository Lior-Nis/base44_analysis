import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { LessonReview } from '@/api/entities';

const translations = {
  he: {
    writeReviewFor: "כתוב חוות דעת על",
    overallRating: "דירוג כללי",
    comment: "הערה",
    commentPlaceholder: "איך היה השיעור? מה למדת? האם המורה עזר לך?",
    submitReview: "שלח חוות דעת",
    submitting: "שולח...",
    selectBooking: "בחר שיעור שעברת",
    noPastLessons: "לא נמצאו שיעורים קודמים עם מורה זה.",
    lessonOn: "שיעור בתאריך"
  },
  en: {
    writeReviewFor: "Write a Review for",
    overallRating: "Overall Rating",
    comment: "Comment",
    commentPlaceholder: "How was the lesson? What did you learn? Did the tutor help you?",
    submitReview: "Submit Review",
    submitting: "Submitting...",
    selectBooking: "Select a past lesson",
    noPastLessons: "No past lessons found with this tutor.",
    lessonOn: "Lesson on"
  }
};

export default function LessonReviewForm({ tutorProfile, studentId, onClose, onSuccess, language = 'he' }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [bookingId, setBookingId] = useState('');
    const [pastBookings, setPastBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const t = translations[language];

    // ... useEffect to fetch past bookings ...

    const handleSubmit = async () => {
        if (rating === 0 || !comment.trim() || !bookingId) {
            alert('Please select a lesson, provide a rating and a comment.');
            return;
        }
        setIsLoading(true);
        try {
            const selectedBooking = pastBookings.find(b => b.id === bookingId);
            await LessonReview.create({
                tutor_profile_id: tutorProfile.id,
                reviewer_user_id: studentId,
                rating: rating,
                comment: comment,
                lesson_subject_id: selectedBooking.subject_id,
                lesson_date: selectedBooking.lesson_date,
                booking_id: bookingId,
            });
            onSuccess();
        } catch (error) {
            console.error('Failed to submit review:', error);
            alert('Failed to submit review.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div /* ... */ >
            <motion.div /* ... */ >
                <Card>
                    <CardHeader>
                        <CardTitle>{t.writeReviewFor} {tutorProfile.user.full_name}</CardTitle>
                        <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                          <Label>{t.selectBooking}</Label>
                          {/* Select dropdown for past lessons */}
                        </div>
                        <div>
                            <Label>{t.overallRating}</Label>
                            <div className="flex items-center gap-1 mt-2">
                                {[...Array(5)].map((_, index) => (
                                    <Star
                                        key={index}
                                        className={`h-8 w-8 cursor-pointer transition-colors ${index < rating ? 'text-yellow-400 fill-current' : 'text-gray-400'}`}
                                        onClick={() => setRating(index + 1)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="comment">{t.comment}</Label>
                            <Textarea
                                id="comment"
                                placeholder={t.commentPlaceholder}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
                            {isLoading ? t.submitting : t.submitReview}
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
        </motion.div>
    );
}