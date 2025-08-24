import React from 'react';
import { Crown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RestaurantCard from './RestaurantCard';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function FeaturedRestaurants({ restaurants = [], onFavoriteToggle, favorites = [], showFavoriteButton }) {
  if (!restaurants || restaurants.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-[var(--bg-main)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="w-6 h-6 text-amber-500" />
            <h2 className="text-3xl md:text-4xl font-bold primary-gradient-text">
              Featured Restaurants
            </h2>
          </div>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
            Discover handpicked culinary gems across the Maldives, each offering unique flavors and exceptional dining experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {restaurants.slice(0, 6).map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              onFavoriteToggle={onFavoriteToggle}
              isFavorited={favorites.includes(restaurant.id)}
              showFavoriteButton={showFavoriteButton}
            />
          ))}
        </div>

        <div className="text-center">
          <Link to={createPageUrl("AllRestaurants")}>
            <Button 
              variant="outline" 
              size="lg"
              className="bg-white border-[var(--border-color)] hover:bg-white/80 hover:shadow-lg transition-all duration-300 text-lg px-8 py-4 text-[var(--text-dark)]"
            >
              Explore All Restaurants
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}