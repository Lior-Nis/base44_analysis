
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  User as UserIcon,
  Download,
  MessageSquare,
  Phone,
  Clock,
  CheckCircle,
  Zap,
  Settings,
  FileText,
  Bell,
  LogOut,
  Star,
  Users // Added for pre-launch waiting list section
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { User as UserEntity } from "@/api/entities";
import { Appointment } from "@/api/entities"; // Keeping import, but not actively used for pre-launch
import { EmailSubscriber } from "@/api/entities"; // Keeping import, but not actively used for pre-launch
import { SendEmail } from "@/api/integrations"; // Keeping import, but not actively used for pre-launch
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import WelcomeOnboarding from "../components/dashboard/WelcomeOnboarding";
import AppointmentsList from "../components/dashboard/AppointmentsList";
import UserProfile from "../components/dashboard/UserProfile";
import BookingModal from "../components/booking/BookingModal";
import AITriageModal from "../components/triage/AITriageModal";
import CompleteProfileModal from "../components/auth/CompleteProfileModal";
import DashboardOnboardingGuide from "../components/dashboard/DashboardOnboardingGuide";
import WaitingListModal from "../components/waitlist/WaitingListModal"; // New import
import DashboardPreLaunchView from "../components/dashboard/DashboardPreLaunchView"; // New import

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showTriageModal, setShowTriageModal] = useState(false);
  const [showWaitingListModal, setShowWaitingListModal] = useState(false); // New state
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showOnboardingGuide, setShowOnboardingGuide] = useState(false);
  const [reviewsNeeded, setReviewsNeeded] = useState([]);
  const [hasActiveStandardConsultation, setHasActiveStandardConsultation] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await UserEntity.me();
      setUser(currentUser);

      // Check if this is a new user (created in last 5 minutes)
      const userCreatedTime = new Date(currentUser.created_date);
      const now = new Date();
      const timeDiff = (now - userCreatedTime) / (1000 * 60); // minutes
      const isNewUserFlag = timeDiff < 5;
      
      setIsNewUser(isNewUserFlag);

      // New logic: Check if new user needs to complete their profile
      if (isNewUserFlag && (!currentUser.property_type || !currentUser.tenant_or_owner)) {
        setShowCompleteProfileModal(true);
        setShowWelcome(false); // Hide welcome banner if profile modal is shown
        setShowOnboardingGuide(false); // Hide onboarding guide if profile modal is shown
      } else if (isNewUserFlag) {
        // If they are a new user but have completed the profile, just show welcome banner
        setShowWelcome(true);
        // And if they haven't seen the guide, show it.
        if (!currentUser.has_completed_onboarding) {
          setShowOnboardingGuide(true);
          setShowWelcome(false); // Hide welcome if onboarding guide is shown
        } else {
          setShowOnboardingGuide(false);
        }
      } else {
        setShowWelcome(false); // For existing users, welcome banner is not shown
        setShowOnboardingGuide(false); // For existing users, onboarding guide is not shown
      }

      // --- Pre-Launch Specific Changes: Appointments are not available yet ---
      setAppointments([]); // No appointments for pre-launch
      setReviewsNeeded([]); // No reviews needed
      setHasActiveStandardConsultation(false); // No active consultations

      // Pre-launch phase: No welcome email is sent on registration from client-side
      // Users join the waiting list explicitly.
      // The `has_received_welcome` flag for the user entity is not updated here.

    } catch (error) {
      console.error("Error loading user data:", error);
      // Redirect to login if not authenticated
      window.location.href = '/';
    }
    setIsLoading(false);
  };

  // Removed sendWelcomeEmail function as it's tied to post-launch email automation.

  const handleProfileCompletionSuccess = () => {
    setShowCompleteProfileModal(false);
    setShowWelcome(false); // Hide welcome banner if profile modal is shown, in favor of guide
    // After completing profile, show the onboarding guide
    setShowOnboardingGuide(true);
    loadUserData(); // Refresh user data to get the latest profile info
  };

  const handleGuideComplete = async () => {
    setShowOnboardingGuide(false);
    try {
      await UserEntity.updateMyUserData({ has_completed_onboarding: true });
      // Update user state locally to prevent re-showing the guide on this session
      setUser(prev => ({...prev, has_completed_onboarding: true}));
    } catch(error) {
      console.error("Failed to update onboarding status", error);
    }
  };

  const handleBookingSuccess = () => {
    // This function is technically not used anymore by BookingModal's confirm action
    // but might be kept if other parts of the app use it.
    setShowBookingModal(false);
    loadUserData(); // Refresh appointments (though appointments are currently empty for pre-launch)
  };

  const handleBookingConfirm = (details) => {
    // Funnel the user to the waiting list instead of payment
    setShowBookingModal(false);
    setShowWaitingListModal(true);
  };

  const handleTriageBookingRequest = () => {
    setShowTriageModal(false);
    // For pre-launch, direct booking from AI Triage goes to waiting list
    setShowWaitingListModal(true);
    // After a successful AI Triage demo, mark user as having used it
    if (user && !user.has_used_ai_triage) {
      UserEntity.updateMyUserData({ has_used_ai_triage: true })
        .then(() => {
          setUser(prev => ({ ...prev, has_used_ai_triage: true }));
        })
        .catch(error => console.error("Failed to update AI Triage usage status", error));
    }
  };

  const getUpcomingAppointments = () => {
    return []; // No upcoming appointments for pre-launch
  };

  const getRecentAppointments = () => {
    return []; // No recent appointments for pre-launch
  };

  const handleLogout = async () => {
    try {
      await UserEntity.logout();
      window.location.href = createPageUrl('Home');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20"> {/* Taller Header */}
            <Link to={createPageUrl('Home')} className="flex items-center">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/52d7270f2_homescope_logo_transparent.png" 
                alt="HomeScope Logo" 
                className="h-16 w-auto object-contain"
              />
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 hidden sm:block">Welcome, {user?.full_name}!</span>
              <Button 
                onClick={() => setShowTriageModal(true)}
                variant="outline" 
                size="sm"
                disabled={user?.has_used_ai_triage}
              >
                <Zap className="w-4 h-4 mr-2" />
                AI Triage
              </Button>
              <Button 
                onClick={() => setShowBookingModal(true)}
                size="sm" 
                className="bg-green-600 hover:bg-green-700"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Book Expert
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Onboarding */}
        {showWelcome && !showOnboardingGuide && (
          <WelcomeOnboarding 
            user={user}
            onDismiss={() => setShowWelcome(false)}
            onBookingClick={() => setShowBookingModal(true)}
            onTriageClick={() => setShowTriageModal(true)}
          />
        )}

        {/* Main Dashboard - Don't show if profile modal is open or onboarding guide is open */}
        {!showCompleteProfileModal && !showOnboardingGuide && (
          <div className="space-y-8">
            {/* Pre-Launch Banner */}
            <Card className="border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <Bell className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-800">
                        Welcome to HomeScope! 🚀
                      </h3>
                      <p className="text-blue-700">
                        {user?.is_on_waiting_list 
                          ? "You're on our waiting list! We're launching soon and you'll be among the first to access expert consultations."
                          : "We're launching soon! Join our waiting list to be first in line for expert home consultations."
                        }
                      </p>
                    </div>
                  </div>
                  {!user?.is_on_waiting_list && (
                    <Button 
                      onClick={() => setShowWaitingListModal(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
                    >
                      Join Waiting List
                    </Button>
                  )}
                  {user?.is_on_waiting_list && (
                    <Badge className="bg-blue-600 text-white px-4 py-2 text-sm font-medium">
                      ON WAITING LIST
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                {/* <TabsTrigger value="appointments">Appointments</TabsTrigger> Removed for pre-launch */}
                <TabsTrigger value="profile">Profile</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <DashboardPreLaunchView
                    user={user}
                    onTriageClick={() => setShowTriageModal(true)}
                    onProfileClick={() => setActiveTab('profile')}
                    onWaitingListClick={() => setShowWaitingListModal(true)}
                />
              </TabsContent>

              {/* <TabsContent value="appointments"> Removed for pre-launch
                <AppointmentsList appointments={appointments} onRefresh={loadUserData} />
              </TabsContent> */}

              <TabsContent value="profile">
                <UserProfile user={user} onUpdate={loadUserData} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* Modals */}
      {showOnboardingGuide && user && (
        <DashboardOnboardingGuide 
          user={user}
          onGuideComplete={handleGuideComplete}
        />
      )}
      <CompleteProfileModal
        isOpen={showCompleteProfileModal}
        user={user}
        onSuccess={handleProfileCompletionSuccess}
      />
      <BookingModal 
        isOpen={showBookingModal} 
        onClose={() => setShowBookingModal(false)}
        onConfirm={handleBookingConfirm} // Changed from onSuccess
      />
      
      <AITriageModal 
        isOpen={showTriageModal} 
        onClose={() => setShowTriageModal(false)}
        onBookingRequested={handleTriageBookingRequest}
        user={user}
      />

      {/* New Waiting List Modal */}
      <WaitingListModal
        isOpen={showWaitingListModal}
        onClose={() => setShowWaitingListModal(false)}
        preFilledEmail={user?.email || ""}
        preFilledName={user?.full_name || ""}
      />
    </div>
  );
}
