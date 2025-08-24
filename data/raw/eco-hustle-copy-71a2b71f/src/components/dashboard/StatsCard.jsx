
import React from "react";
import { motion } from "framer-motion";

export default function StatsCard({ title, value, icon: Icon, color, trend }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="relative group cursor-pointer"
    >
      <div className="bg-black/40 backdrop-blur-2xl rounded-3xl p-6 md:p-8 border border-emerald-400/30 shadow-2xl hover:shadow-emerald-500/25 transition-all duration-500 relative overflow-hidden">
        {/* Background gradients and blurs for sharp UI */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl"></div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-400/10 to-transparent rounded-full blur-3xl group-hover:opacity-70 transition-opacity"></div>
        
        <div className="flex items-start justify-between mb-4 relative z-10">
          <div className={`p-4 rounded-2xl bg-gradient-to-br ${color} shadow-2xl relative group-hover:scale-110 transition-transform duration-300`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${color} blur-xl opacity-60 animate-pulse rounded-2xl`}></div>
            <Icon className="w-8 h-8 text-white drop-shadow-lg relative z-10" />
          </div>
        </div>
        
        <div className="space-y-2 relative z-10">
          <p className="text-lg font-bold text-emerald-300/90 tracking-wide">{title}</p>
          <p className="text-3xl md:text-4xl font-black text-white drop-shadow-xl">{value}</p>
          {trend && (
            <p className="text-sm text-emerald-400 font-bold tracking-wide animate-pulse">{trend}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
