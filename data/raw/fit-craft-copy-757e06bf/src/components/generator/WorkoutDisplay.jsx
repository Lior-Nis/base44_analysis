import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, Target, Calendar, Save, Dumbbell, Timer, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

export default function WorkoutDisplay({ workoutPlan, onSave, onGenerateNew, isSaving }) {
  const getTotalWorkoutTime = () => {
    return workoutPlan.sessions?.reduce((total, session) => total + session.duration_minutes, 0) || 0;
  };

  const getEquipmentUsed = () => {
    const equipment = new Set();
    workoutPlan.sessions?.forEach(session => {
      session.exercises?.forEach(exercise => {
        if (exercise.equipment && exercise.equipment !== "none") {
          equipment.add(exercise.equipment);
        }
      });
    });
    return Array.from(equipment);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-emerald-600 bg-clip-text text-transparent">
          {workoutPlan.name}
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
          {workoutPlan.description}
        </p>
      </div>

      {/* Plan Overview */}
      <Card className="border-none shadow-xl bg-gradient-to-r from-emerald-50 to-emerald-100/50 backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto bg-emerald-500 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{workoutPlan.duration_weeks}</div>
              <div className="text-sm font-medium text-gray-600">Weeks</div>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto bg-emerald-500 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{workoutPlan.sessions?.length || 0}</div>
              <div className="text-sm font-medium text-gray-600">Sessions/Week</div>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto bg-emerald-500 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{getTotalWorkoutTime()}</div>
              <div className="text-sm font-medium text-gray-600">Total Minutes</div>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto bg-emerald-500 rounded-full flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{getEquipmentUsed().length}</div>
              <div className="text-sm font-medium text-gray-600">Equipment Types</div>
            </div>
          </div>
          
          {getEquipmentUsed().length > 0 && (
            <div className="mt-6 pt-6 border-t border-emerald-200">
              <h4 className="font-semibold text-gray-900 mb-3">Equipment Needed:</h4>
              <div className="flex flex-wrap gap-2">
                {getEquipmentUsed().map(equipment => (
                  <Badge key={equipment} variant="secondary" className="bg-white text-emerald-700 border border-emerald-200">
                    {equipment.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workout Sessions */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-900">Weekly Schedule</h3>
        <div className="grid gap-6">
          {workoutPlan.sessions?.map((session, sessionIndex) => (
            <motion.div
              key={sessionIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sessionIndex * 0.1 }}
            >
              <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {sessionIndex + 1}
                      </div>
                      {session.name}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Timer className="w-4 h-4" />
                      {session.duration_minutes} min
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {session.exercises?.map((exercise, exerciseIndex) => (
                    <div key={exerciseIndex} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{exercise.name}</h4>
                        {exercise.equipment && exercise.equipment !== "none" && (
                          <Badge variant="outline" className="text-xs">
                            {exercise.equipment.replace(/_/g, ' ')}
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Sets:</span>
                          <span className="ml-2 font-bold text-emerald-600">{exercise.sets}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Reps:</span>
                          <span className="ml-2 font-bold text-emerald-600">{exercise.reps}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Rest:</span>
                          <span className="ml-2 font-bold text-emerald-600">{exercise.rest_seconds}s</span>
                        </div>
                        <div className="md:col-span-1 col-span-2">
                          <span className="font-medium text-gray-600">Time:</span>
                          <span className="ml-2 font-bold text-emerald-600">
                            ~{Math.ceil(exercise.sets * ((exercise.reps?.includes('-') ? 
                              (parseInt(exercise.reps.split('-')[0]) + parseInt(exercise.reps.split('-')[1])) / 2 * 3 : 
                              parseInt(exercise.reps) * 3) + exercise.rest_seconds) / 60)} min
                          </span>
                        </div>
                      </div>
                      {exercise.notes && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">💡 Tip:</span> {exercise.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
        <Button
          onClick={onGenerateNew}
          variant="outline"
          size="lg"
          className="flex items-center gap-2 px-8 py-4"
        >
          <RotateCcw className="w-5 h-5" />
          Generate New Plan
        </Button>
        <Button
          onClick={onSave}
          disabled={isSaving}
          size="lg"
          className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-xl"
        >
          <Save className="w-5 h-5" />
          {isSaving ? "Saving..." : "Save This Plan"}
        </Button>
      </div>
    </motion.div>
  );
}