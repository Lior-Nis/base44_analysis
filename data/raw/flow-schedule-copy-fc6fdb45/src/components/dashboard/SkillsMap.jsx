
import React, { useState, useEffect } from "react";
import { Task } from "@/api/entities";
import { startOfDay, endOfDay } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Target, Award } from "lucide-react";

const CATEGORY_COLORS = {
  work: "#3B82F6",
  personal: "#10B981", 
  health: "#EF4444",
  learning: "#8B5CF6",
  creative: "#EC4899",
  social: "#F59E0B",
  planning: "#6366F1"
};

export default function SkillsMap({ refreshTrigger }) {
  const [skillsData, setSkillsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    loadSkillsData();
  }, [refreshTrigger]);

  const loadSkillsData = async () => {
    setLoading(true);
    try {
      const tasks = await Task.list();
      const today = new Date();
      const todayTasks = tasks.filter(task => {
        if (!task.start_time) return false;
        const taskDate = new Date(task.start_time);
        return taskDate >= startOfDay(today) && taskDate <= endOfDay(today);
      });

      // Group by category and sum duration
      const categoryTotals = {};
      let totalDuration = 0;

      todayTasks.forEach(task => {
        const category = task.category || 'other';
        const duration = task.duration_minutes || 60;
        categoryTotals[category] = (categoryTotals[category] || 0) + duration;
        totalDuration += duration;
      });

      // Convert to chart data
      const chartData = Object.entries(categoryTotals).map(([category, duration]) => ({
        name: category.replace('_', ' ').toUpperCase(),
        value: duration,
        percentage: Math.round((duration / totalDuration) * 100),
        color: CATEGORY_COLORS[category] || "#64748B"
      }));

      setSkillsData(chartData);
      setTotalTime(totalDuration);
    } catch (error) {
      console.error("Error loading skills data:", error);
    }
    setLoading(false);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white/90 backdrop-blur-xl p-3 rounded-2xl shadow-lg border border-white/20">
          <p className="font-medium text-slate-900">{data.payload.name}</p>
          <p className="text-sm text-slate-600">
            {Math.round(data.payload.value / 60)}h {data.payload.value % 60}m
          </p>
          <p className="text-sm text-slate-600">{data.payload.percentage}% of day</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 min-h-[280px]">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-6 h-6 text-indigo-500 animate-pulse" />
          <h3 className="text-lg font-semibold text-slate-900">Skills Map</h3>
        </div>
        <div className="w-48 h-48 bg-slate-200 rounded-full mx-auto animate-pulse"></div>
      </div>
    );
  }

  if (skillsData.length === 0) {
    return (
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 text-center min-h-[280px]">
        <Target className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Skills Map</h3>
        <p className="text-slate-600">No activities today</p>
        <p className="text-sm text-slate-500">Schedule some tasks to see your skills distribution</p>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 relative overflow-hidden min-h-[280px]">
      {/* Changed gradient to blue-green */}
      <div className="bg-gradient-to-br from-sky-400/20 to-green-400/20 mx-1 my-3 absolute top-0 left-0 w-20 h-20 rounded-full transform -translate-x-8 -translate-y-8"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-6 h-6 text-indigo-500" />
          <h3 className="text-lg font-semibold text-slate-900">Skills Map</h3>
          <Award className="w-4 h-4 text-yellow-500" />
        </div>

        <div className="relative">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={skillsData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {skillsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">
                {Math.round(totalTime / 60)}h
              </div>
              <div className="text-xs text-slate-500">total</div>
            </div>
          </div>
        </div>

        <div className="space-y-2 mt-4">
          {skillsData.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-slate-700 capitalize">{item.name.toLowerCase()}</span>
              </div>
              <span className="font-medium text-slate-600">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
