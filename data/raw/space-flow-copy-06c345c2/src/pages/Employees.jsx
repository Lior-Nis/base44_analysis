
import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users as UsersIcon,
  Plus,
  Trash2
} from "lucide-react";
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
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

import { Employee } from "@/api/entities";
import { User } from "@/api/entities";
import { useCurrentUser } from "@/components/useCurrentUser";
import { useData } from "@/components/DataProvider";

import EmployeeForm from "../components/employees/EmployeeForm";
import EmployeeStats from "../components/employees/EmployeeStats";
import EmployeesTable from "../components/employees/EmployeesTable";
import UserManagement from "../components/employees/UserManagement";

export default function EmployeesPage() {
  const { 
    employees, 
    workspaces, 
    zones, 
    floors, 
    locations, 
    loading, 
    refreshData 
  } = useData();
  const { user: realUser, loading: userLoading } = useCurrentUser();
  
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [hasMerged, setHasMerged] = useState(false);
  const [selectedEmployeeForCleanup, setSelectedEmployeeForCleanup] = useState(null);

  const { toast } = useToast();

  const mergeDuplicateEmployees = useCallback(async (employeesToMerge) => {
    try {
      const emailGroups = {};
      employeesToMerge.forEach(emp => {
        if (!emp.email) {
          return;
        }
        const email = emp.email.toLowerCase();
        if (!emailGroups[email]) {
          emailGroups[email] = [];
        }
        emailGroups[email].push(emp);
      });

      const duplicateGroups = Object.values(emailGroups).filter(group => group.length > 1);
      
      if (duplicateGroups.length === 0) {
        return false;
      }

      for (const group of duplicateGroups) {
        const sortedGroup = group.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        const keepEmployee = sortedGroup[0];
        const duplicatesToDelete = sortedGroup.slice(1);
        
        const mergedData = {
          ...keepEmployee,
          name: keepEmployee.name || duplicatesToDelete.find(d => d.name)?.name || keepEmployee.name,
          department: keepEmployee.department || duplicatesToDelete.find(d => d.department)?.department || '',
          assigned_location_id: keepEmployee.assigned_location_id || duplicatesToDelete.find(d => d.assigned_location_id)?.assigned_location_id || '',
          work_days: keepEmployee.work_days?.length > 0 ? keepEmployee.work_days : 
                     duplicatesToDelete.find(d => d.work_days?.length > 0)?.work_days || [],
          dedicated_workspace_id: keepEmployee.dedicated_workspace_id || duplicatesToDelete.find(d => d.dedicated_workspace_id)?.dedicated_workspace_id || '',
          preferred_zone_id: keepEmployee.preferred_zone_id || duplicatesToDelete.find(d => d.preferred_zone_id)?.preferred_zone_id || '',
          active: true
        };
        
        try {
          await Employee.update(keepEmployee.id, mergedData);
        } catch (updateError) {
          console.error(`Failed to update kept employee ${keepEmployee.id}:`, updateError);
        }

        for (const duplicate of duplicatesToDelete) {
          try {
            await Employee.delete(duplicate.id);
          } catch (error) {
            if (!error.message?.includes('404')) {
              console.error(`Failed to delete duplicate employee ${duplicate.id}:`, error);
            }
          }
        }
      }

      toast({
        title: "Duplicates Merged",
        description: `Found and merged ${duplicateGroups.length} duplicate employee email(s).`,
      });
      return true;
    } catch (error) {
      console.error("Error merging duplicate employees:", error);
      return false;
    }
  }, [toast]);

  useEffect(() => {
    if (!loading && employees.length > 0 && !hasMerged) {
      const runMerge = async () => {
        const wasMerged = await mergeDuplicateEmployees(employees);
        if (wasMerged) {
          await refreshData();
        }
        setHasMerged(true);
      };
      runMerge();
    }
  }, [loading, employees, hasMerged, mergeDuplicateEmployees, refreshData]);

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleFormSubmit = async (data) => {
    try {
      if (editingEmployee) {
        // Defensive check to ensure the employee record still exists before updating
        const employeeCheck = await Employee.filter({ id: editingEmployee.id });
        if (employeeCheck.length === 0) {
            toast({
                title: "Update Failed",
                description: "This employee no longer exists and cannot be updated. The list will be refreshed.",
                variant: "destructive",
            });
            setShowForm(false);
            setEditingEmployee(null);
            await refreshData();
            return;
        }

        await Employee.update(editingEmployee.id, data);
        toast({ title: "Success", description: "Employee updated successfully." });
      } else {
        const existingEmployees = employees.filter(e => e.email?.toLowerCase() === data.email?.toLowerCase());
        if (existingEmployees.length > 0) {
          toast({
            title: "Duplicate Email",
            description: `An employee with email ${data.email} already exists: ${existingEmployees[0].name}`,
            variant: "destructive",
          });
          return;
        }

        await Employee.create(data);
        toast({ title: "Success", description: "Employee added successfully." });
        toast({
            title: "Next Step: Invite User",
            description: `Remember to invite ${data.name} (${data.email}) to the app so they can log in.`,
            duration: 10000,
        });
      }
      
      // Update user record if it exists - with proper error handling
      try {
        const usersToUpdate = await User.filter({ email: data.email });
        if (usersToUpdate.length > 0) {
          const userToUpdate = usersToUpdate[0];
          const workDays = data.work_days || [];
          const workSchedule = {
            sunday: workDays.includes('sunday') ? 'office' : 'remote',
            monday: workDays.includes('monday') ? 'office' : 'remote',
            tuesday: workDays.includes('tuesday') ? 'office' : 'remote',
            wednesday: workDays.includes('wednesday') ? 'office' : 'remote',
            thursday: workDays.includes('thursday') ? 'office' : 'remote',
          };
          
          // Only update fields that are part of our User entity schema
          const updateData = {
            department: data.department || '',
            work_schedule: workSchedule,
            assigned_location_id: data.assigned_location_id || null
          };
          
          await User.update(userToUpdate.id, updateData);
          console.log('User record updated successfully for:', data.email);
        }
      } catch (userUpdateError) {
        console.warn('Failed to update user record, but employee was saved:', userUpdateError);
        // Don't show error to user since employee save was successful
      }

      setShowForm(false);
      setEditingEmployee(null);
      await refreshData();
    } catch (error) {
      console.error("Error saving employee:", error);
      toast({
        title: "Error",
        description: "Failed to save employee details.",
        variant: "destructive",
      });
    }
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedEmployees.length === 0) return;

    try {
      const deletePromises = selectedEmployees.map(id => Employee.delete(id).catch(err => ({id, error: err})));
      const results = await Promise.all(deletePromises);
      
      const successfulDeletes = results.filter(r => !r?.error);
      const failedDeletes = results.filter(r => r?.error && !r.error.message.includes('404'));

      if (successfulDeletes.length > 0) {
        toast({ 
          title: "Success", 
          description: `${successfulDeletes.length} employee(s) deleted.`
        });
      }

      if (failedDeletes.length > 0) {
        toast({
          title: "Warning",
          description: `${failedDeletes.length} employee(s) could not be deleted.`,
          variant: "destructive",
        });
      }

      setShowDeleteConfirm(false);
      setSelectedEmployees([]);
      await refreshData();
    } catch (error) {
      console.error("Error during bulk delete:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during deletion.",
        variant: "destructive",
      });
      setShowDeleteConfirm(false);
      setSelectedEmployees([]);
      await refreshData();
    }
  };

  const handleUserCleanupSuccess = async () => {
    setSelectedEmployeeForCleanup(null);
    await refreshData();
    toast({
      title: "User Deactivated",
      description: "The user has been successfully deactivated and their data cleaned up.",
    });
  };

  if (userLoading || loading) {
    return (
      <div className="p-6 md:p-8 gradient-bg min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-64"></div>
            <div className="h-48 bg-slate-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (realUser?.role !== 'admin') {
    return (
      <div className="p-6 md:p-8 gradient-bg min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Card className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <UsersIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Admin Access Required</h3>
              <p className="text-slate-500">
                You need administrator privileges to manage employees.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <div className="p-4 md:p-8 gradient-bg min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900">Manage Employees</h1>
              <p className="text-slate-600 mt-1">
                Oversee employee schedules and dedicated workspace assignments.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {selectedEmployees.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-1/2 sm:w-auto" 
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete ({selectedEmployees.length})
                </Button>
              )}
              <Button
                onClick={() => { setEditingEmployee(null); setShowForm(true); }}
                className="bg-blue-600 text-white w-1/2 sm:w-auto" 
              >
                <Plus className="w-4 h-4 mr-2" />
                New Employee
              </Button>
            </div>
          </div>

          <EmployeeStats employees={employees} />

          <EmployeesTable
            employees={employees}
            workspaces={workspaces}
            zones={zones}
            floors={floors}
            locations={locations}
            selectedEmployees={selectedEmployees}
            onSelectionChange={setSelectedEmployees}
            onEdit={handleEdit}
            onUserManagement={(employee) => setSelectedEmployeeForCleanup(employee)}
          />

          {showForm && (
            <EmployeeForm
              employee={editingEmployee}
              workspaces={workspaces}
              employees={employees}
              zones={zones}
              floors={floors}
              locations={locations}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingEmployee(null);
              }}
            />
          )}

          {selectedEmployeeForCleanup && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="w-full max-w-md">
                <UserManagement
                  employee={selectedEmployeeForCleanup}
                  onSuccess={handleUserCleanupSuccess}
                />
                <Button
                  variant="outline"
                  onClick={() => setSelectedEmployeeForCleanup(null)}
                  className="w-full mt-4" 
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  <strong> {selectedEmployees.length} selected employee(s)</strong>.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel> 
                <AlertDialogAction onClick={handleBulkDeleteConfirm}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </>
  );
}
