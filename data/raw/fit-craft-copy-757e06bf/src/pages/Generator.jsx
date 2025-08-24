import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { UserProfile, WorkoutPlan } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import ProfileSetup from "../components/generator/ProfileSetup";
import WorkoutDisplay from "../components/generator/WorkoutDisplay";

export default function GeneratorPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await User.me();
      const profiles = await UserProfile.filter({created_by: user.email});
      setCurrentUser(user);
      if (profiles.length > 0) {
        setUserProfile(profiles[0]);
      }
    } catch (error) {
      setError("Please log in to use the workout generator");
    }
  };

  const generateWorkoutPlan = async (profile) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Save or update user profile
      if (userProfile) {
        await UserProfile.update(userProfile.id, profile);
      } else {
        const newProfile = await UserProfile.create(profile);
        setUserProfile(newProfile);
      }

      // Generate workout plan using AI
      const equipmentList = profile.available_equipment.join(", ") || "bodyweight only";
      const prompt = `Create a detailed ${profile.duration_weeks || 4}-week workout plan for a ${profile.fitness_level} level person.

Profile Details:
- Primary Goal: ${profile.primary_goal}
- Available Equipment: ${equipmentList}
- Time per Session: ${profile.time_per_session} minutes
- Sessions per Week: ${profile.sessions_per_week}
- Preferred Style: ${profile.preferred_workout_style}
- Injuries/Limitations: ${profile.injuries_limitations || "None"}

Please create a comprehensive workout plan with specific exercises, sets, reps, rest periods, and helpful notes. Make it progressive and suitable for the user's level. Include exercise modifications if needed based on injuries/limitations.

Focus on exercises that can be done with the available equipment. Each session should fit within the specified time limit.`;

      const response = await InvokeLLM({
        prompt,
        response_json_schema: WorkoutPlan.schema()
      });

      // Add user profile to the generated plan
      const planWithProfile = {
        ...response,
        user_profile: profile
      };

      setGeneratedPlan(planWithProfile);
    } catch (error) {
      setError("Failed to generate workout plan. Please try again.");
      console.error("Error generating plan:", error);
    }
    
    setIsGenerating(false);
  };

  const saveWorkoutPlan = async () => {
    setIsSaving(true);
    try {
      await WorkoutPlan.create(generatedPlan);
      setGeneratedPlan(null);
      setError(null);
    } catch (error) {
      setError("Failed to save workout plan. Please try again.");
    }
    setIsSaving(false);
  };

  const generateNewPlan = () => {
    setGeneratedPlan(null);
    setError(null);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-12 h-12 text-emerald-500 mx-auto" />
          </motion.div>
          <p className="text-gray-600">Loading your fitness profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 p-6">
      {error && (
        <Alert variant="destructive" className="max-w-4xl mx-auto mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isGenerating && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-16 h-16 text-emerald-500 mx-auto" />
            </motion.div>
            <h3 className="text-xl font-bold text-gray-900">Creating Your Perfect Workout</h3>
            <p className="text-gray-600">Our AI is analyzing your profile and crafting a personalized plan...</p>
          </div>
        </div>
      )}

      {!generatedPlan ? (
        <ProfileSetup 
          onProfileComplete={generateWorkoutPlan}
          existingProfile={userProfile}
        />
      ) : (
        <WorkoutDisplay
          workoutPlan={generatedPlan}
          onSave={saveWorkoutPlan}
          onGenerateNew={generateNewPlan}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}