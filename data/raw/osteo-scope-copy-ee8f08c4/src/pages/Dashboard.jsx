
import React, { useState, useEffect } from "react";
import { XRayAnalysis } from "@/api/entities";
import { Patient } from "@/api/entities";
import { User } from "@/api/entities"; // Added User entity import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Activity, 
  Upload, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  LogIn, // Added LogIn icon
  LogOut, // Added LogOut icon
  UserPlus // Added UserPlus icon
} from "lucide-react";
import { format } from "date-fns";
// Removed Dialog imports as they are no longer used here

import StatsOverview from "../components/dashboard/StatsOverview";
import ImageGallery from "../components/dashboard/ImageGallery";
import OsteoporosisDistribution from "../components/dashboard/OsteoporosisDistribution";

// The old placeholder PaymentForm component has been removed.

export default function Dashboard() {
  const [analyses, setAnalyses] = useState([]);
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // Removed isPaymentModalOpen state
  const [currentUser, setCurrentUser] = useState(null); // New state for current user
  const [isLoadingUser, setIsLoadingUser] = useState(true); // New state for user loading
  const navigate = useNavigate();

  const galleryImages = [
    { url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/fcf04a510_CTScanner-SOMATOMForce-SiemensHealthcare.jpg', alt: 'CT Scanner' },
    { url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/459f079db_a6f796c0-145c-47e9-a9c6-dbb5bf85ba25.jpg', alt: 'DXA Scanner' },
    { url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/ae3f9bfc1_Untitled-6.png', alt: 'Calcaneus & Femur Comparison' },
    { url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/f3ed3ba84_cca35cf1-f0d2-4f8e-ad25-35925fc716a3.jpg', alt: 'Wrist X-ray' }
  ];

  useEffect(() => {
    loadDashboardData();
    loadCurrentUser(); // Load current user on component mount
  }, []);

  const loadCurrentUser = async () => {
    setIsLoadingUser(true);
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      // User not logged in or session expired
      setCurrentUser(null);
      console.log('No current user session or error fetching user:', error.message);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const [analysesData, patientsData] = await Promise.all([
        XRayAnalysis.list('-created_date', 50),
        Patient.list('-created_date', 20)
      ]);
      
      setAnalyses(analysesData);
      setPatients(patientsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getClassificationStats = () => {
    const completedAnalyses = analyses.filter(a => a.analysis_status === 'completed');
    const total = completedAnalyses.length;
    
    if (total === 0) return { normal: 0, osteopenia: 0, osteoporosis: 0 };
    
    const counts = completedAnalyses.reduce((acc, analysis) => {
      acc[analysis.osteoporosis_classification] = (acc[analysis.osteoporosis_classification] || 0) + 1;
      return acc;
    }, {});
    
    return {
      normal: Math.round((counts.normal || 0) / total * 100),
      osteopenia: Math.round((counts.osteopenia || 0) / total * 100),
      osteoporosis: Math.round((counts.osteoporosis || 0) / total * 100)
    };
  };

  const handleLogin = async () => {
    try {
      await User.login(); // Triggers the login flow
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await User.logout(); // Logs out the user
      setCurrentUser(null); // Clear local user state
      window.location.reload(); // Reload to clear any cached data or state
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const stats = getClassificationStats();

  // The handlePaymentSuccess function has been removed as it's no longer needed here.

  return (
    <div 
      className="min-h-screen bg-cover bg-center p-4 md:p-8" 
      style={{
        backgroundImage: 'linear-gradient(rgba(10, 20, 40, 0.85), rgba(10, 20, 40, 0.85)), url("https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/ea569eac5_download.jpg")'
      }}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-50 mb-2">Medical Imaging Dashboard</h1>
            <p className="text-slate-300">Monitor osteoporosis analysis and patient outcomes</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Authentication Buttons */}
            {isLoadingUser ? (
              <div className="flex items-center gap-2 text-slate-300">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-300"></div>
                Loading User...
              </div>
            ) : currentUser ? (
              <div className="flex items-center gap-3">
                <div className="text-slate-300 text-sm">
                  <p className="font-medium">Welcome, {currentUser.full_name || currentUser.email}</p>
                  <p className="text-xs opacity-75">{currentUser.role}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogout}
                  className="text-slate-200 border-slate-400 hover:bg-slate-700 hover:text-white"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogin}
                  className="text-slate-200 border-slate-400 hover:bg-slate-700 hover:text-white"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogin} // Sign Up button also triggers login flow in this example
                  className="text-slate-200 border-slate-400 hover:bg-slate-700 hover:text-white"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Sign Up
                </Button>
              </div>
            )}
            
            {/* New Analysis Button - Conditional action based on login state */}
            <Button 
              onClick={() => currentUser ? navigate(createPageUrl("Upload")) : handleLogin()}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium px-6 py-2 rounded-lg shadow-lg transition-all duration-200"
            >
              <Upload className="w-4 h-4 mr-2" />
              New Analysis
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <StatsOverview 
          totalAnalyses={analyses.length}
          totalPatients={patients.length}
          processingCount={analyses.filter(a => a.analysis_status === 'processing').length}
          stats={stats}
          isLoading={isLoading}
        />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Image Gallery - Takes up 2/3 of the width */}
          <div className="lg:col-span-2">
            <ImageGallery images={galleryImages} />
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            <OsteoporosisDistribution stats={stats} isLoading={isLoading} />
            
            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-slate-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Upload New X-ray button - Conditional action based on login state */}
                <Button 
                  onClick={() => currentUser ? navigate(createPageUrl("Upload")) : handleLogin()}
                  variant="outline" 
                  className="w-full justify-start hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload New X-ray
                </Button>
                <Link to={createPageUrl("Patients")} className="block">
                  <Button variant="outline" className="w-full justify-start hover:bg-blue-50 hover:text-blue-700 transition-colors">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Patients
                  </Button>
                </Link>
                <Link to={createPageUrl("Reports")} className="block">
                  <Button variant="outline" className="w-full justify-start hover:bg-blue-50 hover:text-blue-700 transition-colors">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Generate Reports
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* The old placeholder Payment Modal has been removed entirely. */}
    </div>
  );
}
