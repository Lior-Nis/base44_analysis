import React from "react";
import { motion } from "framer-motion";
import { Leaf, Award, Zap, Globe } from "lucide-react";

export default function ImpactMeter({ user }) {
  const impactStats = [
    {
      icon: Leaf,
      label: "CO₂ Saved",
      value: `${(user?.co2_saved || 0).toFixed(1)}kg`,
      color: "text-green-600",
      bg: "bg-green-100"
    },
    {
      icon: Zap,
      label: "Actions Taken",
      value: "12", // This would come from counting user's actions
      color: "text-yellow-600",
      bg: "bg-yellow-100"
    },
    {
      icon: Award,
      label: "Badges Earned",
      value: user?.badges?.length || 0,
      color: "text-purple-600",
      bg: "bg-purple-100"
    },
    {
      icon: Globe,
      label: "Global Impact",
      value: "Top 15%",
      color: "text-blue-600",
      bg: "bg-blue-100"
    }
  ];

  const levelProgress = ((user?.points || 0) % 100);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Your Impact</h3>
      
      {/* Level Progress */}
      <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Level {user?.level || 1}</span>
          <span className="text-sm text-emerald-600 font-medium">{levelProgress}%</span>
        </div>
        <div className="h-3 bg-white rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${levelProgress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {100 - levelProgress} points to next level
        </p>
      </div>

      {/* Impact Stats */}
      <div className="space-y-4">
        {impactStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <span className="text-sm font-medium text-gray-700">{stat.label}</span>
            </div>
            <span className={`font-bold ${stat.color}`}>{stat.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Achievement Section */}
      <div className="mt-6 pt-6 border-t border-emerald-100">
        <h4 className="font-semibold text-gray-900 mb-3">Recent Achievement</h4>
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
          <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg">
            <Award className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Eco Warrior</p>
            <p className="text-xs text-gray-600">First 10 eco actions completed!</p>
          </div>
        </div>
      </div>
    </div>
  );
}