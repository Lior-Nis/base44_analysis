import React, { useState, useEffect } from 'react';
import { StoreItem, User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShoppingCart, DollarSign, Sparkles, Ticket, TrendingUp, Gift, Crown, Zap, Star, Coins } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StorePage() {
  const [items, setItems] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      const storeItems = await StoreItem.filter({ status: 'active' });
      setItems(storeItems);
    } catch (error) {
      console.error("Error fetching store data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (item) => {
    if (!user) {
      alert("Please login to purchase items");
      return;
    }

    if (user.wallet_balance < item.price) {
      alert("Insufficient balance! Please add money to your wallet.");
      return;
    }

    if (!confirm(`Purchase ${item.name} for ₹${item.price}?`)) {
      return;
    }

    setIsPurchasing(true);
    try {
      // Deduct money from wallet
      const newBalance = user.wallet_balance - item.price;
      await User.update(user.id, { wallet_balance: newBalance });

      // Apply item benefits based on type
      switch (item.item_type) {
        case 'bonus_credit':
          await User.update(user.id, { 
            wallet_balance: newBalance + item.value,
            total_deposited: (user.total_deposited || 0) + item.value
          });
          break;
        case 'free_spins':
          await User.update(user.id, { 
            free_spins: (user.free_spins || 0) + item.value 
          });
          break;
        case 'deposit_bonus':
          await User.update(user.id, { 
            deposit_bonus_percentage: (user.deposit_bonus_percentage || 0) + item.value 
          });
          break;
        case 'tournament_ticket':
          await User.update(user.id, { 
            tournament_tickets: (user.tournament_tickets || 0) + item.value 
          });
          break;
      }

      alert(`Successfully purchased ${item.name}! Check your profile for updates.`);
      loadData(); // Refresh user data
    } catch (error) {
      console.error("Error purchasing item:", error);
      alert("Purchase failed. Please try again.");
    } finally {
      setIsPurchasing(false);
    }
  };

  const itemsByCategory = items.reduce((acc, item) => {
    if (!acc[item.item_type]) {
      acc[item.item_type] = [];
    }
    acc[item.item_type].push(item);
    return acc;
  }, {});

  const categoryInfo = {
    bonus_credit: {
      title: "Bonus Credits",
      description: "Instant wallet top-ups with bonus money",
      icon: DollarSign,
      color: "from-green-500 to-emerald-500"
    },
    free_spins: {
      title: "Free Spins",
      description: "Free spins for slot games",
      icon: Sparkles,
      color: "from-pink-500 to-purple-500"
    },
    deposit_bonus: {
      title: "Deposit Bonuses",
      description: "Extra percentage on your next deposit",
      icon: TrendingUp,
      color: "from-blue-500 to-cyan-500"
    },
    tournament_ticket: {
      title: "Tournament Tickets",
      description: "Entry tickets for premium tournaments",
      icon: Ticket,
      color: "from-yellow-500 to-orange-500"
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <Card key={i} className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-6">
                  <div className="w-20 h-20 mx-auto mb-4 bg-slate-700 rounded-full animate-pulse" />
                  <div className="h-4 bg-slate-700 rounded mb-2 animate-pulse" />
                  <div className="h-3 bg-slate-700 rounded mb-4 animate-pulse" />
                  <div className="h-8 bg-slate-700 rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-full px-4 py-2 mb-6"
          >
            <ShoppingCart className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-300">Exclusive Offers</span>
          </motion.div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Game Store
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-6">
            Boost your gameplay with exclusive items, bonuses, and premium features
          </p>
          
          {user && (
            <div className="inline-flex items-center gap-4 bg-slate-800/50 border border-slate-700/50 rounded-full px-6 py-3">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-semibold">Wallet Balance: ₹{user.wallet_balance?.toFixed(2) || 0}</span>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4 text-center">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-pink-400" />
              <div className="text-sm text-gray-400">Free Spins</div>
              <div className="text-xl font-bold text-white">{user?.free_spins || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4 text-center">
              <Ticket className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <div className="text-sm text-gray-400">Tournament Tickets</div>
              <div className="text-xl font-bold text-white">{user?.tournament_tickets || 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <div className="text-sm text-gray-400">Deposit Bonus</div>
              <div className="text-xl font-bold text-white">{user?.deposit_bonus_percentage || 0}%</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4 text-center">
              <Crown className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <div className="text-sm text-gray-400">VIP Level</div>
              <div className="text-xl font-bold text-white">{user?.vip_level || 1}</div>
            </CardContent>
          </Card>
        </div>

        {/* Store Categories */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50">
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="bonus_credit">💰 Credits</TabsTrigger>
            <TabsTrigger value="free_spins">✨ Free Spins</TabsTrigger>
            <TabsTrigger value="deposit_bonus">📈 Bonuses</TabsTrigger>
            <TabsTrigger value="tournament_ticket">🎫 Tickets</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item, index) => (
                <ItemCard key={item.id} item={item} index={index} onPurchase={handlePurchase} isPurchasing={isPurchasing} />
              ))}
            </div>
          </TabsContent>

          {Object.entries(categoryInfo).map(([category, info]) => (
            <TabsContent key={category} value={category}>
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${info.color} flex items-center justify-center`}>
                    <info.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{info.title}</h2>
                    <p className="text-gray-400">{info.description}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {(itemsByCategory[category] || []).map((item, index) => (
                  <ItemCard key={item.id} item={item} index={index} onPurchase={handlePurchase} isPurchasing={isPurchasing} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {items.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
            <h3 className="text-xl font-bold text-white mb-2">Store Coming Soon</h3>
            <p className="text-gray-400">Exciting items and bonuses will be available here soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}

const ItemCard = ({ item, index, onPurchase, isPurchasing }) => {
  const icons = {
    bonus_credit: { icon: DollarSign, color: "text-green-400", bg: "from-green-500 to-emerald-500" },
    free_spins: { icon: Sparkles, color: "text-pink-400", bg: "from-pink-500 to-purple-500" },
    deposit_bonus: { icon: TrendingUp, color: "text-blue-400", bg: "from-blue-500 to-cyan-500" },
    tournament_ticket: { icon: Ticket, color: "text-yellow-400", bg: "from-yellow-500 to-orange-500" },
  };

  const itemIcon = icons[item.item_type] || icons.bonus_credit;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm overflow-hidden group hover:scale-105 transition-all duration-300 hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/20">
        <div className={`h-2 bg-gradient-to-r ${itemIcon.bg}`} />
        <CardContent className="p-6 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-slate-700/50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            {item.icon ? (
              <div className="text-4xl">{item.icon}</div>
            ) : (
              <itemIcon.icon className={`w-8 h-8 ${itemIcon.color}`} />
            )}
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
            {item.name}
          </h3>
          
          <p className="text-gray-400 text-sm mb-4 h-12 leading-relaxed">
            {item.description}
          </p>
          
          <div className="mb-4">
            <div className="text-3xl font-bold text-purple-400 mb-1">₹{item.price}</div>
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              Value: {item.item_type === 'bonus_credit' ? `₹${item.value}` : 
                     item.item_type === 'free_spins' ? `${item.value} spins` :
                     item.item_type === 'deposit_bonus' ? `${item.value}% bonus` :
                     `${item.value} tickets`}
            </Badge>
          </div>
          
          <Button 
            onClick={() => onPurchase(item)} 
            disabled={isPurchasing}
            className={`w-full bg-gradient-to-r ${itemIcon.bg} hover:opacity-90 text-white font-semibold transition-all duration-300 group-hover:shadow-lg`}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {isPurchasing ? 'Processing...' : 'Buy Now'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};