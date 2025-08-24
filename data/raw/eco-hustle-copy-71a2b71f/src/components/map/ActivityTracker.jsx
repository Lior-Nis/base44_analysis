import React from "react";
import { motion } from "framer-motion";
import { Play, Recycle, TreePine, Trash2, Sprout, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const activities = [
  {
    id: "litter_pickup",
    label: "Litter Pickup",
    icon: Trash2,
    description: "Clean up trash in your area",
    basePoints: 2, // points per minute
    color: "from-emerald-500 to-green-600"
  },
  {
    id: "tree_planting",
    label: "Tree Planting",
    icon: TreePine,
    description: "Plant trees and vegetation",
    basePoints: 5,
    color: "from-green-600 to-emerald-700"
  },
  {
    id: "recycling_drive",
    label: "Recycling Drive",
    icon: Recycle,
    description: "Organize recycling collection",
    basePoints: 3,
    color: "from-blue-500 to-cyan-600"
  },
  {
    id: "community_garden",
    label: "Community Garden",
    icon: Sprout,
    description: "Tend to community gardens",
    basePoints: 4,
    color: "from-yellow-500 to-orange-600"
  },
  {
    id: "nature_walk",
    label: "Nature Walk",
    icon: MapPin,
    description: "Educational nature walking",
    basePoints: 1,
    color: "from-purple-500 to-indigo-600"
  }
];

export default function ActivityTracker({ onStartTracking, selectedActivity, setSelectedActivity }) {
  const selectedActivityData = activities.find(a => a.id === selectedActivity);

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 border border-emerald-200 shadow-xl"
    >
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Start Eco Activity</h3>
        <p className="text-sm text-gray-600">
          Choose an activity to track your impact and earn points
        </p>
      </div>

      {/* Activity Selection */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {activities.map((activity) => {
          const isSelected = selectedActivity === activity.id;
          return (
            <motion.button
              key={activity.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedActivity(activity.id)}
              className={`p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 bg-white hover:border-emerald-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-lg bg-gradient-to-r ${activity.color} text-white`}>
                  <activity.icon className="w-4 h-4" />
                </div>
                <span className="font-medium text-sm">{activity.label}</span>
              </div>
              <p className="text-xs text-gray-600">{activity.description}</p>
              <p className="text-xs text-emerald-600 font-medium mt-1">
                +{activity.basePoints} pts/min
              </p>
            </motion.button>
          );
        })}
      </div>

      {/* Selected Activity Info */}
      {selectedActivityData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-emerald-50 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${selectedActivityData.color} text-white`}>
              <selectedActivityData.icon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-emerald-900">{selectedActivityData.label}</h4>
              <p className="text-sm text-emerald-700">{selectedActivityData.description}</p>
            </div>
          </div>
          <div className="text-sm text-emerald-800">
            <span className="font-medium">Earning Rate:</span> {selectedActivityData.basePoints} points per minute + area bonus
          </div>
        </motion.div>
      )}

      {/* Start Button */}
      <Button
        onClick={() => onStartTracking(selectedActivity)}
        className={`w-full bg-gradient-to-r ${selectedActivityData?.color || 'from-emerald-500 to-green-600'} hover:shadow-lg transition-all duration-300`}
        size="lg"
      >
        <Play className="w-5 h-5 mr-2" />
        Start {selectedActivityData?.label || 'Activity'}
      </Button>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Your location will be tracked to calculate area coverage and award points
        </p>
      </div>
    </motion.div>
  );
}