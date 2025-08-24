import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Lock, Trophy, Target, Zap, Crown } from "lucide-react";

const rarityColors = {
  common: {
    gradient: "from-gray-400 to-gray-500",
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200"
  },
  rare: {
    gradient: "from-blue-400 to-blue-600",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200"
  },
  epic: {
    gradient: "from-purple-400 to-purple-600",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200"
  },
  legendary: {
    gradient: "from-yellow-400 to-orange-500",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200"
  }
};

const categoryIcons = {
  learning: Target,
  gaming: Trophy,
  streak: Zap,
  milestone: Star,
  skill: Crown
};

export default function AchievementCard({ 
  achievement, 
  isEarned = false, 
  progress = null 
}) {
  const colors = rarityColors[achievement.rarity];
  const CategoryIcon = categoryIcons[achievement.category];

  return (
    <Card className={`group hover-lift border-0 shadow-lg overflow-hidden rounded-2xl transition-all duration-300 ${
      isEarned ? 'bg-white/90 backdrop-blur-sm' : 'bg-gray-100/50 grayscale'
    }`}>
      <div className={`h-16 bg-gradient-to-r ${colors.gradient} flex items-center justify-center relative`}>
        <div className={`text-3xl ${isEarned ? 'opacity-100' : 'opacity-30'}`}>
          {achievement.icon}
        </div>
        {isEarned && (
          <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
            <Trophy className="w-3 h-3 text-white" />
          </div>
        )}
        {!isEarned && (
          <div className="absolute top-2 right-2 bg-gray-400 rounded-full p-1">
            <Lock className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className={`text-lg font-bold ${isEarned ? colors.text : 'text-gray-400'} group-hover:text-opacity-80 transition-colors`}>
              {achievement.title}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={`${colors.bg} ${colors.text} ${colors.border} border`}>
                {achievement.rarity}
              </Badge>
              <Badge variant="outline" className="capitalize">
                <CategoryIcon className="w-3 h-3 mr-1" />
                {achievement.category}
              </Badge>
            </div>
          </div>
          <div className={`flex items-center gap-1 ${isEarned ? colors.text : 'text-gray-400'}`}>
            <Star className="w-4 h-4" />
            <span className="font-semibold">{achievement.points}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className={`text-sm leading-relaxed h-12 overflow-hidden ${isEarned ? 'text-gray-600' : 'text-gray-400'}`}>
          {achievement.description}
        </p>

        {progress && !isEarned && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Progress</span>
              <span className="font-semibold text-gray-600">
                {progress.current}/{progress.required}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`bg-gradient-to-r ${colors.gradient} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${Math.min(100, (progress.current / progress.required) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {isEarned && (
          <div className={`text-center p-2 ${colors.bg} rounded-lg`}>
            <div className="text-xs text-gray-500">Earned</div>
            <div className={`text-sm font-semibold ${colors.text}`}>
              {new Date(isEarned.earned_date).toLocaleDateString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}