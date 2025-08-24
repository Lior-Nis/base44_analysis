
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Plus, Recycle, Bike, Zap, Droplets } from "lucide-react";

const quickActions = [
  { icon: Recycle, label: "Recycle", color: "from-blue-400 via-cyan-500 to-teal-400" },
  { icon: Bike, label: "Bike Ride", color: "from-green-400 via-emerald-500 to-teal-400" },
  { icon: Zap, label: "Save Energy", color: "from-yellow-400 via-orange-500 to-red-400" },
  { icon: Droplets, label: "Water Save", color: "from-cyan-400 via-blue-500 to-indigo-400" },
];

export default function QuickActions() {
  return (
    <div className="bg-black/40 backdrop-blur-2xl rounded-3xl p-8 border border-emerald-400/30 shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/10 to-transparent rounded-full blur-3xl"></div>
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="text-2xl font-black text-white drop-shadow-lg tracking-wide">Quick Actions ⚡</h3>
        <Link
          to={createPageUrl("Actions")}
          className="text-emerald-400 hover:text-emerald-300 font-bold text-lg transition-colors duration-300 hover:scale-105 transform"
        >
          View All →
        </Link>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ scale: 1.1, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="relative group"
          >
            <Link
              to={createPageUrl("Actions")}
              className={`flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-br ${action.color} text-white hover:shadow-2xl transition-all duration-500 relative overflow-hidden group`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} blur-2xl opacity-60 animate-pulse rounded-2xl group-hover:opacity-80`}></div>
              <action.icon className="w-8 h-8 relative z-10 drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
              <span className="text-lg font-black relative z-10 drop-shadow-lg tracking-wide">{action.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
