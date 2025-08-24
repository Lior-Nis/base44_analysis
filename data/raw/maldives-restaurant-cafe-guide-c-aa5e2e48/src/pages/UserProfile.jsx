
import React, { useState, useEffect } from 'react';
import { User as UserEntity, UserFavorite, Review, Restaurant, UploadFile } from '@/api/entities';
import { User, Heart, Star, MapPin, Edit3, Settings, Calendar, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import RestaurantCard from '../components/restaurant/RestaurantCard';
import ReviewsList from '../components/reviews/ReviewsList';
import AdBanner from '../components/ads/AdBanner';

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [favoriteRestaurants, setFavoriteRestaurants] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await UserEntity.me();
      setUser(currentUser);
      setEditForm({
        full_name: currentUser.full_name,
        phone: currentUser.phone || '',
        location: currentUser.location || '',
        avatar_url: currentUser.avatar_url || ''
      });

      // Load user's favorites
      const userFavorites = await UserFavorite.filter({ 
        user_id: currentUser.id, 
        type: 'restaurant' 
      });
      
      if (userFavorites.length > 0) {
        const restaurantIds = userFavorites.map(f => f.restaurant_id).filter(Boolean);
        const allRestaurants = await Restaurant.list();
        const favoriteRestaurants = allRestaurants.filter(r => 
          restaurantIds.includes(r.id) && r.status === 'approved'
        );
        setFavoriteRestaurants(favoriteRestaurants);
      } else {
        setFavoriteRestaurants([]);
      }

      // Load user's reviews
      const reviews = await Review.filter({ user_id: currentUser.id }, '-created_date');
      
      // Enhance reviews with restaurant names
      const enhancedReviews = await Promise.all(
        reviews.map(async (review) => {
          try {
            const allRestaurants = await Restaurant.list();
            const restaurant = allRestaurants.find(r => r.id === review.restaurant_id);
            return {
              ...review,
              restaurant_name: restaurant ? restaurant.name : 'Unknown Restaurant',
              user_name: currentUser.full_name
            };
          } catch (error) {
            console.error('Error enhancing review with restaurant name:', error);
            return { 
              ...review, 
              restaurant_name: 'Unknown Restaurant',
              user_name: currentUser.full_name
            };
          }
        })
      );
      
      setUserReviews(enhancedReviews);
    } catch (error) {
      console.error('Error loading user data:', error);
      await UserEntity.login();
    }
    setIsLoading(false);
  };

  const handleAvatarUpload = async (file) => {
    if (!file) return;
    
    setUploadingAvatar(true);
    try {
      const result = await UploadFile({ file });
      await UserEntity.updateMyUserData({ avatar_url: result.file_url });
      setUser(prev => ({ ...prev, avatar_url: result.file_url }));
      setEditForm(prev => ({ ...prev, avatar_url: result.file_url }));
    } catch (error) {
      console.error('Error uploading avatar:', error);
    }
    setUploadingAvatar(false);
  };

  const handleFavoriteToggle = async (restaurantId) => {
    // This function is for removing a favorite from the profile page
    try {
      const favoriteRecord = await UserFavorite.filter({ user_id: user.id, restaurant_id: restaurantId });
      if (favoriteRecord.length > 0) {
        await UserFavorite.delete(favoriteRecord[0].id);
        setFavoriteRestaurants(prev => prev.filter(r => r.id !== restaurantId));
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    try {
      await UserEntity.updateMyUserData({
        phone: editForm.phone,
        location: editForm.location
      });
      
      setUser(prev => ({ 
        ...prev, 
        phone: editForm.phone, 
        location: editForm.location 
      }));
      setShowEditDialog(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
    setIsUpdating(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getUserRole = () => {
    if (user?.is_admin) return 'Administrator';
    if (user?.is_restaurant_owner) return 'Restaurant Owner';
    return 'Food Explorer';
  };

  const getUserRoleColor = () => {
    if (user?.is_admin) return 'bg-purple-100 text-purple-800';
    if (user?.is_restaurant_owner) return 'bg-green-100 text-green-800';
    return 'bg-blue-100 text-blue-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--text-muted)]">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <Card className="food-card mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Avatar className="w-24 h-24">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                ) : (
                  <AvatarFallback className="bg-[var(--brand-primary)] text-white text-2xl font-bold">
                    {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                )}
              </Avatar>
              
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl font-bold text-[var(--text-dark)] mb-2">
                  {user?.full_name || 'Welcome!'}
                </h1>
                <p className="text-[var(--text-muted)] text-lg mb-3">{user?.email}</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
                  <Badge className={getUserRoleColor()}>
                    {getUserRole()}
                  </Badge>
                  {user?.location && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {user.location}
                    </Badge>
                  )}
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Joined {formatDate(user?.created_date)}
                  </Badge>
                </div>
                
                <Button 
                  onClick={() => setShowEditDialog(true)}
                  variant="outline"
                  className="border-[var(--border-color)]"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="food-card text-center">
            <CardContent className="p-6">
              <Heart className="w-8 h-8 text-[var(--brand-primary)] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[var(--text-dark)]">
                {favoriteRestaurants.length}
              </div>
              <div className="text-[var(--text-muted)]">Favorite Restaurants</div>
            </CardContent>
          </Card>
          
          <Card className="food-card text-center">
            <CardContent className="p-6">
              <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-[var(--text-dark)]">
                {userReviews.length}
              </div>
              <div className="text-[var(--text-muted)]">Reviews Written</div>
            </CardContent>
          </Card>
          
          <Card className="food-card text-center">
            <CardContent className="p-6">
              <Award className="w-8 h-8 text-[var(--brand-accent)] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[var(--text-dark)]">
                {userReviews.reduce((sum, review) => sum + (review.helpful_votes || 0), 0)}
              </div>
              <div className="text-[var(--text-muted)]">Helpful Votes</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-white border border-[var(--border-color)]">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[var(--brand-primary)] data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="favorites" className="data-[state=active]:bg-[var(--brand-primary)] data-[state=active]:text-white">
              Favorites ({favoriteRestaurants.length})
            </TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-[var(--brand-primary)] data-[state=active]:text-white">
              Reviews ({userReviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Profile Ad Sidebar */}
            <div className="mb-6">
              <AdBanner 
                placement="profile_sidebar" 
                className="h-24"
                format="text"
                targetLocation={user?.location}
              />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="food-card">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  {userReviews.length > 0 ? (
                    <div className="space-y-4">
                      {userReviews.slice(0, 3).map((review) => (
                        <div key={review.id} className="p-3 bg-[var(--bg-warm)] rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-[var(--text-muted)]">
                              {review.restaurant_name}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-[var(--text-dark)] line-clamp-2">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[var(--text-muted)] text-center py-4">
                      No reviews yet. Start exploring restaurants!
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="food-card">
                <CardHeader>
                  <CardTitle>Quick Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-[var(--border-color)]"
                    onClick={() => window.location.href = '/AllRestaurants'}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Discover Restaurants
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-[var(--border-color)]"
                    onClick={() => setActiveTab('favorites')}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    View Favorites
                  </Button>
                  
                  {user?.is_restaurant_owner && (
                    <Button 
                      variant="outline" 
                      className="w-full justify-start border-[var(--border-color)]"
                      onClick={() => window.location.href = '/RestaurantPortal'}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Restaurant Portal
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="favorites">
            {favoriteRestaurants.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteRestaurants.map((restaurant) => (
                  <div key={restaurant.id} className="relative group">
                    <RestaurantCard
                      restaurant={restaurant}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleFavoriteToggle(restaurant.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="food-card text-center py-16">
                <CardContent>
                  <Heart className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold text-[var(--text-dark)] mb-2">
                    No favorite restaurants yet
                  </h3>
                  <p className="text-[var(--text-muted)] mb-6">
                    Start exploring and add restaurants to your favorites!
                  </p>
                  <Button 
                    className="btn-primary"
                    onClick={() => window.location.href = '/AllRestaurants'}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Discover Restaurants
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewsList 
              reviews={userReviews} 
              currentUserId={user?.id}
              onHelpfulVote={() => {}} // User can't vote on their own reviews
            />
          </TabsContent>
        </Tabs>

        {/* Edit Profile Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Avatar Upload */}
              <div className="text-center">
                <div className="relative inline-block">
                  <Avatar className="w-20 h-20">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <AvatarFallback className="bg-[var(--primary-cta)] text-white text-2xl font-bold">
                        {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files && e.target.files[0] && handleAvatarUpload(e.target.files[0])}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 rounded-full p-1 bg-white border border-gray-300 shadow-sm"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                    disabled={uploadingAvatar}
                  >
                    {uploadingAvatar ? (
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Edit3 className="w-4 h-4 text-gray-600" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mt-2">Click the edit button to change your profile picture</p>
              </div>

              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={editForm.full_name || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Contact support to change your name
                </p>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={editForm.phone || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+960 XXX-XXXX"
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={editForm.location || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Your current location"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateProfile}
                  disabled={isUpdating}
                  className="btn-primary"
                >
                  {isUpdating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Updating...
                    </>
                  ) : (
                    'Update Profile'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
