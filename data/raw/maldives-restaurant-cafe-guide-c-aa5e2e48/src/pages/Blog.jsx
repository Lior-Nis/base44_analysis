
import React, { useState, useEffect } from 'react';
import { BlogPost as BlogPostEntity } from '@/api/entities';
import { Search, Filter, Calendar, User, Eye, Heart, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AdBanner from '../components/ads/AdBanner';

const CATEGORIES = {
  dish_deep_dive: 'Dish Deep Dive',
  chef_spotlight: 'Chef Spotlight',
  island_culture: 'Island Culture',
  hidden_gems: 'Hidden Gems',
  festive_food: 'Festive Food',
  traditions: 'Traditions'
};

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [allTags, setAllTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    loadBlogPosts();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [posts, searchQuery, selectedCategory, selectedTag]);

  const loadBlogPosts = async () => {
    setIsLoading(true);
    setHasError(false);
    
    try {
      const allPosts = await BlogPostEntity.filter({ status: 'published' }, '-created_date');
      const featured = allPosts.filter(post => post.featured);
      
      // Extract all unique tags
      const tags = [...new Set(allPosts.flatMap(post => post.tags || []))];
      
      setPosts(allPosts);
      setFeaturedPosts(featured.slice(0, 3));
      setAllTags(tags);
    } catch (error) {
      console.error('Error loading blog posts:', error);
      setHasError(true);
      // Set empty arrays as fallbacks
      setPosts([]);
      setFeaturedPosts([]);
      setAllTags([]);
    }
    setIsLoading(false);
  };

  const filterPosts = () => {
    let filtered = [...posts];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.excerpt?.toLowerCase().includes(query) ||
        post.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // Filter by tag
    if (selectedTag !== 'all') {
      filtered = filtered.filter(post => post.tags?.includes(selectedTag));
    }

    setFilteredPosts(filtered);
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
          <p className="text-[var(--text-muted)]">Loading stories...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-[var(--bg-cream)] py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--headings-labels)] font-poppins mb-4">
              Food Stories
            </h1>
            <div className="bg-white rounded-xl p-12 soft-shadow">
              <h2 className="text-2xl font-bold text-[var(--headings-labels)] mb-4">
                Stories Temporarily Unavailable
              </h2>
              <p className="text-[var(--text-muted)] mb-6">
                We're experiencing some technical difficulties loading our food stories. Please check back soon!
              </p>
              <Link to={createPageUrl('Home')}>
                <button className="cta-button">
                  Return to Home
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-cream)] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Banner Ad */}
        <div className="mb-8">
          <AdBanner 
            placement="homepage_hero" 
            className="h-32 lg:h-48"
            format="banner"
          />
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--headings-labels)] font-poppins mb-4">
            Food Stories
          </h1>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
            Discover the rich culinary heritage, hidden gems, and fascinating stories behind Maldivian cuisine
          </p>
        </div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-[var(--headings-labels)] mb-8 font-poppins">Featured Stories</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <Link key={post.id} to={createPageUrl(`BlogPost?id=${post.id}`)} className="group">
                  <Card className="soft-shadow soft-shadow-hover transition-all duration-300 h-full">
                    <div className="relative overflow-hidden rounded-t-xl">
                      <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className={getCategoryColor(post.category)}>
                          {CATEGORIES[post.category]}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-bold text-xl text-[var(--text-body)] mb-2 group-hover:text-[var(--primary-cta)] transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-[var(--text-muted)] mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-[var(--text-muted)]">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>{post.author_name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{post.views || 0}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            <span>{post.likes || 0}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Filters */}
        <div className="mb-8 p-6 bg-white rounded-xl soft-shadow">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search stories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(CATEGORIES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger>
                <SelectValue placeholder="All Tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {filteredPosts.length > 0 ? (
              <div className="space-y-8">
                {filteredPosts.map((post) => (
                  <Link key={post.id} to={createPageUrl(`BlogPost?id=${post.id}`)} className="group block">
                    <Card className="soft-shadow soft-shadow-hover transition-all duration-300">
                      <div className="grid md:grid-cols-3 gap-6 p-6">
                        <div className="relative overflow-hidden rounded-lg">
                          <img
                            src={post.cover_image_url}
                            alt={post.title}
                            className="w-full h-32 md:h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <div className="flex items-center gap-2 mb-3">
                            <Badge className={getCategoryColor(post.category)}>
                              {CATEGORIES[post.category]}
                            </Badge>
                            <span className="text-sm text-[var(--text-muted)]">
                              {formatDate(post.created_date)}
                            </span>
                          </div>
                          <h3 className="font-bold text-xl text-[var(--text-body)] mb-2 group-hover:text-[var(--primary-cta)] transition-colors">
                            {post.title}
                          </h3>
                          {post.subtitle && (
                            <p className="text-[var(--primary-cta)] mb-2 font-medium">
                              {post.subtitle}
                            </p>
                          )}
                          <p className="text-[var(--text-muted)] mb-4 line-clamp-2">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                              <User className="w-4 h-4" />
                              <span>{post.author_name}</span>
                              {post.read_time_minutes && (
                                <>
                                  <span>•</span>
                                  <span>{post.read_time_minutes} min read</span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                <span>{post.views || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="w-4 h-4" />
                                <span>{post.likes || 0}</span>
                              </div>
                            </div>
                          </div>
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex items-center gap-2 mt-3">
                              <Tag className="w-3 h-3 text-[var(--text-muted)]" />
                              <div className="flex flex-wrap gap-1">
                                {post.tags.slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-2xl font-semibold text-[var(--headings-labels)] mb-3">No Stories Found</h3>
                <p className="text-[var(--text-muted)] mb-6">
                  Try adjusting your search terms or filters.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Sidebar Ad */}
            <AdBanner 
              placement="profile_sidebar" 
              className="h-48"
              format="card"
            />

            {/* Popular Tags */}
            {allTags.length > 0 && (
              <Card className="soft-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">Popular Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {allTags.slice(0, 15).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-[var(--primary-cta)] hover:text-white transition-colors"
                        onClick={() => setSelectedTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Categories */}
            <Card className="soft-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(CATEGORIES).map(([key, label]) => {
                    const count = posts.filter(post => post.category === key).length;
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedCategory(key)}
                      >
                        <span className="text-[var(--text-body)]">{label}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
