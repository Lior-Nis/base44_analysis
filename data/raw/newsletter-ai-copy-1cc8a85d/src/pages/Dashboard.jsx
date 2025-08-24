
import React, { useState, useEffect } from "react";
import { UserProfile, Newsletter, SentEmail, User } from "@/api/entities";
import { PenTool, Sparkles, ArrowRight, Zap, Target, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import WelcomeWizard from "../components/onboarding/WelcomeWizard";
import StatsOverview from "../components/dashboard/StatsOverview";
import RecentContent from "../components/dashboard/RecentContent";

export default function Dashboard() {
  const [userProfile, setUserProfile] = useState(null);
  const [newsletters, setNewsletters] = useState([]);
  const [sentEmails, setSentEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      
      const profiles = await UserProfile.filter({ created_by: user.email });
      
      if (profiles.length === 0) {
        setShowWizard(true);
      } else {
        setUserProfile(profiles[0]);
        const newsletterData = await Newsletter.filter({ created_by: user.email }, '-created_date');
        const emailData = await SentEmail.filter({ created_by: user.email }, '-sent_date');
        setNewsletters(newsletterData);
        setSentEmails(emailData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handleWizardComplete = async (formData) => {
    try {
      const profile = await UserProfile.create(formData);
      setUserProfile(profile);
      setShowWizard(false);
    } catch (error) {
      console.error("Error creating profile:", error);
    }
  };

  const handleEditNewsletter = (newsletter) => {
    navigate(`${createPageUrl("Planner")}?edit=${newsletter.id}`);
  };

  const handleSendNewsletter = (newsletter) => {
    navigate(`${createPageUrl("Send")}?newsletter=${newsletter.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (showWizard) {
    return <WelcomeWizard onComplete={handleWizardComplete} />;
  }

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-7xl font-black text-gray-900 leading-tight">
                Let's make your dream a{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500">
                  reality.
                </span>
              </h1>
              <h2 className="text-6xl md:text-7xl font-black text-gray-900">Right now.</h2>
              <p className="text-gray-700 text-xl font-medium max-w-2xl leading-relaxed">
                Ready to create amazing content about{" "}
                <span className="text-gray-900 font-semibold">{userProfile?.field_of_knowledge}</span>?
                Your AI-powered newsletter assistant is ready to help.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate(createPageUrl("Planner"))}
                className="group px-8 py-4 bg-black text-white rounded-full font-bold text-lg hover:bg-gray-800 transition-all duration-300 flex items-center gap-3 shadow-2xl"
              >
                <Zap className="w-6 h-6 group-hover:scale-110 transition-transform" />
                Start building
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </motion.div>

        <StatsOverview newsletters={newsletters} sentEmails={sentEmails} />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RecentContent 
              newsletters={newsletters}
              onEdit={handleEditNewsletter}
              onSend={handleSendNewsletter}
            />
          </div>

          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-3xl p-8 border border-gray-200"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Target className="w-6 h-6" />
                Quick Actions
              </h3>
              <div className="space-y-4">
                <button
                  onClick={() => navigate(createPageUrl("Planner"))}
                  className="w-full text-left px-6 py-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all duration-300 border border-gray-200 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl">
                      <PenTool className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 text-lg block">Generate Content Plan</span>
                      <span className="text-gray-600 text-sm">Create your next newsletter</span>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => navigate(createPageUrl("Send"))}
                  className="w-full text-left px-6 py-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all duration-300 border border-gray-200 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                      <Sparkles className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 text-lg block">Send Newsletter</span>
                      <span className="text-gray-600 text-sm">Reach your audience</span>
                    </div>
                  </div>
                </button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card rounded-3xl p-8 border border-gray-200"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <TrendingUp className="w-6 h-6" />
                Your Profile
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">Field of Expertise</p>
                  <p className="font-bold text-gray-900 text-lg">{userProfile?.field_of_knowledge}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">Publishing Schedule</p>
                  <p className="font-bold text-gray-900 text-lg capitalize">{userProfile?.frequency}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">Topics ({userProfile?.topics?.length || 0})</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {userProfile?.topics?.slice(0, 3).map((topic) => (
                      <span key={topic} className="text-xs bg-gray-100 text-gray-800 px-4 py-2 rounded-full font-semibold border border-gray-200">
                        {topic}
                      </span>
                    ))}
                    {userProfile?.topics?.length > 3 && (
                      <span className="text-xs bg-gray-100 text-gray-800 px-4 py-2 rounded-full font-semibold border border-gray-200">
                        +{userProfile.topics.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
