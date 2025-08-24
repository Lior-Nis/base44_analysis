import React, { useState, useEffect } from "react";
import { Achievement, UserAchievement, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import AchievementCard from "../components/achievements/AchievementCard";
import AchievementProgress from "../components/achievements/AchievementProgress";

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [user, setUser] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [filterType, setFilterType] = useState("all"); // all, earned, unearned

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [achievementsData, userAchievementsData, userData] = await Promise.all([
        Achievement.list("order"),
        UserAchievement.list(),
        User.me().catch(() => null)
      ]);
      
      setAchievements(achievementsData);
      setUserAchievements(userAchievementsData);
      setUser(userData);
    } catch (error) {
      console.error("Error loading achievements:", error);
    }
  };

  const isAchievementEarned = (achievementId) => {
    return userAchievements.find(ua => 
      ua.achievement_id === achievementId && ua.user_email === user?.email
    );
  };

  const getTotalPoints = () => {
    return userAchievements
      .filter(ua => ua.user_email === user?.email)
      .reduce((total, ua) => {
        const achievement = achievements.find(a => a.id === ua.achievement_id);
        return total + (achievement?.points || 0);
      }, 0);
  };

  const getCategoryStats = () => {
    const stats = {};
    const categories = ['learning', 'gaming', 'streak', 'milestone', 'skill'];
    
    categories.forEach(category => {
      const categoryAchievements = achievements.filter(a => a.category === category);
      const earnedInCategory = categoryAchievements.filter(a => isAchievementEarned(a.id));
      
      stats[category] = {
        total: categoryAchievements.length,
        earned: earnedInCategory.length
      };
    });
    
    return stats;
  };

  const getFilteredAchievements = () => {
    let filtered = achievements;
    
    // Filter by category
    if (activeCategory !== "all") {
      filtered = filtered.filter(a => a.category === activeCategory);
    }
    
    // Filter by earned status
    if (filterType === "earned") {
      filtered = filtered.filter(a => isAchievementEarned(a.id));
    } else if (filterType === "unearned") {
      filtered = filtered.filter(a => !isAchievementEarned(a.id));
    }
    
    return filtered;
  };

  const filteredAchievements = getFilteredAchievements();
  const categoryStats = getCategoryStats();

  return (
    <div className="min-h-screen p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="outline" size="icon" className="hover:bg-gray-100">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-8 h-8 text-yellow-600" />
              <h1 className="text-3xl font-bold text-gray-900">Achievements</h1>
            </div>
            <p className="text-gray-600">
              Track your learning progress and unlock rewards
            </p>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="mb-8">
          <AchievementProgress
            userAchievements={userAchievements.filter(ua => ua.user_email === user?.email)}
            totalAchievements={achievements.length}
            totalPoints={getTotalPoints()}
            categoryStats={categoryStats}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-600">Show:</span>
            <div className="flex gap-2">
              {["all", "earned", "unearned"].map(type => (
                <Button
                  key={type}
                  variant={filterType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType(type)}
                  className="capitalize"
                >
                  {type === "unearned" ? "not earned" : type}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Achievement Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <div className="flex justify-center mb-8">
            <TabsList className="grid grid-cols-6 bg-white/90 backdrop-blur-sm shadow-lg border-0">
              <TabsTrigger value="all" className="data-[state=active]:bg-gray-600 data-[state=active]:text-white">
                All
              </TabsTrigger>
              <TabsTrigger value="learning" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Learning
              </TabsTrigger>
              <TabsTrigger value="gaming" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                Gaming
              </TabsTrigger>
              <TabsTrigger value="streak" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white">
                Streak
              </TabsTrigger>
              <TabsTrigger value="milestone" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                Milestone
              </TabsTrigger>
              <TabsTrigger value="skill" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                Skill
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeCategory}>
            {filteredAchievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    isEarned={isAchievementEarned(achievement.id)}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Achievements Found
                  </h3>
                  <p className="text-gray-600">
                    {filterType === "earned" 
                      ? "You haven't earned any achievements in this category yet. Keep learning!"
                      : filterType === "unearned"
                      ? "Great job! You've earned all achievements in this category."
                      : "No achievements available in this category yet."
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}