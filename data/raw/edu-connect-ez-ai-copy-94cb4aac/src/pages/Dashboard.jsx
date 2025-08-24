import React, { useState, useEffect } from "react";
import { Assignment, StudyPlan } from "@/api/entities";
import { 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Award,
  Calendar,
  Target,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

import StatsGrid from "../components/dashboard/StatsGrid";
import ProgressChart from "../components/dashboard/ProgressChart";
import RecentAssignments from "../components/dashboard/RecentAssignments";
import StudyStreaks from "../components/dashboard/StudyStreaks";
import QuickActions from "../components/dashboard/QuickActions";

export default function Dashboard() {
  const [assignments, setAssignments] = useState([]);
  const [studyPlans, setStudyPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [assignmentsData, studyPlansData] = await Promise.all([
        Assignment.list("-created_date"),
        StudyPlan.list("-created_date")
      ]);
      setAssignments(assignmentsData);
      setStudyPlans(studyPlansData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const total = assignments.length;
    const completed = assignments.filter(a => a.status === "completed").length;
    const pending = assignments.filter(a => a.status === "pending").length;
    const overdue = assignments.filter(a => {
      return a.status !== "completed" && new Date(a.due_date) < new Date();
    }).length;

    return { total, completed, pending, overdue };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Your Learning Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Track your progress and stay on top of your studies
          </p>
        </div>

        {/* Stats Grid */}
        <StatsGrid 
          stats={stats}
          loading={loading}
        />

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            <ProgressChart 
              assignments={assignments}
              loading={loading}
            />
            
            <RecentAssignments 
              assignments={assignments.slice(0, 5)}
              loading={loading}
            />
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-8">
            <QuickActions />
            
            <StudyStreaks 
              assignments={assignments}
              studyPlans={studyPlans}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}