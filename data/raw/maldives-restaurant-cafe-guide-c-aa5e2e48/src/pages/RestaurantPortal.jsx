import React, { useState, useEffect } from 'react';
import { Restaurant, Location, Dish, User as UserEntity } from '@/api/entities';
import { Plus, MapPin, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import RestaurantRegistrationForm from '../components/restaurant/RestaurantRegistrationForm';
import DishManagement from '../components/restaurant/DishManagement';
import RestaurantSettings from '../components/restaurant/RestaurantSettings';
import RestaurantAnalytics from '../components/restaurant/RestaurantAnalytics';
import AuthPrompt from '../components/auth/AuthPrompt';

export default function RestaurantPortal() {
  const [user, setUser] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [promptLogin, setPromptLogin] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setPromptLogin(false);
    try {
      const currentUser = await UserEntity.me();
      setUser(currentUser);

      const userRestaurants = await Restaurant.filter({ owner_id: currentUser.id });
      setRestaurants(userRestaurants);

      if (userRestaurants.length > 0) {
        const initialSelected = selectedRestaurant ? userRestaurants.find(r => r.id === selectedRestaurant.id) : userRestaurants[0];
        setSelectedRestaurant(initialSelected || userRestaurants[0]);
        const restaurantDishes = await Dish.filter({ restaurant_id: (initialSelected || userRestaurants[0]).id });
        setDishes(restaurantDishes);
      } else {
        setSelectedRestaurant(null);
        setDishes([]);
      }
    } catch (error) {
      setPromptLogin(true);
    }
    setIsLoading(false);
  };

  const loadSelectedRestaurantDetails = async () => {
    if (selectedRestaurant?.id) {
      try {
        const updatedRestaurant = await Restaurant.filter({ id: selectedRestaurant.id }).then(res => res[0]);
        setSelectedRestaurant(updatedRestaurant);
        const currentUser = await UserEntity.me();
        const userRestaurants = await Restaurant.filter({ owner_id: currentUser.id });
        setRestaurants(userRestaurants);
      } catch (error) {
        console.error('Failed to load selected restaurant details:', error);
      }
    }
  };

  const handleRestaurantSelect = async (restaurant) => {
    setSelectedRestaurant(restaurant);
    const restaurantDishes = await Dish.filter({ restaurant_id: restaurant.id });
    setDishes(restaurantDishes);
    setActiveTab('overview');
  };

  const handleRestaurantCreated = async () => {
    setShowRegistrationForm(false);
    await loadData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your restaurant dashboard...</p>
        </div>
      </div>
    );
  }

  if (promptLogin) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AuthPrompt
          title="Access Restaurant Portal"
          message="Please sign in to manage your restaurants or register a new one."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Restaurant Portal</h1>
            <p className="text-gray-600 mt-1">Manage your restaurants and menus</p>
          </div>
          <Button
            onClick={() => setShowRegistrationForm(true)}
            className="bg-[var(--primary-cta)] text-white hover:bg-[var(--primary-cta)]/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Restaurant
          </Button>
        </div>

        {restaurants.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-[var(--primary-cta)] rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to Restaurant Portal
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Start by registering your restaurant to showcase your delicious menu to customers across the Maldives.
              </p>
              <Button
                size="lg"
                onClick={() => setShowRegistrationForm(true)}
                className="bg-[var(--primary-cta)] text-white hover:bg-[var(--primary-cta)]/90"
              >
                Register Your First Restaurant
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Your Restaurants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {restaurants.map((restaurant) => (
                      <div
                        key={restaurant.id}
                        onClick={() => handleRestaurantSelect(restaurant)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedRestaurant?.id === restaurant.id
                            ? 'border-[var(--primary-cta)] bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <h3 className="font-medium text-gray-900 mb-1">
                          {restaurant.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {restaurant.cuisine_type}
                        </p>
                        <Badge
                          variant={
                            restaurant.status === 'approved' ? 'default' :
                            restaurant.status === 'pending' ? 'secondary' : 'destructive'
                          }
                          className="text-xs"
                        >
                          {restaurant.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {restaurant.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                          {restaurant.status.charAt(0).toUpperCase() + restaurant.status.slice(1)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3">
              {selectedRestaurant ? (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4 mb-8">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="menu">Menu</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview">
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            {selectedRestaurant.name}
                            <Badge
                              variant={
                                selectedRestaurant.status === 'approved' ? 'default' :
                                selectedRestaurant.status === 'pending' ? 'secondary' : 'destructive'
                              }
                            >
                              {selectedRestaurant.status}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-medium mb-3">Restaurant Information</h4>
                              <div className="space-y-2 text-sm">
                                <p><span className="font-medium">Cuisine:</span> {selectedRestaurant.cuisine_type}</p>
                                <p><span className="font-medium">Phone:</span> {selectedRestaurant.contact_phone}</p>
                                <p><span className="font-medium">Email:</span> {selectedRestaurant.contact_email}</p>
                                <p><span className="font-medium">Hours:</span> {selectedRestaurant.opening_hours}</p>
                                <p><span className="font-medium">Description:</span> {selectedRestaurant.description}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-3">Quick Stats</h4>
                              <div className="space-y-2 text-sm">
                                <p><span className="font-medium">Menu Items:</span> {dishes.length}</p>
                                <p><span className="font-medium">Average Rating:</span> {selectedRestaurant.average_rating ? selectedRestaurant.average_rating.toFixed(1) : 'No ratings yet'}</p>
                                <p><span className="font-medium">Featured:</span> {selectedRestaurant.featured ? 'Yes' : 'No'}</p>
                                {selectedRestaurant.logo_url && (
                                  <div>
                                    <span className="font-medium">Logo:</span>
                                    <img src={selectedRestaurant.logo_url} alt="Restaurant" className="w-24 h-24 object-cover rounded-md mt-2" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {selectedRestaurant.status === 'approved' && (
                            <div className="mt-6">
                              <Link to={createPageUrl(`Restaurant?id=${selectedRestaurant.id}`)}>
                                <Button variant="outline">
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Public Page
                                </Button>
                              </Link>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {selectedRestaurant.status === 'pending' && (
                        <Card className="border-yellow-200 bg-yellow-50">
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <h3 className="font-medium text-yellow-800 mb-1">Under Review</h3>
                                <p className="text-yellow-700 text-sm">
                                  Your restaurant is currently being reviewed by our team. This usually takes 1-2 business days.
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {selectedRestaurant.status === 'rejected' && (
                        <Card className="border-red-200 bg-red-50">
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <XCircle className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <h3 className="font-medium text-red-800 mb-1">Application Rejected</h3>
                                <p className="text-red-700 text-sm">
                                  Your restaurant application needs some updates. Please contact our support team for details.
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="menu">
                    <DishManagement
                      restaurant={selectedRestaurant}
                      dishes={dishes}
                      onDishesUpdate={setDishes}
                    />
                  </TabsContent>

                  <TabsContent value="settings">
                    <RestaurantSettings restaurant={selectedRestaurant} onUpdate={loadSelectedRestaurantDetails} />
                  </TabsContent>

                  <TabsContent value="analytics">
                    <RestaurantAnalytics restaurant={selectedRestaurant} />
                  </TabsContent>
                </Tabs>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-gray-600 text-center">
                      Select a restaurant from the sidebar to manage it.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        <Dialog open={showRegistrationForm} onOpenChange={setShowRegistrationForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Register New Restaurant</DialogTitle>
            </DialogHeader>
            <RestaurantRegistrationForm
              onSuccess={handleRestaurantCreated}
              onCancel={() => setShowRegistrationForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}