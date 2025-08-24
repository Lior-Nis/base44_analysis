import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Target, Clock, Dumbbell, Heart } from "lucide-react";
import { motion } from "framer-motion";

const fitnessLevels = [
  { value: "beginner", label: "Beginner", description: "New to fitness or returning after a long break" },
  { value: "intermediate", label: "Intermediate", description: "Regular exercise for 3-6 months" },
  { value: "advanced", label: "Advanced", description: "Consistent training for 1+ years" }
];

const fitnessGoals = [
  { value: "weight_loss", label: "Weight Loss", icon: "🔥" },
  { value: "muscle_gain", label: "Muscle Gain", icon: "💪" },
  { value: "endurance", label: "Endurance", icon: "🏃" },
  { value: "strength", label: "Strength", icon: "🏋️" },
  { value: "general_fitness", label: "General Fitness", icon: "⚡" }
];

const equipmentOptions = [
  { value: "none", label: "No Equipment", description: "Bodyweight only" },
  { value: "dumbbells", label: "Dumbbells", description: "Adjustable or fixed weights" },
  { value: "barbell", label: "Barbell", description: "Olympic or standard barbell" },
  { value: "resistance_bands", label: "Resistance Bands", description: "Loop or tube bands" },
  { value: "pull_up_bar", label: "Pull-up Bar", description: "Doorway or mounted bar" },
  { value: "gym_access", label: "Full Gym Access", description: "Complete gym equipment" },
  { value: "kettlebells", label: "Kettlebells", description: "Various weights" },
  { value: "yoga_mat", label: "Yoga Mat", description: "For floor exercises" }
];

const workoutStyles = [
  { value: "strength_training", label: "Strength Training", description: "Focus on building muscle and power" },
  { value: "cardio", label: "Cardiovascular", description: "Heart health and endurance" },
  { value: "hiit", label: "HIIT", description: "High-intensity interval training" },
  { value: "yoga", label: "Yoga & Flexibility", description: "Flexibility and mindfulness" },
  { value: "mixed", label: "Mixed Training", description: "Combination of all styles" }
];

export default function ProfileSetup({ onProfileComplete, existingProfile }) {
  const [profile, setProfile] = useState({
    fitness_level: "",
    primary_goal: "",
    available_equipment: [],
    time_per_session: 30,
    sessions_per_week: 3,
    injuries_limitations: "",
    preferred_workout_style: "",
    ...existingProfile
  });

  const handleEquipmentChange = (equipment, checked) => {
    setProfile(prev => ({
      ...prev,
      available_equipment: checked 
        ? [...prev.available_equipment, equipment]
        : prev.available_equipment.filter(e => e !== equipment)
    }));
  };

  const isFormValid = () => {
    return profile.fitness_level && 
           profile.primary_goal && 
           profile.time_per_session > 0 && 
           profile.sessions_per_week > 0 &&
           profile.preferred_workout_style;
  };

  const handleSubmit = () => {
    if (isFormValid()) {
      onProfileComplete(profile);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-emerald-600 bg-clip-text text-transparent">
            Let's Create Your Perfect Workout
          </h2>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto leading-relaxed">
            Answer a few questions to generate a personalized fitness plan tailored specifically for you
          </p>
        </motion.div>
      </div>

      <div className="grid gap-8">
        {/* Fitness Level */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <User className="w-5 h-5 text-emerald-600" />
                </div>
                What's your current fitness level?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={profile.fitness_level}
                onValueChange={(value) => setProfile(prev => ({...prev, fitness_level: value}))}
                className="grid gap-4"
              >
                {fitnessLevels.map((level) => (
                  <div key={level.value} className="flex items-center space-x-3 p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all cursor-pointer">
                    <RadioGroupItem value={level.value} id={level.value} />
                    <div className="flex-1">
                      <Label htmlFor={level.value} className="font-semibold text-gray-900 cursor-pointer">
                        {level.label}
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">{level.description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </motion.div>

        {/* Fitness Goals */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Target className="w-5 h-5 text-emerald-600" />
                </div>
                What's your primary fitness goal?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={profile.primary_goal}
                onValueChange={(value) => setProfile(prev => ({...prev, primary_goal: value}))}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {fitnessGoals.map((goal) => (
                  <div key={goal.value} className="flex items-center space-x-3 p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all cursor-pointer">
                    <RadioGroupItem value={goal.value} id={goal.value} />
                    <div className="flex-1">
                      <Label htmlFor={goal.value} className="font-semibold text-gray-900 cursor-pointer flex items-center gap-2">
                        <span className="text-lg">{goal.icon}</span>
                        {goal.label}
                      </Label>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </motion.div>

        {/* Time & Frequency */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Clock className="w-5 h-5 text-emerald-600" />
                </div>
                Time Commitment
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="time_per_session" className="font-semibold text-gray-900">
                  Minutes per workout session
                </Label>
                <Input
                  id="time_per_session"
                  type="number"
                  min="15"
                  max="120"
                  value={profile.time_per_session}
                  onChange={(e) => setProfile(prev => ({...prev, time_per_session: parseInt(e.target.value) || 30}))}
                  className="text-lg font-semibold"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="sessions_per_week" className="font-semibold text-gray-900">
                  Workouts per week
                </Label>
                <Input
                  id="sessions_per_week"
                  type="number"
                  min="1"
                  max="7"
                  value={profile.sessions_per_week}
                  onChange={(e) => setProfile(prev => ({...prev, sessions_per_week: parseInt(e.target.value) || 3}))}
                  className="text-lg font-semibold"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Equipment */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Dumbbell className="w-5 h-5 text-emerald-600" />
                </div>
                Available Equipment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {equipmentOptions.map((equipment) => (
                  <div key={equipment.value} className="flex items-start space-x-3 p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all">
                    <Checkbox
                      id={equipment.value}
                      checked={profile.available_equipment.includes(equipment.value)}
                      onCheckedChange={(checked) => handleEquipmentChange(equipment.value, checked)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={equipment.value} className="font-semibold text-gray-900 cursor-pointer">
                        {equipment.label}
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">{equipment.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Workout Style */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Heart className="w-5 h-5 text-emerald-600" />
                </div>
                Preferred Workout Style
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={profile.preferred_workout_style}
                onValueChange={(value) => setProfile(prev => ({...prev, preferred_workout_style: value}))}
                className="grid gap-4"
              >
                {workoutStyles.map((style) => (
                  <div key={style.value} className="flex items-center space-x-3 p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all cursor-pointer">
                    <RadioGroupItem value={style.value} id={style.value} />
                    <div className="flex-1">
                      <Label htmlFor={style.value} className="font-semibold text-gray-900 cursor-pointer">
                        {style.label}
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">{style.description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </motion.div>

        {/* Injuries/Limitations */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Any injuries or limitations? (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Describe any injuries, physical limitations, or exercises to avoid..."
                value={profile.injuries_limitations}
                onChange={(e) => setProfile(prev => ({...prev, injuries_limitations: e.target.value}))}
                className="min-h-24 resize-none"
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex justify-center pt-8"
        >
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid()}
            className="px-12 py-4 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Generate My Workout Plan
          </Button>
        </motion.div>
      </div>
    </div>
  );
}