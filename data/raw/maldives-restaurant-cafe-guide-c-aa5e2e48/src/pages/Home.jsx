
import React, { useState, useEffect } from 'react';
import { Restaurant, User, HeroMedia, Dish, BlogPost, Poll, Product, Location } from '@/api/entities';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Star, Utensils } from 'lucide-react';
import FeaturedRestaurants from '../components/restaurant/FeaturedRestaurants';
import TopDishes from '../components/dishes/TopDishes';
import AdBanner from '../components/ads/AdBanner';
import RollingReviews from '../components/reviews/RollingReviews';
import FeaturedArticleWidget from '../components/blog/FeaturedArticleWidget';
import WeeklyPollWidget from '../components/polls/WeeklyPollWidget';
import FeaturedProducts from '../components/marketplace/FeaturedProducts';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [heroMedia, setHeroMedia] = useState([]);
  const [restaurants, setRestaurants] = useState([]); // Represents all approved restaurants
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]); // Represents specifically featured restaurants
  const [topDishes, setTopDishes] = useState([]); // Renamed from 'dishes'
  // products state and its loading have been removed as per the outline's instructions.
  // FeaturedProducts component will receive an empty array.
  const [blogPosts, setBlogPosts] = useState([]); // New state for blog posts
  const [activePoll, setActivePoll] = useState(null); // New state for active poll
  const [featuredProducts, setFeaturedProducts] = useState([]); // New state for featured products
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // New state for error handling

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load user (non-critical, allows other data to load even if user authentication fails)
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (userError) {
        // User not logged in or authentication error - this is acceptable for the homepage
        console.log('User not authenticated for homepage:', userError.message);
      }

      // Load core data with individual error handling for each promise
      const dataPromises = [
        Restaurant.filter({ status: 'approved' }, '-created_date', 20).catch((err) => {
          console.error('Failed to load all restaurants:', err);
          return []; // Return empty array on error to prevent Promise.all from failing
        }),
        Restaurant.filter({ featured: true, status: 'approved' }, '-created_date', 8).catch((err) => {
          console.error('Failed to load featured restaurants:', err);
          return []; // Return empty array on error
        }),
        Dish.list('-popularity_score', 12).catch((err) => {
          console.error('Failed to load top dishes:', err);
          return []; // Return empty array on error
        }),
        BlogPost.filter({ status: 'published' }, '-created_date', 4).catch((err) => {
          console.error('Failed to load blog posts:', err);
          return []; // Return empty array on error
        }),
        HeroMedia.filter({ is_active: true }, 'sort_order').catch((err) => {
          console.error('Failed to load hero media:', err);
          return []; // Return empty array on error
        }),
        Poll.filter({ active: true, featured: true }, '-created_date', 1).catch((err) => {
          console.error('Failed to load polls:', err);
          return []; // Return empty array on error
        }),
        // Add featured products loading
        Product.filter({ featured: true, status: 'approved' }, '-created_date', 6).catch((err) => {
          console.error('Failed to load featured products:', err);
          return []; // Return empty array on error
        }),
        Location.list().catch((err) => {
          console.error('Failed to load locations:', err);
          return [];
        })
      ];

      const [
        restaurantData,
        featuredData,
        dishData,
        blogData,
        heroData,
        pollData,
        productsData,
        locationData
      ] = await Promise.all(dataPromises);

      // Create enriched location data with display names
      const atolls = locationData.filter(l => l.type === 'atoll');
      const islands = locationData.filter(l => l.type === 'island');
      
      const enrichedIslands = islands.map(island => {
        const parentAtoll = atolls.find(atoll => atoll.id === island.parent_id);
        return {
          ...island,
          display_name: parentAtoll ? `${island.name} (${parentAtoll.name})` : island.name
        };
      });

      // Enrich restaurant data with location names
      const enrichRestaurantsWithLocation = (restaurants) => {
        return restaurants.map(restaurant => {
          const location = enrichedIslands.find(l => l.id === restaurant.location_id);
          return {
            ...restaurant,
            location_name: location ? location.display_name : 'Location TBD'
          };
        });
      };

      const enrichedRestaurantData = enrichRestaurantsWithLocation(restaurantData);
      const enrichedFeaturedData = enrichRestaurantsWithLocation(featuredData);

      // Enhance dishes with restaurant names, preserving existing functionality
      const enhancedDishes = dishData.map((dish) => {
        const restaurant = enrichedRestaurantData.find((r) => r.id === dish.restaurant_id);
        return {
          ...dish,
          restaurant_name: restaurant ? restaurant.name : 'Unknown Restaurant'
        };
      });

      setRestaurants(enrichedRestaurantData);
      setFeaturedRestaurants(enrichedFeaturedData);
      setTopDishes(enhancedDishes);
      setBlogPosts(blogData);
      setHeroMedia(heroData);
      setActivePoll(pollData.length > 0 ? pollData[0] : null);
      setFeaturedProducts(productsData);

    } catch (criticalError) {
      console.error('Critical error loading homepage data:', criticalError);
      setError('Unable to load content. Please try refreshing the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = createPageUrl(`AllRestaurants?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Render loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--primary-cta)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--text-muted)]">Loading delicious content...</p>
        </div>
      </div>);

  }

  // Render error state if a critical error occurred during data loading
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🍽️</div>
          <h2 className="text-2xl font-bold text-[var(--headings-labels)] mb-2">
            Something went wrong
          </h2>
          <p className="text-[var(--text-muted)] mb-6">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="cta-button">

            Refresh Page
          </Button>
        </div>
      </div>);

  }

  const HeroSection = () => {
    // heroLoading state and its checks are removed, as global isLoading handles initial page load.
    // This component will only render when isLoading is false.

    if (!heroMedia || heroMedia.length === 0) {
      return (
        <div className="relative w-full h-[45vh] bg-cover bg-center" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80&fit=max)` }}>
          <div className="absolute inset-0 bg-black/50"></div>
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
            <h1 className="font-playfair text-3xl md:text-5xl font-bold mb-4">Discover the Taste of Maldives</h1>
            <p className="font-inter text-base md:text-lg max-w-2xl mb-6">Your ultimate guide to the best dining experiences, from local favorites to hidden gems.</p>
            <Link to={createPageUrl('AllRestaurants')} className="cta-button">Explore Restaurants</Link>
          </div>
        </div>);

    }

    return (
      <Carousel
        className="w-full relative"
        opts={{ loop: true }}>

        <CarouselContent>
          {heroMedia.map((item) =>
            <CarouselItem key={item.id}>
              <div className="relative w-full h-[45vh]">
                {item.media_type === 'video' ?
                  <video src={item.file_url} className="w-full h-full object-cover" autoPlay loop muted playsInline /> :
                  <img src={item.file_url} alt={item.headline || 'Hero image'} className="w-full h-full object-cover" />
                }
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4">
                  <h1 className="font-playfair text-3xl md:text-5xl font-bold mb-4">{item.headline || 'Discover the Taste of Maldives'}</h1>
                  <p className="font-inter text-base md:text-lg max-w-2xl mb-6">{item.subheadline || 'Your ultimate guide to the best dining experiences'}</p>
                  {item.cta_text && item.cta_link &&
                    <Link to={item.cta_link} className="cta-button">{item.cta_text}</Link>
                  }
                </div>
              </div>
            </CarouselItem>
          )}
        </CarouselContent>

        {/* Navigation Arrows - Only show if there are multiple items */}
        {heroMedia.length > 1 &&
          <>
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 border border-white/20 text-white hover:text-white" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 border border-white/20 text-white hover:text-white" />
          </>
        }
      </Carousel>);

  };

  return (
    <div className="bg-white">
      <HeroSection />

      {/* Search Bar Section */}
      <div className="relative -mt-8 z-20">
        <div className="max-w-4xl mx-auto px-4">
          <form onSubmit={handleSearch}>
            <div className="relative bg-white p-4 rounded-lg shadow-lg flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for restaurants, dishes, or islands..."
                className="flex-grow border-0 focus:ring-0 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} />

              <Button type="submit" className="cta-button px-8">
                Search
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* FeaturedRestaurants now receives featuredRestaurants */}
        <FeaturedRestaurants restaurants={featuredRestaurants} />

        <div className="my-16">
          <AdBanner placement="homepage_featured" />
        </div>

        {/* TopDishes now receives topDishes */}
        <TopDishes dishes={topDishes} />

        <div className="my-16">
          <AdBanner placement="homepage_trending" />
        </div>

        <div className="my-16">
          <RollingReviews />
        </div>

        <div className="my-16">
          {/* FeaturedArticleWidget will internally handle blogPosts or receive them as props if its implementation changes */}
          <FeaturedArticleWidget />
        </div>

        <div className="my-16">
          {/* WeeklyPollWidget will internally handle activePoll or receive it as a prop if its implementation changes */}
          <WeeklyPollWidget />
        </div>

        <div className="my-16">
          {/* FeaturedProducts now receives the actual featuredProducts from state */}
          <FeaturedProducts products={featuredProducts} />
        </div>
      </div>
    </div>);

}
