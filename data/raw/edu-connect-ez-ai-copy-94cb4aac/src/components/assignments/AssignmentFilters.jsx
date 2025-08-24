import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";

const subjects = [
  "Mathematics", "Science", "English", "History", 
  "Physics", "Chemistry", "Biology", "Computer Science", "Art", "Other"
];

export default function AssignmentFilters({ 
  searchTerm, 
  setSearchTerm, 
  filters, 
  setFilters, 
  assignments 
}) {
  const getFilterCounts = () => {
    const counts = {
      total: assignments.length,
      pending: assignments.filter(a => a.status === "pending").length,
      "in-progress": assignments.filter(a => a.status === "in-progress").length,
      completed: assignments.filter(a => a.status === "completed").length,
      overdue: assignments.filter(a => 
        a.status !== "completed" && new Date(a.due_date) < new Date()
      ).length
    };
    return counts;
  };

  const counts = getFilterCounts();

  return (
    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Status
              </label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({...prev, status: value}))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status ({counts.total})</SelectItem>
                  <SelectItem value="pending">Pending ({counts.pending})</SelectItem>
                  <SelectItem value="in-progress">In Progress ({counts["in-progress"]})</SelectItem>
                  <SelectItem value="completed">Completed ({counts.completed})</SelectItem>
                  <SelectItem value="overdue">Overdue ({counts.overdue})</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Subject
              </label>
              <Select
                value={filters.subject}
                onValueChange={(value) => setFilters(prev => ({...prev, subject: value}))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Difficulty
              </label>
              <Select
                value={filters.difficulty}
                onValueChange={(value) => setFilters(prev => ({...prev, difficulty: value}))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Filter Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={filters.status === "overdue" ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${
                filters.status === "overdue" ? "bg-red-500" : "hover:bg-red-50"
              }`}
              onClick={() => setFilters(prev => ({
                ...prev, 
                status: prev.status === "overdue" ? "all" : "overdue"
              }))}
            >
              🚨 Overdue ({counts.overdue})
            </Badge>
            
            <Badge 
              variant={filters.status === "pending" ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${
                filters.status === "pending" ? "bg-yellow-500" : "hover:bg-yellow-50"
              }`}
              onClick={() => setFilters(prev => ({
                ...prev, 
                status: prev.status === "pending" ? "all" : "pending"
              }))}
            >
              ⏳ Pending ({counts.pending})
            </Badge>
            
            <Badge 
              variant={filters.status === "completed" ? "default" : "outline"}
              className={`cursor-pointer transition-colors ${
                filters.status === "completed" ? "bg-green-500" : "hover:bg-green-50"
              }`}
              onClick={() => setFilters(prev => ({
                ...prev, 
                status: prev.status === "completed" ? "all" : "completed"
              }))}
            >
              ✅ Completed ({counts.completed})
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}