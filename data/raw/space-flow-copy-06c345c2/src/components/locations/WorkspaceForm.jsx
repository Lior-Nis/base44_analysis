
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Briefcase, X, Plus, Trash2 } from "lucide-react";

const workspaceTypes = [
  { value: 'desk', label: 'Desk' },
  { value: 'meeting_room', label: 'Meeting Room' },
  { value: 'phone_booth', label: 'Phone Booth' },
  { value: 'collaboration_space', label: 'Collaboration Space' }
];

export default function WorkspaceForm({ workspace, zoneId, zones, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: workspace?.name || '',
    description: workspace?.description || '',
    workspace_type: workspace?.workspace_type || 'desk',
    equipment: workspace?.equipment || [],
    active: workspace?.active ?? true,
    zone_id: workspace?.zone_id || zoneId || ''
  });
  
  const [newEquipment, setNewEquipment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleAddEquipment = () => {
    if (newEquipment && !formData.equipment.includes(newEquipment)) {
      handleInputChange('equipment', [...formData.equipment, newEquipment]);
      setNewEquipment('');
    }
  };

  const handleRemoveEquipment = (itemToRemove) => {
    handleInputChange('equipment', formData.equipment.filter(item => item !== itemToRemove));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Briefcase className="w-5 h-5 text-slate-600" />
              {workspace ? 'Edit Workspace' : 'New Workspace'}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="max-h-[80vh] overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!zoneId && (
              <div className="space-y-2">
                <Label htmlFor="zone">Zone</Label>
                <Select
                  value={formData.zone_id}
                  onValueChange={(value) => handleInputChange('zone_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {zones?.filter(z => z.active).map(z => (
                      <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="name">Workspace Name/Number</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Desk #101, Conference Room 'Mars'"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workspace_type">Workspace Type</Label>
              <Select 
                value={formData.workspace_type} 
                onValueChange={(value) => handleInputChange('workspace_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select workspace type" />
                </SelectTrigger>
                <SelectContent>
                  {workspaceTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Equipment</Label>
              <div className="flex gap-2">
                <Input
                  value={newEquipment}
                  onChange={(e) => setNewEquipment(e.target.value)}
                  placeholder="e.g., Monitor, Webcam"
                />
                <Button type="button" variant="outline" onClick={handleAddEquipment}>
                  <Plus className="w-4 h-4 mr-2" /> Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {formData.equipment.map((item, index) => (
                  <div key={index} className="flex items-center gap-1 bg-slate-100 rounded-full px-3 py-1 text-sm">
                    <span>{item}</span>
                    <button type="button" onClick={() => handleRemoveEquipment(item)}>
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of this workspace..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => handleInputChange('active', checked)}
              />
              <Label htmlFor="active">Active Workspace</Label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-slate-900 hover:bg-slate-800 text-white"
                disabled={!formData.zone_id}
              >
                {workspace ? 'Update' : 'Create'} Workspace
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
