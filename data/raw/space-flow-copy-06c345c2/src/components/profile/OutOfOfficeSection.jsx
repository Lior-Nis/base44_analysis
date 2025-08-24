
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Trash2, Plane, Heart, Briefcase, User, AlertCircle } from "lucide-react";
import { format, parseISO, isWithinInterval } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

import { OutOfOffice } from "@/api/entities";
import { Booking } from "@/api/entities";

const reasonIcons = {
  vacation: Plane,
  sick_leave: Heart,
  business_trip: Briefcase,
  personal: User,
  other: AlertCircle
};

const reasonColors = {
  vacation: "bg-blue-100 text-blue-800 border-blue-200",
  sick_leave: "bg-red-100 text-red-800 border-red-200",
  business_trip: "bg-green-100 text-green-800 border-green-200",
  personal: "bg-purple-100 text-purple-800 border-purple-200",
  other: "bg-gray-100 text-gray-800 border-gray-200"
};

export default function OutOfOfficeSection({ userEmail, isReadOnly = false, isAdmin = false }) {
  const [outOfOfficeEntries, setOutOfOfficeEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    employee_email: userEmail,
    start_date: '',
    end_date: '',
    reason: 'vacation',
    notes: ''
  });

  const { toast } = useToast();

  useEffect(() => {
    loadOutOfOfficeData();
  }, [userEmail]);

  const loadOutOfOfficeData = async () => {
    setLoading(true);
    try {
      let entries;
      if (isAdmin && !userEmail) {
        // Admin viewing all entries
        entries = await OutOfOffice.list('-start_date');
      } else {
        // Specific user entries
        entries = await OutOfOffice.filter({ employee_email: userEmail }, '-start_date');
      }
      setOutOfOfficeEntries(entries);
    } catch (error) {
      console.error("Error loading out of office data:", error);
      toast({
        title: "Error",
        description: "Failed to load out of office data.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        status: 'approved', // Automatically approve for now
        submitted_by: userEmail // Track who submitted it
      };
      
      await OutOfOffice.create(data);
      
      // After creating OOO, cancel any existing bookings in that period
      const allBookings = await Booking.list();
      const oooStartDate = parseISO(data.start_date);
      const oooEndDate = parseISO(data.end_date);

      const bookingsToCancel = allBookings.filter(b => 
        b.user_email === data.employee_email &&
        b.status !== 'cancelled' && // Don't try to cancel already cancelled bookings
        isWithinInterval(parseISO(b.booking_date), { start: oooStartDate, end: oooEndDate })
      );

      if (bookingsToCancel.length > 0) {
        const cancellationPromises = bookingsToCancel.map(b => 
          Booking.update(b.id, { status: 'cancelled' })
        );
        await Promise.all(cancellationPromises);
        toast({
          title: "Bookings Cancelled",
          description: `Automatically cancelled ${bookingsToCancel.length} booking(s) for the out of office period.`,
        });
      }
      
      toast({
        title: "Success",
        description: "Out of office period added successfully.",
      });

      setShowForm(false);
      setFormData({
        employee_email: userEmail,
        start_date: '',
        end_date: '',
        reason: 'vacation',
        notes: ''
      });
      
      loadOutOfOfficeData();
    } catch (error) {
      console.error("Error submitting out of office:", error);
      toast({
        title: "Error",
        description: "Failed to submit out of office period.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await OutOfOffice.delete(id);
      toast({
        title: "Success",
        description: "Out of office period removed.",
      });
      loadOutOfOfficeData();
    } catch (error) {
      console.error("Error deleting out of office:", error);
      toast({
        title: "Error",
        description: "Failed to remove out of office period.",
        variant: "destructive",
      });
    }
  };

  const isCurrentlyOutOfOffice = () => {
    const today = new Date();
    return outOfOfficeEntries.some(entry => {
      const start = parseISO(entry.start_date);
      const end = parseISO(entry.end_date);
      return isWithinInterval(today, { start, end }) && entry.status === 'approved';
    });
  };

  if (loading) {
    return (
      <Card className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            <div className="h-20 bg-slate-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-hover border-0 shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5 text-slate-600" />
            Out of Office
            {isCurrentlyOutOfOffice() && (
              <Badge className="bg-red-100 text-red-700 border-red-200">
                Currently Out
              </Badge>
            )}
          </CardTitle>
          {!isReadOnly && (
            <Button 
              onClick={() => setShowForm(true)}
              size="sm"
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Period
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && !isReadOnly && (
          <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Reason</Label>
                <Select
                  value={formData.reason}
                  onValueChange={(value) => setFormData({...formData, reason: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vacation">Vacation</SelectItem>
                    <SelectItem value="sick_leave">Sick Leave</SelectItem>
                    <SelectItem value="business_trip">Business Trip</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional details..."
                  className="h-20"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Add Out of Office
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-3">
          {outOfOfficeEntries.length > 0 ? (
            outOfOfficeEntries.map((entry) => {
              const ReasonIcon = reasonIcons[entry.reason];
              const today = new Date();
              const isActive = isWithinInterval(today, { 
                start: parseISO(entry.start_date), 
                end: parseISO(entry.end_date) 
              });

              return (
                <div 
                  key={entry.id} 
                  className={`p-3 rounded-lg border ${
                    isActive ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <ReasonIcon className="w-4 h-4 text-slate-500" />
                        <span className="font-medium text-slate-700">
                          {format(parseISO(entry.start_date), 'MMM d')} - {format(parseISO(entry.end_date), 'MMM d, yyyy')}
                        </span>
                        {isActive && (
                          <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={reasonColors[entry.reason]}>
                          {entry.reason.replace('_', ' ')}
                        </Badge>
                        {isAdmin && entry.employee_email !== userEmail && (
                          <span className="text-sm text-slate-500">
                            {entry.employee_email}
                          </span>
                        )}
                      </div>
                      {entry.notes && (
                        <p className="text-sm text-slate-600">{entry.notes}</p>
                      )}
                    </div>
                    {!isReadOnly && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(entry.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No out of office periods</p>
              <p className="text-slate-400 text-sm mt-1">
                Add periods when you'll be out of the office
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
