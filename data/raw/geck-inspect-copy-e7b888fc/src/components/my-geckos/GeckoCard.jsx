import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, Heart, Calendar, DollarSign, Sparkles } from 'lucide-react';

const DEFAULT_GECKO_IMAGE = 'https://i.imgur.com/sw9gnDp.png';

export default function GeckoCard({ gecko, onView, onEdit, onCardClick, onToggleFavorite, showPrice = false }) {
  const primaryImage = gecko.image_urls && gecko.image_urls.length > 0 
    ? gecko.image_urls[0] 
    : DEFAULT_GECKO_IMAGE;

  const getStatusColor = (status) => {
    const colors = {
      'Pet': 'bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow-lg',
      'Future Breeder': 'bg-gradient-to-r from-purple-400 to-purple-600 text-white shadow-lg',
      'Holdback': 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg',
      'Ready to Breed': 'bg-gradient-to-r from-green-400 to-emerald-600 text-white shadow-lg',
      'Proven': 'bg-gradient-to-r from-emerald-400 to-teal-600 text-white shadow-lg',
      'For Sale': 'bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-lg',
      'Sold': 'bg-gradient-to-r from-gray-400 to-gray-600 text-white shadow-lg'
    };
    return colors[status] || 'bg-gradient-to-r from-gray-400 to-gray-600 text-white shadow-lg';
  };

  const formatPrice = (price) => {
    if (!price) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(gecko);
    } else if (onView) {
      onView(gecko);
    }
  };

  const handleViewClick = (e) => {
    e.stopPropagation();
    if (onView) {
      onView(gecko);
    } else if (onCardClick) {
      onCardClick(gecko);
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(gecko);
    }
  };

  return (
    <Card 
      className="gecko-card cursor-pointer group"
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden">
        <div className="gecko-scale-pattern absolute inset-0 opacity-30"></div>
        <img 
          src={primaryImage} 
          alt={gecko.name}
          className="w-full h-56 object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
          onError={(e) => {
            if (e.target.src !== DEFAULT_GECKO_IMAGE) {
              e.target.src = DEFAULT_GECKO_IMAGE;
            }
          }}
        />
        
        {/* Gradient overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        {/* Floating status badge */}
        <div className="absolute top-3 left-3 transform group-hover:scale-110 transition-transform duration-300">
          <Badge className={`${getStatusColor(gecko.status)} backdrop-blur-sm border border-white/20`}>
            <Sparkles className="w-3 h-3 mr-1" />
            {gecko.status}
          </Badge>
        </div>

        {/* Price badge with glow effect */}
        {showPrice && gecko.asking_price && (
          <div className="absolute top-3 right-3 transform group-hover:scale-110 transition-all duration-300">
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg backdrop-blur-sm border border-green-300/30 gecko-glow">
              <DollarSign className="w-3 h-3 mr-1" />
              {formatPrice(gecko.asking_price)}
            </Badge>
          </div>
        )}

        {/* Action buttons with enhanced styling */}
        {(onView || onCardClick || onEdit) && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-400 flex items-center justify-center gap-3">
            {(onView || onCardClick) && (
              <Button
                size="sm"
                onClick={handleViewClick}
                className="bg-white/90 hover:bg-white text-gray-900 font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg backdrop-blur-sm"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            )}
            {onEdit && (
              <Button
                size="sm"
                onClick={handleEditClick}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg backdrop-blur-sm gecko-glow"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        )}
      </div>

      <CardContent className="p-5 relative">
        {/* Subtle background pattern */}
        <div className="gecko-scale-pattern absolute inset-0 opacity-10"></div>
        
        <div className="space-y-4 relative z-10">
          {/* Gecko name and ID with enhanced typography */}
          <div>
            <h3 className="font-bold text-xl text-gecko-text text-glow truncate tracking-wide">
              {gecko.name}
            </h3>
            {gecko.gecko_id_code && (
              <p className="text-sm text-gecko-text-muted font-medium mt-1">
                ID: <span className="font-mono bg-gecko-surface px-2 py-1 rounded text-xs">{gecko.gecko_id_code}</span>
              </p>
            )}
          </div>

          {/* Enhanced info display */}
          <div className="flex justify-between items-center">
            <Badge className="gecko-badge">
              {gecko.sex}
            </Badge>
            {gecko.hatch_date && (
              <div className="flex items-center gap-2 text-gecko-text-muted">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {new Date(gecko.hatch_date).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Morphs/traits with better styling */}
          {gecko.morphs_traits && (
            <div className="bg-gecko-surface-light rounded-lg p-3 border border-gecko-border">
              <p className="text-sm text-gecko-text font-medium leading-relaxed">
                {gecko.morphs_traits}
              </p>
            </div>
          )}

          {/* Market price estimate with enhanced styling */}
          {gecko.market_price_estimate && (
            <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-lg p-3 border border-emerald-500/20">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gecko-text-muted font-semibold uppercase tracking-wider">
                  Est. Value
                </span>
                <span className="text-emerald-400 font-bold">
                  {formatPrice(gecko.market_price_estimate.low)} - {formatPrice(gecko.market_price_estimate.high)}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}