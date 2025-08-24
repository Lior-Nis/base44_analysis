import React, { useState } from "react";
import WeeklyCalendar from "../components/dashboard/WeeklyCalendar";
import UpcomingTask from "../components/dashboard/UpcomingTask";
import DailySummary from "../components/dashboard/DailySummary";
import SkillsMap from "../components/dashboard/SkillsMap";
import QuickActions from "../components/dashboard/QuickActions";
import DailyFocus from "../components/dashboard/DailyFocus";

export default function Dashboard() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDataUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main content area: Calendar and then Quick Actions/Skills Map below it */}
        <div className="lg:col-span-9 space-y-6">
          <WeeklyCalendar onTaskUpdate={handleDataUpdate} />
          
          {/* Row for Quick Actions and Skills Map */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <QuickActions onTaskAdded={handleDataUpdate} />
            <SkillsMap refreshTrigger={refreshTrigger} />
          </div>
        </div>

        {/* Right Column Widgets */}
        <div className="lg:col-span-3 space-y-6">
          <UpcomingTask refreshTrigger={refreshTrigger} />
          <DailyFocus refreshTrigger={refreshTrigger} />
          <DailySummary refreshTrigger={refreshTrigger} /> 
          {/* SkillsMap moved below calendar */}
          {/* QuickActions moved below calendar */}
        </div>
      </div>
    </div>
  );
}