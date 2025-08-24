import React, { useState, useEffect } from "react";
import { Event } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function EventManagement({ onStatsUpdate }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const initialFormState = {
    title: "",
    description: "",
    type: "company_event",
    start_date: "",
    end_date: "",
    location: "",
    department: "",
    mandatory: false,
  };
  const [currentEvent, setCurrentEvent] = useState(initialFormState);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const eventData = await Event.list('-start_date');
      setEvents(eventData);
    } catch (error) {
      console.error("Error loading events:", error);
    }
    setLoading(false);
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setCurrentEvent({
      ...event,
      start_date: format(parseISO(event.start_date), "yyyy-MM-dd'T'HH:mm"),
      end_date: format(parseISO(event.end_date), "yyyy-MM-dd'T'HH:mm"),
    });
    setShowForm(true);
  };
  
  const handleNew = () => {
    setEditingEvent(null);
    setCurrentEvent(initialFormState);
    setShowForm(true);
  };

  const handleDelete = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await Event.delete(eventId);
        loadEvents();
        onStatsUpdate();
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await Event.update(editingEvent.id, currentEvent);
      } else {
        await Event.create(currentEvent);
      }
      setShowForm(false);
      loadEvents();
      onStatsUpdate();
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };
  
  if (loading) return <div>Loading events...</div>;

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-slate-900">Event Management</CardTitle>
            <Button onClick={handleNew}>
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>{event.type}</TableCell>
                  <TableCell>{format(parseISO(event.start_date), "MMM d, yyyy h:mm a")}</TableCell>
                  <TableCell>{event.location}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEdit(event)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDelete(event.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Edit Event" : "Create New Event"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" value={currentEvent.title} onChange={(e) => setCurrentEvent({...currentEvent, title: e.target.value})} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={currentEvent.type} onValueChange={(value) => setCurrentEvent({...currentEvent, type: value})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                          <SelectItem value="training">Training</SelectItem>
                          <SelectItem value="shift">Shift</SelectItem>
                          <SelectItem value="meeting">Meeting</SelectItem>
                          <SelectItem value="company_event">Company Event</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input id="start_date" type="datetime-local" value={currentEvent.start_date} onChange={(e) => setCurrentEvent({...currentEvent, start_date: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input id="end_date" type="datetime-local" value={currentEvent.end_date} onChange={(e) => setCurrentEvent({...currentEvent, end_date: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={currentEvent.location} onChange={(e) => setCurrentEvent({...currentEvent, location: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input id="department" value={currentEvent.department} onChange={(e) => setCurrentEvent({...currentEvent, department: e.target.value})} />
                </div>
             </div>
             <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={currentEvent.description} onChange={(e) => setCurrentEvent({...currentEvent, description: e.target.value})} />
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="mandatory" checked={currentEvent.mandatory} onChange={(e) => setCurrentEvent({...currentEvent, mandatory: e.target.checked})} />
                <Label htmlFor="mandatory">Mandatory Attendance</Label>
              </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit">Save Event</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}