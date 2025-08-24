
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Plus,
  MapPin,
  Edit,
  Trash2,
  Users,
  Calendar
} from "lucide-react";

import { Location } from "@/api/entities";
import { Floor } from "@/api/entities";
import { Zone } from "@/api/entities";
import { Workspace } from "@/api/entities";
import { User } from "@/api/entities";

import LocationForm from "../components/locations/LocationForm";
import FloorForm from "../components/locations/FloorForm";
import ZoneForm from "../components/locations/ZoneForm";
import WorkspaceForm from "../components/locations/WorkspaceForm";
import LocationCard from "../components/locations/LocationCard";

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [floors, setFloors] = useState([]);
  const [zones, setZones] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [showFloorForm, setShowFloorForm] = useState(false);
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [showWorkspaceForm, setShowWorkspaceForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [currentUser, allLocations, allFloors, allZones, allWorkspaces] = await Promise.all([
        User.me(),
        Location.list(),
        Floor.list(),
        Zone.list(),
        Workspace.list()
      ]);

      setUser(currentUser);
      setLocations(allLocations);
      setFloors(allFloors);
      setZones(allZones);
      setWorkspaces(allWorkspaces);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handleLocationSubmit = async (data) => {
    try {
      // If setting as default, remove default flag from other locations first
      if (data.is_default) {
        const currentDefaultLocations = locations.filter(l => l.is_default && l.id !== editingItem?.id);
        for (const defaultLocation of currentDefaultLocations) {
          await Location.update(defaultLocation.id, { is_default: false });
        }
      }

      if (editingItem) {
        await Location.update(editingItem.id, data);
      } else {
        await Location.create(data);
      }
      setShowLocationForm(false);
      setEditingItem(null);
      loadData();
    } catch (error) {
      console.error("Error saving location:", error);
    }
  };

  const handleFloorSubmit = async (data) => {
    try {
      if (editingItem) {
        await Floor.update(editingItem.id, data);
      } else {
        await Floor.create({ ...data, location_id: selectedLocation });
      }
      setShowFloorForm(false);
      setEditingItem(null);
      loadData();
    } catch (error) {
      console.error("Error saving floor:", error);
    }
  };

  const handleZoneSubmit = async (data) => {
    try {
      if (editingItem) {
        await Zone.update(editingItem.id, data);
      } else {
        await Zone.create({ ...data, floor_id: selectedFloor });
      }
      setShowZoneForm(false);
      setEditingItem(null);
      loadData();
    } catch (error) {
      console.error("Error saving zone:", error);
    }
  };

  const handleWorkspaceSubmit = async (data) => {
    try {
      if (editingItem) {
        await Workspace.update(editingItem.id, data);
      } else {
        await Workspace.create({ ...data, zone_id: selectedZone });
      }
      setShowWorkspaceForm(false);
      setEditingItem(null);
      loadData();
    } catch (error) {
      console.error("Error saving workspace:", error);
    }
  };

  const handleEdit = (type, item) => {
    setEditingItem(item);
    switch (type) {
      case 'location':
        setShowLocationForm(true);
        break;
      case 'floor':
        setSelectedLocation(item.location_id);
        setShowFloorForm(true);
        break;
      case 'zone':
        const floor = floors.find(f => f.id === item.floor_id);
        setSelectedLocation(floor?.location_id);
        setSelectedFloor(item.floor_id);
        setShowZoneForm(true);
        break;
      case 'workspace':
        const zone = zones.find(z => z.id === item.zone_id);
        const parentFloor = floors.find(f => f.id === zone?.floor_id);
        setSelectedLocation(parentFloor?.location_id);
        setSelectedFloor(zone?.floor_id);
        setSelectedZone(item.zone_id);
        setShowWorkspaceForm(true);
        break;
    }
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8 gradient-bg min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-48 bg-slate-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="p-6 md:p-8 gradient-bg min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Admin Access Required</h3>
              <p className="text-slate-500">
                You need administrator privileges to manage office locations.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 gradient-bg min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Office Locations</h1>
            <p className="text-slate-600 mt-1">Manage your office infrastructure and workspaces</p>
          </div>
          <Button
            onClick={() => setShowLocationForm(true)}
            className="bg-blue-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Location
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Locations</p>
                  <p className="text-3xl font-bold text-slate-900">{locations.length}</p>
                </div>
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Floors</p>
                  <p className="text-3xl font-bold text-slate-900">{floors.length}</p>
                </div>
                <MapPin className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Zones</p>
                  <p className="text-3xl font-bold text-slate-900">{zones.length}</p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Workspaces</p>
                  <p className="text-3xl font-bold text-slate-900">{workspaces.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-slate-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {locations.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              floors={floors.filter(f => f.location_id === location.id)}
              zones={zones}
              workspaces={workspaces}
              onEdit={handleEdit}
              onAddFloor={(locationId) => {
                setSelectedLocation(locationId);
                setShowFloorForm(true);
              }}
              onAddZone={(floorId) => {
                const floor = floors.find(f => f.id === floorId);
                setSelectedLocation(floor?.location_id);
                setSelectedFloor(floorId);
                setShowZoneForm(true);
              }}
              onAddWorkspace={(zoneId) => {
                const zone = zones.find(z => z.id === zoneId);
                const floor = floors.find(f => f.id === zone?.floor_id);
                setSelectedLocation(floor?.location_id);
                setSelectedFloor(zone?.floor_id);
                setSelectedZone(zoneId);
                setShowWorkspaceForm(true);
              }}
            />
          ))}
        </div>

        {/* Forms */}
        {showLocationForm && (
          <LocationForm
            location={editingItem}
            onSubmit={handleLocationSubmit}
            onCancel={() => {
              setShowLocationForm(false);
              setEditingItem(null);
            }}
          />
        )}

        {showFloorForm && (
          <FloorForm
            floor={editingItem}
            locationId={selectedLocation}
            locations={locations}
            onSubmit={handleFloorSubmit}
            onCancel={() => {
              setShowFloorForm(false);
              setEditingItem(null);
              setSelectedLocation(null);
            }}
          />
        )}

        {showZoneForm && (
          <ZoneForm
            zone={editingItem}
            floorId={selectedFloor}
            floors={floors}
            locations={locations}
            onSubmit={handleZoneSubmit}
            onCancel={() => {
              setShowZoneForm(false);
              setEditingItem(null);
              setSelectedFloor(null);
            }}
          />
        )}

        {showWorkspaceForm && (
          <WorkspaceForm
            workspace={editingItem}
            zoneId={selectedZone}
            zones={zones}
            onSubmit={handleWorkspaceSubmit}
            onCancel={() => {
              setShowWorkspaceForm(false);
              setEditingItem(null);
              setSelectedZone(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
