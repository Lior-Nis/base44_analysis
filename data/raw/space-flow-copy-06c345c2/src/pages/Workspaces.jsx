
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Briefcase, 
  Plus,
  ArrowLeft
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
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";

import { Workspace } from "@/api/entities";
import { Zone } from "@/api/entities";
import { User } from "@/api/entities";

import WorkspaceForm from "../components/locations/WorkspaceForm";
import WorkspaceStats from "../components/workspaces/WorkspaceStats";
import WorkspacesTable from "../components/workspaces/WorkspacesTable";

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState([]);
  const [zones, setZones] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);
  const [workspaceToDelete, setWorkspaceToDelete] = useState(null);

  const [filteredZone, setFilteredZone] = useState(null);

  const { toast } = useToast();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const zoneId = params.get('zoneId');
    loadData(zoneId);
  }, [location.search]);

  const loadData = async (zoneId = null) => {
    setLoading(true);
    try {
      const [currentUser, allWorkspaces, allZones] = await Promise.all([
        User.me(),
        Workspace.list(),
        Zone.list()
      ]);

      setUser(currentUser);
      
      if (zoneId) {
        setWorkspaces(allWorkspaces.filter(w => w.zone_id === zoneId));
        const zone = allZones.find(z => z.id === zoneId);
        setFilteredZone(zone);
      } else {
        setWorkspaces(allWorkspaces);
        setFilteredZone(null);
      }
      
      setZones(allZones);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load workspace management data.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleEdit = (workspace) => {
    setEditingWorkspace(workspace);
    setShowForm(true);
  };
  
  const handleFormSubmit = async (data) => {
    try {
      if (editingWorkspace) {
        await Workspace.update(editingWorkspace.id, data);
        toast({ title: "Success", description: "Workspace updated successfully." });
      } else {
        await Workspace.create(data);
        toast({ title: "Success", description: "Workspace created successfully." });
      }
      setShowForm(false);
      setEditingWorkspace(null);
      loadData(filteredZone?.id);
    } catch (error) {
      console.error("Error saving workspace:", error);
      toast({
        title: "Error",
        description: "Failed to save the workspace.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!workspaceToDelete) return;

    try {
      await Workspace.delete(workspaceToDelete.id);
      toast({ title: "Success", description: `Workspace "${workspaceToDelete.name}" has been deleted.` });
      setWorkspaceToDelete(null);
      loadData(filteredZone?.id);
    } catch (error) {
      console.error("Error deleting workspace:", error);
      toast({
        title: "Error",
        description: "Failed to delete the workspace.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
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
  
  if (user?.role !== 'admin') {
    return (
      <div className="p-6 md:p-8 gradient-bg min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Card className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Admin Access Required</h3>
              <p className="text-slate-500">
                You need administrator privileges to manage workspaces.
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
      <div className="p-6 md:p-8 gradient-bg min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Manage Workspaces</h1>
              <p className="text-slate-600 mt-1">
                {filteredZone 
                  ? `Workspaces in zone: ${filteredZone.name}`
                  : "Oversee all workspaces available for booking."
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              {filteredZone && (
                 <Link to={createPageUrl("Zones")}>
                    <Button className="bg-blue-600 text-white">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Zones
                    </Button>
                 </Link>
              )}
              <Button 
                onClick={() => { setEditingWorkspace(null); setShowForm(true); }}
                className="bg-blue-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Workspace
              </Button>
            </div>
          </div>

          <WorkspaceStats workspaces={workspaces} />

          <WorkspacesTable 
            workspaces={workspaces}
            zones={zones}
            onEdit={handleEdit}
            onDelete={(workspace) => setWorkspaceToDelete(workspace)}
          />

          {showForm && (
            <WorkspaceForm
              workspace={editingWorkspace}
              zones={zones}
              zoneId={filteredZone?.id}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingWorkspace(null);
              }}
            />
          )}

          <AlertDialog open={!!workspaceToDelete} onOpenChange={() => setWorkspaceToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the 
                  workspace "{workspaceToDelete?.name}". Any existing bookings will NOT be deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-blue-600 text-white">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm} className="bg-blue-600 text-white">
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
