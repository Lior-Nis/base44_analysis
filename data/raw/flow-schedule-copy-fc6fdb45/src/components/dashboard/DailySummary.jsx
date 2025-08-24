
import React, { useState, useEffect } from "react";
import { Task } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { format, startOfDay, endOfDay } from "date-fns";
import { Brain, Sparkles, TrendingUp } from "lucide-react";

export default function DailySummary({ refreshTrigger }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateSummary();
  }, [refreshTrigger]);

  const generateSummary = async () => {
    setLoading(true);
    try {
      const tasks = await Task.list();
      const today = new Date();
      const todayTasks = tasks.filter(task => {
        if (!task.start_time) return false;
        const taskDate = new Date(task.start_time);
        return taskDate >= startOfDay(today) && taskDate <= endOfDay(today);
      });

      if (todayTasks.length === 0) {
        setSummary({
          mood: "planning",
          focus_areas: ["Free day"],
          activities: ["Open schedule"],
          insights: "Perfect opportunity for planning or taking a break!"
        });
        setLoading(false);
        return;
      }

      const prompt = `
        Analyze this daily schedule briefly:
        
        Tasks for ${format(today, 'MMMM d, yyyy')}:
        ${todayTasks.map(task => `
        - ${task.title} (${task.category}, ${task.priority} priority)
        `).join('\n')}
        
        Provide a concise analysis with:
        1. Overall mood/theme (1-2 words)
        2. Key focus areas (max 3 items)
        3. Activity types (max 3 items) 
        4. Brief insight (max 2 sentences)
      `;

      const result = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            mood: { type: "string" },
            focus_areas: { type: "array", items: { type: "string" } },
            activities: { type: "array", items: { type: "string" } },
            insights: { type: "string" }
          }
        }
      });

      setSummary(result);
    } catch (error) {
      console.error("Error generating summary:", error);
      setSummary({
        mood: "productive",
        focus_areas: ["Work tasks"],
        activities: ["Mixed activities"],
        insights: "Keep up the good work!"
      });
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-4 shadow-xl border border-white/20">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-5 h-5 text-purple-500 animate-pulse" />
          <h3 className="text-base font-semibold text-slate-900">AI Summary</h3>
        </div>
        <div className="space-y-2 animate-pulse">
          <div className="h-3 bg-slate-200 rounded-xl w-3/4"></div>
          <div className="h-3 bg-slate-200 rounded-xl w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-4 shadow-xl border border-white/20 relative overflow-hidden">
      {/* Changed gradient to blue-green */}
      <div className="bg-gradient-to-br from-sky-400/20 to-green-400/20 mt-2 mr-64 mb-2 ml-64 pr-10 pl-10 absolute top-0 right-0 w-16 h-16 rounded-full transform translate-x-6 -translate-y-6"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-5 h-5 text-purple-500" />
          <h3 className="text-base font-semibold text-slate-900">AI Summary</h3>
          <Sparkles className="w-3 h-3 text-yellow-500 animate-pulse" />
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3 h-3 text-purple-600" />
              <span className="text-xs font-medium text-purple-900">Mood</span>
            </div>
            <p className="text-purple-800 capitalize font-medium text-sm">{summary?.mood}</p>
          </div>

          <div>
            <h4 className="text-xs font-medium text-slate-900 mb-1.5">Focus Areas</h4>
            <div className="flex flex-wrap gap-1">
              {summary?.focus_areas?.slice(0,3).map((area, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-medium text-slate-900 mb-1.5">Activities</h4>
            <div className="flex flex-wrap gap-1">
              {summary?.activities?.slice(0,3).map((activity, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium"
                >
                  {activity}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-2 max-h-20 overflow-y-auto custom-scrollbar">
            <h4 className="text-xs font-medium text-slate-900 mb-1">Insights</h4>
            <p className="text-slate-700 text-xs leading-relaxed">{summary?.insights}</p>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.1);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.2);
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
}
