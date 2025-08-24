import React from 'react';
import { Star, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function RestaurantCard({ restaurant }) {
  // Use the actual location name from the restaurant data
  const locationName = restaurant.location_name || 'Location TBD';

  return (
    <Link 
      to={createPageUrl(`Restaurant?id=${restaurant.id}`)}
      className="block bg-[var(--card-bg)] rounded-lg overflow-hidden soft-shadow soft-shadow-hover transition-all duration-300 group border border-transparent hover:border-[var(--border-color)] h-full"
    >
      <div className="relative">
        <div className="aspect-[4/3]">
          <img
            src={restaurant.logo_url || 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop'}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs backdrop-blur-sm">
          <Star className="w-3 h-3 text-[var(--highlights-accents)] fill-current" />
          <span>{restaurant.average_rating ? restaurant.average_rating.toFixed(1) : 'New'}</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-playfair text-lg font-bold text-[var(--headings-labels)] truncate mb-1">{restaurant.name}</h3>
        <p className="text-[var(--text-muted)] text-sm capitalize truncate mb-2">{restaurant.cuisine_type}</p>
        <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{locationName}</span>
        </div>
      </div>
    </Link>
  );
}