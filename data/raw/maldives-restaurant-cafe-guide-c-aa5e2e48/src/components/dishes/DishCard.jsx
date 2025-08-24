import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Star, MapPin } from 'lucide-react';

export default function DishCard({ dish }) {
  // Fallback for dish image
  const imageUrl = dish.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop';
  const restaurantUrl = createPageUrl(`Restaurant?id=${dish.restaurant_id}`);

  return (
    <Link to={restaurantUrl} className="block group">
      <div className="bg-[var(--card-bg)] rounded-lg overflow-hidden soft-shadow soft-shadow-hover transition-all duration-300 h-full flex flex-col border border-transparent hover:border-[var(--border-color)]">
        {/* Fixed size image container */}
        <div className="relative w-full h-48">
          <img 
            src={imageUrl}
            alt={dish.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Price badge */}
          <div className="absolute top-3 right-3 bg-[var(--primary-cta)] text-white px-2 py-1 rounded-md text-sm font-semibold">
            {dish.price} {dish.currency || 'MVR'}
          </div>
        </div>
        
        {/* Content section */}
        <div className="p-4 flex-grow flex flex-col justify-between">
          <div>
            <h3 className="font-playfair font-bold text-lg text-[var(--headings-labels)] line-clamp-2 mb-2">
              {dish.name}
            </h3>
            <p className="text-sm text-[var(--primary-cta)] font-medium mb-1">
              {dish.restaurant_name || 'Restaurant'}
            </p>
          </div>
          
          <div className="flex justify-between items-center mt-auto">
            <div className="flex items-center gap-1 text-sm text-[var(--text-muted)]">
              <MapPin className="w-3 h-3" />
              <span className="text-xs">{dish.location_name || 'Maldives'}</span>
            </div>
            {dish.average_rating > 0 && (
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 text-[var(--highlights-accents)] fill-current" />
                <span className="font-medium text-[var(--headings-labels)]">{dish.average_rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}