import React from 'react';
import { Package, Star, ArrowRight, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function FeaturedProducts({ products = [] }) {
  if (!products || products.length === 0) {
    return null;
  }

  const displayProducts = products.slice(0, 4);

  return (
    <section className="py-16 bg-gradient-to-br from-white to-stone-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Package className="w-6 h-6 text-[var(--highlights-accents)]" />
            <h2 className="text-3xl md:text-4xl font-bold font-playfair text-[var(--headings-labels)]">
              Featured Products
            </h2>
          </div>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
            Discover authentic Maldivian ingredients, crafts, and culinary treasures from local artisans.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {displayProducts.map((product) => (
            <Link key={product.id} to={createPageUrl(`ProductDetail?id=${product.id}`)} className="group">
              <Card className="overflow-hidden soft-shadow soft-shadow-hover transition-all duration-300 h-full border border-transparent hover:border-[var(--border-color)]">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Price badge */}
                  <div className="absolute top-3 right-3 bg-[var(--primary-cta)] text-white px-2 py-1 rounded-full text-sm font-semibold">
                    {product.price} {product.currency || 'MVR'}
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="mb-2">
                    <h3 className="font-bold text-lg text-[var(--headings-labels)] line-clamp-1 group-hover:text-[var(--primary-cta)] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-[var(--text-muted)] line-clamp-2">
                      {product.short_description || 'Authentic Maldivian Product'}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.chef_recommended && (
                      <Badge className="bg-purple-100 text-purple-800 text-xs">
                        <Award className="w-3 h-3 mr-1" />
                        Chef's Pick
                      </Badge>
                    )}
                    {product.maldivian_classic && (
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        Classic
                      </Badge>
                    )}
                    {product.new_arrival && (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        New
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {product.average_rating > 0 && (
                        <>
                          <Star className="w-4 h-4 fill-[var(--highlights-accents)] text-[var(--highlights-accents)]" />
                          <span className="text-sm font-medium text-[var(--headings-labels)]">
                            {product.average_rating.toFixed(1)}
                          </span>
                        </>
                      )}
                    </div>
                    <span className="text-xs text-[var(--text-muted)] capitalize">
                      {product.category?.replace('_', ' ')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link to={createPageUrl("Marketplace")}>
            <Button 
              variant="outline" 
              size="lg"
              className="bg-white border-[var(--border-color)] hover:bg-white/80 hover:shadow-lg transition-all duration-300 text-lg px-8 py-4"
            >
              Explore Marketplace
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}