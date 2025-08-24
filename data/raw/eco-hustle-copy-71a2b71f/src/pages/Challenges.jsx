import React, { useState, useEffect } from "react";
import { Challenge, User } from "@/api/entities";
import { motion } from "framer-motion";
import { Trophy, Users, Calendar, Target, Clock, Gift, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import ChallengeCard from "../components/challenges/ChallengeCard";
import ChallengeDetails from "../components/challenges/ChallengeDetails";
import CreateChallenge from "../components/challenges/CreateChallenge";

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      const allChallenges = await Challenge.list('-created_date');
      setUser(userData);
      setChallenges(allChallenges);
    } catch (error) {
      console.error("Error loading challenges:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinChallenge = async (challenge) => {
    // In a real app, this would create a UserChallenge record
    // For now, we'll just increment participants count
    try {
      await Challenge.update(challenge.id, {
        ...challenge,
        participants: (challenge.participants || 0) + 1
      });
      loadData();
    } catch (error) {
      console.error("Error joining challenge:", error);
    }
  };

  const handleCreateChallenge = async (challengeData) => {
    try {
      await Challenge.create(challengeData);
      setShowCreateChallenge(false);
      loadData();
    } catch (error) {
      console.error("Error creating challenge:", error);
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    if (filter === "all") return true;
    if (filter === "active") {
      const now = new Date();
      const endDate = challenge.end_date ? new Date(challenge.end_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      return endDate > now;
    }
    if (filter === "my") {
      // In a real app, check if user has joined this challenge
      return challenge.created_by === user?.email;
    }
    return challenge.category === filter;
  });

  const sortedChallenges = filteredChallenges.sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.created_date) - new Date(a.created_date);
      case "popular":
        return (b.participants || 0) - (a.participants || 0);
      case "reward":
        return (b.reward_points || 0) - (a.reward_points || 0);
      case "ending":
        const aEnd = a.end_date ? new Date(a.end_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        const bEnd = b.end_date ? new Date(b.end_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        return aEnd - bEnd;
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="bg-white/60 rounded-2xl p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded-lg w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded-lg w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-500 to-orange-600 bg-clip-text text-transparent">
            Eco Challenges
          </h1>
          <p className="text-gray-600 mt-1">Join challenges, compete with others, and earn bonus rewards</p>
        </div>
        <Button
          onClick={() => setShowCreateChallenge(true)}
          className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white shadow-lg"
        >
          <Trophy className="w-4 h-4 mr-2" />
          Create Challenge
        </Button>
      </div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-600">{challenges.length}</div>
          <div className="text-sm text-gray-600">Total Challenges</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-green-200">
          <div className="text-2xl font-bold text-green-600">
            {challenges.filter(c => {
              const now = new Date();
              const endDate = c.end_date ? new Date(c.end_date) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
              return endDate > now;
            }).length}
          </div>
          <div className="text-sm text-gray-600">Active Now</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">
            {challenges.reduce((sum, c) => sum + (c.participants || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Total Participants</div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">
            {challenges.reduce((sum, c) => sum + (c.reward_points || 0), 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Rewards</div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-4 mb-6"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Challenges</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="my">My Challenges</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="special">Special</SelectItem>
              <SelectItem value="community">Community</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="reward">Highest Reward</SelectItem>
            <SelectItem value="ending">Ending Soon</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Challenges Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {sortedChallenges.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No challenges found</h3>
            <p className="text-gray-500 mb-6">Be the first to create an eco challenge!</p>
            <Button
              onClick={() => setShowCreateChallenge(true)}
              className="bg-gradient-to-r from-yellow-500 to-orange-600"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Create First Challenge
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedChallenges.map((challenge, index) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ChallengeCard
                  challenge={challenge}
                  onJoin={() => handleJoinChallenge(challenge)}
                  onViewDetails={() => setSelectedChallenge(challenge)}
                  user={user}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Challenge Details Modal */}
      {selectedChallenge && (
        <ChallengeDetails
          challenge={selectedChallenge}
          onClose={() => setSelectedChallenge(null)}
          onJoin={() => handleJoinChallenge(selectedChallenge)}
          user={user}
        />
      )}

      {/* Create Challenge Modal */}
      {showCreateChallenge && (
        <CreateChallenge
          onSubmit={handleCreateChallenge}
          onClose={() => setShowCreateChallenge(false)}
        />
      )}
    </div>
  );
}