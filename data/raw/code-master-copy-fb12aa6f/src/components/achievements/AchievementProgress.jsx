import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target, Star, Crown } from "lucide-react";

export default function AchievementProgress({ 
  userAchievements = [], 
  totalAchievements = 0,
  totalPoints = 0,
  categoryStats = {}
}) {
  const completionRate = totalAchievements > 0 ? Math.round((userAchievements.length / totalAchievements) * 100) : 0;

  const categories = [
    { key: 'learning', icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
    { key: 'gaming', icon: Trophy, color: 'text-purple-600', bg: 'bg-purple-50' },
    { key: 'streak', icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { key: 'milestone', icon: Crown, color: 'text-green-600', bg: 'bg-green-50' }
  ];

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Achievement Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="text-3xl font-bold text-blue-600">{userAchievements.length}</div>
              <div className="text-sm text-gray-600">Earned</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <div className="text-3xl font-bold text-green-600">{totalPoints}</div>
              <div className="text-sm text-gray-600">Total Points</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <div className="text-3xl font-bold text-purple-600">{completionRate}%</div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Overall Progress</span>
              <span className="font-semibold text-gray-900">
                {userAchievements.length}/{totalAchievements} achievements
              </span>
            </div>
            <Progress value={completionRate} className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-purple-500" />
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Achievement Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category) => {
              const stats = categoryStats[category.key] || { earned: 0, total: 0 };
              const percentage = stats.total > 0 ? Math.round((stats.earned / stats.total) * 100) : 0;
              const CategoryIcon = category.icon;
              
              return (
                <div key={category.key} className={`p-4 ${category.bg} rounded-xl`}>
                  <div className="flex items-center gap-3 mb-3">
                    <CategoryIcon className={`w-5 h-5 ${category.color}`} />
                    <span className="font-semibold capitalize text-gray-800">
                      {category.key}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className={`font-semibold ${category.color}`}>
                        {stats.earned}/{stats.total}
                      </span>
                    </div>
                    <Progress 
                      value={percentage} 
                      className="h-2" 
                    />
                    <div className="text-xs text-gray-500 text-center">
                      {percentage}% Complete
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}