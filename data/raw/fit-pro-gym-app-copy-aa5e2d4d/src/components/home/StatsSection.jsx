import React, { useState, useRef } from "react";
import { Users, Award, Zap, Star } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  {
    icon: Users,
    value: "5,000+",
    label: "Happy Members",
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    borderColor: "border-blue-500/30"
  },
  {
    icon: Award,
    value: "10+", 
    label: "Years Experience",
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    borderColor: "border-green-500/30"
  },
  {
    icon: Zap,
    value: "24/7",
    label: "Gym Access",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/20",
    borderColor: "border-yellow-500/30"
  },
  {
    icon: Star,
    value: "4.9",
    label: "Average Rating",
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
    borderColor: "border-purple-500/30"
  }
];

const StatCard = ({ stat, index }) => {
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      key={index}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      className={`relative bg-white/5 backdrop-blur-lg border ${stat.borderColor} rounded-2xl p-8 text-center shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 group overflow-hidden`}
    >
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-300"
        style={{
          opacity: isHovering ? 1 : 0,
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.15), transparent 80%)`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl"></div>
      
      <div className="relative z-10">
        <div className={`relative w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 ${stat.bgColor} backdrop-blur-sm border ${stat.borderColor} group-hover:scale-110 transition-transform duration-300`}>
          <stat.icon className={`w-8 h-8 ${stat.color}`} />
        </div>
        
        <motion.p 
          className="text-4xl font-bold text-white mb-2"
          initial={{ scale: 0.8 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
          viewport={{ once: true }}
        >
          {stat.value}
        </motion.p>
        
        <p className="text-gray-300 font-medium">{stat.label}</p>
      </div>
    </motion.div>
  );
}

export default function StatsSection() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {stats.map((stat, index) => (
        <StatCard stat={stat} index={index} key={index} />
      ))}
    </div>
  );
}