import React, { useState, useEffect } from "react";
import { TimeOffRequest } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Clock, User as UserIcon, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";

export default function TimeOffManagement({ onStatsUpdate }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [managerNotes, setManagerNotes] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filteredRequests, setFilteredRequests] = useState([]);

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, filterStatus]);

  const loadRequests = async () => {
    try {
      const requestData = await TimeOffRequest.list('-created_date');
      setRequests(requestData);
    } catch (error) {
      console.error("Error loading time off requests:", error);
    }
    setLoading(false);
  };

  const filterRequests = () => {
    let filtered = requests;
    if (filterStatus !== "all") {
      filtered = requests.filter(request => request.status === filterStatus);
    }
    setFilteredRequests(filtered);
  };

  const handleApproveRequest = async (requestId, approved) => {
    try {
      const status = approved ? 'approved' : 'denied';
      await TimeOffRequest.update(requestId, {
        status,
        manager_notes: managerNotes,
        approval_date: new Date().toISOString(),
        approved_by: "Admin"
      });
      
      setSelectedRequest(null);
      setManagerNotes("");
      loadRequests();
      onStatsUpdate();
    } catch (error) {
      console.error("Error updating time off request:", error);
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-64 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-slate-900">Time Off Request Management</CardTitle>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requests</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="denied">Denied</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Clock className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No time off requests found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRequests.map((request) => (
                <Card key={request.id} className="border border-slate-200 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeColor(request.type)}>
                          {request.type.replace('_', ' ')}
                        </Badge>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-lg">
                      {format(parseISO(request.start_date), "MMM d")} - {format(parseISO(request.end_date), "MMM d, yyyy")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <UserIcon className="w-4 h-4" />
                        <span>{request.employee_name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4" />
                        <span>{request.total_days} day{request.total_days !== 1 ? 's' : ''}</span>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-slate-700 mb-1">Reason:</p>
                        <p className="text-sm text-slate-600 line-clamp-2">{request.reason}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-200">
                        <p className="text-xs text-slate-500">
                          Submitted {format(parseISO(request.created_date), "MMM d, yyyy")}
                        </p>
                        {request.department && (
                          <p className="text-xs text-slate-500">{request.department}</p>
                        )}
                      </div>

                      {request.status === 'pending' && (
                        <div className="flex gap-2 pt-3">
                          <Button
                            size="sm"
                            onClick={() => setSelectedRequest(request)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                          >
                            Review
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Review Time Off Request
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-slate-900">{selectedRequest.employee_name}</p>
                    <p className="text-sm text-slate-600">{selectedRequest.department}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Type</p>
                      <Badge className={getTypeColor(selectedRequest.type)}>
                        {selectedRequest.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">Duration</p>
                      <p className="text-sm text-slate-600">{selectedRequest.total_days} day{selectedRequest.total_days !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-700">Dates</p>
                    <p className="text-sm text-slate-600">
                      {format(parseISO(selectedRequest.start_date), "MMMM d, yyyy")} - {format(parseISO(selectedRequest.end_date), "MMMM d, yyyy")}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-700">Reason</p>
                    <p className="text-sm text-slate-600">{selectedRequest.reason}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Manager Notes (Optional)</label>
                  <Textarea
                    placeholder="Add notes about your decision..."
                    value={managerNotes}
                    onChange={(e) => setManagerNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleApproveRequest(selectedRequest.id, false)}
                    className="hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Deny Request
                  </Button>
                  <Button
                    onClick={() => handleApproveRequest(selectedRequest.id, true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Request
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}