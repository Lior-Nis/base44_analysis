import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { WorkoutPlan } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, Plus, AlertCircle, Calendar, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

import PlanCard from "../components/plans/PlanCard";
import WorkoutDisplay from "../components/generator/WorkoutDisplay";

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    filterPlans();
  }, [plans, searchQuery]);

  const loadPlans = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      const userPlans = await WorkoutPlan.filter({created_by: user.email}, "-created_date");
      setPlans(userPlans);
      setError(null);
    } catch (error) {
      setError("Failed to load your workout plans");
    }
    setIsLoading(false);
  };

  const filterPlans = () => {
    if (!searchQuery.trim()) {
      setFilteredPlans(plans);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredPlans(plans.filter(plan => 
        plan.name?.toLowerCase().includes(query) ||
        plan.description?.toLowerCase().includes(query) ||
        plan.user_profile?.primary_goal?.toLowerCase().includes(query)
      ));
    }
  };

  const handleDeletePlan = async () => {
    if (!planToDelete) return;
    
    try {
      await WorkoutPlan.delete(planToDelete.id);
      setPlans(plans.filter(p => p.id !== planToDelete.id));
      setPlanToDelete(null);
    } catch (error) {
      setError("Failed to delete workout plan");
    }
  };

  const getUniqueGoals = () => {
    const goals = new Set();
    plans.forEach(plan => {
      if (plan.user_profile?.primary_goal) {
        goals.add(plan.user_profile.primary_goal);
      }
    });
    return Array.from(goals);
  };

  if (selectedPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 p-6">
        <div className="max-w-6xl mx-auto mb-6">
          <Button
            onClick={() => setSelectedPlan(null)}
            variant="outline"
            className="mb-4"
          >
            ← Back to Plans
          </Button>
        </div>
        <WorkoutDisplay
          workoutPlan={selectedPlan}
          onSave={() => {}}
          onGenerateNew={() => setSelectedPlan(null)}
          isSaving={false}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-emerald-600 bg-clip-text text-transparent">
              My Workout Plans
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Manage and track your personalized fitness routines
            </p>
          </div>
          <Link to={createPageUrl("Generator")}>
            <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-xl">
              <Plus className="w-5 h-5 mr-2" />
              Create New Plan
            </Button>
          </Link>
        </motion.div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search plans by name, description, or goal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-gray-200 focus:border-emerald-300 focus:ring-emerald-200"
              />
            </div>
            {getUniqueGoals().length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-gray-500" />
                {getUniqueGoals().map(goal => (
                  <Badge key={goal} variant="outline" className="text-emerald-700 border-emerald-200">
                    {goal.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Plans Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-2xl h-64"></div>
              </div>
            ))}
          </div>
        ) : filteredPlans.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {plans.length === 0 ? "No workout plans yet" : "No plans match your search"}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {plans.length === 0 
                ? "Create your first personalized workout plan to get started on your fitness journey"
                : "Try adjusting your search terms or create a new plan"
              }
            </p>
            <Link to={createPageUrl("Generator")}>
              <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-xl">
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Plan
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredPlans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PlanCard
                    plan={plan}
                    onView={setSelectedPlan}
                    onDelete={setPlanToDelete}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!planToDelete} onOpenChange={() => setPlanToDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Workout Plan</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{planToDelete?.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPlanToDelete(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeletePlan}>
                Delete Plan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}