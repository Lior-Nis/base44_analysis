
import React, { useState, useEffect } from 'react';
import { Product, Seller, Category } from '@/api/entities';
import { Search, Filter, Heart, Star, ShoppingCart, Tag, Package, Award } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import ProductCard from '../components/marketplace/ProductCard';
import FeaturedSellers from '../components/marketplace/FeaturedSellers';
import AdBanner from '../components/ads/AdBanner';

export default function MarketplacePage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [featuredSellers, setFeaturedSellers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory, selectedFilter, sortBy, products]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [productData, sellerData, categoryData] = await Promise.all([
        Product.filter({ status: 'approved' }),
        Seller.filter({ status: 'approved', featured: true }, '-rating', 6),
        Category.list()
      ]);
      
      setProducts(productData);
      setFeaturedSellers(sellerData);
      setCategories(categoryData);
    } catch (error) {
      console.error('Error loading marketplace data:', error);
    }
    setIsLoading(false);
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Special filters
    if (selectedFilter === 'chef_recommended') {
      filtered = filtered.filter(p => p.chef_recommended);
    } else if (selectedFilter === 'maldivian_classic') {
      filtered = filtered.filter(p => p.maldivian_classic);
    } else if (selectedFilter === 'new_arrivals') {
      filtered = filtered.filter(p => p.new_arrival);
    } else if (selectedFilter === 'organic') {
      filtered = filtered.filter(p => p.organic);
    }

    // Sort products
    switch (sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0));
        break;
      default: // featured
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    setFilteredProducts(filtered);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--primary-cta)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-[var(--primary-cta)] rounded-lg flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-playfair text-4xl md:text-5xl font-bold text-[var(--headings-labels)] mb-4">
            Maldivian Flavors Marketplace
          </h1>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
            Discover authentic ingredients, chef-recommended products, and culinary treasures 
            from the heart of Maldivian cuisine culture.
          </p>
        </div>

        {/* Top Banner Ad */}
        <AdBanner placement="marketplace_hero" className="h-32 mb-12" format="banner" />

        {/* Search and Filters */}
        <div className="bg-stone-50/70 rounded-lg border border-[var(--border-color)] p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search products, ingredients, or sellers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 rounded-md"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-12 rounded-md">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                    <SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-12 rounded-md">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured First</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-3 mt-4">
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('all')}
              className="rounded-full"
            >
              All Products
            </Button>
            <Button
              variant={selectedFilter === 'chef_recommended' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('chef_recommended')}
              className="rounded-full"
            >
              <Award className="w-4 h-4 mr-1" />
              Chef's Pick
            </Button>
            <Button
              variant={selectedFilter === 'maldivian_classic' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('maldivian_classic')}
              className="rounded-full"
            >
              <Star className="w-4 h-4 mr-1" />
              Maldivian Classic
            </Button>
            <Button
              variant={selectedFilter === 'new_arrivals' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('new_arrivals')}
              className="rounded-full"
            >
              <Tag className="w-4 h-4 mr-1" />
              New Arrivals
            </Button>
            <Button
              variant={selectedFilter === 'organic' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('organic')}
              className="rounded-full"
            >
              Organic
            </Button>
          </div>
        </div>

        {/* Featured Sellers Section */}
        <FeaturedSellers sellers={featuredSellers} />

        {/* Products Grid */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-playfair text-2xl font-bold text-[var(--headings-labels)]">
              Products ({filteredProducts.length})
            </h2>
            <Button variant="outline" asChild>
              <Link to={createPageUrl('SellerPortal')}>
                Become a Seller
              </Link>
            </Button>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <div key={product.id}>
                  <ProductCard product={product} />
                  
                  {/* Inline ads every 8 products */}
                  {(index + 1) % 8 === 0 && (
                    <div className="col-span-full mt-6 mb-6">
                      <AdBanner 
                        placement="marketplace_inline" 
                        className="h-24"
                        format="text"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold font-playfair text-[var(--headings-labels)] mb-2">No products found</h3>
              <p className="text-[var(--text-muted)] mb-6">Try adjusting your search or filters</p>
              <Button onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedFilter('all');
              }} className="cta-button">
                Clear All Filters
              </Button>
            </div>
          )}
        </div>

        {/* Bottom Ad */}
        <AdBanner placement="marketplace_bottom" className="h-32" format="banner" />
      </div>
    </div>
  );
}
