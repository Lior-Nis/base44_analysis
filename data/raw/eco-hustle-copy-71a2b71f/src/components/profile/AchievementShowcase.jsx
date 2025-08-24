import React from "react";
import { motion } from "framer-motion";
import { Award, Star, Trophy, Crown, Shield, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const achievementIcons = {
  first_action: Award,
  eco_warrior: Shield,
  tree_hugger: Star,
  recycling_champion: Trophy,
  ambassador: Crown,
  streak_master: Target
};

const achievementColors = {
  first_action: "from-blue-500 to-cyan-600",
  eco_warrior: "from-green-500 to-emerald-600",
  tree_hugger: "from-yellow-500 to-orange-600",
  recycling_champion: "from-purple-500 to-indigo-600",
  ambassador: "from-pink-500 to-rose-600",
  streak_master: "from-red-500 to-orange-600"
};

export default function AchievementShowcase({ user }) {
  // Mock achievements - in a real app, these would come from the user's badges
  const allAchievements = [
    {
      id: "first_action",
      title: "First Steps",
      description: "Completed your first eco action",
      earned: true,
      earnedDate: "2024-01-15"
    },
    {
      id: "eco_warrior",
      title: "Eco Warrior",
      description: "Completed 10 eco actions",
      earned: true,
      earnedDate: "2024-01-20"
    },
    {
      id: "tree_hugger",
      title: "Tree Hugger",
      description: "Planted your first tree",
      earned: false,
      requirement: "Plant 1 tree"
    },
    {
      id: "recycling_champion",
      title: "Recycling Champion",
      description: "Recycled 25 times",
      earned: false,
      requirement: "Complete 25 recycling actions"
    },
    {
      id: "ambassador",
      title: "Ambassador",
      description: "Referred 5 new hustlers",
      earned: false,
      requirement: "Refer 5 friends"
    },
    {
      id: "streak_master",
      title: "Streak Master",
      description: "30-day action streak",
      earned: false,
      requirement: "30 consecutive days"
    }
  ];

  const earnedAchievements = allAchievements.filter(a => a.earned);
  const upcomingAchievements = allAchievements.filter(a => !a.earned);

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-emerald-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-gray-900">Achievements</span>
            <p className="text-sm text-gray-600 font-normal">
              {earnedAchievements.length} of {allAchievements.length} unlocked
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Earned Achievements */}
        {earnedAchievements.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Unlocked Badges</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {earnedAchievements.map((achievement, index) => {
                const Icon = achievementIcons[achievement.id] || Award;
                const colorClass = achievementColors[achievement.id] || "from-gray-500 to-gray-600";
                
                return (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-xl bg-gradient-to-br ${colorClass} text-white text-center relative overflow-hidden`}
                  >
                    <div className="relative z-10">
                      <Icon className="w-8 h-8 mx-auto mb-2" />
                      <h5 className="font-bold text-sm mb-1">{achievement.title}</h5>
                      <p className="text-xs opacity-90">{achievement.description}</p>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-white/20 text-white text-xs">
                        ✓
                      </Badge>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Progress Section */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Next Achievements</h4>
          <div className="space-y-3">
            {upcomingAchievements.slice(0, 3).map((achievement, index) => {
              const Icon = achievementIcons[achievement.id] || Award;
              const colorClass = achievementColors[achievement.id] || "from-gray-500 to-gray-600";
              
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                >
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClass} opacity-60`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900">{achievement.title}</h5>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    <p className="text-xs text-emerald-600 font-medium mt-1">
                      {achievement.requirement}
                    </p>
                  </div>
                  <div className="text-gray-400">
                    <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Achievement Progress */}
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-emerald-900">Achievement Progress</span>
            <span className="text-emerald-700 font-bold">
              {Math.round((earnedAchievements.length / allAchievements.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-white rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(earnedAchievements.length / allAchievements.length) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}