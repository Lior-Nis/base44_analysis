import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Save, Plus, Trash2 } from "lucide-react";

const commonSubjects = [
  "Mathematics", "Science", "English", "History", 
  "Physics", "Chemistry", "Biology", "Computer Science", "Art", "Other"
];

export default function StudyPlanForm({ studyPlan, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: studyPlan?.name || "",
    subjects: studyPlan?.subjects || [],
    weekly_hours: studyPlan?.weekly_hours || 10,
    goals: studyPlan?.goals || [""],
    daily_tasks: studyPlan?.daily_tasks || [
      { day: "Monday", tasks: [""], duration: 2 }
    ],
    active: studyPlan?.active ?? true
  });

  const [newSubject, setNewSubject] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanedData = {
      ...formData,
      goals: formData.goals.filter(goal => goal.trim() !== ""),
      daily_tasks: formData.daily_tasks.map(day => ({
        ...day,
        tasks: day.tasks.filter(task => task.trim() !== "")
      })).filter(day => day.tasks.length > 0)
    };
    onSubmit(cleanedData);
  };

  const addSubject = (subject) => {
    if (subject && !formData.subjects.includes(subject)) {
      setFormData(prev => ({
        ...prev,
        subjects: [...prev.subjects, subject]
      }));
      setNewSubject("");
    }
  };

  const removeSubject = (subjectToRemove) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s !== subjectToRemove)
    }));
  };

  const updateGoal = (index, value) => {
    const newGoals = [...formData.goals];
    newGoals[index] = value;
    setFormData(prev => ({ ...prev, goals: newGoals }));
  };

  const addGoal = () => {
    setFormData(prev => ({
      ...prev,
      goals: [...prev.goals, ""]
    }));
  };

  const removeGoal = (index) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  const updateDayTask = (dayIndex, taskIndex, value) => {
    const newDailyTasks = [...formData.daily_tasks];
    newDailyTasks[dayIndex].tasks[taskIndex] = value;
    setFormData(prev => ({ ...prev, daily_tasks: newDailyTasks }));
  };

  const addDayTask = (dayIndex) => {
    const newDailyTasks = [...formData.daily_tasks];
    newDailyTasks[dayIndex].tasks.push("");
    setFormData(prev => ({ ...prev, daily_tasks: newDailyTasks }));
  };

  const removeDayTask = (dayIndex, taskIndex) => {
    const newDailyTasks = [...formData.daily_tasks];
    newDailyTasks[dayIndex].tasks = newDailyTasks[dayIndex].tasks.filter((_, i) => i !== taskIndex);
    setFormData(prev => ({ ...prev, daily_tasks: newDailyTasks }));
  };

  const addDay = () => {
    setFormData(prev => ({
      ...prev,
      daily_tasks: [...prev.daily_tasks, {
        day: "",
        tasks: [""],
        duration: 2
      }]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-4xl my-8"
      >
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur">
          <CardHeader className="pb-4 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-gray-900">
                {studyPlan ? "Edit Study Plan" : "Create Study Plan"}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={onCancel}
                className="hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6 max-h-[70vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                    Plan Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                    placeholder="Enter plan name..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weekly_hours" className="text-sm font-semibold text-gray-700">
                    Weekly Hours *
                  </Label>
                  <Input
                    id="weekly_hours"
                    type="number"
                    min="1"
                    max="168"
                    value={formData.weekly_hours}
                    onChange={(e) => setFormData(prev => ({...prev, weekly_hours: parseInt(e.target.value)}))}
                    required
                  />
                </div>
              </div>

              {/* Subjects */}
              <div className="space-y-4">
                <Label className="text-sm font-semibold text-gray-700">
                  Subjects
                </Label>
                
                {/* Current subjects */}
                <div className="flex flex-wrap gap-2">
                  {formData.subjects.map((subject) => (
                    <Badge key={subject} variant="outline" className="gap-1">
                      {subject}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => removeSubject(subject)}
                      />
                    </Badge>
                  ))}
                </div>

                {/* Add subjects */}
                <div className="flex flex-wrap gap-2">
                  {commonSubjects
                    .filter(s => !formData.subjects.includes(s))
                    .map(subject => (
                    <Button
                      key={subject}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addSubject(subject)}
                      className="text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {subject}
                    </Button>
                  ))}
                </div>

                {/* Custom subject */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom subject..."
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSubject(newSubject);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addSubject(newSubject)}
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Goals */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-gray-700">
                    Study Goals
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addGoal}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Goal
                  </Button>
                </div>

                <div className="space-y-2">
                  {formData.goals.map((goal, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={goal}
                        onChange={(e) => updateGoal(index, e.target.value)}
                        placeholder="Enter a study goal..."
                      />
                      {formData.goals.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeGoal(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Tasks */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-gray-700">
                    Daily Schedule
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addDay}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Day
                  </Button>
                </div>

                <div className="space-y-4">
                  {formData.daily_tasks.map((day, dayIndex) => (
                    <Card key={dayIndex} className="p-4">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <Input
                          placeholder="Day (e.g., Monday)"
                          value={day.day}
                          onChange={(e) => {
                            const newDailyTasks = [...formData.daily_tasks];
                            newDailyTasks[dayIndex].day = e.target.value;
                            setFormData(prev => ({...prev, daily_tasks: newDailyTasks}));
                          }}
                        />
                        <Input
                          type="number"
                          placeholder="Hours"
                          min="0.5"
                          step="0.5"
                          value={day.duration}
                          onChange={(e) => {
                            const newDailyTasks = [...formData.daily_tasks];
                            newDailyTasks[dayIndex].duration = parseFloat(e.target.value);
                            setFormData(prev => ({...prev, daily_tasks: newDailyTasks}));
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        {day.tasks.map((task, taskIndex) => (
                          <div key={taskIndex} className="flex gap-2">
                            <Input
                              placeholder="Study task..."
                              value={task}
                              onChange={(e) => updateDayTask(dayIndex, taskIndex, e.target.value)}
                            />
                            {day.tasks.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => removeDayTask(dayIndex, taskIndex)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => addDayTask(dayIndex)}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Task
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white shadow-lg"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {studyPlan ? "Update" : "Create"} Plan
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}