import React from "react";
import { motion } from "framer-motion";
import { Zap, Leaf, Trophy, Flame } from "lucide-react";

export default function ProfileStats({ user }) {
  const stats = [
    {
      icon: Zap,
      label: "Total Points",
      value: user?.points || 0,
      color: "text-yellow-600",
      bg: "bg-yellow-100"
    },
    {
      icon: Leaf,
      label: "CO₂ Saved",
      value: `${(user?.co2_saved || 0).toFixed(1)}kg`,
      color: "text-green-600",
      bg: "bg-green-100"
    },
    {
      icon: Trophy,
      label: "Level",
      value: user?.level || 1,
      color: "text-purple-600",
      bg: "bg-purple-100"
    },
    {
      icon: Flame,
      label: "Day Streak",
      value: user?.streak || 0,
      color: "text-red-600",
      bg: "bg-red-100"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100"
    >
      <h3 className="font-bold text-gray-900 mb-4">Your Impact</h3>
      <div className="space-y-4">
        {stats.map((stat, index) => (
          <div key={stat.label} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <span className="text-sm font-medium text-gray-700">{stat.label}</span>
            </div>
            <span className={`font-bold ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}