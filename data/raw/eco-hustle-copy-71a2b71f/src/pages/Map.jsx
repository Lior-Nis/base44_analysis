import React, { useState, useEffect } from "react";
import { CleanupSession, User } from "@/api/entities";
import { motion } from "framer-motion";
import { 
  Play, 
  Square, 
  Users, 
  Trophy, 
  Filter,
  Camera,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";

import MapView from "../components/map/MapView";
import ActivityTracker from "../components/map/ActivityTracker";
import SessionHistory from "../components/map/SessionHistory";
import CommunityLeaderboard from "../components/map/CommunityLeaderboard";

export default function MapPage() {
  const [sessions, setSessions] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState("community"); // community, personal, tracking
  const [selectedActivity, setSelectedActivity] = useState("litter_pickup");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      const allSessions = await CleanupSession.list('-created_date', 100);
      setUser(userData);
      setSessions(allSessions);
    } catch (error) {
      console.error("Error loading map data:", error);
    }
  };

  const startTracking = async (activityType) => {
    setSelectedActivity(activityType);
    setIsTracking(true);
    setViewMode("tracking");
    
    const newSession = {
      activity_type: activityType,
      start_time: new Date().toISOString(),
      route_coordinates: [],
      coverage_area: [],
      points_earned: 0,
      area_covered_sqft: 0
    };
    
    setCurrentSession(newSession);
  };

  const stopTracking = async (sessionData) => {
    try {
      const completedSession = await CleanupSession.create(sessionData);
      
      // Update user points
      const updatedPoints = (user.points || 0) + sessionData.points_earned;
      await User.updateMyUserData({
        points: updatedPoints,
        level: Math.floor(updatedPoints / 100) + 1
      });

      setIsTracking(false);
      setCurrentSession(null);
      setViewMode("community");
      loadData();
    } catch (error) {
      console.error("Error saving session:", error);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-lg border-b border-emerald-100 p-4 flex items-center justify-between z-10">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
            EcoMap
          </h1>
          <p className="text-sm text-gray-600">Track your impact, see the community</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "community" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("community")}
            className={viewMode === "community" ? "bg-emerald-600" : ""}
          >
            <Users className="w-4 h-4 mr-1" />
            Community
          </Button>
          <Button
            variant={viewMode === "personal" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("personal")}
            className={viewMode === "personal" ? "bg-emerald-600" : ""}
          >
            <Trophy className="w-4 h-4 mr-1" />
            My Areas
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        <MapView
          sessions={sessions}
          currentSession={currentSession}
          viewMode={viewMode}
          user={user}
        />

        {/* Activity Tracker Overlay */}
        {!isTracking && viewMode !== "tracking" && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute bottom-4 left-4 right-4 md:left-auto md:w-80"
          >
            <ActivityTracker
              onStartTracking={startTracking}
              selectedActivity={selectedActivity}
              setSelectedActivity={setSelectedActivity}
            />
          </motion.div>
        )}

        {/* Live Tracking Controls */}
        {isTracking && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute bottom-4 left-4 right-4 md:left-auto md:w-80"
          >
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 border border-emerald-200 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-gray-900">Recording Session</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Add photo functionality here
                  }}
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">00:05:23</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Area Covered:</span>
                  <span className="font-medium">1,247 sq ft</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Points Earning:</span>
                  <span className="font-medium text-emerald-600">+24 pts</span>
                </div>
              </div>
              
              <Button
                onClick={() => stopTracking(currentSession)}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop & Save Session
              </Button>
            </div>
          </motion.div>
        )}

        {/* Community Leaderboard */}
        {viewMode === "community" && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="absolute top-4 left-4 w-72 max-h-96 overflow-hidden"
          >
            <CommunityLeaderboard sessions={sessions} />
          </motion.div>
        )}

        {/* Session History */}
        {viewMode === "personal" && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="absolute top-4 left-4 w-72 max-h-96 overflow-auto"
          >
            <SessionHistory sessions={sessions.filter(s => s.created_by === user?.email)} />
          </motion.div>
        )}
      </div>
    </div>
  );
}