import React, { useState, useEffect } from "react";
import { TimeOffRequest, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Plus, Clock, User as UserIcon, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";

export default function TimeOff() {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [newRequest, setNewRequest] = useState({
    type: "vacation",
    start_date: "",
    end_date: "",
    reason: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      const requestData = await TimeOffRequest.filter({ employee_email: userData.email }, '-created_date');
      setRequests(requestData);
    } catch (error) {
      console.error("Error loading time off data:", error);
    }
    setLoading(false);
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    return differenceInDays(new Date(end), new Date(start)) + 1;
  };

  const handleSubmitRequest = async () => {
    if (!newRequest.start_date || !newRequest.end_date || !newRequest.reason.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    const totalDays = calculateDays(newRequest.start_date, newRequest.end_date);
    
    try {
      await TimeOffRequest.create({
        ...newRequest,
        employee_name: user.full_name,
        employee_email: user.email,
        total_days: totalDays,
        department: user.department,
        manager_email: user.manager_email || "manager@company.com"
      });
      
      setShowNewRequest(false);
      setNewRequest({
        type: "vacation",
        start_date: "",
        end_date: "",
        reason: ""
      });
      loadData();
    } catch (error) {
      console.error("Error submitting request:", error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      approved: "bg-green-100 text-green-800 border-green-200",
      denied: "bg-red-100 text-red-800 border-red-200",
      cancelled: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[status] || colors.pending;
  };

  const getTypeColor = (type) => {
    const colors = {
      vacation: "bg-blue-100 text-blue-800",
      sick: "bg-red-100 text-red-800",
      personal: "bg-purple-100 text-purple-800",
      bereavement: "bg-gray-100 text-gray-800",
      maternity: "bg-pink-100 text-pink-800",
      paternity: "bg-indigo-100 text-indigo-800",
      other: "bg-slate-100 text-slate-800"
    };
    return colors[type] || colors.vacation;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <AlertCircle className="w-4 h-4" />,
      approved: <CheckCircle className="w-4 h-4" />,
      denied: <XCircle className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />
    };
    return icons[status] || icons.pending;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/4"></div>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">Time Off Requests</h1>
                <p className="text-slate-600 text-lg">Manage your vacation and leave requests</p>
              </div>
              
              <Dialog open={showNewRequest} onOpenChange={setShowNewRequest}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg">
                    <Plus className="w-5 h-5 mr-2" />
                    Request Time Off
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      New Time Off Request
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Type of Leave</Label>
                      <Select value={newRequest.type} onValueChange={(value) => setNewRequest({...newRequest, type: value})}>
                        <SelectTrigger id="type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vacation">Vacation</SelectItem>
                          <SelectItem value="sick">Sick Leave</SelectItem>
                          <SelectItem value="personal">Personal Day</SelectItem>
                          <SelectItem value="bereavement">Bereavement</SelectItem>
                          <SelectItem value="maternity">Maternity Leave</SelectItem>
                          <SelectItem value="paternity">Paternity Leave</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="start_date">Start Date</Label>
                        <Input
                          id="start_date"
                          type="date"
                          value={newRequest.start_date}
                          onChange={(e) => setNewRequest({...newRequest, start_date: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="end_date">End Date</Label>
                        <Input
                          id="end_date"
                          type="date"
                          value={newRequest.end_date}
                          onChange={(e) => setNewRequest({...newRequest, end_date: e.target.value})}
                        />
                      </div>
                    </div>

                    {newRequest.start_date && newRequest.end_date && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800 font-medium">
                          Total Days: {calculateDays(newRequest.start_date, newRequest.end_date)}
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason</Label>
                      <Textarea
                        id="reason"
                        placeholder="Please provide a reason for your time off request..."
                        value={newRequest.reason}
                        onChange={(e) => setNewRequest({...newRequest, reason: e.target.value})}
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button variant="outline" onClick={() => setShowNewRequest(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSubmitRequest} className="bg-blue-600 hover:bg-blue-700">
                        Submit Request
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Requests Grid */}
          {requests.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl">
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No Time Off Requests</h3>
                <p className="text-slate-600 mb-6">You haven't submitted any time off requests yet.</p>
                <Button onClick={() => setShowNewRequest(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Request
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.map((request) => (
                <Card key={request.id} className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-200">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeColor(request.type)}>
                          {request.type.replace('_', ' ')}
                        </Badge>
                        <Badge className={`${getStatusColor(request.status)} flex items-center gap-1`}>
                          {getStatusIcon(request.status)}
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-lg text-slate-900">
                      {format(parseISO(request.start_date), "MMM d")} - {format(parseISO(request.end_date), "MMM d, yyyy")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4" />
                        <span>{request.total_days} day{request.total_days !== 1 ? 's' : ''}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <UserIcon className="w-4 h-4" />
                        <span>Requested by {request.employee_name}</span>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm font-medium text-slate-700 mb-1">Reason:</p>
                        <p className="text-sm text-slate-600 line-clamp-2">{request.reason}</p>
                      </div>

                      {request.manager_notes && (
                        <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                          <p className="text-sm font-medium text-slate-700 mb-1">Manager Notes:</p>
                          <p className="text-sm text-slate-600">{request.manager_notes}</p>
                        </div>
                      )}

                      <div className="pt-3 border-t border-slate-200">
                        <p className="text-xs text-slate-500">
                          Submitted {format(parseISO(request.created_date), "MMM d, yyyy")}
                        </p>
                        {request.approval_date && (
                          <p className="text-xs text-slate-500">
                            {request.status === 'approved' ? 'Approved' : 'Decided'} {format(parseISO(request.approval_date), "MMM d, yyyy")}
                          </p>
                        )}
                      </div>
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