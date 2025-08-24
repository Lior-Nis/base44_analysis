import React, { useState } from 'react';
import { Star, ThumbsUp, Camera, MoreVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function ReviewsList({ reviews, currentUserId, onHelpfulVote }) {
  const [expandedReviews, setExpandedReviews] = useState(new Set());

  const toggleExpanded = (reviewId) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Star className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-[var(--text-dark)] mb-2">No reviews yet</h3>
        <p className="text-[var(--text-muted)]">Be the first to share your experience!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => {
        const isExpanded = expandedReviews.has(review.id);
        const shouldTruncate = review.comment && review.comment.length > 200;
        const displayComment = isExpanded ? review.comment : review.comment?.slice(0, 200);

        return (
          <Card key={review.id} className="food-card">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-[var(--brand-primary)] text-white font-medium">
                    {review.user_name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-medium text-[var(--text-dark)]">
                          {review.user_name || 'Anonymous User'}
                        </h4>
                        {review.dish_id && (
                          <Badge variant="outline" className="text-xs">
                            Dish Review
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="text-sm text-[var(--text-muted)]">
                          {formatDate(review.created_date)}
                        </span>
                      </div>
                    </div>
                    
                    {currentUserId === review.user_id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="p-2">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit Review</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Delete Review</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {review.comment && (
                    <div className="mb-4">
                      <p className="text-[var(--text-dark)] leading-relaxed">
                        {displayComment}
                        {shouldTruncate && !isExpanded && '...'}
                      </p>
                      {shouldTruncate && (
                        <button
                          onClick={() => toggleExpanded(review.id)}
                          className="text-[var(--brand-primary)] text-sm font-medium mt-1 hover:underline"
                        >
                          {isExpanded ? 'Show Less' : 'Read More'}
                        </button>
                      )}
                    </div>
                  )}

                  {review.images && review.images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {review.images.slice(0, 3).map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Review photo ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(image, '_blank')}
                        />
                      ))}
                      {review.images.length > 3 && (
                        <div className="relative">
                          <img
                            src={review.images[3]}
                            alt="More photos"
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              +{review.images.length - 3} more
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[var(--text-muted)] hover:text-[var(--brand-primary)] p-0"
                      onClick={() => onHelpfulVote?.(review.id)}
                    >
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      <span>Helpful ({review.helpful_votes || 0})</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}