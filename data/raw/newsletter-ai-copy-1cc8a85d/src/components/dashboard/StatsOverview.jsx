
import React from "react";
import { PenTool, Send, Calendar, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function StatsOverview({ newsletters, sentEmails }) {
  const stats = [
    {
      title: "Total Content",
      value: newsletters.length,
      icon: PenTool,
      gradient: "from-blue-400 to-cyan-500",
      bgGradient: "from-blue-400/10 to-cyan-500/10"
    },
    {
      title: "Sent Emails",
      value: sentEmails.length,
      icon: Send,
      gradient: "from-purple-400 to-pink-500",
      bgGradient: "from-purple-400/10 to-pink-500/10"
    },
    {
      title: "This Week",
      value: newsletters.filter(n => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(n.created_date) >= weekAgo;
      }).length,
      icon: Calendar,
      gradient: "from-green-400 to-emerald-500",
      bgGradient: "from-green-400/10 to-emerald-500/10"
    },
    {
      title: "Success Rate",
      value: sentEmails.length > 0 ? `${Math.round((sentEmails.filter(e => e.status === 'sent').length / sentEmails.length) * 100)}%` : "0%",
      icon: TrendingUp,
      gradient: "from-orange-400 to-red-500",
      bgGradient: "from-orange-400/10 to-red-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 + 0.2 }}
          className="glass-card rounded-3xl p-8 border border-gray-200 hover:border-gray-300 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">{stat.title}</h3>
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.bgGradient} border border-gray-200`}>
              <stat.icon className="w-6 h-6 text-gray-700" />
            </div>
          </div>
          <div className={`text-4xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
            {stat.value}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
