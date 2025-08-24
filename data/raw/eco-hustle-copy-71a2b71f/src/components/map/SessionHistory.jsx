import React from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { 
  Calendar, 
  Clock, 
  SquareIcon, 
  Award,
  Trash2,
  TreePine,
  Recycle,
  Sprout,
  MapPin
} from "lucide-react";

const activityIcons = {
  litter_pickup: Trash2,
  tree_planting: TreePine,
  recycling_drive: Recycle,
  community_garden: Sprout,
  nature_walk: MapPin
};

const activityColors = {
  litter_pickup: "from-emerald-500 to-green-600",
  tree_planting: "from-green-600 to-emerald-700",
  recycling_drive: "from-blue-500 to-cyan-600",
  community_garden: "from-yellow-500 to-orange-600",
  nature_walk: "from-purple-500 to-indigo-600"
};

export default function SessionHistory({ sessions }) {
  const totalStats = sessions.reduce((acc, session) => ({
    totalArea: acc.totalArea + (session.area_covered_sqft || 0),
    totalSessions: acc.totalSessions + 1,
    totalPoints: acc.totalPoints + (session.points_earned || 0),
    totalDuration: acc.totalDuration + (session.duration_minutes || 0)
  }), { totalArea: 0, totalSessions: 0, totalPoints: 0, totalDuration: 0 });

  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="bg-white/95 backdrop-blur-lg rounded-2xl p-4 border border-emerald-200 shadow-xl"
    >
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-blue-500" />
        <h3 className="font-bold text-gray-900">Your Sessions</h3>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-blue-50 rounded-xl">
        <div className="text-center">
          <p className="text-lg font-bold text-blue-900">{totalStats.totalSessions}</p>
          <p className="text-xs text-blue-700">Sessions</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-blue-900">{totalStats.totalArea.toLocaleString()}</p>
          <p className="text-xs text-blue-700">Total sq ft</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-blue-900">{totalStats.totalPoints}</p>
          <p className="text-xs text-blue-700">Points</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-blue-900">{Math.round(totalStats.totalDuration / 60)}h</p>
          <p className="text-xs text-blue-700">Total time</p>
        </div>
      </div>

      {/* Session List */}
      <div className="space-y-2 max-h-60 overflow-auto">
        {sessions.slice(0, 10).map((session, index) => {
          const Icon = activityIcons[session.activity_type] || MapPin;
          const colorClass = activityColors[session.activity_type] || "from-emerald-500 to-green-600";
          
          return (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className={`p-2 rounded-lg bg-gradient-to-br ${colorClass} text-white`}>
                <Icon className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 capitalize text-sm">
                  {session.activity_type.replace(/_/g, ' ')}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <SquareIcon className="w-3 h-3" />
                    <span>{session.area_covered_sqft?.toLocaleString()} sq ft</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{session.duration_minutes}m</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400">
                  {format(new Date(session.created_date), 'MMM d, h:mm a')}
                </p>
              </div>
              
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Award className="w-3 h-3 text-blue-600" />
                  <span className="text-sm font-bold text-blue-600">+{session.points_earned}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {sessions.length === 0 && (
        <div className="text-center py-6">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No sessions yet</p>
          <p className="text-gray-400 text-xs">Start your first eco activity!</p>
        </div>
      )}
    </motion.div>
  );
}