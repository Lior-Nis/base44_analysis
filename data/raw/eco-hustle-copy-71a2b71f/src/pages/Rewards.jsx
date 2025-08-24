import React, { useState, useEffect } from "react";
import { Reward, User } from "@/api/entities";
import { motion } from "framer-motion";
import { Gift, Sparkles, Filter, Coins } from "lucide-react";

import RewardCard from "../components/rewards/RewardCard";
import PartnerCTA from "../components/rewards/PartnerCTA";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RewardsPage() {
  const [rewards, setRewards] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [redeemedMessage, setRedeemedMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userData, allRewards] = await Promise.all([
        User.me(),
        Reward.list('-points_cost')
      ]);
      setUser(userData);
      setRewards(allRewards);
    } catch (error) {
      console.error("Error loading rewards data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeem = (reward) => {
    // Symbolic redemption as requested
    setRedeemedMessage(`Congratulations! You've symbolically redeemed "${reward.title}".`);
    setTimeout(() => setRedeemedMessage(""), 5000);
  };

  const filteredRewards = rewards.filter(reward => {
    if (filter === "all") return true;
    return reward.category === filter;
  });
  
  const userPoints = user?.points || 0;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
         <div className="h-8 bg-gray-200 rounded-lg w-1/3 mb-4 animate-pulse"></div>
         <div className="h-6 bg-gray-200 rounded-lg w-1/2 mb-8 animate-pulse"></div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white/60 rounded-2xl p-6 h-64 animate-pulse"></div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-rose-600 bg-clip-text text-transparent">
            Eco Rewards
          </h1>
          <p className="text-gray-600 mt-1">Redeem your points for exclusive rewards from our partners.</p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-full px-4 py-2 flex items-center gap-2">
            <Coins className="w-6 h-6 text-yellow-500" />
            <span className="text-lg font-bold text-gray-800">{userPoints.toLocaleString()}</span>
            <span className="text-sm text-gray-600">Points</span>
        </div>
      </div>

      {redeemedMessage && (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-100 text-green-800 border-l-4 border-green-500 rounded-r-lg"
        >
            {redeemedMessage}
        </motion.div>
      )}

      {/* Filters & Partner CTA */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rewards</SelectItem>
                <SelectItem value="discount">Discounts</SelectItem>
                <SelectItem value="product">Products</SelectItem>
                <SelectItem value="experience">Experiences</SelectItem>
                <SelectItem value="donation">Donations</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="md:col-span-2">
             <PartnerCTA />
        </div>
      </div>


      {/* Rewards Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {filteredRewards.length === 0 ? (
          <div className="text-center py-12">
            <Gift className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No rewards in this category</h3>
            <p className="text-gray-500">Check back soon for new rewards!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRewards.map((reward) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <RewardCard
                  reward={reward}
                  userPoints={userPoints}
                  onRedeem={() => handleRedeem(reward)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}