import React, { useState, useEffect } from "react";
import { Game, GameProgress, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Target, Gamepad2, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import GameCard from "../components/games/GameCard";
import CodeChallengeGame from "../components/games/CodeChallengeGame";
import SyntaxMatchGame from "../components/games/SyntaxMatchGame";
import DebugHuntGame from "../components/games/DebugHuntGame";

export default function Games() {
  const [games, setGames] = useState([]);
  const [gameProgress, setGameProgress] = useState([]);
  const [user, setUser] = useState(null);
  const [activeGame, setActiveGame] = useState(null);
  const [activeLanguage, setActiveLanguage] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [gamesData, progressData, userData] = await Promise.all([
        Game.list("order"),
        GameProgress.list(),
        User.me().catch(() => null)
      ]);
      
      setGames(gamesData);
      setGameProgress(progressData);
      setUser(userData);
    } catch (error) {
      console.error("Error loading games:", error);
    }
  };

  const handleGameComplete = async (gameResult) => {
    if (!user) return;

    try {
      // Check if progress exists
      const existingProgress = gameProgress.find(p => 
        p.game_id === activeGame.id && p.user_email === user.email
      );

      if (existingProgress) {
        // Update existing progress
        await GameProgress.update(existingProgress.id, {
          ...gameResult,
          best_score: Math.max(existingProgress.best_score || 0, gameResult.score || 0),
          attempts: (existingProgress.attempts || 0) + 1,
          completion_date: new Date().toISOString()
        });
      } else {
        // Create new progress
        await GameProgress.create({
          user_email: user.email,
          game_id: activeGame.id,
          ...gameResult,
          best_score: gameResult.score || 0,
          completion_date: new Date().toISOString()
        });
      }

      setActiveGame(null);
      loadData();
    } catch (error) {
      console.error("Error saving game progress:", error);
    }
  };

  const getGameProgress = (gameId) => {
    return gameProgress.find(p => p.game_id === gameId && p.user_email === user?.email);
  };

  const renderGameComponent = (game) => {
    const commonProps = {
      game,
      onComplete: handleGameComplete,
      onClose: () => setActiveGame(null)
    };

    switch (game.type) {
      case 'code_challenge':
        return <CodeChallengeGame {...commonProps} />;
      case 'syntax_match':
        return <SyntaxMatchGame {...commonProps} />;
      case 'debug_hunt':
        return <DebugHuntGame {...commonProps} />;
      default:
        return <div>Game type not supported yet</div>;
    }
  };

  const filteredGames = games.filter(game => 
    activeLanguage === "all" || game.language === activeLanguage
  );

  const getTotalScore = () => {
    return gameProgress.reduce((total, progress) => total + (progress.best_score || 0), 0);
  };

  const getCompletedGames = () => {
    return gameProgress.filter(p => p.completed).length;
  };

  if (activeGame) {
    return (
      <div className="min-h-screen p-6 md:p-8">
        {renderGameComponent(activeGame)}
      </div>
    );
  }

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
              <Gamepad2 className="w-8 h-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-900">Coding Games</h1>
            </div>
            <p className="text-gray-600">
              Learn programming through fun and interactive games
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-violet-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Total Score</p>
                  <p className="text-3xl font-bold">{getTotalScore()}</p>
                </div>
                <Trophy className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Completed</p>
                  <p className="text-3xl font-bold">{getCompletedGames()}</p>
                </div>
                <Target className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Available</p>
                  <p className="text-3xl font-bold">{games.length}</p>
                </div>
                <Gamepad2 className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Avg Score</p>
                  <p className="text-3xl font-bold">
                    {getCompletedGames() > 0 ? Math.round(getTotalScore() / getCompletedGames()) : 0}
                  </p>
                </div>
                <Zap className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Game Tabs */}
        <Tabs value={activeLanguage} onValueChange={setActiveLanguage}>
          <div className="flex justify-center mb-8">
            <TabsList className="grid grid-cols-4 bg-white/90 backdrop-blur-sm shadow-lg border-0">
              <TabsTrigger value="all" className="data-[state=active]:bg-gray-600 data-[state=active]:text-white">
                All Games
              </TabsTrigger>
              <TabsTrigger value="python" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                🐍 Python
              </TabsTrigger>
              <TabsTrigger value="java" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                ☕ Java
              </TabsTrigger>
              <TabsTrigger value="c" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                ⚡ C
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={activeLanguage}>
            {filteredGames.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGames.map((game) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    progress={getGameProgress(game.id)}
                    onPlay={setActiveGame}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <Gamepad2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Games Available
                  </h3>
                  <p className="text-gray-600">
                    {activeLanguage === "all" 
                      ? "Games will be added soon. Check back later!"
                      : `${activeLanguage.charAt(0).toUpperCase() + activeLanguage.slice(1)} games will be added soon!`
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