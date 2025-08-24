import React, { useState, useEffect } from "react";
import { Ticket, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Ticket as TicketIcon, Plus, Clock, User as UserIcon, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function Tickets() {
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    description: "",
    category: "other",
    priority: "medium"
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      const ticketData = await Ticket.filter({ requester_email: userData.email }, '-created_date');
      setTickets(ticketData);
    } catch (error) {
      console.error("Error loading tickets:", error);
    }
    setLoading(false);
  };

  const handleSubmitTicket = async () => {
    if (!newTicket.subject.trim() || !newTicket.description.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      await Ticket.create({
        ...newTicket,
        requester_name: user.full_name,
        requester_email: user.email,
        department: user.department
      });
      
      setShowNewTicket(false);
      setNewTicket({
        subject: "",
        description: "",
        category: "other",
        priority: "medium"
      });
      loadData();
    } catch (error) {
      console.error("Error submitting ticket:", error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: "bg-blue-100 text-blue-800 border-blue-200",
      in_progress: "bg-yellow-100 text-yellow-800 border-yellow-200",
      waiting_response: "bg-purple-100 text-purple-800 border-purple-200",
      resolved: "bg-green-100 text-green-800 border-green-200",
      closed: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[status] || colors.open;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-blue-100 text-blue-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800"
    };
    return colors[priority] || colors.medium;
  };

  const getCategoryColor = (category) => {
    const colors = {
      technical: "bg-indigo-100 text-indigo-800",
      hr: "bg-blue-100 text-blue-800",
      facilities: "bg-green-100 text-green-800",
      policy: "bg-purple-100 text-purple-800",
      training: "bg-amber-100 text-amber-800",
      other: "bg-gray-100 text-gray-800"
    };
    return colors[category] || colors.other;
  };

  const getStatusIcon = (status) => {
    const icons = {
      open: <AlertCircle className="w-4 h-4" />,
      in_progress: <Clock className="w-4 h-4" />,
      waiting_response: <Clock className="w-4 h-4" />,
      resolved: <CheckCircle className="w-4 h-4" />,
      closed: <XCircle className="w-4 h-4" />
    };
    return icons[status] || icons.open;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-64 bg-slate-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">Support Tickets</h1>
                <p className="text-slate-600 text-lg">Get help and support from our team</p>
              </div>
              
              <Dialog open={showNewTicket} onOpenChange={setShowNewTicket}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700 shadow-lg">
                    <Plus className="w-5 h-5 mr-2" />
                    New Support Ticket
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <TicketIcon className="w-5 h-5 text-purple-600" />
                      Create Support Ticket
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        placeholder="Brief description of your issue"
                        value={newTicket.subject}
                        onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={newTicket.category} onValueChange={(value) => setNewTicket({...newTicket, category: value})}>
                          <SelectTrigger id="category">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technical">Technical Issue</SelectItem>
                            <SelectItem value="hr">Human Resources</SelectItem>
                            <SelectItem value="facilities">Facilities</SelectItem>
                            <SelectItem value="policy">Policy Question</SelectItem>
                            <SelectItem value="training">Training Request</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select value={newTicket.priority} onValueChange={(value) => setNewTicket({...newTicket, priority: value})}>
                          <SelectTrigger id="priority">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Please provide detailed information about your issue or request..."
                        value={newTicket.description}
                        onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                        rows={4}
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button variant="outline" onClick={() => setShowNewTicket(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSubmitTicket} className="bg-purple-600 hover:bg-purple-700">
                        Submit Ticket
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Tickets Grid */}
          {tickets.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl">
              <CardContent className="p-12 text-center">
                <TicketIcon className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Support Tickets</h3>
                <p className="text-slate-600 mb-6">You haven't submitted any support tickets yet.</p>
                <Button onClick={() => setShowNewTicket(true)} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Ticket
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tickets.map((ticket) => (
                <Card key={ticket.id} className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-200">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStatusColor(ticket.status)} flex items-center gap-1`}>
                          {getStatusIcon(ticket.status)}
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-lg text-slate-900 line-clamp-2">
                      {ticket.subject}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Badge className={getCategoryColor(ticket.category)}>
                        {ticket.category.replace('_', ' ')}
                      </Badge>
                      
                      <p className="text-sm text-slate-600 line-clamp-3">
                        {ticket.description}
                      </p>
                      
                      <div className="space-y-2 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4" />
                          <span>Created by {ticket.requester_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{format(parseISO(ticket.created_date), "MMM d, yyyy 'at' h:mm a")}</span>
                        </div>
                        {ticket.assigned_to && (
                          <div className="text-sm">
                            <span className="font-medium">Assigned to:</span> {ticket.assigned_to}
                          </div>
                        )}
                      </div>

                      {ticket.resolution_notes && (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm font-medium text-green-800 mb-1">Resolution Notes:</p>
                          <p className="text-sm text-green-700">{ticket.resolution_notes}</p>
                        </div>
                      )}

                      {ticket.due_date && (
                        <div className="pt-3 border-t border-slate-200">
                          <p className="text-xs text-slate-500">
                            Due: {format(parseISO(ticket.due_date), "MMM d, yyyy")}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}