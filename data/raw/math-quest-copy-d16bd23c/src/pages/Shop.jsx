
import React, { useState, useEffect } from 'react';
import { RewardItem } from '@/api/entities';
import { UserPurchase } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, ShoppingCart, CheckCircle } from 'lucide-react';

export default function Shop() {
  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);
  const [purchasedItemIds, setPurchasedItemIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadShopData();
  }, []);

  const loadShopData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      const [rewardItems, userPurchases] = await Promise.all([
        RewardItem.list(),
        UserPurchase.filter({ user_email: currentUser.email })
      ]);

      setItems(rewardItems);
      setPurchasedItemIds(new Set(userPurchases.map(p => p.item_id)));
    } catch (error) {
      console.error("Error loading shop data:", error);
      setMessage("Could not load shop data. Please try again.");
    }
    setIsLoading(false);
  };

  const handlePurchase = async (item) => {
    if (!user || user.points < item.cost || purchasedItemIds.has(item.id)) {
      setMessage("Not enough points or item already owned.");
      return;
    }
    
    setIsPurchasing(item.id);
    try {
      const newPoints = user.points - item.cost;
      
      await User.updateMyUserData({ points: newPoints });
      await UserPurchase.create({
        user_email: user.email,
        item_id: item.id
      });

      setMessage(`You bought the ${item.name}!`);
      
      // Refresh data
      loadShopData();

    } catch (error) {
      console.error("Error purchasing item:", error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setIsPurchasing(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blue-600 p-4 md:p-8 flex items-center justify-center">
        <h2 className="text-2xl text-white">Loading the Shop...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-600 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="game-title text-4xl md:text-6xl text-white mb-4 drop-shadow-lg flex items-center justify-center gap-4">
            <ShoppingCart className="w-12 h-12" /> Rewards Shop
          </h1>
          <p className="text-xl text-white/90 drop-shadow">
            Spend your points on awesome rewards!
          </p>
        </div>
        
        {/* Points Display */}
        <div className="text-center mb-8">
          <Card className="max-w-sm mx-auto bg-white/95 backdrop-blur-sm">
            <CardContent className="p-4">
              <p className="text-lg text-gray-600">Your Points Balance</p>
              <div className="flex items-center justify-center gap-2">
                <Star className="w-8 h-8 text-yellow-400" />
                <p className="text-4xl font-bold text-gray-800">{user?.points || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message Display */}
        {message && (
          <div className="text-center mb-6">
            <div className="bg-white/90 text-gray-800 px-4 py-2 rounded-lg inline-block">
              {message}
            </div>
          </div>
        )}

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map(item => (
            <Card key={item.id} className="bg-white/95 backdrop-blur-sm hover:shadow-lg transition-shadow flex flex-col">
              <CardHeader className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <img src={item.image_url} alt={item.name} className="w-20 h-20" />
                </div>
                <CardTitle>{item.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-gray-600 text-center">{item.description}</p>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <div className="flex items-center justify-center gap-2 text-xl font-bold text-blue-600 mb-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span>{item.cost} Points</span>
                </div>
                <Button
                  onClick={() => handlePurchase(item)}
                  disabled={isPurchasing === item.id || (user && user.points < item.cost) || purchasedItemIds.has(item.id)}
                  className="w-full"
                >
                  {purchasedItemIds.has(item.id) ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Owned
                    </>
                  ) : isPurchasing === item.id ? 'Purchasing...' : 'Buy Now'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
