import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Users,
  User as UserIcon,
  HelpCircle,
  Star
} from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardPreLaunchView({ user, onTriageClick, onProfileClick, onWaitingListClick }) {
  const FADE_IN_VARIANTS = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: 0.1 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      {/* Welcome & Status Card */}
      <motion.div variants={FADE_IN_VARIANTS} className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Welcome to your Dashboard, {user?.full_name?.split(' ')[0]}!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              We're putting the finishing touches on HomeScope and will be launching very soon. 
              As a member, you'll get first access to our expert consultations.
            </p>
            {user?.is_on_waiting_list ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
                <Users className="w-6 h-6 text-green-600" />
                <div>
                  <h4 className="font-semibold text-green-800">You're on the Waiting List!</h4>
                  <p className="text-sm text-green-700">We'll notify you the moment we launch.</p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center space-x-3">
                <HelpCircle className="w-6 h-6 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-blue-800">Don't miss out!</h4>
                  <p className="text-sm text-blue-700">Join our waiting list to get launch notifications and exclusive offers.</p>
                  <Button size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700" onClick={onWaitingListClick}>
                    Join Now
                  </Button>
                </div>
              </div>
            )}
            {user?.has_claimed_launch_offer && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center space-x-3">
                <Star className="w-6 h-6 text-yellow-500" />
                <div>
                  <h4 className="font-semibold text-yellow-800">Launch Offer Secured!</h4>
                  <p className="text-sm text-yellow-700">You've successfully claimed the 50% discount for your first consultation.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions Card */}
      <motion.div variants={FADE_IN_VARIANTS}>
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={onTriageClick}
              disabled={user?.has_used_ai_triage}
            >
              <Zap className="w-4 h-4 mr-2" />
              {user?.has_used_ai_triage ? 'AI Triage Demo Used' : 'Try AI Triage Demo'}
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={onProfileClick}>
              <UserIcon className="w-4 h-4 mr-2" />
              Update Your Profile
            </Button>
            {!user?.is_on_waiting_list && (
              <Button className="w-full justify-start bg-green-600 hover:bg-green-700" onClick={onWaitingListClick}>
                <Users className="w-4 h-4 mr-2" />
                Join Waiting List
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}