
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ExpertReview } from "@/api/entities";
import { Appointment } from "@/api/entities"; // Added import
import { Loader2, Star } from "lucide-react";
import { User as UserEntity } from "@/api/entities";

const StarRating = ({ rating, setRating }) => {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`cursor-pointer h-8 w-8 transition-colors ${
            rating >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
          onClick={() => setRating(star)}
        />
      ))}
    </div>
  );
};

export default function ReviewModal({ isOpen, onClose, onSuccess, appointment }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Renamed from isSaving

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Please provide a star rating.");
      return;
    }
    setIsSubmitting(true); // Renamed from setIsSaving
    try {
      // Removed: const user = await UserEntity.me();
      await ExpertReview.create({
        rating,
        comment,
        appointment_id: appointment.id,
        expert_id: appointment.expert_id,
        customer_email: appointment.user_email, // Changed from user.email
      });

      // Mark the appointment as reviewed
      await Appointment.update(appointment.id, { has_been_reviewed: true });

      onSuccess(); // This will close the modal and trigger a refresh
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("There was an error submitting your review. Please try again.");
    } finally { // Added finally block
      setIsSubmitting(false); // Moved into finally block
    }
  };
  
  const handleClose = () => {
    setRating(0);
    setComment('');
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Leave a Review</DialogTitle>
          <DialogDescription>
            Share your feedback for your consultation with {appointment?.expert_name} on {new Date(appointment?.appointment_date).toLocaleDateString()}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div>
            <Label>Your Rating *</Label>
            <StarRating rating={rating} setRating={setRating} />
          </div>
          <div>
            <Label htmlFor="comment">Your Feedback</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about your experience..."
              className="h-32"
            />
          </div>
        </div>

        <DialogFooter>
           <Button variant="outline" onClick={handleClose}>Cancel</Button>
           <Button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0} // Renamed from isSaving
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? ( // Renamed from isSaving
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
