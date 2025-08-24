import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Star, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SponsoredListing({ restaurant, ad, onAdClick }) {
  const handleClick = () => {
    // REMOVED: No ad click tracking to avoid database write issues
    // Just call the callback if provided (for UI purposes)
    if (onAdClick) {
      // Don't actually track the click, just call the function
      // onAdClick(ad);
    }
  };

  return (
    <Link 
      to={createPageUrl(`Restaurant?id=${restaurant.id}`)}
      onClick={handleClick}
      className="block bg-gradient-to-r from-[var(--highlights-accents)]/10 to-transparent rounded-xl overflow-hidden soft-shadow soft-shadow-hover transition-all duration-300 group border-2 border-[var(--highlights-accents)]/20"
    >
      <div className="relative">
        <div className="absolute top-3 left-3 z-10 flex gap-2">
          <Badge className="bg-[var(--highlights-accents)] text-black font-semibold">
            <Crown className="w-3 h-3 mr-1" />
            Sponsored
          </Badge>
        </div>
        
        <div className="aspect-[4/3]">
          <img
            src={restaurant.logo_url || 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop'}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        
        <div className="absolute top-3 right-3 bg-black/50 text-white px-3 py-1 rounded-full flex items-center gap-1 text-sm">
          <Star className="w-4 h-4 text-[var(--highlights-accents)] fill-current" />
          <span>{restaurant.average_rating ? restaurant.average_rating.toFixed(1) : 'New'}</span>
        </div>
      </div>
      
      <div className="p-5 bg-white">
        <h3 className="font-poppins text-xl font-bold text-[var(--headings-labels)] truncate">{restaurant.name}</h3>
        <p className="text-[var(--text-muted)] text-sm capitalize mt-1 truncate">{restaurant.cuisine_type}</p>
        
        {ad.description && (
          <p className="text-sm text-[var(--primary-cta)] font-medium mt-2 line-clamp-2">
            {ad.description}
          </p>
        )}
        
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mt-2">
          <span>{restaurant.location_name || 'Maldives'}</span>
        </div>
      </div>
    </Link>
  );
}