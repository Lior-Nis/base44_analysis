import React, { useState, useEffect } from "react";
import { Ticket } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Clock, CheckCircle, XCircle } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function TicketManagement({ onStatsUpdate }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketUpdate, setTicketUpdate] = useState({ status: "", resolution_notes: "", assigned_to: "" });
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    loadTickets();
  }, [filterStatus]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const filters = filterStatus === "all" ? {} : { status: filterStatus };
      const ticketData = await Ticket.filter(filters, '-created_date');
      setTickets(ticketData);
    } catch (error) {
      console.error("Error loading tickets:", error);
    }
    setLoading(false);
  };

  const handleView = (ticket) => {
    setSelectedTicket(ticket);
    setTicketUpdate({
      status: ticket.status,
      resolution_notes: ticket.resolution_notes || "",
      assigned_to: ticket.assigned_to || ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    try {
      await Ticket.update(selectedTicket.id, ticketUpdate);
      setSelectedTicket(null);
      loadTickets();
      onStatsUpdate();
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
  };

  const getStatusColor = (status) => {
    const colors = { open: "bg-blue-100 text-blue-800", in_progress: "bg-yellow-100 text-yellow-800", waiting_response: "bg-purple-100 text-purple-800", resolved: "bg-green-100 text-green-800", closed: "bg-gray-100 text-gray-800" };
    return colors[status] || colors.open;
  };

  const getPriorityColor = (priority) => {
    const colors = { low: "text-blue-600", medium: "text-yellow-600", high: "text-orange-600", urgent: "text-red-600" };
    return colors[priority] || colors.medium;
  };
  
  if (loading) return <div>Loading tickets...</div>;

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-slate-900">Ticket Management</CardTitle>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48"><SelectValue placeholder="Filter by status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="waiting_response">Waiting Response</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Requester</TableHead><TableHead>Status</TableHead><TableHead>Priority</TableHead><TableHead>Created</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">{ticket.subject}</TableCell>
                  <TableCell>{ticket.requester_name}</TableCell>
                  <TableCell><Badge className={getStatusColor(ticket.status)}>{ticket.status.replace('_', ' ')}</Badge></TableCell>
                  <TableCell className={getPriorityColor(ticket.priority)}>{ticket.priority}</TableCell>
                  <TableCell>{format(parseISO(ticket.created_date), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleView(ticket)}><Eye className="w-4 h-4 mr-1" /> View / Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>Ticket Details</DialogTitle></DialogHeader>
          {selectedTicket && (
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div><h3 className="font-semibold">{selectedTicket.subject}</h3><p className="text-sm text-slate-600">from {selectedTicket.requester_name}</p></div>
              <p className="text-sm bg-slate-50 p-3 rounded-md">{selectedTicket.description}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Assigned To</Label><Input value={ticketUpdate.assigned_to} onChange={e => setTicketUpdate({...ticketUpdate, assigned_to: e.target.value})} /></div>
                <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={ticketUpdate.status} onValueChange={v => setTicketUpdate({...ticketUpdate, status: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="open">Open</SelectItem><SelectItem value="in_progress">In Progress</SelectItem><SelectItem value="waiting_response">Waiting Response</SelectItem><SelectItem value="resolved">Resolved</SelectItem><SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
              </div>
              <div className="space-y-2"><Label>Resolution Notes</Label><Textarea value={ticketUpdate.resolution_notes} onChange={e => setTicketUpdate({...ticketUpdate, resolution_notes: e.target.value})} /></div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setSelectedTicket(null)}>Cancel</Button>
                <Button type="submit">Update Ticket</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}