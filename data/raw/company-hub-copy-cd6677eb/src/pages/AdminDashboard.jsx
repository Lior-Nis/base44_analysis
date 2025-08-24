import React, { useState, useEffect } from "react";
import { Event, Policy, Executive, Announcement, Ticket, TimeOffRequest, User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Calendar, 
  FileText, 
  Users, 
  Megaphone, 
  Ticket as TicketIcon,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Plus,
  Edit,
  Trash2
} from "lucide-react";
import { format, parseISO } from "date-fns";

import EventManagement from "../components/admin/EventManagement";
import PolicyManagement from "../components/admin/PolicyManagement";
import ExecutiveManagement from "../components/admin/ExecutiveManagement";
import AnnouncementManagement from "../components/admin/AnnouncementManagement";
import TicketManagement from "../components/admin/TicketManagement";
import TimeOffManagement from "../components/admin/TimeOffManagement";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    events: 0,
    policies: 0,
    executives: 0,
    announcements: 0,
    openTickets: 0,
    pendingTimeOff: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    checkAdminAccess();
    loadStats();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const userData = await User.me();
      if (userData.role !== 'admin') {
        // Redirect non-admin users
        window.location.href = '/';
        return;
      }
      setUser(userData);
    } catch (error) {
      console.error("Error checking admin access:", error);
      // Redirect if not authenticated
      window.location.href = '/';
    }
  };

  const loadStats = async () => {
    try {
      const [events, policies, executives, announcements, tickets, timeOffRequests] = await Promise.all([
        Event.list(),
        Policy.list(),
        Executive.list(),
        Announcement.list(),
        Ticket.list(),
        TimeOffRequest.list()
      ]);

      setStats({
        events: events.length,
        policies: policies.length,
        executives: executives.length,
        announcements: announcements.length,
        openTickets: tickets.filter(t => ['open', 'in_progress'].includes(t.status)).length,
        pendingTimeOff: timeOffRequests.filter(t => t.status === 'pending').length
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
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
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">Admin Dashboard</h1>
                <p className="text-slate-600 text-lg">Manage your company portal and employee services</p>
              </div>
              <Badge className="bg-red-100 text-red-800 border-red-200 px-4 py-2">
                <Settings className="w-4 h-4 mr-2" />
                Administrator Access
              </Badge>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-7 bg-white/80 backdrop-blur-sm border border-slate-200 p-1">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Events
              </TabsTrigger>
              <TabsTrigger value="policies" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Policies
              </TabsTrigger>
              <TabsTrigger value="executives" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Executives
              </TabsTrigger>
              <TabsTrigger value="announcements" className="flex items-center gap-2">
                <Megaphone className="w-4 h-4" />
                Announcements
              </TabsTrigger>
              <TabsTrigger value="tickets" className="flex items-center gap-2">
                <TicketIcon className="w-4 h-4" />
                Tickets
              </TabsTrigger>
              <TabsTrigger value="timeoff" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Time Off
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Stats Cards */}
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">Total Events</p>
                        <p className="text-3xl font-bold">{stats.events}</p>
                      </div>
                      <Calendar className="w-8 h-8 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-medium">Active Policies</p>
                        <p className="text-3xl font-bold">{stats.policies}</p>
                      </div>
                      <FileText className="w-8 h-8 text-green-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm font-medium">Executives</p>
                        <p className="text-3xl font-bold">{stats.executives}</p>
                      </div>
                      <Users className="w-8 h-8 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-amber-100 text-sm font-medium">Announcements</p>
                        <p className="text-3xl font-bold">{stats.announcements}</p>
                      </div>
                      <Megaphone className="w-8 h-8 text-amber-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-100 text-sm font-medium">Open Tickets</p>
                        <p className="text-3xl font-bold">{stats.openTickets}</p>
                      </div>
                      <TicketIcon className="w-8 h-8 text-red-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-indigo-100 text-sm font-medium">Pending Time Off</p>
                        <p className="text-3xl font-bold">{stats.pendingTimeOff}</p>
                      </div>
                      <Clock className="w-8 h-8 text-indigo-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-xl mt-6">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-slate-900">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button 
                      onClick={() => setActiveTab("events")} 
                      className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Event
                    </Button>
                    <Button 
                      onClick={() => setActiveTab("announcements")} 
                      className="bg-amber-600 hover:bg-amber-700 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      New Announcement
                    </Button>
                    <Button 
                      onClick={() => setActiveTab("policies")} 
                      className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Policy
                    </Button>
                    <Button 
                      onClick={() => setActiveTab("tickets")} 
                      className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
                    >
                      <TicketIcon className="w-4 h-4" />
                      Manage Tickets
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="events">
              <EventManagement onStatsUpdate={loadStats} />
            </TabsContent>

            <TabsContent value="policies">
              <PolicyManagement onStatsUpdate={loadStats} />
            </TabsContent>

            <TabsContent value="executives">
              <ExecutiveManagement onStatsUpdate={loadStats} />
            </TabsContent>

            <TabsContent value="announcements">
              <AnnouncementManagement onStatsUpdate={loadStats} />
            </TabsContent>

            <TabsContent value="tickets">
              <TicketManagement onStatsUpdate={loadStats} />
            </TabsContent>

            <TabsContent value="timeoff">
              <TimeOffManagement onStatsUpdate={loadStats} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}