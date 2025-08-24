import React, { useState } from 'react';
import { TutorReview } from '@/api/entities';
import { LessonBooking } from '@/api/entities';
import { TutorProfile } from '@/api/entities';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useToast } from '../ui/use-toast';
import { useTheme } from '../ui/theme-provider';

const translations = {
  he: {
    leaveReview: 'השאר ביקורת',
    forTutor: 'עבור {tutorName}',
    rating: 'דירוג',
    comment: 'תגובה',
    commentPlaceholder: 'ספר לנו על חווית הלמידה שלך...',
    submit: 'שלח ביקורת',
    submitting: 'שולח...',
    reviewSuccess: 'הביקורת נשלחה בהצלחה!',
    reviewError: 'שגיאה בשליחת הביקורת',
    pleaseSelectRating: 'אנא בחר דירוג'
  },
  en: {
    leaveReview: 'Leave a Review',
    forTutor: 'For {tutorName}',
    rating: 'Rating',
    comment: 'Comment',
    commentPlaceholder: 'Tell us about your learning experience...',
    submit: 'Submit Review',
    submitting: 'Submitting...',
    reviewSuccess: 'Review submitted successfully!',
    reviewError: 'Error submitting review',
    pleaseSelectRating: 'Please select a rating'
  }
};

export default function TutorReviewForm({ booking, onClose, onReviewSubmitted, language = 'en' }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { themeClasses } = useTheme();
  const t = translations[language];

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: t.pleaseSelectRating,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create the review
      const review = await TutorReview.create({
        tutor_profile_id: booking.tutor_profile_id,
        student_id: booking.student_id,
        booking_id: booking.id,
        rating: rating,
        comment: comment,
        lesson_subject_id: booking.subject_id,
        lesson_date: booking.lesson_date,
      });

      // 2. Update the booking with the review ID
      await LessonBooking.update(booking.id, { student_review_id: review.id });

      // 3. Update the tutor's profile with the new average rating
      const tutorProfile = await TutorProfile.get(booking.tutor_profile_id);
      const existingReviews = await TutorReview.filter({ tutor_profile_id: booking.tutor_profile_id });
      
      const totalRatings = existingReviews.reduce((sum, r) => sum + r.rating, 0);
      const newRatingCount = existingReviews.length;
      const newAvgRating = totalRatings / newRatingCount;

      await TutorProfile.update(tutorProfile.id, {
        rating_avg: newAvgRating,
        rating_count: newRatingCount,
        reviews_count: newRatingCount
      });

      toast({
        title: t.reviewSuccess,
        variant: "success",
      });
      onReviewSubmitted?.();
      onClose();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: t.reviewError,
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className={`${themeClasses.cardSolid} border-gray-700`}>
        <DialogHeader>
          <DialogTitle>{t.leaveReview}</DialogTitle>
          <p className="text-sm text-gray-400">
            {t.forTutor.replace('{tutorName}', booking.tutor_profile?.user?.full_name || 'Tutor')}
          </p>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>{t.rating}</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-8 h-8 cursor-pointer transition-colors ${
                    star <= rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-500'
                  }`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="comment">{t.comment}</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t.commentPlaceholder}
              className="bg-white/10 border-white/20 text-white resize-none"
              rows={4}
            />
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? t.submitting : t.submit}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}