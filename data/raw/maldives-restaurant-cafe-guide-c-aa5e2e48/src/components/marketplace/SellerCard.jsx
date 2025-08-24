import React from 'react';
import { Star, MapPin, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SellerCard({ seller }) {
  const locationName = seller.location_name || seller.location || 'Location TBD';

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      <div className="relative overflow-hidden h-32 bg-gradient-to-br from-[var(--primary-cta)]/20 to-[var(--highlights-accents)]/20">
        {seller.cover_image ? (
          <img
            src={seller.cover_image}
            alt={`${seller.name} cover`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Award className="w-12 h-12 text-[var(--primary-cta)]" />
          </div>
        )}
      </div>

      <CardContent className="p-4 relative flex-grow flex flex-col">
        <div className="absolute -top-8 left-4">
          <div className="w-16 h-16 rounded-full bg-white border-4 border-white shadow-md overflow-hidden">
            {seller.profile_image ? (
              <img
                src={seller.profile_image}
                alt={seller.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[var(--primary-cta)] flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {seller.name.charAt(0)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="pt-8 flex-grow flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 line-clamp-1 flex-1">
              {seller.name}
            </h3>
            <Badge variant="outline" className="text-xs capitalize whitespace-nowrap">
              {seller.seller_type?.replace('_', ' ')}
            </Badge>
          </div>

          {locationName && (
            <div className="flex items-center gap-1 mb-2">
              <MapPin className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-600">{locationName}</span>
            </div>
          )}

          <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-grow">
            {seller.bio}
          </p>

          {seller.specialties && seller.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {seller.specialties.slice(0, 2).map((specialty, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
              {seller.specialties.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{seller.specialties.length - 2} more
                </Badge>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-auto">
            {seller.rating > 0 ? (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">{seller.rating.toFixed(1)}</span>
              </div>
            ) : <div />}
            
            <Link to={createPageUrl(`SellerProfile?id=${seller.id}`)}>
              <Button size="sm" variant="outline">
                View Store
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}