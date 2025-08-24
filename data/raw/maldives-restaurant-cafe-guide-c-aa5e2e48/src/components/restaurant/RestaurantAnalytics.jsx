import React, { useState, useEffect } from 'react';
import { Review, Dish } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, Eye, Heart, Users, TrendingUp, Calendar, MessageSquare } from 'lucide-react';

export default function RestaurantAnalytics({ restaurant }) {
  const [reviews, setReviews] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [restaurant.id]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const [reviewData, dishData] = await Promise.all([
        Review.filter({ restaurant_id: restaurant.id }),
        Dish.filter({ restaurant_id: restaurant.id })
      ]);
      
      setReviews(reviewData);
      setDishes(dishData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  // Analytics calculations
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => {
    const count = reviews.filter(r => r.rating === rating).length;
    return { rating, count, percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0 };
  });

  const recentReviews = reviews
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 5);

  const topDishes = dishes
    .sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
    .slice(0, 5);

  const monthlyReviews = reviews.filter(r => {
    const reviewDate = new Date(r.created_date);
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return reviewDate >= oneMonthAgo;
  }).length;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">Analytics & Insights</h3>
        <p className="text-gray-600">Performance metrics and customer feedback for your restaurant</p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{averageRating}</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <MessageSquare className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{totalReviews}</div>
            <div className="text-sm text-gray-600">Total Reviews</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{monthlyReviews}</div>
            <div className="text-sm text-gray-600">Reviews This Month</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{dishes.length}</div>
            <div className="text-sm text-gray-600">Menu Items</div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-4">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm">{rating}</span>
                  <Star className="w-4 h-4 text-yellow-500" />
                </div>
                <Progress value={percentage} className="flex-1" />
                <div className="text-sm text-gray-600 w-12">{count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {recentReviews.length > 0 ? (
            <div className="space-y-4">
              {recentReviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{review.user_name}</span>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.created_date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No reviews yet</p>
          )}
        </CardContent>
      </Card>

      {/* Top Performing Dishes */}
      <Card>
        <CardHeader>
          <CardTitle>Top Rated Dishes</CardTitle>
        </CardHeader>
        <CardContent>
          {topDishes.length > 0 ? (
            <div className="space-y-4">
              {topDishes.map((dish, index) => (
                <div key={dish.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">{dish.name}</h4>
                      <p className="text-sm text-gray-600">{dish.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm ml-1">{(dish.average_rating || 0).toFixed(1)}</span>
                    </div>
                    <Badge variant="outline">{dish.currency} {dish.price}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Add dishes to see performance data</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}