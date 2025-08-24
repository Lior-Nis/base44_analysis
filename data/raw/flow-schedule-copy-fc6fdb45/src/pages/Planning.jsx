import React, { useState, useEffect } from "react";
import { Task } from "@/api/entities";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { Calendar, Plus, Filter, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Planning() {
  const [tasks, setTasks] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const allTasks = await Task.list();
      setTasks(allTasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
    setLoading(false);
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  const getTasksForDay = (date) => {
    return tasks.filter(task => {
      if (!task.start_time) return false;
      return isSameDay(new Date(task.start_time), date);
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      work: "bg-blue-100 text-blue-700",
      personal: "bg-green-100 text-green-700",
      health: "bg-red-100 text-red-700",
      learning: "bg-purple-100 text-purple-700",
      creative: "bg-pink-100 text-pink-700",
      social: "bg-yellow-100 text-yellow-700",
      planning: "bg-indigo-100 text-indigo-700"
    };
    return colors[category] || "bg-gray-100 text-gray-700";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "text-green-600",
      medium: "text-yellow-600",
      high: "text-orange-600", 
      urgent: "text-red-600"
    };
    return colors[priority] || colors.medium;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Weekly Planning</h1>
          <p className="text-slate-600">Organize and review your upcoming week</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="rounded-2xl border-slate-200"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button className="rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600">
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">
            Week of {format(currentWeek, 'MMM d, yyyy')}
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
              className="rounded-2xl border-slate-200"
            >
              ← Previous Week
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
              className="rounded-2xl border-slate-200"
            >
              Next Week →
            </Button>
          </div>
        </div>

        {/* Week Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weekDays.map((day) => {
            const dayTasks = getTasksForDay(day);
            const isSelected = selectedDay && isSameDay(selectedDay, day);
            
            return (
              <div
                key={day.toISOString()}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'bg-sky-50 border-sky-200' 
                    : 'bg-white/50 border-slate-200 hover:bg-slate-50'
                }`}
                onClick={() => setSelectedDay(day)}
              >
                <div className="text-center mb-3">
                  <div className="font-semibold text-slate-900">{format(day, 'EEE')}</div>
                  <div className="text-2xl font-bold text-slate-700">{format(day, 'd')}</div>
                </div>
                
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="text-xs p-2 rounded-xl bg-slate-100 truncate"
                    >
                      <div className="font-medium text-slate-700">{task.title}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getCategoryColor(task.category)}`}
                        >
                          {task.category}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-slate-500 text-center py-1">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                  {dayTasks.length === 0 && (
                    <div className="text-xs text-slate-400 text-center py-2">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Day View */}
      {selectedDay && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/60 backdrop-blur-xl border border-white/20 rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-500" />
                {format(selectedDay, 'EEEE, MMM d, yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getTasksForDay(selectedDay).map((task) => (
                  <div
                    key={task.id}
                    className="p-4 rounded-2xl bg-white/50 border border-slate-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-slate-900">{task.title}</h4>
                      <div className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </div>
                    </div>
                    {task.description && (
                      <p className="text-sm text-slate-600 mb-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(task.category)}>
                        {task.category}
                      </Badge>
                      {task.start_time && (
                        <span className="text-xs text-slate-500">
                          {format(new Date(task.start_time), 'HH:mm')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {getTasksForDay(selectedDay).length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No tasks scheduled for this day</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-xl border border-white/20 rounded-3xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-500" />
                Day Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Statistics would go here */}
                <div className="text-center py-8 text-slate-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Statistics for selected day</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}