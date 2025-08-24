import React, { useState, useEffect } from "react";
import { Announcement } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Pin } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function AnnouncementManagement({ onStatsUpdate }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  const initialFormState = {
    title: "",
    content: "",
    priority: "medium",
    category: "general",
    expires_at: "",
    pinned: false,
    requires_acknowledgment: false,
    target_audience: 'all',
    department: ''
  };
  const [currentAnnouncement, setCurrentAnnouncement] = useState(initialFormState);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await Announcement.list('-created_date');
      setAnnouncements(data);
    } catch (error) {
      console.error("Error loading announcements:", error);
    }
    setLoading(false);
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setCurrentAnnouncement({
        ...announcement,
        expires_at: announcement.expires_at ? format(parseISO(announcement.expires_at), "yyyy-MM-dd'T'HH:mm") : '',
    });
    setShowForm(true);
  };
  
  const handleNew = () => {
    setEditingAnnouncement(null);
    setCurrentAnnouncement(initialFormState);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        await Announcement.delete(id);
        loadAnnouncements();
        onStatsUpdate();
      } catch (error) {
        console.error("Error deleting announcement:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSave = {...currentAnnouncement};
      if (!dataToSave.expires_at) {
          delete dataToSave.expires_at;
      }
      if (editingAnnouncement) {
        await Announcement.update(editingAnnouncement.id, dataToSave);
      } else {
        await Announcement.create(dataToSave);
      }
      setShowForm(false);
      loadAnnouncements();
      onStatsUpdate();
    } catch (error) {
      console.error("Error saving announcement:", error);
    }
  };
  
  if (loading) return <div>Loading announcements...</div>;

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-slate-900">Announcement Management</CardTitle>
            <Button onClick={handleNew}>
              <Plus className="w-4 h-4 mr-2" />
              Add Announcement
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Priority</TableHead><TableHead>Category</TableHead><TableHead>Pinned</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {announcements.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.priority}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.pinned && <Pin className="w-4 h-4 text-amber-500" />}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(item)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>{editingAnnouncement ? "Edit Announcement" : "Create New Announcement"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="space-y-2"><Label>Title</Label><Input value={currentAnnouncement.title} onChange={e => setCurrentAnnouncement({...currentAnnouncement, title: e.target.value})} /></div>
            <div className="space-y-2"><Label>Content</Label><Textarea value={currentAnnouncement.content} onChange={e => setCurrentAnnouncement({...currentAnnouncement, content: e.target.value})} rows={5} /></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={currentAnnouncement.priority} onValueChange={v => setCurrentAnnouncement({...currentAnnouncement, priority: v})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent></Select>
                </div>
                <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={currentAnnouncement.category} onValueChange={v => setCurrentAnnouncement({...currentAnnouncement, category: v})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="general">General</SelectItem><SelectItem value="hr">HR</SelectItem><SelectItem value="safety">Safety</SelectItem><SelectItem value="technology">Technology</SelectItem><SelectItem value="training">Training</SelectItem><SelectItem value="events">Events</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select>
                </div>
                <div className="space-y-2">
                    <Label>Target Audience</Label>
                    <Select value={currentAnnouncement.target_audience} onValueChange={v => setCurrentAnnouncement({...currentAnnouncement, target_audience: v})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="managers">Managers</SelectItem><SelectItem value="department_specific">Department Specific</SelectItem><SelectItem value="executives">Executives</SelectItem></SelectContent></Select>
                </div>
                {currentAnnouncement.target_audience === 'department_specific' && <div className="space-y-2"><Label>Department</Label><Input value={currentAnnouncement.department} onChange={e => setCurrentAnnouncement({...currentAnnouncement, department: e.target.value})} /></div>}
                <div className="space-y-2">
                    <Label>Expires At (Optional)</Label>
                    <Input type="datetime-local" value={currentAnnouncement.expires_at} onChange={e => setCurrentAnnouncement({...currentAnnouncement, expires_at: e.target.value})} />
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2"><input type="checkbox" id="pinned" checked={currentAnnouncement.pinned} onChange={e => setCurrentAnnouncement({...currentAnnouncement, pinned: e.target.checked})} /><Label htmlFor="pinned">Pin Announcement</Label></div>
                <div className="flex items-center space-x-2"><input type="checkbox" id="requires_acknowledgment" checked={currentAnnouncement.requires_acknowledgment} onChange={e => setCurrentAnnouncement({...currentAnnouncement, requires_acknowledgment: e.target.checked})} /><Label htmlFor="requires_acknowledgment">Require Acknowledgment</Label></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit">Save Announcement</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}