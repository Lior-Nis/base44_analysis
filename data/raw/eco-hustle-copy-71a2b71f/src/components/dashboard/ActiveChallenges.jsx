import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { Trophy, Users, Calendar, Target } from "lucide-react";
import { format } from "date-fns";

export default function ActiveChallenges({ challenges }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Active Challenges</h3>
        <Link
          to={createPageUrl("Challenges")}
          className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
        >
          View All
        </Link>
      </div>

      {challenges.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-4">No active challenges</p>
          <Link
            to={createPageUrl("Challenges")}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
          >
            <Trophy className="w-4 h-4" />
            Browse Challenges
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {challenges.slice(0, 3).map((challenge, index) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg">
                    <Trophy className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{challenge.title}</h4>
                    <p className="text-sm text-gray-600">{challenge.description}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Target className="w-4 h-4" />
                    <span>{challenge.target_points} pts</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>{challenge.participants || 0}</span>
                  </div>
                </div>
                <div className="text-yellow-600 font-medium">
                  +{challenge.reward_points} bonus
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}