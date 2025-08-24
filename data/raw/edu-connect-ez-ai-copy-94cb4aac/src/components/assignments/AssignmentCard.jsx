import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  Calendar, 
  Clock, 
  MoreVertical, 
  Edit, 
  Trash2,
  CheckCircle2,
  Play,
  AlertTriangle
} from "lucide-react";
import { format, isAfter, isBefore, addDays } from "date-fns";

const statusConfig = {
  pending: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Clock,
    iconColor: "text-yellow-600"
  },
  "in-progress": {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Play,
    iconColor: "text-blue-600"
  },
  completed: {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle2,
    iconColor: "text-green-600"
  },
  overdue: {
    color: "bg-red-100 text-red-800 border-red-200",
    icon: AlertTriangle,
    iconColor: "text-red-600"
  }
};

const difficultyColors = {
  easy: "bg-green-50 text-green-700 border-green-200",
  medium: "bg-yellow-50 text-yellow-700 border-yellow-200",
  hard: "bg-red-50 text-red-700 border-red-200"
};

const priorityColors = {
  low: "bg-gray-50 text-gray-700 border-gray-200",
  medium: "bg-blue-50 text-blue-700 border-blue-200",
  high: "bg-red-50 text-red-700 border-red-200"
};

const subjectColors = {
  Mathematics: "bg-blue-50 text-blue-700 border-blue-200",
  Science: "bg-green-50 text-green-700 border-green-200",
  English: "bg-purple-50 text-purple-700 border-purple-200",
  History: "bg-amber-50 text-amber-700 border-amber-200",
  Physics: "bg-cyan-50 text-cyan-700 border-cyan-200",
  Chemistry: "bg-emerald-50 text-emerald-700 border-emerald-200"
};

export default function AssignmentCard({ assignment, onStatusChange, onEdit, onDelete }) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const dueDate = new Date(assignment.due_date);
  const now = new Date();
  const isOverdue = assignment.status !== "completed" && isBefore(dueDate, now);
  const isDueSoon = assignment.status !== "completed" && 
                   isAfter(dueDate, now) && 
                   isBefore(dueDate, addDays(now, 3));
  
  const status = isOverdue ? "overdue" : assignment.status;
  const StatusIcon = statusConfig[status].icon;

  const getCardBorder = () => {
    if (isOverdue) return "border-l-4 border-l-red-500";
    if (isDueSoon) return "border-l-4 border-l-yellow-500";
    if (assignment.status === "completed") return "border-l-4 border-l-green-500";
    return "border-l-4 border-l-blue-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/90 backdrop-blur ${getCardBorder()}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-gray-900 truncate">
                {assignment.title}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={subjectColors[assignment.subject] || "bg-gray-50 text-gray-700"}>
                  {assignment.subject}
                </Badge>
                <Badge className={statusConfig[status].color}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status.replace('-', ' ')}
                </Badge>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(assignment)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                {assignment.status !== "completed" && (
                  <>
                    <DropdownMenuItem 
                      onClick={() => onStatusChange(assignment.id, "in-progress")}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Working
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onStatusChange(assignment.id, "completed")}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark Complete
                    </DropdownMenuItem>
                  </>
                )}
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
          {assignment.description && (
            <p className="text-gray-600 text-sm line-clamp-3">
              {assignment.description}
            </p>
          )}

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className={`font-medium ${
              isOverdue ? "text-red-600" : 
              isDueSoon ? "text-yellow-600" : 
              "text-gray-600"
            }`}>
              Due: {format(dueDate, "MMM d, yyyy 'at' h:mm a")}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="flex gap-2">
              <Badge variant="outline" className={difficultyColors[assignment.difficulty]}>
                {assignment.difficulty}
              </Badge>
              <Badge variant="outline" className={priorityColors[assignment.priority]}>
                {assignment.priority} priority
              </Badge>
            </div>
            
            {assignment.grade && (
              <Badge className="bg-blue-100 text-blue-800">
                Grade: {assignment.grade}%
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{assignment.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(assignment.id);
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