import React, { useState, useEffect } from 'react';
import { UserFavorite, Restaurant, Dish, User as UserEntity } from '@/api/entities';
import { Heart, Utensils, ChefHat } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RestaurantCard from '../components/restaurant/RestaurantCard';
import DishCard from '../components/dishes/DishCard';
import AdBanner from '../components/ads/AdBanner';

export default function FavoritesPage() {
  const [favoriteRestaurants, setFavoriteRestaurants] = useState([]);
  const [favoriteDishes, setFavoriteDishes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setIsLoading(true);
    try {
      const currentUser = await UserEntity.me();
      setUser(currentUser);
      
      const favorites = await UserFavorite.filter({ user_id: currentUser.id });
      
      const restaurantIds = favorites.filter(f => f.type === 'restaurant').map(f => f.restaurant_id);
      const dishIds = favorites.filter(f => f.type === 'dish').map(f => f.dish_id);

      const [allRestaurants, allDishes] = await Promise.all([
        Restaurant.list(),
        Dish.list()
      ]);

      const favRestaurants = allRestaurants.filter(r => restaurantIds.includes(r.id));
      const favDishes = allDishes.filter(d => dishIds.includes(d.id));

      setFavoriteRestaurants(favRestaurants);
      setFavoriteDishes(favDishes);

    } catch (error) {
      // User not logged in
      await UserEntity.login();
    }
    setIsLoading(false);
  };
  
  if (isLoading) {
    return <div className="text-center py-20">Loading your favorites...</div>;
  }

  return (
    <div className="py-12 bg-[var(--bg-cream)] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-poppins text-4xl font-bold text-[var(--headings-labels)] flex items-center justify-center gap-3">
            <Heart className="w-10 h-10 text-red-500" />
            Your Favorites
          </h1>
          <p className="text-lg text-[var(--text-muted)] mt-2">All your saved restaurants and dishes in one place.</p>
        </div>
        
        <AdBanner placement="favorites_top" className="h-32 mb-8" />
        
        <Tabs defaultValue="restaurants" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="restaurants">
              <Utensils className="w-4 h-4 mr-2" />
              Restaurants ({favoriteRestaurants.length})
            </TabsTrigger>
            <TabsTrigger value="dishes">
              <ChefHat className="w-4 h-4 mr-2" />
              Dishes ({favoriteDishes.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="restaurants">
            {favoriteRestaurants.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {favoriteRestaurants.map(r => <RestaurantCard key={r.id} restaurant={r} />)}
              </div>
            ) : (
              <div className="text-center py-16 text-[var(--text-muted)]">
                You haven't favorited any restaurants yet.
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="dishes">
            {favoriteDishes.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {favoriteDishes.map(d => <DishCard key={d.id} dish={d} />)}
              </div>
            ) : (
              <div className="text-center py-16 text-[var(--text-muted)]">
                You haven't favorited any dishes yet.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}