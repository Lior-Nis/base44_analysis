import React, { useState, useEffect } from "react";
import { EcoAction, User } from "@/api/entities";
import { motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import ActionLogger from "../components/actions/ActionLogger";
import ActionsList from "../components/actions/ActionsList";
import ActionStats from "../components/actions/ActionStats";

export default function ActionsPage() {
  const [actions, setActions] = useState([]);
  const [showLogger, setShowLogger] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      const userActions = await EcoAction.filter({ created_by: userData.email }, '-created_date');
      setUser(userData);
      setActions(userActions);
    } catch (error) {
      console.error("Error loading actions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionLogged = async (actionData) => {
    try {
      const newAction = await EcoAction.create(actionData);
      
      // Update user points
      const updatedPoints = (user.points || 0) + actionData.points_earned;
      const updatedCO2 = (user.co2_saved || 0) + (actionData.co2_saved || 0);
      
      await User.updateMyUserData({
        points: updatedPoints,
        co2_saved: updatedCO2,
        level: Math.floor(updatedPoints / 100) + 1
      });

      setShowLogger(false);
      loadData(); // Reload to get updated data
    } catch (error) {
      console.error("Error logging action:", error);
    }
  };

  const filteredActions = actions.filter(action =>
    action.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (action.description && action.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
            Eco Actions
          </h1>
          <p className="text-gray-600 mt-1">Track your sustainable activities and earn points</p>
        </div>
        <Button
          onClick={() => setShowLogger(true)}
          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Log Action
        </Button>
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <ActionStats actions={actions} user={user} />
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search your actions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/80 backdrop-blur-sm border-emerald-200 focus:border-emerald-500"
          />
        </div>
      </motion.div>

      {/* Actions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <ActionsList actions={filteredActions} isLoading={isLoading} />
      </motion.div>

      {/* Action Logger Modal */}
      {showLogger && (
        <ActionLogger
          onSubmit={handleActionLogged}
          onClose={() => setShowLogger(false)}
        />
      )}
    </div>
  );
}