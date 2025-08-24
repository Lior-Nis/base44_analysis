import React, { useState } from 'react';
import { Heart, Eye, Phone, Mail, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ProductCard({ product, className = "" }) {
  const [isFavorited, setIsFavorited] = useState(false);

  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorited(!isFavorited);
  };

  return (
    <Link to={createPageUrl(`ProductDetail?id=${product.id}`)} className="block group">
      <div className={`bg-[var(--card-bg)] rounded-xl overflow-hidden soft-shadow soft-shadow-hover transition-all duration-300 h-full flex flex-col ${className}`}>
        {/* Image container */}
        <div className="relative w-full h-32 sm:h-36">
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Price badge */}
          <div className="absolute top-2 right-2 bg-[var(--primary-cta)] text-white px-2 py-1 rounded-full text-xs font-semibold">
            {product.price} {product.currency || 'MVR'}
          </div>
          {/* Favorite button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 left-2 bg-white/80 hover:bg-white rounded-full h-6 w-6 sm:h-7 sm:w-7"
            onClick={toggleFavorite}
          >
            <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
          </Button>
        </div>
        
        {/* Content section */}
        <div className="p-3 flex-grow flex flex-col justify-between">
          <div className="flex-grow">
            <h3 className="font-poppins font-bold text-sm sm:text-base text-[var(--text-body)] line-clamp-2 mb-1">
              {product.name}
            </h3>
            <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-2">
              {product.short_description || 'Authentic Maldivian Product'}
            </p>
          </div>
          
          <div className="mt-auto">
            <div className="flex flex-wrap gap-1 mb-2">
              {product.new_arrival && (
                <Badge className="bg-green-100 text-green-800 text-[9px] sm:text-[10px] px-1 py-0.5">New</Badge>
              )}
              {product.chef_recommended && (
                <Badge className="bg-purple-100 text-purple-800 text-[9px] sm:text-[10px] px-1 py-0.5">Chef's Pick</Badge>
              )}
              {product.maldivian_classic && (
                <Badge className="bg-blue-100 text-blue-800 text-[9px] sm:text-[10px] px-1 py-0.5">Classic</Badge>
              )}
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-[var(--text-muted)]">
                Contact Seller
              </span>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-6 w-6 sm:h-7 sm:w-7 rounded-full"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}