
import React, { useState, useEffect } from 'react';
import { Review, User as UserEntity } from '@/api/entities';
import { Star, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { UploadFile } from '@/api/integrations';

export default function ReviewForm({ restaurantId, onReviewSubmitted, onCancel }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get current user when component mounts
    const getCurrentUser = async () => {
      try {
        const currentUser = await UserEntity.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Error getting current user:', error);
        // If user is not logged in, redirect to login
        await UserEntity.login();
      }
    };
    getCurrentUser();
  }, []);

  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return;
    
    setUploadingImages(true);
    try {
      const uploadPromises = Array.from(files).map(file => UploadFile({ file }));
      const results = await Promise.all(uploadPromises);
      const urls = results.map(res => res.file_url);
      setImages(prev => [...prev, ...urls]);
    } catch (error) {
      console.error('Error uploading images:', error);
    }
    setUploadingImages(false);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return;
    if (!user) {
      console.error('No user found');
      return;
    }

    setIsSubmitting(true);
    try {
      await Review.create({
        user_id: user.id,
        user_name: user.full_name, // Added user_name here
        restaurant_id: restaurantId,
        rating,
        comment,
        images
      });
      
      onReviewSubmitted();
      
      // Reset form
      setRating(0);
      setComment('');
      setImages([]);
    } catch (error) {
      console.error('Error submitting review:', error);
    }
    setIsSubmitting(false);
  };

  // Don't render the form if user is not loaded yet
  if (!user) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-2 border-[var(--primary-cta)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[var(--text-muted)]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl soft-shadow p-6 mb-8">
      <h3 className="text-xl font-bold text-[var(--headings-labels)] mb-6">Write a Review</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating */}
        <div>
          <Label className="text-base font-medium mb-3 block">Your Rating *</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 transition-colors"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= rating 
                      ? 'text-yellow-400 fill-yellow-400' 
                      : 'text-gray-300 hover:text-yellow-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div>
          <Label htmlFor="comment" className="text-base font-medium">Your Review</Label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience at this restaurant..."
            rows={4}
            className="mt-2"
          />
        </div>

        {/* Image Upload */}
        <div>
          <Label className="text-base font-medium">Add Photos (Optional)</Label>
          <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <div className="text-sm text-gray-600 mb-4">
              Upload photos from your dining experience
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files)}
              className="hidden"
              id="review-images"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('review-images').click()}
              disabled={uploadingImages}
            >
              {uploadingImages ? 'Uploading...' : 'Choose Photos'}
            </Button>
          </div>
          
          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
              {images.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Review ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    onClick={() => removeImage(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={rating === 0 || isSubmitting}
            className="bg-[var(--primary-cta)] hover:bg-orange-600 text-white"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      </form>
    </div>
  );
}
