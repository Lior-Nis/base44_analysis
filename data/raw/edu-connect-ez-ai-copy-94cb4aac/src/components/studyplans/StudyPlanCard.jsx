import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Target, 
  Clock, 
  Book, 
  MoreVertical, 
  Edit, 
  Trash2,
  Calendar
} from "lucide-react";

export default function StudyPlanCard({ studyPlan, onEdit, onDelete, onToggleActive }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getTotalDailyHours = () => {
    return studyPlan.daily_tasks?.reduce((total, day) => total + (day.duration || 0), 0) || 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur ${
        studyPlan.active ? 'border-l-4 border-l-purple-500' : 'border-l-4 border-l-gray-300'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-gray-900 truncate">
                {studyPlan.name}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={studyPlan.active ? 
                  "bg-purple-100 text-purple-800 border-purple-200" : 
                  "bg-gray-100 text-gray-800 border-gray-200"
                }>
                  {studyPlan.active ? "Active" : "Inactive"}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="w-3 h-3" />
                  {studyPlan.weekly_hours}h/week
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(studyPlan)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Subjects */}
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-1">
              <Book className="w-3 h-3" />
              Subjects
            </h4>
            <div className="flex flex-wrap gap-1">
              {studyPlan.subjects?.slice(0, 3).map((subject, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {subject}
                </Badge>
              ))}
              {studyPlan.subjects?.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{studyPlan.subjects.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          {/* Goals */}
          {studyPlan.goals?.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-1">
                <Target className="w-3 h-3" />
                Goals
              </h4>
              <ul className="text-xs text-gray-600 space-y-1">
                {studyPlan.goals.slice(0, 2).map((goal, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <span className="text-purple-500">•</span>
                    <span className="line-clamp-1">{goal}</span>
                  </li>
                ))}
                {studyPlan.goals.length > 2 && (
                  <li className="text-gray-400">
                    +{studyPlan.goals.length - 2} more goals
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Daily Schedule Preview */}
          {studyPlan.daily_tasks?.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Schedule Preview
              </h4>
              <div className="text-xs text-gray-600">
                <div className="flex justify-between items-center">
                  <span>{studyPlan.daily_tasks.length} days planned</span>
                  <span>{getTotalDailyHours()}h total</span>
                </div>
              </div>
            </div>
          )}

          {/* Active Toggle */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span className="text-sm font-medium text-gray-700">
              Active Plan
            </span>
            <Switch
              checked={studyPlan.active}
              onCheckedChange={(checked) => onToggleActive(studyPlan.id, checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Study Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{studyPlan.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(studyPlan.id);
                setShowDeleteDialog(false);
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}