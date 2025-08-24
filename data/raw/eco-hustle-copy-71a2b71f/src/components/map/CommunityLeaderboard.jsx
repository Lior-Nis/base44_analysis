import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy, Crown, Medal, SquareIcon } from "lucide-react";

export default function CommunityLeaderboard({ sessions }) {
  const leaderboardData = useMemo(() => {
    const userStats = {};
    
    sessions.forEach(session => {
      if (!userStats[session.created_by]) {
        userStats[session.created_by] = {
          email: session.created_by,
          name: session.created_by.split('@')[0], // Simple name extraction
          totalArea: 0,
          totalSessions: 0,
          totalPoints: 0
        };
      }
      
      userStats[session.created_by].totalArea += session.area_covered_sqft || 0;
      userStats[session.created_by].totalSessions += 1;
      userStats[session.created_by].totalPoints += session.points_earned || 0;
    });
    
    return Object.values(userStats)
      .sort((a, b) => b.totalArea - a.totalArea)
      .slice(0, 10);
  }, [sessions]);

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return <Crown className="w-4 h-4 text-yellow-500" />;
      case 1: return <Medal className="w-4 h-4 text-gray-400" />;
      case 2: return <Medal className="w-4 h-4 text-amber-600" />;
      default: return <Trophy className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRankColor = (index) => {
    switch (index) {
      case 0: return "from-yellow-400 to-yellow-600";
      case 1: return "from-gray-300 to-gray-500";
      case 2: return "from-amber-400 to-amber-600";
      default: return "from-gray-200 to-gray-400";
    }
  };

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 border border-emerald-200 shadow-xl max-h-96 overflow-auto"
    >
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h3 className="font-bold text-gray-900">Area Coverage Leaders</h3>
      </div>

      <div className="space-y-2">
        {leaderboardData.map((user, index) => (
          <motion.div
            key={user.email}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center gap-3 p-3 rounded-xl ${
              index < 3 ? 'bg-gradient-to-r ' + getRankColor(index) + ' text-white' : 'bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="flex items-center justify-center w-6 h-6">
                {index < 3 ? (
                  getRankIcon(index)
                ) : (
                  <span className="text-sm font-bold text-gray-500">#{index + 1}</span>
                )}
              </div>
              
              <div className="min-w-0 flex-1">
                <p className={`font-medium truncate ${index < 3 ? 'text-white' : 'text-gray-900'}`}>
                  {user.name}
                </p>
                <div className="flex items-center gap-1 text-xs">
                  <SquareIcon className={`w-3 h-3 ${index < 3 ? 'text-white/80' : 'text-gray-500'}`} />
                  <span className={index < 3 ? 'text-white/80' : 'text-gray-500'}>
                    {user.totalArea.toLocaleString()} sq ft
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <p className={`text-sm font-bold ${index < 3 ? 'text-white' : 'text-emerald-600'}`}>
                {user.totalPoints}
              </p>
              <p className={`text-xs ${index < 3 ? 'text-white/80' : 'text-gray-500'}`}>
                {user.totalSessions} sessions
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {leaderboardData.length === 0 && (
        <div className="text-center py-6">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No activity data yet</p>
          <p className="text-gray-400 text-xs">Be the first to start tracking!</p>
        </div>
      )}
    </motion.div>
  );
}