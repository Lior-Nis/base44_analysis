
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { motion } from "framer-motion";
import { 
  User as UserIcon, 
  Trophy, 
  Leaf, 
  Zap, 
  Award,
  Share2,
  QrCode,
  Copy,
  Gift,
  Users,
  Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import AmbassadorHub from "../components/profile/AmbassadorHub";
import AchievementShowcase from "../components/profile/AchievementShowcase";
import ProfileStats from "../components/profile/ProfileStats";
import SuggestionBox from "../components/profile/SuggestionBox";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: "",
    profile_image: ""
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      setProfileData({
        full_name: userData.full_name || "",
        profile_image: userData.profile_image || ""
      });
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await User.updateMyUserData(profileData);
      setIsEditing(false);
      loadProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        {Array(4).fill(0).map((_, i) => (
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
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
          My Profile
        </h1>
        <p className="text-gray-600 mt-1">Manage your eco journey and ambassador status</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100 text-center"
          >
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
                {user.profile_image ? (
                  <img 
                    src={user.profile_image} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-12 h-12 text-white" />
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center border-2 border-white">
                <Crown className="w-4 h-4 text-white" />
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <Input
                  placeholder="Full Name"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                />
                <Input
                  placeholder="Profile Image URL"
                  value={profileData.profile_image}
                  onChange={(e) => setProfileData({...profileData, profile_image: e.target.value})}
                />
                <div className="flex gap-2">
                  <Button onClick={handleSaveProfile} className="flex-1 bg-emerald-600">
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  {user.full_name || "Eco Hustler"}
                </h2>
                <p className="text-emerald-600 font-medium mb-2">Ambassador Level {user.level || 1}</p>
                <p className="text-sm text-gray-600 mb-4">{user.email}</p>
                <Button 
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                >
                  Edit Profile
                </Button>
              </div>
            )}
          </motion.div>

          {/* Quick Stats */}
          <ProfileStats user={user} />
        </div>

        {/* Right Column - Ambassador Hub & Achievements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ambassador Hub */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AmbassadorHub user={user} />
          </motion.div>

          {/* Achievement Showcase */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <AchievementShowcase user={user} />
          </motion.div>
          
          {/* Suggestion Box */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <SuggestionBox />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
