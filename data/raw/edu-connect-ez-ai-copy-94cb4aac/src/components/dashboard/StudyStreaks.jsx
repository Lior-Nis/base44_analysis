import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Flame, Target, Award } from "lucide-react";

export default function StudyStreaks({ assignments, studyPlans, loading }) {
  const calculateStreakData = () => {
    if (!assignments || assignments.length === 0) {
      return { dailyStreak: 0, weeklyProgress: 0, weeklyCompleted: 0, weeklyGoal: 7, achievement: null };
    }

    const completedAssignments = assignments
      .filter(a => a.status === "completed" && a.updated_date)
      .map(a => new Date(a.updated_date))
      .sort((a, b) => b - a);

    // Calculate Daily Streak
    let dailyStreak = 0;
    if (completedAssignments.length > 0) {
      const uniqueCompletionDays = [...new Set(completedAssignments.map(d => d.toDateString()))];
      let today = new Date();
      if (uniqueCompletionDays.includes(today.toDateString())) {
        dailyStreak = 1;
        let yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        while (uniqueCompletionDays.includes(yesterday.toDateString())) {
          dailyStreak++;
          yesterday.setDate(yesterday.getDate() - 1);
        }
      }
    }
    
    // Calculate Weekly Progress
    const weeklyGoal = 7;
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const thisWeekCompleted = completedAssignments.filter(d => d >= weekStart).length;
    const weeklyProgress = (thisWeekCompleted / weeklyGoal) * 100;

    // Determine Achievement
    let achievement = null;
    if (assignments.filter(a => a.status === 'completed').length >= 10) {
      achievement = { icon: '🏆', title: 'Task Master', description: 'Completed 10+ assignments!' };
    } else if (assignments.some(a => a.status === 'completed' && new Date(a.updated_date) < new Date(a.due_date))) {
      achievement = { icon: '🐦', title: 'Early Bird', description: 'Finished an assignment early.' };
    } else if (thisWeekCompleted >= weeklyGoal) {
       achievement = { icon: '🎯', title: 'Goal Crusher', description: 'Met your weekly goal!' };
    }


    return { dailyStreak, weeklyProgress, weeklyCompleted, weeklyGoal, achievement };
  };

  const streakData = calculateStreakData();

  return (
    <div className="space-y-6">
      {/* Study Streak */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-red-50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Study Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="text-4xl font-bold text-orange-600">
                {streakData.dailyStreak}
              </div>
              <div className="text-sm text-gray-600">days in a row</div>
            </div>
            
            <Badge className="bg-orange-100 text-orange-800 border-orange-200">
              {streakData.dailyStreak > 0 ? '🔥 Keep it up!' : 'Complete a task to start!'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Progress */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-500" />
            Weekly Goal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Completed Assignments</span>
            <span className="text-sm text-gray-500">
              {streakData.weeklyCompleted}/{streakData.weeklyGoal}
            </span>
          </div>
          
          <Progress 
            value={streakData.weeklyProgress} 
            className="h-3"
          />
          
          <p className="text-xs text-gray-600 text-center">
            {Math.round(streakData.weeklyProgress)}% of your weekly goal
          </p>
        </CardContent>
      </Card>

      {/* Achievement */}
      {streakData.achievement && (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-blue-50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-500" />
              Latest Achievement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className="text-3xl">{streakData.achievement.icon}</div>
              <div className="font-semibold text-purple-700">{streakData.achievement.title}</div>
              <p className="text-xs text-gray-600">
                {streakData.achievement.description}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}