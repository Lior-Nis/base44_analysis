
import React, { useState, useEffect } from 'react';
import { Restaurant as RestaurantEntity, Dish, Review, UserFavorite, User as UserEntity, Location } from '@/api/entities';
import { Star, MapPin, Clock, Phone, Mail, Heart, Utensils, Send, Plus, Download, FileText, ImageIcon, ZoomIn } from 'lucide-react'; // Added ZoomIn
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import SimpleMap from '../components/map/SimpleMap';
import ReviewsList from '../components/reviews/ReviewsList';
import ReviewForm from '../components/reviews/ReviewForm';
import AdBanner from '../components/ads/AdBanner';

// DishCard component for displaying individual menu items
const DishCard = ({ dish }) => (
  <Card className="soft-shadow overflow-hidden group">
    {dish.image_url && (
      <div className="relative w-full h-48 overflow-hidden">
        <img
          src={dish.image_url}
          alt={dish.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute bottom-0 right-0 bg-[var(--primary-cta)] text-white px-3 py-1 rounded-tl-lg font-semibold text-lg">
          {dish.price} {dish.currency}
        </div>
      </div>
    )}
    <CardContent className="p-4">
      <h3 className="font-bold text-xl text-[var(--text-body)] mb-2">{dish.name}</h3>
      <p className="text-sm text-[var(--text-muted)] line-clamp-3">{dish.description}</p>
    </CardContent>
  </Card>
);

export default function RestaurantPage() {
  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [user, setUser] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false); // State to control the Review Form Dialog
  const [activeTab, setActiveTab] = useState('overview');
  const [lightboxImage, setLightboxImage] = useState(null); // State for lightbox

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    const urlParams = new URLSearchParams(window.location.search);
    const restaurantId = urlParams.get('id');

    if (!restaurantId) {
      setError('No restaurant ID provided.');
      setIsLoading(false);
      return;
    }

    try {
      const [
        restaurantData,
        dishData,
        reviewData,
        currentUser
      ] = await Promise.all([
        RestaurantEntity.filter({ id: restaurantId, status: 'approved' }).then(res => res[0]).catch(err => { console.error("Failed to load restaurant data", err); return null; }),
        Dish.filter({ restaurant_id: restaurantId }).catch(err => { console.error("Failed to load dishes", err); return []; }),
        Review.filter({ restaurant_id: restaurantId }, '-created_date').catch(err => { console.error("Failed to load reviews", err); return []; }),
        UserEntity.me().catch(() => null)
      ]);

      if (!restaurantData) {
        setError('Restaurant not found or not approved.');
        setIsLoading(false);
        return;
      }

      setDishes(dishData);
      setReviews(reviewData);
      setUser(currentUser);

      const locationData = await Location.filter({ id: restaurantData.location_id }).then(res => res[0]).catch(err => { console.error("Failed to load location data", err); return null; });
      setLocation(locationData);

      // Augment restaurant state with location coordinates for map component if available
      // This ensures the map has latitude/longitude even if RestaurantEntity doesn't inherently contain them
      if (locationData && locationData.latitude && locationData.longitude) {
        setRestaurant({
          ...restaurantData,
          latitude: locationData.latitude,
          longitude: locationData.longitude
        });
      } else {
        // If location data doesn't have coordinates, fall back to restaurantData (if it has them)
        // or proceed with potentially no coordinates for the map
        setRestaurant(restaurantData);
      }

      if (currentUser) {
        const favorite = await UserFavorite.filter({ user_id: currentUser.id, restaurant_id: restaurantId }).catch(() => []);
        setIsFavorited(favorite.length > 0);
      }

    } catch (err) {
      console.error('Failed to load restaurant page:', err);
      setError('Could not load restaurant details.');
    }
    setIsLoading(false);
  };

  const handleFavoriteToggle = async () => {
    if (!user) {
      // User is not logged in, prompt for login
      await UserEntity.login();
      return;
    }

    try {
      if (isFavorited) {
        const favorite = await UserFavorite.filter({ user_id: user.id, restaurant_id: restaurant.id });
        if (favorite.length > 0) {
          await UserFavorite.delete(favorite[0].id);
          setIsFavorited(false);
        }
      } else {
        await UserFavorite.create({
          user_id: user.id,
          restaurant_id: restaurant.id,
          type: 'restaurant'
        });
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false); // Close the dialog
    loadData(); // Reload data to show the new review
  };

  const handlePDFMenuDownload = () => {
    if (restaurant.pdf_menu_url) {
      const link = document.createElement('a');
      link.href = restaurant.pdf_menu_url;
      link.download = `${restaurant.name}-Menu.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isLoading) {
    return <div className="text-center py-20">Loading restaurant...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">{error}</div>;
  }

  if (!restaurant || !location) {
    return <div className="text-center py-20 text-red-500">Restaurant data is incomplete or unavailable.</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Restaurant Image */}
      <div className="relative h-[40vh] bg-gray-200 overflow-hidden">
        <img
          src={restaurant.restaurant_images?.[0] || restaurant.logo_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80'}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Restaurant Info Overlay */}
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={restaurant.logo_url || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=100&q=80'}
              alt={`${restaurant.name} logo`}
              className="w-20 h-20 rounded-full border-4 border-white shadow-lg object-cover"
            />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-playfair mb-2">{restaurant.name}</h1>
              <div className="flex items-center gap-4 text-lg">
                <span className="capitalize">{restaurant.cuisine_type}</span>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{location?.name || 'Unknown Location'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="text-xl font-semibold">
                {restaurant.average_rating > 0 ? restaurant.average_rating.toFixed(1) : 'New'}
              </span>
              <span className="text-gray-200">({reviews.length} reviews)</span>
            </div>
            {restaurant.opening_hours && (
              <span className="text-gray-200">{restaurant.opening_hours}</span>
            )}
          </div>
        </div>
      </div>

      {/* Ad Banner Space */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AdBanner
          placement="restaurant_detail_header"
          className="h-24 w-full"
          format="banner"
          targetLocation={restaurant.location_id}
          targetCuisine={restaurant.cuisine_type}
        />
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {['overview', 'menu', 'reviews', 'photos', 'info'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-[var(--primary-cta)] text-[var(--primary-cta)]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Conditionally rendered content based on activeTab */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <section>
            <h2 className="font-poppins text-3xl font-bold text-center mb-8 text-[var(--headings-labels)]">Overview</h2>
            <Card className="soft-shadow mb-8">
              <CardHeader>
                <CardTitle>About {restaurant.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-[var(--text-body)]">
                <p className="text-lg">{restaurant.description}</p>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="font-bold text-lg">{restaurant.average_rating?.toFixed(1) || 'New'}</span>
                  <span className="text-[var(--text-muted)] text-lg">({reviews.length} reviews)</span>
                </div>
                <Badge variant="outline" className="text-lg py-1 px-3 capitalize">{restaurant.cuisine_type}</Badge>
                <div className="flex items-center gap-3"><MapPin className="w-5 h-5 text-[var(--primary-cta)]"/>{location?.name || 'Unknown Location'}</div>
                <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-[var(--primary-cta)]"/>{restaurant.opening_hours}</div>
              </CardContent>
            </Card>
            <div className="space-y-3">
              <Button onClick={handleFavoriteToggle} variant="outline" size="lg" className="w-full">
                <Heart className={`w-5 h-5 mr-2 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
              </Button>
              {restaurant.pdf_menu_url && (
                <Button
                  onClick={handlePDFMenuDownload}
                  className="w-full cta-button"
                  size="lg"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Menu (PDF)
                </Button>
              )}
            </div>
          </section>
        )}

        {activeTab === 'menu' && (
          <section>
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-poppins text-3xl font-bold text-[var(--headings-labels)]">Our Menu</h2>
              {restaurant.pdf_menu_url && (
                <Button
                  onClick={handlePDFMenuDownload}
                  variant="outline"
                  className="hidden md:flex"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF Menu
                </Button>
              )}
            </div>

            <div className="space-y-8">
              {/* Menu Photos Section */}
              {restaurant.menu_images && restaurant.menu_images.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Menu Photos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {restaurant.menu_images.map((imageUrl, index) => (
                        <div key={index} className="aspect-[4/3] overflow-hidden rounded-lg group relative">
                          <img
                            src={imageUrl}
                            alt={`Menu ${index + 1}`}
                            className="w-full h-full object-cover transition-transform duration-200"
                          />
                          <div
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                            onClick={() => setLightboxImage(imageUrl)}
                          >
                            <ZoomIn className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Dishes Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dishes.length > 0 ? (
                  dishes.map((dish) => (
                    <DishCard key={dish.id} dish={dish} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-16">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Menu Items Yet</h3>
                    <p className="text-gray-500">This restaurant hasn't added their menu items yet.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'reviews' && (
          <section>
            <h2 className="font-poppins text-3xl font-bold text-center mb-8 text-[var(--headings-labels)]">Reviews</h2>

            <div className="max-w-3xl mx-auto">
              <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
                <DialogTrigger asChild>
                  <Button size="lg" className="cta-button mb-8">
                    <Plus className="w-5 h-5 mr-2" /> Write a Review
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Write a Review for {restaurant.name}</DialogTitle>
                    <DialogDescription>
                      Share your experience to help others.
                    </DialogDescription>
                  </DialogHeader>
                  <ReviewForm
                    restaurantId={restaurant.id}
                    onReviewSubmitted={handleReviewSubmitted}
                    onCancel={() => setShowReviewForm(false)}
                  />
                </DialogContent>
              </Dialog>

              <ReviewsList reviews={reviews} currentUserId={user?.id} />
            </div>
          </section>
        )}

        {activeTab === 'photos' && (
          <section>
            <h2 className="font-poppins text-3xl font-bold text-center mb-8 text-[var(--headings-labels)]">Photo Gallery</h2>
            {restaurant.restaurant_images && restaurant.restaurant_images.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {restaurant.restaurant_images.map((imageUrl, index) => (
                  <div key={index} className="aspect-video overflow-hidden rounded-lg group relative">
                    <img
                      src={imageUrl}
                      alt={`Restaurant photo ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-200"
                    />
                    <div
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                      onClick={() => setLightboxImage(imageUrl)}
                    >
                      <ZoomIn className="w-8 h-8 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-white/50 rounded-lg border border-dashed border-[var(--border-color)]">
                <p className="text-[var(--text-muted)] mb-4">No photos available yet.</p>
              </div>
            )}
          </section>
        )}

        {activeTab === 'info' && (
          <section>
            <h2 className="font-poppins text-3xl font-bold text-center mb-8 text-[var(--headings-labels)]">Restaurant Information</h2>
            <div className="grid lg:grid-cols-2 gap-8">
                <div>
                    <Card className="soft-shadow">
                      <CardHeader>
                        <CardTitle>Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-[var(--text-body)]">
                        <div className="flex items-center gap-3"><MapPin className="w-5 h-5 text-[var(--primary-cta)]"/>{location?.name || 'Unknown Location'}</div>
                        <div className="flex items-center gap-3"><Phone className="w-5 h-5 text-[var(--primary-cta)]"/>{restaurant.contact_phone}</div>
                        <div className="flex items-center gap-3"><Mail className="w-5 h-5 text-[var(--primary-cta)]"/>{restaurant.contact_email}</div>
                        <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-[var(--primary-cta)]"/>{restaurant.opening_hours}</div>

                        {restaurant.pdf_menu_url && (
                          <div className="pt-2 border-t border-[var(--border-color)]">
                            <Button
                              onClick={handlePDFMenuDownload}
                              variant="outline"
                              className="w-full"
                            >
                              <FileText className="w-4 h-4 mr-2" />
                              View Full Menu (PDF)
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                </div>
                <div>
                    {/* SimpleMap expects restaurant object(s) to have latitude and longitude */}
                    <SimpleMap restaurants={[restaurant]} height="300px" />
                </div>
            </div>
          </section>
        )}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={!!lightboxImage} onOpenChange={() => setLightboxImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-2 bg-transparent border-none shadow-none">
          <img src={lightboxImage} alt="Enlarged view" className="w-full h-full object-contain" />
        </DialogContent>
      </Dialog>
    </div>
  );
}
