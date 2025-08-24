
import React, { useState, useEffect } from 'react';
import { BlogPost as BlogPostEntity, User as UserEntity } from '@/api/entities';
import { Calendar, User, Eye, Heart, Share2, ArrowLeft, Clock, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ReactMarkdown from 'react-markdown';
import FeaturedArticleWidget from '../components/blog/FeaturedArticleWidget';
import AdBanner from '../components/ads/AdBanner';

const CATEGORIES = {
  dish_deep_dive: 'Dish Deep Dive',
  chef_spotlight: 'Chef Spotlight',
  island_culture: 'Island Culture',
  hidden_gems: 'Hidden Gems',
  festive_food: 'Festive Food',
  traditions: 'Traditions'
};

export default function BlogPost() {
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    if (postId) {
      loadPost(postId);
    } else {
      setError('No post ID provided');
      setIsLoading(false);
    }
  }, []);

  const loadPost = async (postId) => {
    try {
      const posts = await BlogPostEntity.filter({ id: postId, status: 'published' });
      if (posts.length > 0) {
        const blogPost = posts[0];
        setPost(blogPost);
        
        // Increment view count
        await BlogPostEntity.update(postId, {
          ...blogPost,
          views: (blogPost.views || 0) + 1
        });
        
        // Check if user has liked this post (using localStorage)
        const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
        setIsLiked(likedPosts.includes(postId));
      } else {
        setError('Post not found');
      }
    } catch (error) {
      console.error('Error loading blog post:', error);
      setError('Failed to load post');
    }
    setIsLoading(false);
  };

  const handleLike = async () => {
    if (!post) return;
    
    try {
      const newLikeCount = isLiked ? (post.likes || 0) - 1 : (post.likes || 0) + 1;
      
      await BlogPostEntity.update(post.id, {
        ...post,
        likes: Math.max(0, newLikeCount)
      });
      
      setPost(prev => ({ ...prev, likes: Math.max(0, newLikeCount) }));
      
      // Update localStorage
      const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]');
      if (isLiked) {
        const updated = likedPosts.filter(id => id !== post.id);
        localStorage.setItem('likedPosts', JSON.stringify(updated));
      } else {
        likedPosts.push(post.id);
        localStorage.setItem('likedPosts', JSON.stringify(likedPosts));
      }
      
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt || post.subtitle,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      dish_deep_dive: 'bg-orange-100 text-orange-800',
      chef_spotlight: 'bg-purple-100 text-purple-800',
      island_culture: 'bg-blue-100 text-blue-800',
      hidden_gems: 'bg-green-100 text-green-800',
      festive_food: 'bg-red-100 text-red-800',
      traditions: 'bg-amber-100 text-amber-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-cream)]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--primary-cta)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--text-muted)]">Loading story...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-cream)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--text-body)] mb-4">Story Not Found</h1>
          <p className="text-[var(--text-muted)] mb-6">{error || 'The story you\'re looking for doesn\'t exist.'}</p>
          <Link to={createPageUrl('Blog')}>
            <Button className="cta-button">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Stories
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-cream)]">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px]">
        <img
          src={post.cover_image_url}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Back Button */}
        <div className="absolute top-6 left-6 z-10">
          <Link to={createPageUrl('Blog')}>
            <Button variant="ghost" className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Stories
            </Button>
          </Link>
        </div>

        {/* Article Header */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <Badge className={getCategoryColor(post.category)}>
                {CATEGORIES[post.category]}
              </Badge>
              {post.tags && post.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="bg-white/20 text-white border-white/30">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 font-poppins">
              {post.title}
            </h1>
            
            {post.subtitle && (
              <p className="text-xl text-white/90 mb-6 max-w-3xl">
                {post.subtitle}
              </p>
            )}
            
            <div className="flex items-center gap-6 text-white/80">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{post.author_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(post.created_date)}</span>
              </div>
              {post.read_time_minutes && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{post.read_time_minutes} min read</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                <span>{post.views || 0} views</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Article Content */}
          <main className="lg:col-span-3">
            <Card className="soft-shadow mb-8">
              <CardContent className="p-4 md:p-8">
                {/* Article Actions */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={handleLike}
                      variant={isLiked ? "default" : "outline"}
                      size="sm"
                      className={isLiked ? "bg-red-500 hover:bg-red-600 text-white" : ""}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                      {post.likes || 0}
                    </Button>
                    <Button onClick={handleShare} variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                  
                  <div className="text-sm text-[var(--text-muted)]">
                    Published {formatDate(post.created_date)}
                  </div>
                </div>

                {/* Article Body */}
                <div className="prose prose-lg max-w-none">
                  <ReactMarkdown
                    components={{
                      img: ({ node, ...props }) => (
                        <img
                          {...props}
                          className="rounded-xl shadow-lg w-full h-auto my-8"
                          loading="lazy"
                        />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2 {...props} className="text-2xl font-bold text-[var(--headings-labels)] mt-8 mb-4 font-poppins" />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3 {...props} className="text-xl font-bold text-[var(--headings-labels)] mt-6 mb-3 font-poppins" />
                      ),
                      p: ({ node, ...props }) => (
                        <p {...props} className="text-[var(--text-body)] leading-relaxed mb-4" />
                      ),
                      blockquote: ({ node, ...props }) => (
                        <blockquote {...props} className="border-l-4 border-[var(--primary-cta)] pl-6 italic text-[var(--text-muted)] my-6 bg-[var(--bg-cream)] p-4 rounded-r-lg" />
                      )
                    }}
                  >
                    {post.content}
                  </ReactMarkdown>
                </div>

                {/* Article Footer */}
                <div className="mt-12 pt-8 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[var(--text-muted)] mb-2">Written by</p>
                      <p className="font-medium text-[var(--text-body)]">{post.author_name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button onClick={handleLike} variant={isLiked ? "default" : "outline"}>
                        <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                        {isLiked ? 'Liked' : 'Like this story'}
                      </Button>
                      <Button onClick={handleShare} variant="outline">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6 lg:sticky lg:top-24 self-start">
            {/* Sidebar Ad */}
            <AdBanner 
              placement="profile_sidebar" 
              className="h-48"
              format="card"
            />

            {/* Article Stats */}
            <Card className="soft-shadow">
              <CardContent className="p-6">
                <h3 className="font-bold text-[var(--headings-labels)] mb-4">Article Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Views</span>
                    <span className="font-medium">{post.views || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Likes</span>
                    <span className="font-medium">{post.likes || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Reading Time</span>
                    <span className="font-medium">{post.read_time_minutes || 5} min</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      {/* Related Stories Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold font-poppins text-[var(--headings-labels)]">You Might Also Like</h2>
                <p className="text-lg text-[var(--text-muted)] mt-2">Continue your culinary journey with these stories.</p>
            </div>
            <FeaturedArticleWidget 
                relatedRestaurantIds={post.related_restaurant_ids || []}
                relatedDishes={post.related_dish_names || []}
            />
        </div>
      </section>
    </div>
  );
}
