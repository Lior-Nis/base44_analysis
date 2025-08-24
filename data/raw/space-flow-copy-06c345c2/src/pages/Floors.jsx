
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Plus, 
  Building2,
  Layers
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

import { Floor } from "@/api/entities";
import { Location } from "@/api/entities";
import { Zone } from "@/api/entities";
import { Workspace } from "@/api/entities";
import { User } from "@/api/entities";

import FloorForm from "../components/locations/FloorForm";
import FloorStats from "../components/floors/FloorStats";
import FloorsTable from "../components/floors/FloorsTable";

export default function FloorsPage() {
  const [floors, setFloors] = useState([]);
  const [locations, setLocations] = useState([]);
  const [zones, setZones] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [editingFloor, setEditingFloor] = useState(null);
  const [floorToDelete, setFloorToDelete] = useState(null);
  
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [currentUser, allFloors, allLocations, allZones, allWorkspaces] = await Promise.all([
        User.me(),
        Floor.list(),
        Location.list(),
        Zone.list(),
        Workspace.list()
      ]);

      setUser(currentUser);
      setFloors(allFloors);
      setLocations(allLocations);
      setZones(allZones);
      setWorkspaces(allWorkspaces);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load floor management data.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleEdit = (floor) => {
    setEditingFloor(floor);
    setShowForm(true);
  };
  
  const handleFormSubmit = async (data) => {
    try {
      if (editingFloor) {
        await Floor.update(editingFloor.id, data);
        toast({ title: "Success", description: "Floor updated successfully." });
      } else {
        await Floor.create(data);
        toast({ title: "Success", description: "Floor created successfully." });
      }
      setShowForm(false);
      setEditingFloor(null);
      loadData();
    } catch (error) {
      console.error("Error saving floor:", error);
      toast({
        title: "Error",
        description: "Failed to save the floor.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!floorToDelete) return;

    const zonesOnFloor = zones.filter(z => z.floor_id === floorToDelete.id);
    if (zonesOnFloor.length > 0) {
      toast({
        title: "Deletion Failed",
        description: "Cannot delete a floor that contains zones. Please remove them first.",
        variant: "destructive",
      });
      setFloorToDelete(null);
      return;
    }

    try {
      await Floor.delete(floorToDelete.id);
      toast({ title: "Success", description: `Floor "${floorToDelete.name}" has been deleted.` });
      setFloorToDelete(null);
      loadData();
    } catch (error) {
      console.error("Error deleting floor:", error);
      toast({
        title: "Error",
        description: "Failed to delete the floor.",
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
              <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Admin Access Required</h3>
              <p className="text-slate-500">
                You need administrator privileges to manage floors.
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
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Manage Floors</h1>
              <p className="text-slate-600 mt-1">Oversee all floors across your office locations.</p>
            </div>
            <Button 
              onClick={() => { setEditingFloor(null); setShowForm(true); }}
              className="bg-blue-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Floor
            </Button>
          </div>

          <FloorStats floors={floors} zones={zones} workspaces={workspaces} />

          <FloorsTable 
            floors={floors}
            locations={locations}
            zones={zones}
            workspaces={workspaces}
            onEdit={handleEdit}
            onDelete={(floor) => setFloorToDelete(floor)}
          />

          {showForm && (
            <FloorForm
              floor={editingFloor}
              locations={locations}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingFloor(null);
              }}
            />
          )}

          <AlertDialog open={!!floorToDelete} onOpenChange={() => setFloorToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the 
                  floor "{floorToDelete?.name}" and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm}>
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
