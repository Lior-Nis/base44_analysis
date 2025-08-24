
import React, { useState, useEffect } from "react";
import { GameProgress } from "@/api/entities";
import { User } from "@/api/entities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Play, Star, Trophy, Target, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProfileSetup from "../components/ProfileSetup";

export default function Dashboard() {
  const [progress, setProgress] = useState([]);
  const [user, setUser] = useState(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [stats, setStats] = useState({
    totalPoints: 0,
    totalCompleted: 0,
    averageAccuracy: 0,
    currentStreak: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      if (!currentUser.nickname) {
        setShowProfileSetup(true);
      }
      const data = await GameProgress.list("-created_date", 50);
      setProgress(data);
      calculateStats(data, currentUser);
    } catch (error) {
      console.error("Error loading progress:", error);
    }
    setIsLoading(false);
  };

  const handleProfileComplete = (updatedUser) => {
      setUser(updatedUser);
      setShowProfileSetup(false);
  };

  const calculateStats = (progressData, currentUser) => {
    const totalPoints = currentUser?.points || 0;
    const completed = progressData.filter(p => p.completed).length;
    const totalAccuracy = progressData.length > 0 
      ? progressData.reduce((sum, p) => sum + (p.correct_answers / p.total_questions * 100), 0) / progressData.length
      : 0;
    
    setStats({
      totalPoints,
      totalCompleted: completed,
      averageAccuracy: Math.round(totalAccuracy),
      currentStreak: Math.min(completed, 10)
    });
  };

  const levels = [
    {
      id: "easy",
      name: "Easy Explorer",
      description: "Perfect for beginners! Simple addition and subtraction.",
      color: "from-green-400 to-green-600",
      icon: "🌱",
      operations: ["addition", "subtraction"]
    },
    {
      id: "medium", 
      name: "Math Adventurer",
      description: "Ready for more? Multiplication and bigger numbers!",
      color: "from-blue-400 to-blue-600",
      icon: "🚀",
      operations: ["addition", "subtraction", "multiplication"]
    },
    {
      id: "hard",
      name: "Number Ninja",
      description: "Master level! All operations with challenging problems.",
      color: "from-purple-400 to-purple-600", 
      icon: "🥷",
      operations: ["addition", "subtraction", "multiplication", "division"]
    }
  ];

  return (
    <div className="min-h-screen bg-blue-600 p-4 md:p-8">
      {showProfileSetup && user && <ProfileSetup user={user} onComplete={handleProfileComplete} />}
      <div className="max-w-6xl mx-auto">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <div className="bounce-in">
            <h1 className="game-title text-4xl md:text-6xl text-white mb-4 drop-shadow-lg">
              Welcome, {user?.nickname || user?.full_name || 'Player'}! 🎯
            </h1>
            <p className="text-xl text-white/90 mb-6 drop-shadow">
              Choose your adventure and start practicing math!
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-300 hover:scale-105">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Star className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.totalPoints}</p>
              <p className="text-sm text-gray-600">Total Points</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-300 hover:scale-105">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.totalCompleted}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-300 hover:scale-105">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.averageAccuracy}%</p>
              <p className="text-sm text-gray-600">Accuracy</p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-300 hover:scale-105">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{stats.currentStreak}</p>
              <p className="text-sm text-gray-600">Streak</p>
            </CardContent>
          </Card>
        </div>

        {/* Level Selection */}
        <div className="space-y-6">
          <h2 className="game-title text-3xl text-white text-center mb-8 drop-shadow-lg">
            Choose Your Level! 🎮
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {levels.map((level, index) => (
              <Card 
                key={level.id} 
                className="bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden"
                style={{animationDelay: `${index * 100}ms`}}
              >
                <CardContent className="p-0">
                  <div className={`bg-gradient-to-r ${level.color} p-6 text-center`}>
                    <div className="text-4xl mb-2 float">{level.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-2">{level.name}</h3>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-gray-600 mb-4 text-center">{level.description}</p>
                    
                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                      {level.operations.map(op => (
                        <span 
                          key={op}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                        >
                          {op === 'addition' ? '➕' : op === 'subtraction' ? '➖' : op === 'multiplication' ? '✖️' : '➗'} {op}
                        </span>
                      ))}
                    </div>
                    
                    <Link to={createPageUrl(`Game?level=${level.id}`)} className="block">
                      <Button className={`w-full bg-gradient-to-r ${level.color} hover:shadow-lg transition-all duration-300 text-white font-semibold text-lg py-3 rounded-xl`}>
                        <Play className="w-5 h-5 mr-2" />
                        Start Playing!
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        {progress.length > 0 && (
          <div className="mt-12">
            <h3 className="game-title text-2xl text-white text-center mb-6 drop-shadow-lg">
              Recent Games 📈
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {progress.slice(0, 6).map((game) => (
                <Card key={game.id} className="bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-800 capitalize">{game.level} Level</span>
                      <span className="text-sm text-gray-500">
                        {new Date(game.created_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="capitalize text-gray-600">{game.operation}</span>
                      <span className="text-2xl">
                        {game.operation === 'addition' ? '➕' : 
                         game.operation === 'subtraction' ? '➖' : 
                         game.operation === 'multiplication' ? '✖️' : '➗'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg text-blue-600">{game.score} pts</span>
                      <span className="text-sm text-gray-600">
                        {game.correct_answers}/{game.total_questions} correct
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
