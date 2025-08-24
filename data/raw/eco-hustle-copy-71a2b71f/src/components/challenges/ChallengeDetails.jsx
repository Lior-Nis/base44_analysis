import React from "react";
import { motion } from "framer-motion";
import { X, Trophy, Users, Calendar, Target, Clock, Gift, CheckCircle, Star } from "lucide-react";
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

export default function ChallengeDetails({ challenge, onClose, onJoin, user }) {
  const endDate = challenge.end_date ? new Date(challenge.end_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const startDate = challenge.start_date ? new Date(challenge.start_date) : new Date(challenge.created_date);
  const isActive = isAfter(endDate, new Date());
  const daysLeft = differenceInDays(endDate, new Date());
  const colorClass = categoryColors[challenge.category] || "from-gray-500 to-gray-600";
  
  // Check if user has already joined (mock logic)
  const hasJoined = challenge.created_by === user?.email;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${colorClass} p-6 rounded-t-2xl text-white relative`}>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
          
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Trophy className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">{challenge.title}</h2>
              <div className="flex items-center gap-3">
                <Badge className={`${difficultyColors[challenge.difficulty]} text-xs`}>
                  {challenge.difficulty || 'medium'} difficulty
                </Badge>
                <Badge className="bg-white/20 text-white text-xs">
                  {challenge.category || 'general'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Challenge Description</h3>
            <p className="text-gray-600 leading-relaxed">
              {challenge.description}
            </p>
          </div>

          {/* Challenge Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <Target className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <div className="font-bold text-gray-900">{challenge.target_points}</div>
              <div className="text-xs text-gray-600">Target Points</div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <Gift className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
              <div className="font-bold text-gray-900">+{challenge.reward_points}</div>
              <div className="text-xs text-gray-600">Bonus Reward</div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="font-bold text-gray-900">{challenge.participants || 0}</div>
              <div className="text-xs text-gray-600">Participants</div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="font-bold text-gray-900">
                {isActive ? (
                  daysLeft > 0 ? `${daysLeft}d` : 'Today'
                ) : (
                  'Ended'
                )}
              </div>
              <div className="text-xs text-gray-600">Time Left</div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Challenge Started</div>
                  <div className="text-xs text-gray-600">
                    {format(startDate, 'MMM d, yyyy \'at\' h:mm a')}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Challenge Ends</div>
                  <div className="text-xs text-gray-600">
                    {format(endDate, 'MMM d, yyyy \'at\' h:mm a')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How to Complete */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">How to Complete</h3>
            <div className="bg-emerald-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Star className="w-5 h-5 text-emerald-600 mt-0.5" />
                <div>
                  <p className="text-emerald-800 font-medium mb-1">
                    Earn {challenge.target_points} eco points through any sustainable actions
                  </p>
                  <p className="text-emerald-700 text-sm">
                    Log eco actions like recycling, using public transport, energy saving, or participating in cleanup sessions to reach your target!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
            
            {hasJoined ? (
              <Button
                disabled
                className="flex-1 bg-green-600 hover:bg-green-600"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Already Joined
              </Button>
            ) : (
              <Button
                onClick={() => {
                  onJoin();
                  onClose();
                }}
                disabled={!isActive}
                className={`flex-1 bg-gradient-to-r ${colorClass} hover:shadow-lg transition-all duration-300 ${!isActive ? 'opacity-50' : ''}`}
              >
                <Trophy className="w-4 h-4 mr-2" />
                {isActive ? 'Join Challenge' : 'Challenge Ended'}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}