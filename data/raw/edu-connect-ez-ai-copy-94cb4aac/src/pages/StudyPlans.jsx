import React, { useState, useEffect } from "react";
import { StudyPlan } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Plus, Target, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import StudyPlanForm from "../components/studyplans/StudyPlanForm";
import StudyPlanCard from "../components/studyplans/StudyPlanCard";
import AIStudyPlanGenerator from "../components/studyplans/AIStudyPlanGenerator";

export default function StudyPlans() {
  const [studyPlans, setStudyPlans] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadStudyPlans();
  }, []);

  const loadStudyPlans = async () => {
    try {
      const data = await StudyPlan.list("-created_date");
      setStudyPlans(data);
    } catch (error) {
      console.error("Failed to load study plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (planData) => {
    try {
      if (editingPlan) {
        await StudyPlan.update(editingPlan.id, planData);
      } else {
        await StudyPlan.create(planData);
      }
      setShowForm(false);
      setEditingPlan(null);
      loadStudyPlans();
    } catch (error) {
      console.error("Failed to save study plan:", error);
    }
  };

  const handleAIGenerate = async (preferences) => {
    setGenerating(true);
    try {
      const prompt = `Create a personalized study plan based on these preferences:
      - Subjects: ${preferences.subjects.join(', ')}
      - Available hours per week: ${preferences.weeklyHours}
      - Study goals: ${preferences.goals.join(', ')}
      - Learning style: ${preferences.learningStyle}
      - Difficulty level: ${preferences.difficulty}
      
      Generate a comprehensive weekly study plan with daily tasks, time allocation, and specific recommendations.`;

      const response = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            name: { type: "string" },
            subjects: { type: "array", items: { type: "string" } },
            weekly_hours: { type: "number" },
            goals: { type: "array", items: { type: "string" } },
            daily_tasks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "string" },
                  tasks: { type: "array", items: { type: "string" } },
                  duration: { type: "number" }
                }
              }
            }
          }
        }
      });

      await StudyPlan.create({
        ...response,
        active: true
      });

      setShowAIGenerator(false);
      loadStudyPlans();
    } catch (error) {
      console.error("Failed to generate AI study plan:", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setShowForm(true);
  };

  const handleDelete = async (planId) => {
    try {
      await StudyPlan.delete(planId);
      loadStudyPlans();
    } catch (error) {
      console.error("Failed to delete study plan:", error);
    }
  };

  const handleToggleActive = async (planId, active) => {
    try {
      await StudyPlan.update(planId, { active });
      loadStudyPlans();
    } catch (error) {
      console.error("Failed to update study plan:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Study Plans
          </h1>
          <p className="text-gray-600 text-lg">
            Organize your learning journey with structured study schedules
          </p>
          
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => setShowAIGenerator(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              AI Generate Plan
            </Button>
            
            <Button
              onClick={() => setShowForm(true)}
              variant="outline"
              className="border-purple-200 hover:bg-purple-50 text-purple-700"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Manual Plan
            </Button>
          </div>
        </div>

        {/* Modals */}
        <AnimatePresence>
          {showForm && (
            <StudyPlanForm
              studyPlan={editingPlan}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingPlan(null);
              }}
            />
          )}
          
          {showAIGenerator && (
            <AIStudyPlanGenerator
              onGenerate={handleAIGenerate}
              onCancel={() => setShowAIGenerator(false)}
              generating={generating}
            />
          )}
        </AnimatePresence>

        {/* Study Plans Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white rounded-2xl p-6 h-80 shadow-lg">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-2 bg-gray-200 rounded"></div>
                      <div className="h-2 bg-gray-200 rounded"></div>
                      <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : studyPlans.length > 0 ? (
              studyPlans.map((plan) => (
                <StudyPlanCard
                  key={plan.id}
                  studyPlan={plan}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleActive={handleToggleActive}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Target className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No study plans yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Create your first study plan to organize your learning schedule
                </p>
                <Button
                  onClick={() => setShowAIGenerator(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get Started with AI
                </Button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}