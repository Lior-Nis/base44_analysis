import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Sparkles, Brain, Plus } from "lucide-react";

const commonSubjects = [
  "Mathematics", "Science", "English", "History", 
  "Physics", "Chemistry", "Biology", "Computer Science", "Art"
];

const learningStyles = [
  "Visual", "Auditory", "Kinesthetic", "Reading/Writing", "Mixed"
];

const difficultyLevels = [
  "Beginner", "Intermediate", "Advanced", "Mixed"
];

export default function AIStudyPlanGenerator({ onGenerate, onCancel, generating }) {
  const [preferences, setPreferences] = useState({
    subjects: [],
    weeklyHours: 10,
    goals: [""],
    learningStyle: "",
    difficulty: "",
    customPreferences: ""
  });

  const [newSubject, setNewSubject] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanedPreferences = {
      ...preferences,
      goals: preferences.goals.filter(goal => goal.trim() !== "")
    };
    onGenerate(cleanedPreferences);
  };

  const addSubject = (subject) => {
    if (subject && !preferences.subjects.includes(subject)) {
      setPreferences(prev => ({
        ...prev,
        subjects: [...prev.subjects, subject]
      }));
      setNewSubject("");
    }
  };

  const removeSubject = (subjectToRemove) => {
    setPreferences(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s !== subjectToRemove)
    }));
  };

  const updateGoal = (index, value) => {
    const newGoals = [...preferences.goals];
    newGoals[index] = value;
    setPreferences(prev => ({ ...prev, goals: newGoals }));
  };

  const addGoal = () => {
    setPreferences(prev => ({
      ...prev,
      goals: [...prev.goals, ""]
    }));
  };

  const removeGoal = (index) => {
    setPreferences(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl my-8"
      >
        <Card className="border-0 shadow-2xl bg-gradient-to-br from-purple-50 to-pink-50 backdrop-blur">
          <CardHeader className="pb-4 border-b border-purple-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-600" />
                AI Study Plan Generator
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={onCancel}
                className="hover:bg-purple-100"
                disabled={generating}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-purple-700 text-sm">
              Tell us about your learning preferences and we'll create a personalized study plan
            </p>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Subjects */}
              <div className="space-y-4">
                <Label className="text-sm font-semibold text-gray-700">
                  What subjects do you want to study? *
                </Label>
                
                {/* Current subjects */}
                <div className="flex flex-wrap gap-2">
                  {preferences.subjects.map((subject) => (
                    <Badge key={subject} className="bg-purple-100 text-purple-800 gap-1">
                      {subject}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => removeSubject(subject)}
                      />
                    </Badge>
                  ))}
                </div>

                {/* Add subjects */}
                <div className="flex flex-wrap gap-2">
                  {commonSubjects
                    .filter(s => !preferences.subjects.includes(s))
                    .map(subject => (
                    <Button
                      key={subject}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addSubject(subject)}
                      className="text-xs hover:bg-purple-50"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {subject}
                    </Button>
                  ))}
                </div>

                {/* Custom subject */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom subject..."
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSubject(newSubject);
                      }
                    }}
                    className="border-purple-200 focus:border-purple-500"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addSubject(newSubject)}
                    className="hover:bg-purple-50"
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Weekly Hours */}
              <div className="space-y-2">
                <Label htmlFor="weeklyHours" className="text-sm font-semibold text-gray-700">
                  How many hours per week can you dedicate to studying? *
                </Label>
                <Input
                  id="weeklyHours"
                  type="number"
                  min="1"
                  max="40"
                  value={preferences.weeklyHours}
                  onChange={(e) => setPreferences(prev => ({...prev, weeklyHours: parseInt(e.target.value)}))}
                  className="border-purple-200 focus:border-purple-500"
                  required
                />
              </div>

              {/* Learning Style and Difficulty */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    Preferred Learning Style
                  </Label>
                  <Select
                    value={preferences.learningStyle}
                    onValueChange={(value) => setPreferences(prev => ({...prev, learningStyle: value}))}
                  >
                    <SelectTrigger className="border-purple-200 focus:border-purple-500">
                      <SelectValue placeholder="Select your learning style" />
                    </SelectTrigger>
                    <SelectContent>
                      {learningStyles.map(style => (
                        <SelectItem key={style} value={style}>
                          {style}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">
                    Difficulty Level
                  </Label>
                  <Select
                    value={preferences.difficulty}
                    onValueChange={(value) => setPreferences(prev => ({...prev, difficulty: value}))}
                  >
                    <SelectTrigger className="border-purple-200 focus:border-purple-500">
                      <SelectValue placeholder="Select difficulty level" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyLevels.map(level => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Goals */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-gray-700">
                    What are your study goals?
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addGoal}
                    className="hover:bg-purple-50"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Goal
                  </Button>
                </div>

                <div className="space-y-2">
                  {preferences.goals.map((goal, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={goal}
                        onChange={(e) => updateGoal(index, e.target.value)}
                        placeholder="Enter a study goal..."
                        className="border-purple-200 focus:border-purple-500"
                      />
                      {preferences.goals.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeGoal(index)}
                          className="hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Preferences */}
              <div className="space-y-2">
                <Label htmlFor="customPreferences" className="text-sm font-semibold text-gray-700">
                  Additional Preferences (Optional)
                </Label>
                <Textarea
                  id="customPreferences"
                  value={preferences.customPreferences}
                  onChange={(e) => setPreferences(prev => ({...prev, customPreferences: e.target.value}))}
                  placeholder="Tell us about your schedule, preferred study times, specific challenges, or any other preferences..."
                  className="border-purple-200 focus:border-purple-500 min-h-[80px]"
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-purple-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={generating}
                  className="hover:bg-purple-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={generating || preferences.subjects.length === 0}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg"
                >
                  {generating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate AI Study Plan
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}