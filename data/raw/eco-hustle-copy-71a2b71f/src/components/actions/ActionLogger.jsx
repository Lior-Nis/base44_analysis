import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const actionTypes = [
  { value: "recycle", label: "Recycling", points: 10, co2: 0.5 },
  { value: "bike", label: "Bike Ride", points: 15, co2: 2.1 },
  { value: "public_transport", label: "Public Transport", points: 12, co2: 1.8 },
  { value: "walk", label: "Walking", points: 8, co2: 0.3 },
  { value: "energy_save", label: "Energy Saving", points: 20, co2: 3.2 },
  { value: "plant_tree", label: "Plant Tree", points: 50, co2: 21.8 },
  { value: "sustainable_purchase", label: "Eco Purchase", points: 25, co2: 1.5 },
  { value: "water_save", label: "Water Conservation", points: 15, co2: 0.8 },
  { value: "waste_reduce", label: "Waste Reduction", points: 18, co2: 1.2 }
];

export default function ActionLogger({ onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    action_type: "",
    description: "",
    location: "",
    points_earned: 0,
    co2_saved: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleActionTypeChange = (value) => {
    const selectedAction = actionTypes.find(action => action.value === value);
    setFormData({
      ...formData,
      action_type: value,
      points_earned: selectedAction?.points || 0,
      co2_saved: selectedAction?.co2 || 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.action_type) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md mx-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Log Eco Action</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action Type *
            </label>
            <Select value={formData.action_type} onValueChange={handleActionTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select an action" />
              </SelectTrigger>
              <SelectContent>
                {actionTypes.map((action) => (
                  <SelectItem key={action.value} value={action.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{action.label}</span>
                      <span className="text-emerald-600 font-medium ml-2">+{action.points}pts</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <Textarea
              placeholder="Tell us about your eco action..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <Input
              placeholder="Where did this happen?"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          {formData.action_type && (
            <div className="p-4 bg-emerald-50 rounded-lg">
              <h4 className="font-medium text-emerald-900 mb-2">Impact Preview</h4>
              <div className="flex justify-between text-sm">
                <span className="text-emerald-700">Points Earned:</span>
                <span className="font-medium text-emerald-900">+{formData.points_earned}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-emerald-700">CO₂ Saved:</span>
                <span className="font-medium text-emerald-900">{formData.co2_saved}kg</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!formData.action_type || isSubmitting}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
            >
              {isSubmitting ? "Logging..." : "Log Action"}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}