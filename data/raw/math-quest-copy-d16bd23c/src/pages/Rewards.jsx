
import React, { useState, useEffect } from "react";
import { GameProgress } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Star, Trophy, Target, Zap, Award, Crown, Medal, Gift } from "lucide-react";

export default function Rewards() {
  const [progress, setProgress] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({
    totalPoints: 0,
    gamesCompleted: 0,
    perfectGames: 0,
    totalCorrect: 0,
    averageAccuracy: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await GameProgress.list("-created_date", 100);
      setProgress(data);
      calculateStats(data);
      calculateAchievements(data);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const calculateStats = (progressData) => {
    const totalPoints = progressData.reduce((sum, p) => sum + (p.score || 0), 0);
    const completed = progressData.filter(p => p.completed).length;
    const perfect = progressData.filter(p => p.correct_answers === p.total_questions).length;
    const totalCorrect = progressData.reduce((sum, p) => sum + (p.correct_answers || 0), 0);
    const averageAccuracy = progressData.length > 0 
      ? Math.round(progressData.reduce((sum, p) => sum + (p.correct_answers / p.total_questions * 100), 0) / progressData.length)
      : 0;

    setStats({
      totalPoints,
      gamesCompleted: completed,
      perfectGames: perfect,
      totalCorrect,
      averageAccuracy
    });
  };

  const achievementDefinitions = [
    {
      id: 'first_game',
      name: 'Getting Started',
      description: 'Complete your first game',
      icon: '🌟',
      requirement: (stats, progress) => progress.length >= 1,
      points: 50
    },
    {
      id: 'perfect_game',
      name: 'Perfect Score',
      description: 'Get all answers correct in one game',
      icon: '🎯',
      requirement: (stats) => stats.perfectGames >= 1,
      points: 100
    },
    {
      id: 'math_master',
      name: 'Math Master',
      description: 'Complete 10 games',
      icon: '🧠',
      requirement: (stats) => stats.gamesCompleted >= 10,
      points: 200
    },
    {
      id: 'speed_demon',
      name: 'Speed Demon',
      description: 'Complete a game in under 30 seconds',
      icon: '⚡',
      requirement: (stats, progress) => progress.some(p => p.time_taken <= 30),
      points: 150
    },
    {
      id: 'accuracy_expert',
      name: 'Accuracy Expert',
      description: 'Maintain 90% accuracy across all games',
      icon: '🏆',
      requirement: (stats) => stats.averageAccuracy >= 90,
      points: 250
    },
    {
      id: 'dedication',
      name: 'Dedicated Learner',
      description: 'Play games for 5 days',
      icon: '📚',
      requirement: (stats, progress) => {
        const uniqueDays = new Set(progress.map(p => new Date(p.created_date).toDateString()));
        return uniqueDays.size >= 5;
      },
      points: 300
    },
    {
      id: 'all_operations',
      name: 'Operation Master',
      description: 'Complete games in all four operations',
      icon: '🔢',
      requirement: (stats, progress) => {
        const operations = new Set(progress.map(p => p.operation));
        return ['addition', 'subtraction', 'multiplication', 'division'].every(op => operations.has(op));
      },
      points: 400
    },
    {
      id: 'high_scorer',
      name: 'High Scorer',
      description: 'Score 500+ points in a single game',
      icon: '💯',
      requirement: (stats, progress) => progress.some(p => p.score >= 500),
      points: 200
    }
  ];

  const calculateAchievements = (progressData) => {
    const currentStats = {
      totalPoints: progressData.reduce((sum, p) => sum + (p.score || 0), 0),
      gamesCompleted: progressData.filter(p => p.completed).length,
      perfectGames: progressData.filter(p => p.correct_answers === p.total_questions).length,
      totalCorrect: progressData.reduce((sum, p) => sum + (p.correct_answers || 0), 0),
      averageAccuracy: progressData.length > 0 
        ? Math.round(progressData.reduce((sum, p) => sum + (p.correct_answers / p.total_questions * 100), 0) / progressData.length)
        : 0
    };

    const earned = achievementDefinitions.filter(achievement => 
      achievement.requirement(currentStats, progressData)
    );

    setAchievements(earned);
  };

  const badges = [
    { name: 'Addition Expert', icon: '➕', color: 'bg-green-100 text-green-800', requirement: () => progress.filter(p => p.operation === 'addition' && p.completed).length >= 5 },
    { name: 'Subtraction Pro', icon: '➖', color: 'bg-blue-100 text-blue-800', requirement: () => progress.filter(p => p.operation === 'subtraction' && p.completed).length >= 5 },
    { name: 'Multiplication Ninja', icon: '✖️', color: 'bg-purple-100 text-purple-800', requirement: () => progress.filter(p => p.operation === 'multiplication' && p.completed).length >= 5 },
    { name: 'Division Wizard', icon: '➗', color: 'bg-orange-100 text-orange-800', requirement: () => progress.filter(p => p.operation === 'division' && p.completed).length >= 5 }
  ];

  const earnedBadges = badges.filter(badge => badge.requirement());

  return (
    <div className="min-h-screen bg-blue-600 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="game-title text-4xl md:text-6xl text-white mb-4 drop-shadow-lg">
            Your Rewards! 🏆
          </h1>
          <p className="text-xl text-white/90 drop-shadow">
            Look at all the amazing things you've achieved!
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-300">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.totalPoints}</p>
              <p className="text-sm text-gray-600">Total Points</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-300">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.gamesCompleted}</p>
              <p className="text-sm text-gray-600">Games Won</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-300">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.averageAccuracy}%</p>
              <p className="text-sm text-gray-600">Accuracy</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-300">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.perfectGames}</p>
              <p className="text-sm text-gray-600">Perfect Games</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-300">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Award className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{achievements.length}</p>
              <p className="text-sm text-gray-600">Achievements</p>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <div className="mb-8">
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Crown className="w-6 h-6 text-yellow-500" />
                Achievements Unlocked ({achievements.length}/{achievementDefinitions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Progress 
                  value={(achievements.length / achievementDefinitions.length) * 100} 
                  className="h-3"
                />
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievementDefinitions.map((achievement) => {
                  const isEarned = achievements.some(a => a.id === achievement.id);
                  return (
                    <div
                      key={achievement.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isEarned 
                          ? 'border-yellow-300 bg-yellow-50' 
                          : 'border-gray-200 bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{achievement.icon}</span>
                        <div>
                          <h3 className="font-bold text-gray-800">{achievement.name}</h3>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <Badge variant={isEarned ? "default" : "secondary"} className="text-xs">
                          {achievement.points} points
                        </Badge>
                        {isEarned && (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            ✓ Earned
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Badges */}
        <div className="mb-8">
          <Card className="bg-white/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Medal className="w-6 h-6 text-blue-500" />
                Operation Badges ({earnedBadges.length}/{badges.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {badges.map((badge) => {
                  const isEarned = badge.requirement();
                  return (
                    <div
                      key={badge.name}
                      className={`p-6 rounded-lg text-center transition-all ${
                        isEarned 
                          ? 'border-2 border-blue-300 bg-blue-50' 
                          : 'border-2 border-gray-200 bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="text-4xl mb-2">{badge.icon}</div>
                      <h3 className="font-bold text-gray-800 mb-2">{badge.name}</h3>
                      {isEarned ? (
                        <Badge className="bg-green-100 text-green-800">
                          ✓ Earned
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Not Yet
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Motivational Section */}
        <Card className="bg-gradient-to-r from-purple-400 to-pink-400 text-white">
          <CardContent className="p-8 text-center">
            <Gift className="w-16 h-16 mx-auto mb-4 float" />
            <h2 className="game-title text-3xl mb-4">Keep Going, Math Champion! 🌟</h2>
            <p className="text-xl mb-4">
              You're doing an amazing job learning math! Every game makes you stronger and smarter.
            </p>
            <p className="text-lg opacity-90">
              {achievements.length < achievementDefinitions.length 
                ? `Only ${achievementDefinitions.length - achievements.length} more achievements to unlock!`
                : "You've unlocked all achievements! You're a true Math Master! 👑"
              }
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
