
import React, { useState, useEffect } from "react";
import { User, EcoAction, Challenge } from "@/api/entities";
import { motion } from "framer-motion";
import { 
  Leaf, 
  Zap, 
  Trophy, 
  TrendingUp, 
  Calendar,
  Target,
  Users,
  Flame
} from "lucide-react";

// StatsCard component is replaced by inline JSX, so it's no longer needed.
// import StatsCard from "../components/dashboard/StatsCard"; 
import RecentActions from "../components/dashboard/RecentActions";
import ActiveChallenges from "../components/dashboard/ActiveChallenges";
import ImpactMeter from "../components/dashboard/ImpactMeter";
import QuickActions from "../components/dashboard/QuickActions";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [recentActions, setRecentActions] = useState([]);
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const userData = await User.me();
      const actions = await EcoAction.filter({ created_by: userData.email }, '-created_date', 5);
      const challenges = await Challenge.list('-created_date', 3);
      
      setUser(userData);
      setRecentActions(actions);
      setActiveChallenges(challenges);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="bg-black/20 backdrop-blur-xl rounded-3xl p-8 animate-pulse border border-emerald-400/20">
            <div className="h-8 bg-gradient-to-r from-emerald-400/30 to-green-400/30 rounded-xl w-1/3 mb-6"></div>
            <div className="h-6 bg-gradient-to-r from-emerald-400/20 to-green-400/20 rounded-lg w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Eco Points",
      value: user?.points || 0,
      icon: Zap,
      color: "from-emerald-400 via-green-500 to-cyan-400",
      trend: "+12 today"
    },
    {
      title: "Current Level",
      value: user?.level || 1,
      icon: Trophy,
      color: "from-yellow-400 via-orange-500 to-red-500",
      trend: `${((user?.points || 0) % 100)}% to next`
    },
    {
      title: "CO₂ Saved",
      value: `${(user?.co2_saved || 0).toFixed(1)}kg`,
      icon: Leaf,
      color: "from-green-400 via-emerald-500 to-teal-400",
      trend: "+2.1kg this week"
    },
    {
      title: "Day Streak",
      value: user?.streak || 0,
      icon: Flame,
      color: "from-red-400 via-pink-500 to-purple-500",
      trend: "Keep it up!"
    }
  ];

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center md:text-left"
      >
        <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-emerald-300 via-green-300 to-cyan-300 bg-clip-text text-transparent mb-4 drop-shadow-2xl">
          Welcome back, {user?.full_name?.split(' ')[0] || 'Eco Warrior'}! 🌱
        </h1>
        <p className="text-emerald-200/90 text-xl font-semibold tracking-wide">
          Ready to make a MASSIVE impact today?
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.15, duration: 0.6 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="relative group"
          >
            <div className="bg-black/40 backdrop-blur-2xl rounded-3xl p-6 md:p-8 border border-emerald-400/30 shadow-2xl hover:shadow-emerald-500/25 transition-all duration-500 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl"></div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-400/10 to-transparent rounded-full blur-2xl"></div>
              
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-2xl relative`}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} blur-xl opacity-60 animate-pulse rounded-2xl`}></div>
                  <stat.icon className="w-8 h-8 text-white drop-shadow-lg relative z-10" />
                </div>
              </div>
              
              <div className="space-y-2 relative z-10">
                <p className="text-lg font-bold text-emerald-300/90 tracking-wide">{stat.title}</p>
                <p className="text-3xl md:text-4xl font-black text-white drop-shadow-xl">{stat.value}</p>
                {stat.trend && (
                  <p className="text-sm text-emerald-400 font-bold tracking-wide">{stat.trend}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <QuickActions />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <RecentActions actions={recentActions} />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0 }}
          >
            <ActiveChallenges challenges={activeChallenges} />
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 }}
          >
            <ImpactMeter user={user} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
