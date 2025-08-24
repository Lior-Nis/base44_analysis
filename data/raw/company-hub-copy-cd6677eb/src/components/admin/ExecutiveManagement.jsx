import React, { useState, useEffect } from "react";
import { Executive } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Users } from "lucide-react";

export default function ExecutiveManagement({ onStatsUpdate }) {
  const [executives, setExecutives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExecutive, setEditingExecutive] = useState(null);

  const initialFormState = {
    full_name: "",
    position: "",
    department: "",
    bio: "",
    photo_url: "",
    email: "",
    phone: "",
    linkedin_url: "",
    office_location: "",
    years_with_company: 0,
    display_order: 0,
  };
  const [currentExecutive, setCurrentExecutive] = useState(initialFormState);

  useEffect(() => {
    loadExecutives();
  }, []);

  const loadExecutives = async () => {
    setLoading(true);
    try {
      const executiveData = await Executive.list('display_order');
      setExecutives(executiveData);
    } catch (error) {
      console.error("Error loading executives:", error);
    }
    setLoading(false);
  };

  const handleEdit = (executive) => {
    setEditingExecutive(executive);
    setCurrentExecutive(executive);
    setShowForm(true);
  };
  
  const handleNew = () => {
    setEditingExecutive(null);
    setCurrentExecutive(initialFormState);
    setShowForm(true);
  };

  const handleDelete = async (executiveId) => {
    if (window.confirm("Are you sure you want to delete this executive profile?")) {
      try {
        await Executive.delete(executiveId);
        loadExecutives();
        onStatsUpdate();
      } catch (error) {
        console.error("Error deleting executive:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSave = {
        ...currentExecutive,
        years_with_company: Number(currentExecutive.years_with_company) || 0,
        display_order: Number(currentExecutive.display_order) || 0,
      }
      if (editingExecutive) {
        await Executive.update(editingExecutive.id, dataToSave);
      } else {
        await Executive.create(dataToSave);
      }
      setShowForm(false);
      loadExecutives();
      onStatsUpdate();
    } catch (error) {
      console.error("Error saving executive:", error);
    }
  };
  
  if (loading) return <div>Loading executive profiles...</div>;

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-slate-900">Executive Management</CardTitle>
            <Button onClick={handleNew}>
              <Plus className="w-4 h-4 mr-2" />
              Add Executive
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {executives.map(exec => (
              <Card key={exec.id}>
                <CardHeader>
                  <CardTitle>{exec.full_name}</CardTitle>
                  <p className="text-sm text-slate-600">{exec.position}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(exec)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(exec.id)}>
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingExecutive ? "Edit Executive" : "Create New Executive"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Full Name</Label><Input value={currentExecutive.full_name} onChange={e => setCurrentExecutive({...currentExecutive, full_name: e.target.value})} /></div>
              <div className="space-y-2"><Label>Position</Label><Input value={currentExecutive.position} onChange={e => setCurrentExecutive({...currentExecutive, position: e.target.value})} /></div>
              <div className="space-y-2"><Label>Department</Label><Input value={currentExecutive.department} onChange={e => setCurrentExecutive({...currentExecutive, department: e.target.value})} /></div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={currentExecutive.email} onChange={e => setCurrentExecutive({...currentExecutive, email: e.target.value})} /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={currentExecutive.phone} onChange={e => setCurrentExecutive({...currentExecutive, phone: e.target.value})} /></div>
              <div className="space-y-2"><Label>Photo URL</Label><Input value={currentExecutive.photo_url} onChange={e => setCurrentExecutive({...currentExecutive, photo_url: e.target.value})} /></div>
              <div className="space-y-2"><Label>LinkedIn URL</Label><Input value={currentExecutive.linkedin_url} onChange={e => setCurrentExecutive({...currentExecutive, linkedin_url: e.target.value})} /></div>
              <div className="space-y-2"><Label>Office Location</Label><Input value={currentExecutive.office_location} onChange={e => setCurrentExecutive({...currentExecutive, office_location: e.target.value})} /></div>
              <div className="space-y-2"><Label>Years with Company</Label><Input type="number" value={currentExecutive.years_with_company} onChange={e => setCurrentExecutive({...currentExecutive, years_with_company: e.target.value})} /></div>
              <div className="space-y-2"><Label>Display Order</Label><Input type="number" value={currentExecutive.display_order} onChange={e => setCurrentExecutive({...currentExecutive, display_order: e.target.value})} /></div>
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea value={currentExecutive.bio} onChange={e => setCurrentExecutive({...currentExecutive, bio: e.target.value})} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit">Save Executive</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}