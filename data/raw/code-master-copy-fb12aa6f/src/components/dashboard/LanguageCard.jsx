
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronRight, Clock, Star } from "lucide-react";

const languageIcons = {
  python: "🐍",
  java: "☕",
  c: "⚡"
};

const languageColors = {
  python: {
    gradient: "from-blue-500 to-cyan-400",
    text: "text-blue-600",
    bg: "bg-blue-50",
    progress: "bg-blue-500"
  },
  java: {
    gradient: "from-orange-500 to-amber-400",
    text: "text-orange-600",
    bg: "bg-orange-50",
    progress: "bg-orange-500"
  },
  c: {
    gradient: "from-purple-500 to-violet-400",
    text: "text-purple-600",
    bg: "bg-purple-50",
    progress: "bg-purple-500"
  }
};

export default function LanguageCard({
  language,
  title,
  description,
  progress = 0,
  totalLessons = 0,
  completedLessons = 0,
  estimatedHours = 0,
  difficulty = "beginner",
  pageName
}) {
  const colors = languageColors[language];

  return (
    <Card className="group hover-lift border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden rounded-2xl">
      <div className={`h-24 bg-gradient-to-r ${colors.gradient} flex items-center justify-center`}>
        <div className="text-6xl opacity-80">{languageIcons[language]}</div>
      </div>

      <CardContent className="p-6 space-y-6">
        <div>
          <h3 className={`text-2xl font-bold ${colors.text}`}>
            {title}
          </h3>
          <p className="text-sm text-gray-500 capitalize font-medium">
            {difficulty} Level
          </p>
        </div>

        <p className="text-gray-600 leading-relaxed h-20">{description}</p>

        <div className="grid grid-cols-2 gap-4">
          <div className={`text-center p-3 ${colors.bg} rounded-xl`}>
            <div className={`text-2xl font-bold ${colors.text}`}>{totalLessons}</div>
            <div className="text-sm text-gray-500">Lessons</div>
          </div>
          <div className={`text-center p-3 ${colors.bg} rounded-xl`}>
            <div className={`text-2xl font-bold ${colors.text} flex items-center justify-center gap-1`}>
              <Clock className="w-5 h-5" />
              {estimatedHours}h
            </div>
            <div className="text-sm text-gray-500">Duration</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className={`font-semibold ${colors.text}`}>{completedLessons}/{totalLessons} lessons</span>
          </div>
          <Progress value={progress} className={`h-2 [&>div]:bg-gradient-to-r ${colors.gradient}`} />
        </div>

        <Link to={createPageUrl(pageName)} className="w-full">
          <Button className={`w-full bg-gradient-to-r ${colors.gradient} text-white font-semibold py-3 rounded-xl transition-all duration-300 transform group-hover:scale-105 shadow-lg group-hover:shadow-xl`}>
            {progress > 0 ? 'Continue Learning' : 'Start Learning'}
            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
