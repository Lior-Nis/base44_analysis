import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Briefcase, Sparkles, Zap, Globe } from "lucide-react";
import { motion } from "framer-motion";
import 'leaflet/dist/leaflet.css';

import LiveCampusMap from "../components/campus/LiveCampusMap";
import SkillSwap from "../components/campus/SkillSwap";
import ProjectPartnerFinder from "../components/campus/ProjectPartnerFinder";
import AISuggestions from "../components/campus/AISuggestions";
import { useTheme } from "../components/ui/theme-provider";

const translations = {
  he: {
    dynamicCampus: "קמפוס דינמי",
    liveMap: "מפה חיה",
    skillSwap: "קמפוס כישרונות",
    projectPartners: "שותפים לפרויקטים", 
    aiSuggestions: "הצעות AI",
    welcome: "ברוך הבא לקמפוס הדינמי",
    subtitle: "גלה הזדמנויות לימוד, התחבר עם חברים וצור קשרים חדשים"
  },
  en: {
    dynamicCampus: "Dynamic Campus",
    liveMap: "Live Map",
    skillSwap: "Skill Swap",
    projectPartners: "Project Partners",
    aiSuggestions: "AI Suggestions", 
    welcome: "Welcome to Dynamic Campus",
    subtitle: "Discover learning opportunities, connect with peers and build new relationships"
  }
};

const FloatingCampusElements = () => (
  <>
    {/* Campus-themed floating elements */}
    <motion.div
      className="absolute top-16 right-20 w-72 h-72 bg-gradient-to-r from-cyan-400/15 to-emerald-500/15 rounded-full blur-3xl"
      animate={{
        scale: [1, 1.2, 1],
        x: [0, 20, 0],
        y: [0, -15, 0],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
    
    <motion.div
      className="absolute bottom-24 left-16 w-48 h-48 bg-gradient-to-r from-purple-400/15 to-pink-500/15 rounded-3xl rotate-12 blur-2xl"
      animate={{
        rotate: [12, 45, 12],
        scale: [1, 1.15, 1],
      }}
      transition={{
        duration: 16,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />

    <motion.div
      className="absolute top-1/3 left-1/4 w-32 h-32 bg-gradient-to-r from-orange-400/15 to-yellow-500/15 rounded-full blur-xl"
      animate={{
        x: [0, 40, 0],
        y: [0, -20, 0],
        scale: [1, 1.3, 1],
      }}
      transition={{
        duration: 14,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />

    {/* Network connection lines */}
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-20 bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent"
        style={{
          top: `${20 + Math.random() * 60}%`,
          left: `${15 + Math.random() * 70}%`,
          transform: `rotate(${Math.random() * 360}deg)`,
        }}
        animate={{
          opacity: [0, 0.6, 0],
          scaleY: [0, 1, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          delay: i * 0.5,
          ease: "easeInOut",
        }}
      />
    ))}

    {/* Floating nodes */}
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-3 h-3 bg-gradient-to-r from-cyan-400 to-emerald-500 rounded-full"
        style={{
          top: `${25 + Math.random() * 50}%`,
          left: `${20 + Math.random() * 60}%`,
        }}
        animate={{
          opacity: [0.3, 1, 0.3],
          scale: [0.8, 1.2, 0.8],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          delay: i * 0.3,
          ease: "easeInOut",
        }}
      />
    ))}
  </>
);

export default function Campus() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('liveMap');
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useTheme();

  const t = translations[language || 'en'];

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventJoin = (eventId) => {
    // This function will be called from AI suggestions to join an event
    // We can implement the join logic here or trigger a refresh
    console.log('Joining event:', eventId);
    // For now, just switch to live map tab
    setActiveTab('liveMap');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-cyan-900 to-emerald-900">
      
      {/* Floating Campus Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <FloatingCampusElements />
      </div>
      
      <div className="relative z-10 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-emerald-600/20 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/20 relative">
                <Globe className="w-7 h-7 text-cyan-400" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-emerald-400/20 rounded-xl"
                  animate={{ opacity: [0, 0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                {t.dynamicCampus}
              </h1>
            </div>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              {t.subtitle}
            </p>
          </motion.div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-xl border border-white/20">
              <TabsTrigger 
                value="liveMap" 
                className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
              >
                <MapPin className="w-4 h-4" />
                <span className="hidden sm:inline">{t.liveMap}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="skillSwap"
                className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
              >
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">{t.skillSwap}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="projectPartners"
                className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
              >
                <Briefcase className="w-4 h-4" />
                <span className="hidden sm:inline">{t.projectPartners}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="aiSuggestions"
                className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">{t.aiSuggestions}</span>
              </TabsTrigger>
            </TabsList>

            {/* Live Campus Map */}
            <TabsContent value="liveMap" className="mt-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <LiveCampusMap language={language || 'en'} />
              </motion.div>
            </TabsContent>

            {/* Skill Swap */}
            <TabsContent value="skillSwap" className="mt-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <SkillSwap language={language || 'en'} />
              </motion.div>
            </TabsContent>

            {/* Project Partner Finder */}
            <TabsContent value="projectPartners" className="mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <ProjectPartnerFinder language={language || 'en'} />
              </motion.div>
            </TabsContent>

            {/* AI Suggestions */}
            <TabsContent value="aiSuggestions" className="mt-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl">
                  <CardContent className="p-6">
                    <AISuggestions 
                      language={language || 'en'}
                      onEventJoin={handleEventJoin}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}