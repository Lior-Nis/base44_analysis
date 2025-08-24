
import React, { useState, useEffect } from 'react';
import { Review, Restaurant } from '@/api/entities';
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function RollingReviews() {
  const [reviews, setReviews] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    if (reviews.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % reviews.length);
      }, 4000); // Change every 4 seconds

      return () => clearInterval(interval);
    }
  }, [reviews.length]);

  const loadReviews = async () => {
    try {
      // Get recent reviews, ordered by creation date, up to 20
      const allReviews = await Review.list('-created_date', 20);
      
      // Enhance reviews with restaurant names
      const restaurants = await Restaurant.list();
      const enhancedReviews = allReviews
        .filter(review => review.comment && review.comment.length > 20) // Only reviews with substantial comments
        .map(review => {
          const restaurant = restaurants.find(r => r.id === review.restaurant_id);
          return {
            ...review,
            restaurant_name: restaurant?.name || 'Unknown Restaurant',
            restaurant_cuisine: restaurant?.cuisine_type || 'Restaurant'
          };
        })
        .slice(0, 8); // Limit to 8 reviews for rolling

      setReviews(enhancedReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
    setIsLoading(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading || reviews.length === 0) {
    return null;
  }

  const currentReview = reviews[currentIndex];

  return (
    <section className="py-16 bg-gradient-to-br from-white to-stone-50/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-playfair text-[var(--headings-labels)] mb-4">
            What Our Community Says
          </h2>
          <p className="text-lg text-[var(--text-muted)]">
            Real experiences from fellow food enthusiasts
          </p>
        </div>

        <div className="relative overflow-hidden">
          <Card className="bg-gradient-to-r from-white to-stone-50/50 border-[var(--highlights-accents)]/20 soft-shadow">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                {/* Quote Icon */}
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-[var(--highlights-accents)]/10 rounded-full flex items-center justify-center">
                    <Quote className="w-6 h-6 text-[var(--highlights-accents)]" />
                  </div>
                </div>

                {/* Review Content */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className="w-5 h-5 text-[var(--highlights-accents)] fill-current"
                      />
                    ))}
                  </div>

                  <blockquote className="text-lg text-[var(--text-body)] leading-relaxed mb-4 italic">
                    "{currentReview.comment.length > 150 
                      ? currentReview.comment.substring(0, 150) + '...' 
                      : currentReview.comment}"
                  </blockquote>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-[var(--primary-cta)] text-white font-medium">
                          {currentReview.user_name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-[var(--text-body)]">
                          {currentReview.user_name || 'Anonymous'}
                        </p>
                        <p className="text-sm text-[var(--text-muted)]">
                          {formatDate(currentReview.created_date)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-[var(--primary-cta)]">
                        {currentReview.restaurant_name}
                      </p>
                      <p className="text-sm text-[var(--text-muted)]">
                        {currentReview.restaurant_cuisine}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Indicators */}
              <div className="flex justify-center gap-2 mt-6">
                {reviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex 
                        ? 'bg-[var(--highlights-accents)] w-6' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
