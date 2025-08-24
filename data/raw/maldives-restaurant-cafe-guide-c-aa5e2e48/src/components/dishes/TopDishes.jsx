import React, { useState, useEffect } from 'react';
import { TrendingUp, Star, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function TopDishes({ dishes = [] }) {
  const [displayedDishes, setDisplayedDishes] = useState([]);

  useEffect(() => {
    if (!dishes || dishes.length === 0) {
      setDisplayedDishes([]);
      return;
    }

    // Calculate dynamic popularity based on various factors
    const calculatePopularity = (dish) => {
      let score = dish.popularity_score || 0;
      
      // Boost score based on average rating
      if (dish.average_rating > 0) {
        score += dish.average_rating * 10;
      }
      
      // Add randomization to show variety over time
      score += Math.random() * 20;
      
      return score;
    };

    // Sort dishes by calculated popularity and take top 8
    const sortedDishes = dishes
      .map(dish => ({
        ...dish,
        calculated_popularity: calculatePopularity(dish)
      }))
      .sort((a, b) => b.calculated_popularity - a.calculated_popularity)
      .slice(0, 8);

    setDisplayedDishes(sortedDishes);
  }, [dishes]);

  if (!displayedDishes || displayedDishes.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-white to-stone-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-[var(--highlights-accents)]" />
            <h2 className="text-3xl md:text-4xl font-bold font-playfair text-[var(--headings-labels)]">
              Trending Dishes
            </h2>
          </div>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
            Discover the most loved dishes across Maldivian restaurants, handpicked by food enthusiasts like you.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {displayedDishes.map((dish, index) => (
            <Card key={dish.id} className="group relative overflow-hidden soft-shadow soft-shadow-hover transition-all duration-300 border border-transparent hover:border-[var(--border-color)]">
              {index < 3 && (
                <div className="absolute top-3 left-3 z-10">
                  <Badge className="bg-[var(--primary-cta)] text-white border-0 shadow-lg">
                    #{index + 1} Trending
                  </Badge>
                </div>
              )}
              
              <div className="aspect-square overflow-hidden">
                <img
                  src={dish.image_url || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop'}
                  alt={dish.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              
              <CardContent className="p-4">
                <div className="mb-2">
                  <h3 className="font-bold text-lg text-[var(--headings-labels)] line-clamp-1 group-hover:text-[var(--primary-cta)] transition-colors">
                    {dish.name}
                  </h3>
                  <p className="text-sm text-[var(--primary-cta)] font-medium line-clamp-1">
                    {dish.restaurant_name || 'Restaurant'}
                  </p>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-[var(--highlights-accents)] text-[var(--highlights-accents)]" />
                    <span className="text-sm font-medium text-[var(--headings-labels)]">
                      {dish.average_rating > 0 ? dish.average_rating.toFixed(1) : 'New'}
                    </span>
                  </div>
                  <span className="font-bold text-[var(--primary-cta)]">
                    {dish.price} {dish.currency || 'MVR'}
                  </span>
                </div>
                
                <div className="flex gap-2 mb-4">
                  {dish.is_vegetarian && (
                    <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                      Veg
                    </Badge>
                  )}
                  {dish.is_spicy && (
                    <Badge variant="outline" className="text-red-600 border-red-600 text-xs">
                      Spicy
                    </Badge>
                  )}
                </div>
                
                <Link to={createPageUrl(`Restaurant?id=${dish.restaurant_id}`)}>
                  <Button className="w-full cta-button group-hover:shadow-xl transition-all duration-300">
                    <MapPin className="w-4 h-4 mr-2" />
                    View Restaurant
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link to={createPageUrl("AllRestaurants")}>
            <Button 
              variant="outline" 
              size="lg"
              className="bg-white border-[var(--border-color)] hover:bg-white/80 hover:shadow-lg transition-all duration-300 text-lg px-8 py-4"
            >
              Explore All Restaurants
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}