import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, Target, Star, Play } from "lucide-react";

const gameTypeIcons = {
  code_challenge: "🧩",
  syntax_match: "🎯", 
  debug_hunt: "🐛",
  quiz: "❓",
  drag_drop: "🔄"
};

const languageColors = {
  python: {
    gradient: "from-blue-500 to-cyan-400",
    text: "text-blue-600",
    bg: "bg-blue-50"
  },
  java: {
    gradient: "from-orange-500 to-amber-400", 
    text: "text-orange-600",
    bg: "bg-orange-50"
  },
  c: {
    gradient: "from-purple-500 to-violet-400",
    text: "text-purple-600", 
    bg: "bg-purple-50"
  },
  general: {
    gradient: "from-gray-500 to-gray-400",
    text: "text-gray-600",
    bg: "bg-gray-50"
  }
};

const difficultyColors = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-yellow-100 text-yellow-800", 
  advanced: "bg-red-100 text-red-800"
};

export default function GameCard({ 
  game, 
  progress, 
  onPlay 
}) {
  const colors = languageColors[game.language];
  const isCompleted = progress?.completed || false;
  const bestScore = progress?.best_score || 0;

  return (
    <Card className="group hover-lift border-0 shadow-lg bg-white/90 backdrop-blur-sm overflow-hidden rounded-2xl">
      <div className={`h-20 bg-gradient-to-r ${colors.gradient} flex items-center justify-center relative`}>
        <div className="text-4xl opacity-80">{gameTypeIcons[game.type]}</div>
        {isCompleted && (
          <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
            <Trophy className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className={`text-lg font-bold ${colors.text} group-hover:text-opacity-80 transition-colors`}>
              {game.title}
            </CardTitle>
            <div className="flex gap-2 mt-2">
              <Badge className={difficultyColors[game.difficulty]}>
                {game.difficulty}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {game.language}
              </Badge>
            </div>
          </div>
          <div className={`flex items-center gap-1 ${colors.text}`}>
            <Star className="w-4 h-4" />
            <span className="font-semibold">{game.points}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-gray-600 text-sm leading-relaxed h-12 overflow-hidden">
          {game.description}
        </p>

        {progress && (
          <div className="grid grid-cols-2 gap-3">
            <div className={`text-center p-2 ${colors.bg} rounded-lg`}>
              <div className={`text-lg font-bold ${colors.text}`}>{bestScore}</div>
              <div className="text-xs text-gray-500">Best Score</div>
            </div>
            <div className={`text-center p-2 ${colors.bg} rounded-lg`}>
              <div className={`text-lg font-bold ${colors.text}`}>{progress.attempts || 0}</div>
              <div className="text-xs text-gray-500">Attempts</div>
            </div>
          </div>
        )}

        <Button
          onClick={() => onPlay(game)}
          className={`w-full bg-gradient-to-r ${colors.gradient} text-white font-semibold py-2 rounded-xl transition-all duration-300 transform group-hover:scale-105 shadow-lg`}
        >
          <Play className="w-4 h-4 mr-2" />
          {isCompleted ? 'Play Again' : 'Start Game'}
        </Button>
      </CardContent>
    </Card>
  );
}