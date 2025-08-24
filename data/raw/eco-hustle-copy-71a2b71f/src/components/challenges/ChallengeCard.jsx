import React from "react";
import { motion } from "framer-motion";
import { Trophy, Users, Calendar, Target, Clock, Gift, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, isAfter, differenceInDays } from "date-fns";

const categoryColors = {
  weekly: "from-blue-500 to-cyan-600",
  monthly: "from-purple-500 to-indigo-600",
  special: "from-pink-500 to-rose-600",
  community: "from-green-500 to-emerald-600"
};

const difficultyColors = {
  easy: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  hard: "bg-red-100 text-red-800"
};

export default function ChallengeCard({ challenge, onJoin, onViewDetails, user }) {
  const endDate = challenge.end_date ? new Date(challenge.end_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const isActive = isAfter(endDate, new Date());
  const daysLeft = differenceInDays(endDate, new Date());
  const colorClass = categoryColors[challenge.category] || "from-gray-500 to-gray-600";

  // Check if user has already joined (mock logic)
  const hasJoined = challenge.created_by === user?.email; // Simplified check

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClass} text-white`}>
          <Trophy className="w-6 h-6" />
        </div>
        <div className="text-right">
          <Badge className={difficultyColors[challenge.difficulty] || difficultyColors.medium}>
            {challenge.difficulty || 'medium'}
          </Badge>
          {!isActive && (
            <Badge variant="outline" className="ml-1 text-gray-500">
              Ended
            </Badge>
          )}
        </div>
      </div>

      {/* Title & Description */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {challenge.title}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-3">
          {challenge.description}
        </p>
      </div>

      {/* Challenge Details */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Target className="w-4 h-4" />
            <span>Target: {challenge.target_points} points</span>
          </div>
          <div className="flex items-center gap-1 text-yellow-600 font-semibold">
            <Gift className="w-4 h-4" />
            <span>+{challenge.reward_points}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-4 h-4" />
            <span>{challenge.participants || 0} joined</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>
              {isActive ? (
                daysLeft > 0 ? `${daysLeft} days left` : 'Ending today'
              ) : (
                'Challenge ended'
              )}
            </span>
          </div>
        </div>

        {challenge.end_date && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>Ends {format(endDate, 'MMM d, yyyy')}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onViewDetails}
          className="flex-1"
        >
          View Details
        </Button>
        
        {hasJoined ? (
          <Button
            disabled
            className="flex-1 bg-green-600 hover:bg-green-600"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Joined
          </Button>
        ) : (
          <Button
            onClick={onJoin}
            disabled={!isActive}
            className={`flex-1 bg-gradient-to-r ${colorClass} hover:shadow-lg transition-all duration-300 ${!isActive ? 'opacity-50' : ''}`}
          >
            <Trophy className="w-4 h-4 mr-2" />
            {isActive ? 'Join Challenge' : 'Ended'}
          </Button>
        )}
      </div>
    </motion.div>
  );
}