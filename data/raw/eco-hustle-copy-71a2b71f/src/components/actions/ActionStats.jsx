import React from "react";
import { motion } from "framer-motion";
import { Zap, Leaf, TrendingUp, Target } from "lucide-react";

export default function ActionStats({ actions, user }) {
  const todayActions = actions.filter(action => {
    const today = new Date();
    const actionDate = new Date(action.created_date);
    return actionDate.toDateString() === today.toDateString();
  });

  const thisWeekActions = actions.filter(action => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(action.created_date) >= weekAgo;
  });

  const totalPoints = actions.reduce((sum, action) => sum + action.points_earned, 0);
  const totalCO2 = actions.reduce((sum, action) => sum + (action.co2_saved || 0), 0);

  const stats = [
    {
      title: "Today's Actions",
      value: todayActions.length,
      icon: Zap,
      color: "from-emerald-500 to-green-600",
      description: `${todayActions.reduce((sum, a) => sum + a.points_earned, 0)} points earned`
    },
    {
      title: "This Week",
      value: thisWeekActions.length,
      icon: TrendingUp,
      color: "from-blue-500 to-cyan-600",
      description: "actions completed"
    },
    {
      title: "Total Points",
      value: totalPoints,
      icon: Target,
      color: "from-yellow-500 to-orange-600",
      description: "lifetime earnings"
    },
    {
      title: "CO₂ Saved",
      value: `${totalCO2.toFixed(1)}kg`,
      icon: Leaf,
      color: "from-green-500 to-emerald-600",
      description: "environmental impact"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100 shadow-sm hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} bg-opacity-10`}>
              <stat.icon className={`w-6 h-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}