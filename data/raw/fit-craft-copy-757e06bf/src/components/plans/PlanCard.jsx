import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Target, Dumbbell, Eye, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function PlanCard({ plan, onView, onDelete }) {
  const getTotalTime = () => {
    return plan.sessions?.reduce((total, session) => total + session.duration_minutes, 0) || 0;
  };

  const getEquipmentCount = () => {
    const equipment = new Set();
    plan.sessions?.forEach(session => {
      session.exercises?.forEach(exercise => {
        if (exercise.equipment && exercise.equipment !== "none") {
          equipment.add(exercise.equipment);
        }
      });
    });
    return equipment.size;
  };

  const getGoalBadgeColor = (goal) => {
    const colors = {
      weight_loss: "bg-red-100 text-red-800 border-red-200",
      muscle_gain: "bg-blue-100 text-blue-800 border-blue-200",
      endurance: "bg-green-100 text-green-800 border-green-200",
      strength: "bg-purple-100 text-purple-800 border-purple-200",
      general_fitness: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[goal] || colors.general_fitness;
  };

  const formatGoalText = (goal) => {
    return goal?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'General Fitness';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-none shadow-lg bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-300 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
        
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-xl font-bold text-gray-900 line-clamp-1">
                {plan.name}
              </CardTitle>
              <p className="text-sm text-gray-600 line-clamp-2">
                {plan.description}
              </p>
            </div>
            <Badge className={`${getGoalBadgeColor(plan.user_profile?.primary_goal)} border text-xs font-semibold`}>
              {formatGoalText(plan.user_profile?.primary_goal)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="p-1.5 bg-emerald-100 rounded-lg">
                <Calendar className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <div className="font-bold text-gray-900">{plan.duration_weeks || 4} weeks</div>
                <div className="text-xs text-gray-500">Duration</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <div className="p-1.5 bg-emerald-100 rounded-lg">
                <Target className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <div className="font-bold text-gray-900">{plan.sessions?.length || 0}</div>
                <div className="text-xs text-gray-500">Sessions/Week</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <div className="p-1.5 bg-emerald-100 rounded-lg">
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <div className="font-bold text-gray-900">{getTotalTime()} min</div>
                <div className="text-xs text-gray-500">Total Time</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <div className="p-1.5 bg-emerald-100 rounded-lg">
                <Dumbbell className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <div className="font-bold text-gray-900">{getEquipmentCount()}</div>
                <div className="text-xs text-gray-500">Equipment</div>
              </div>
            </div>
          </div>

          {/* Created Date */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Created {format(new Date(plan.created_date), "MMM d, yyyy")}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => onView(plan)}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Plan
            </Button>
            <Button
              onClick={() => onDelete(plan)}
              variant="outline"
              size="icon"
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}