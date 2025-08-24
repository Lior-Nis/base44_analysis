import React, { useState, useEffect } from "react";
import { Task } from "@/api/entities";
import { format, addHours } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Trash2 } from "lucide-react";

export default function AddTaskModal({ isOpen, onClose, selectedSlot, selectedTask, onSave }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "work",
    start_time: "",
    end_time: "",
    duration_minutes: 60
  });

  useEffect(() => {
    if (selectedTask) {
      setFormData({
        title: selectedTask.title || "",
        description: selectedTask.description || "",
        priority: selectedTask.priority || "medium",
        category: selectedTask.category || "work",
        start_time: selectedTask.start_time || "",
        end_time: selectedTask.end_time || "",
        duration_minutes: selectedTask.duration_minutes || 60
      });
    } else if (selectedSlot) {
      const endTime = addHours(selectedSlot, 1);
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        category: "work",
        start_time: selectedSlot.toISOString(),
        end_time: endTime.toISOString(),
        duration_minutes: 60
      });
    }
  }, [selectedTask, selectedSlot]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedTask) {
        await Task.update(selectedTask.id, formData);
      } else {
        await Task.create(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const handleDelete = async () => {
    if (selectedTask && window.confirm("Are you sure you want to delete this task?")) {
      try {
        await Task.delete(selectedTask.id);
        onSave();
        onClose();
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };

  const updateEndTime = (startTime, durationMinutes) => {
    if (startTime && durationMinutes) {
      const start = new Date(startTime);
      const end = new Date(start.getTime() + durationMinutes * 60000);
      setFormData(prev => ({ ...prev, end_time: end.toISOString() }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white/95 backdrop-blur-xl border border-white/20 rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            {selectedTask ? "Edit Task" : "Add New Task"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title..."
              className="rounded-2xl border-slate-200"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add details..."
              className="rounded-2xl border-slate-200 min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger className="rounded-2xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="rounded-2xl border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={formData.start_time ? format(new Date(formData.start_time), "yyyy-MM-dd'T'HH:mm") : ""}
                onChange={(e) => {
                  const newStartTime = e.target.value ? new Date(e.target.value).toISOString() : "";
                  setFormData(prev => ({ ...prev, start_time: newStartTime }));
                  updateEndTime(newStartTime, formData.duration_minutes);
                }}
                className="rounded-2xl border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                step="15"
                value={formData.duration_minutes}
                onChange={(e) => {
                  const duration = parseInt(e.target.value);
                  setFormData(prev => ({ ...prev, duration_minutes: duration }));
                  updateEndTime(formData.start_time, duration);
                }}
                className="rounded-2xl border-slate-200"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            {selectedTask && (
              <Button
                type="button"
                variant="outline"
                onClick={handleDelete}
                className="rounded-2xl border-red-200 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            )}
            <div className="flex gap-3 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-2xl border-slate-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {selectedTask ? "Update" : "Create"} Task
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}