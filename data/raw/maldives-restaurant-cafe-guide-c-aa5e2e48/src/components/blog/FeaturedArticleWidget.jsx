import React, { useState, useEffect } from 'react';
import { BlogPost as BlogPostEntity } from '@/api/entities';
import { ArrowRight, Calendar, User, Eye, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const CATEGORIES = {
  dish_deep_dive: 'Dish Deep Dive',
  chef_spotlight: 'Chef Spotlight',
  island_culture: 'Island Culture',
  hidden_gems: 'Hidden Gems',
  festive_food: 'Festive Food',
  traditions: 'Traditions'
};

export default function FeaturedArticleWidget({ relatedRestaurantIds = [], relatedDishes = [], className = "" }) {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    loadFeaturedPosts();
  }, [JSON.stringify(relatedRestaurantIds), JSON.stringify(relatedDishes)]);

  const loadFeaturedPosts = async () => {
    setIsLoading(true);
    setHasError(false);
    
    try {
      const allPublishedPosts = await BlogPostEntity.filter({ status: 'published' }, '-created_date', 50);

      const featuredPosts = allPublishedPosts.filter(p => p.featured);
      let finalPosts = featuredPosts;

      if (relatedRestaurantIds.length > 0 || relatedDishes.length > 0) {
        const related = allPublishedPosts.filter(post => {
          if (post.featured) return false;

          const hasRelatedRestaurant = post.related_restaurant_ids?.some(id => 
            relatedRestaurantIds.includes(id)
          );
          const hasRelatedDish = post.related_dish_names?.some(dish =>
            relatedDishes.some(d => d.toLowerCase().includes(dish.toLowerCase()) || dish.toLowerCase().includes(d.toLowerCase()))
          );
          return hasRelatedRestaurant || hasRelatedDish;
        });

        const combined = [...related.slice(0, 3), ...featuredPosts];
        
        const uniquePostIds = new Set();
        finalPosts = combined.filter(post => {
          if (uniquePostIds.has(post.id)) {
            return false;
          }
          uniquePostIds.add(post.id);
          return true;
        });
      }
      
      setPosts(finalPosts.slice(0, 6));
    } catch (error) {
      console.error('Error loading featured posts:', error);
      setHasError(true);
      // Fallback to empty array instead of showing error
      setPosts([]);
    }
    setIsLoading(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    // Using a more muted, single style for the new theme
    return 'bg-stone-100 text-stone-700';
  };

  // Don't render anything if loading, error, or no posts
  if (isLoading) {
    return (
      <div className={`space-y-8 ${className}`}>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold font-playfair text-[var(--headings-labels)] mb-4">
            Featured Stories
          </h2>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
            Loading featured stories...
          </p>
        </div>
      </div>
    );
  }

  if (hasError || posts.length === 0) {
    return null; // Silently fail instead of showing error to users
  }

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold font-playfair text-[var(--headings-labels)] mb-4">
          Featured Stories
        </h2>
        <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
          Discover the rich culinary heritage and hidden gems of Maldivian cuisine
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.slice(0, 3).map((post) => (
          <Link
            key={post.id}
            to={createPageUrl(`BlogPost?id=${post.id}`)}
            className="block group"
          >
            <div className="bg-white rounded-lg overflow-hidden soft-shadow soft-shadow-hover transition-all duration-300 h-full border border-transparent hover:border-[var(--border-color)]">
              <div className="aspect-video overflow-hidden">
                <img
                  src={post.cover_image_url}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <Badge className={`${getCategoryColor(post.category)} text-xs font-medium`}>
                    {CATEGORIES[post.category]}
                  </Badge>
                  <span className="text-xs text-[var(--text-muted)]">
                    {formatDate(post.created_date)}
                  </span>
                </div>
                
                <h3 className="font-playfair font-bold text-lg text-[var(--headings-labels)] group-hover:text-[var(--primary-cta)] transition-colors line-clamp-2 mb-3">
                  {post.title}
                </h3>
                
                <p className="text-sm text-[var(--text-muted)] line-clamp-3 mb-4">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-3 border-t border-[var(--border-color)]">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3 h-3" />
                    <span>{post.author_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{post.views || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{post.likes || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-center pt-4">
        <Link to={createPageUrl('Blog')}>
          <Button variant="outline">
            View All Stories
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}