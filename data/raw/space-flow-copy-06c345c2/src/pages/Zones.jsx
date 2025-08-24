
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Plus,
  Building2,
  MapPin,
  Briefcase
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
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import { Zone } from "@/api/entities";
import { Floor } from "@/api/entities";
import { Location } from "@/api/entities";
import { Workspace } from "@/api/entities";
import { User } from "@/api/entities";

import ZoneForm from "../components/locations/ZoneForm";
import ZoneStats from "../components/zones/ZoneStats";
import ZonesTable from "../components/zones/ZonesTable";

export default function ZonesPage() {
  const [zones, setZones] = useState([]);
  const [floors, setFloors] = useState([]);
  const [locations, setLocations] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [zoneToDelete, setZoneToDelete] = useState(null);

  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [currentUser, allZones, allFloors, allLocations, allWorkspaces] = await Promise.all([
        User.me(),
        Zone.list(),
        Floor.list(),
        Location.list(),
        Workspace.list()
      ]);

      setUser(currentUser);
      setZones(allZones);
      setFloors(allFloors);
      setLocations(allLocations);
      setWorkspaces(allWorkspaces);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load zone management data.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleEdit = (zone) => {
    setEditingZone(zone);
    setShowForm(true);
  };

  const handleFormSubmit = async (data) => {
    try {
      if (editingZone) {
        await Zone.update(editingZone.id, data);
        toast({ title: "Success", description: "Zone updated successfully." });
      } else {
        const newZone = await Zone.create(data);
        toast({ title: "Success", description: `Zone "${newZone.name}" created successfully.` });

        if (newZone && newZone.capacity > 0) {
            const workspacesToCreate = [];
            const workspaceTypeMap = {
              'open_desk': 'desk',
              'private_office': 'desk',
              'meeting_room': 'meeting_room',
              'collaboration_space': 'collaboration_space',
              'phone_booth': 'phone_booth'
            };
            const namePrefixMap = {
              'desk': 'Desk',
              'meeting_room': 'Meeting Room',
              'phone_booth': 'Phone Booth',
              'collaboration_space': 'Collaboration Space'
            };

            const workspaceType = workspaceTypeMap[newZone.zone_type] || 'desk';
            const namePrefix = namePrefixMap[workspaceType] || 'Workspace';

            for (let i = 1; i <= newZone.capacity; i++) {
              workspacesToCreate.push({
                zone_id: newZone.id,
                name: `${namePrefix} ${i}`,
                workspace_type: workspaceType,
                active: true,
              });
            }

            if (workspacesToCreate.length > 0) {
              await Workspace.bulkCreate(workspacesToCreate);
              toast({
                title: "Workspaces Created",
                description: `${workspacesToCreate.length} workspaces were automatically created for this zone.`,
                duration: 5000
              });
            }
        }
      }
      setShowForm(false);
      setEditingZone(null);
      await loadData();
    } catch (error) {
      console.error("Error saving zone and creating workspaces:", error);
      toast({
        title: "Error",
        description: "Failed to save the zone or create associated workspaces.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!zoneToDelete) return;

    const workspacesInZone = workspaces.filter(w => w.zone_id === zoneToDelete.id);
    if (workspacesInZone.length > 0) {
      toast({
        title: "Deletion Failed",
        description: "Cannot delete a zone that contains workspaces. Please remove them first.",
        variant: "destructive",
      });
      setZoneToDelete(null);
      return;
    }

    try {
      await Zone.delete(zoneToDelete.id);
      toast({ title: "Success", description: `Zone "${zoneToDelete.name}" has been deleted.` });
      setZoneToDelete(null);
      await loadData();
    } catch (error) {
      console.error("Error deleting zone:", error);
      toast({
        title: "Error",
        description: "Failed to delete the zone.",
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
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Admin Access Required</h3>
              <p className="text-slate-500">
                You need administrator privileges to manage zones.
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
              <h1 className="text-3xl font-bold text-slate-900">Manage Zones</h1>
              <p className="text-slate-600 mt-1">Oversee all workspace zones across your locations.</p>
            </div>
            <Button
              onClick={() => { setEditingZone(null); setShowForm(true); }}
              className="bg-blue-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Zone
            </Button>
          </div>

          <ZoneStats zones={zones} workspaces={workspaces} />

          <ZonesTable
            zones={zones}
            floors={floors}
            locations={locations}
            workspaces={workspaces}
            onEdit={handleEdit}
            onDelete={(zone) => setZoneToDelete(zone)}
          />

          {showForm && (
            <ZoneForm
              zone={editingZone}
              floors={floors}
              locations={locations}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingZone(null);
              }}
            />
          )}

          <AlertDialog open={!!zoneToDelete} onOpenChange={() => setZoneToDelete(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  zone "{zoneToDelete?.name}".
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
