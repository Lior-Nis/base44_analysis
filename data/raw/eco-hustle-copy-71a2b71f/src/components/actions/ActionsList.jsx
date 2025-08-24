import React from "react";
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
  TrendingUp,
  MapPin,
  CheckCircle 
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

export default function ActionsList({ actions, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="bg-white/60 rounded-2xl p-6 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded-lg w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded-lg w-2/3"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded-lg w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Your Eco Actions</h3>
      
      {actions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-10 h-10 text-gray-400" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No actions logged yet</h4>
          <p className="text-gray-500 mb-6">Start your eco journey by logging your first sustainable action!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {actions.map((action, index) => {
            const Icon = actionIcons[action.action_type] || Zap;
            const colorClass = actionColors[action.action_type] || "from-emerald-500 to-green-600";
            
            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 hover:shadow-md transition-all duration-300"
              >
                <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClass} text-white shadow-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 capitalize">
                      {action.action_type.replace(/_/g, ' ')}
                    </h4>
                    {action.verified && (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                  
                  {action.description && (
                    <p className="text-sm text-gray-600 mb-1">{action.description}</p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{format(new Date(action.created_date), 'MMM d, h:mm a')}</span>
                    {action.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{action.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-emerald-600">+{action.points_earned}</span>
                    <span className="text-xs text-gray-500">pts</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {action.co2_saved?.toFixed(1)}kg CO₂
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}