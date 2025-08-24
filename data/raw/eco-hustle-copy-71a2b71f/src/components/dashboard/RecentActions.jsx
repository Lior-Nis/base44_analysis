import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { 
  Recycle, 
  Bike, 
  Bus, 
  Zap, 
  TreePine, 
  ShoppingBag, 
  Droplets,
  Trash2,
  TrendingUp 
} from "lucide-react";

const actionIcons = {
  recycle: Recycle,
  bike: Bike,
  public_transport: Bus,
  energy_save: Zap,
  plant_tree: TreePine,
  sustainable_purchase: ShoppingBag,
  water_save: Droplets,
  waste_reduce: Trash2,
  walk: TrendingUp
};

const actionColors = {
  recycle: "from-blue-500 to-cyan-600",
  bike: "from-green-500 to-emerald-600",
  public_transport: "from-purple-500 to-indigo-600",
  energy_save: "from-yellow-500 to-orange-600",
  plant_tree: "from-green-600 to-emerald-700",
  sustainable_purchase: "from-pink-500 to-rose-600",
  water_save: "from-cyan-500 to-blue-600",
  waste_reduce: "from-gray-500 to-slate-600",
  walk: "from-indigo-500 to-purple-600"
};

export default function RecentActions({ actions }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Recent Actions</h3>
        <Link
          to={createPageUrl("Actions")}
          className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
        >
          View All
        </Link>
      </div>

      {actions.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-4">No eco actions yet!</p>
          <Link
            to={createPageUrl("Actions")}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
          >
            <Zap className="w-4 h-4" />
            Log Your First Action
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {actions.map((action, index) => {
            const Icon = actionIcons[action.action_type] || Zap;
            const colorClass = actionColors[action.action_type] || "from-emerald-500 to-green-600";
            
            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClass} text-white`}>
                  <Icon className="w-5 h-5" />
                </div>
                
                <div className="flex-1">
                  <p className="font-medium text-gray-900 capitalize">
                    {action.action_type.replace(/_/g, ' ')}
                  </p>
                  <p className="text-sm text-gray-500">
                    {action.description || 'Eco action completed'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {format(new Date(action.created_date), 'MMM d, h:mm a')}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-emerald-600">+{action.points_earned}</p>
                  <p className="text-xs text-gray-500">points</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}