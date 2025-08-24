
import React, { useState, useEffect } from "react";
import { Task } from "@/api/entities";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { Clock, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UpcomingTask({ refreshTrigger }) {
  const [nextTask, setNextTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNextTask();
  }, [refreshTrigger]);

  const loadNextTask = async () => {
    setLoading(true);
    try {
      const tasks = await Task.list();
      const upcomingTasks = tasks
        .filter(task => task.start_time && task.status !== 'completed')
        .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
      
      const now = new Date();
      const nextUpcoming = upcomingTasks.find(task => new Date(task.start_time) > now);
      setNextTask(nextUpcoming || null);
    } catch (error) {
      console.error("Error loading next task:", error);
    }
    setLoading(false);
  };

  const markComplete = async () => {
    if (nextTask) {
      try {
        await Task.update(nextTask.id, { status: 'completed' });
        loadNextTask();
      } catch (error) {
        console.error("Error updating task:", error);
      }
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "text-green-600 bg-green-100",
      medium: "text-yellow-600 bg-yellow-100", 
      high: "text-orange-600 bg-orange-100",
      urgent: "text-red-600 bg-red-100"
    };
    return colors[priority] || colors.medium;
  };

  const getTimeDisplay = (startTime) => {
    const taskDate = parseISO(startTime);
    if (isToday(taskDate)) {
      return `Today at ${format(taskDate, 'HH:mm')}`;
    } else if (isTomorrow(taskDate)) {
      return `Tomorrow at ${format(taskDate, 'HH:mm')}`;
    } else {
      return format(taskDate, 'MMM d at HH:mm');
    }
  };

  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded-2xl w-1/3 mb-4"></div>
          <div className="h-4 bg-slate-200 rounded-2xl w-2/3 mb-2"></div>
          <div className="h-4 bg-slate-200 rounded-2xl w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!nextTask) {
    return (
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">All caught up!</h3>
        <p className="text-slate-600">No upcoming tasks scheduled.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 relative overflow-hidden">
      {/* Changed gradient to blue-green */}
      <div className="bg-gradient-to-br from-sky-400/20 to-green-400/20 mx-64 my-4 px-16 absolute top-0 right-0 w-20 h-20 rounded-full transform translate-x-8 -translate-y-8"></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Next Up</h3>
          <div className={`px-3 py-1 rounded-2xl text-xs font-medium ${getPriorityColor(nextTask.priority)}`}>
            {nextTask.priority}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-xl font-bold text-slate-900 leading-tight">{nextTask.title}</h4>
          
          {nextTask.description && (
            <p className="text-slate-600 text-sm leading-relaxed">{nextTask.description}</p>
          )}

          <div className="flex items-center gap-2 text-slate-500">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{getTimeDisplay(nextTask.start_time)}</span>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full animate-pulse" style={{width: '75%'}}></div>
            </div>
            <span className="text-xs text-slate-500 font-medium">Ready</span>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={markComplete}
            className="flex-1 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Mark Complete
          </Button>
          <Button
            variant="outline"
            className="rounded-2xl border-slate-200 hover:bg-slate-50"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
