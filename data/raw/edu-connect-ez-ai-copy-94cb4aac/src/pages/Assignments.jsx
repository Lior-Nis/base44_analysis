import React, { useState, useEffect } from "react";
import { Assignment } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import AssignmentForm from "../components/assignments/AssignmentForm";
import AssignmentCard from "../components/assignments/AssignmentCard";
import AssignmentFilters from "../components/assignments/AssignmentFilters";

export default function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    subject: "all",
    difficulty: "all"
  });

  useEffect(() => {
    loadAssignments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [assignments, searchTerm, filters]);

  const loadAssignments = async () => {
    try {
      const data = await Assignment.list("-created_date");
      setAssignments(data);
    } catch (error) {
      console.error("Failed to load assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = assignments;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(assignment =>
        assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(assignment => {
        if (filters.status === "overdue") {
          return assignment.status !== "completed" && new Date(assignment.due_date) < new Date();
        }
        return assignment.status === filters.status;
      });
    }

    // Apply subject filter
    if (filters.subject !== "all") {
      filtered = filtered.filter(assignment => assignment.subject === filters.subject);
    }

    // Apply difficulty filter
    if (filters.difficulty !== "all") {
      filtered = filtered.filter(assignment => assignment.difficulty === filters.difficulty);
    }

    setFilteredAssignments(filtered);
  };

  const handleSubmit = async (assignmentData) => {
    try {
      if (editingAssignment) {
        await Assignment.update(editingAssignment.id, assignmentData);
      } else {
        await Assignment.create(assignmentData);
      }
      setShowForm(false);
      setEditingAssignment(null);
      loadAssignments();
    } catch (error) {
      console.error("Failed to save assignment:", error);
    }
  };

  const handleStatusChange = async (assignmentId, newStatus) => {
    try {
      await Assignment.update(assignmentId, { status: newStatus });
      loadAssignments();
    } catch (error) {
      console.error("Failed to update assignment status:", error);
    }
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setShowForm(true);
  };

  const handleDelete = async (assignmentId) => {
    try {
      await Assignment.delete(assignmentId);
      loadAssignments();
    } catch (error) {
      console.error("Failed to delete assignment:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Assignment Manager
          </h1>
          <p className="text-gray-600 text-lg">
            Stay organized and track your academic progress
          </p>
          
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Assignment
          </Button>
        </div>

        {/* Assignment Form Modal */}
        <AnimatePresence>
          {showForm && (
            <AssignmentForm
              assignment={editingAssignment}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingAssignment(null);
              }}
            />
          )}
        </AnimatePresence>

        {/* Filters */}
        <AssignmentFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filters={filters}
          setFilters={setFilters}
          assignments={assignments}
        />

        {/* Assignments Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-white rounded-2xl p-6 h-64 shadow-lg">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : filteredAssignments.length > 0 ? (
              filteredAssignments.map((assignment) => (
                <AssignmentCard
                  key={assignment.id}
                  assignment={assignment}
                  onStatusChange={handleStatusChange}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No assignments found
                </h3>
                <p className="text-gray-500">
                  {assignments.length === 0
                    ? "Create your first assignment to get started!"
                    : "Try adjusting your search or filters."
                  }
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}