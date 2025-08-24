import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BookOpen, 
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";

const statusConfig = {
  pending: {
    icon: Clock,
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    iconColor: "text-yellow-600"
  },
  "in-progress": {
    icon: Clock,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    iconColor: "text-blue-600"
  },
  completed: {
    icon: CheckCircle2,
    color: "bg-green-100 text-green-800 border-green-200",
    iconColor: "text-green-600"
  },
  overdue: {
    icon: AlertTriangle,
    color: "bg-red-100 text-red-800 border-red-200",
    iconColor: "text-red-600"
  }
};

const subjectColors = {
  Mathematics: "bg-blue-50 text-blue-700 border-blue-200",
  Science: "bg-green-50 text-green-700 border-green-200",
  English: "bg-purple-50 text-purple-700 border-purple-200",
  History: "bg-amber-50 text-amber-700 border-amber-200",
  Physics: "bg-cyan-50 text-cyan-700 border-cyan-200",
  Chemistry: "bg-emerald-50 text-emerald-700 border-emerald-200"
};

export default function RecentAssignments({ assignments, loading }) {
  return (
    <Card className="border-0 shadow-xl bg-white/80 backdrop-blur">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          Recent Assignments
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : assignments.length > 0 ? (
          <div className="space-y-4">
            {assignments.map((assignment) => {
              const isOverdue = assignment.status !== "completed" && new Date(assignment.due_date) < new Date();
              const status = isOverdue ? "overdue" : assignment.status;
              const StatusIcon = statusConfig[status].icon;

              return (
                <div key={assignment.id} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className={`p-2 rounded-full ${statusConfig[status].color.replace('text-', 'bg-').replace('border-', '').replace('bg-', 'bg-opacity-20 bg-')}`}>
                    <StatusIcon className={`w-4 h-4 ${statusConfig[status].iconColor}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {assignment.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {assignment.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={subjectColors[assignment.subject] || "bg-gray-50 text-gray-700"}>
                            {assignment.subject}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(assignment.due_date), "MMM d, yyyy")}
                          </div>
                        </div>
                      </div>
                      
                      <Badge className={statusConfig[status].color}>
                        {status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No assignments yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}