
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Users,
  Mail,
  Calendar,
  Zap,
  RefreshCw,
  Search,
  Shield,
  LogOut
} from "lucide-react";
import { User as UserEntity } from "@/api/entities";
import { EmailSubscriber } from "@/api/entities";
import { Appointment } from "@/api/entities";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ExpertApplicationsList from "../components/admin/ExpertApplicationsList";

export default function AdminPanel() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [emailSubscribers, setEmailSubscribers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({ totalUsers: 0, totalAppointments: 0, totalSubscribers: 0 });

  const navigate = useNavigate();

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const user = await UserEntity.me();
      setCurrentUser(user);

      // Check if user is an admin
      if (user.role !== 'admin') {
        // Redirect non-admins to dashboard or home
        navigate(createPageUrl('Dashboard')); // Use navigate for client-side routing
        return; // Stop execution if not an admin
      }

      // Load all data for admin view if user is an admin
      const allUsers = await UserEntity.list('-created_date', 50);
      const allSubscribers = await EmailSubscriber.list('-created_date', 50);
      const allAppointments = await Appointment.list('-created_date', 50);

      setUsers(allUsers);
      setEmailSubscribers(allSubscribers);
      setAppointments(allAppointments);
      
      // Update stats based on fetched data
      setStats({
        totalUsers: allUsers.length,
        totalAppointments: allAppointments.length,
        totalSubscribers: allSubscribers.length,
      });

    } catch (error) {
      console.error("Error loading admin data:", error);
      // Redirect to home/login if not authenticated or error occurs
      navigate('/'); // Redirect to home page
    } finally {
      setIsLoading(false); // Ensure loading state is reset
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const resetUserTriageStatus = async (userEmail) => {
    try {
      // Find the user and update their triage status
      const user = users.find(u => u.email === userEmail);
      if (user) {
        await UserEntity.update(user.id, { has_used_ai_triage: false });
        alert(`AI Triage status reset for ${userEmail}`);
        loadAdminData(); // Refresh data
      }
    } catch (error) {
      console.error("Error resetting triage status:", error);
      alert("Error resetting triage status");
    }
  };

  const updateUserWaitingListStatus = async (userEmail, status) => {
    try {
      const user = users.find(u => u.email === userEmail);
      if (user) {
        await UserEntity.update(user.id, { 
          is_on_waiting_list: status,
          waiting_list_joined_date: status ? new Date().toISOString() : null
        });
        alert(`Waiting list status updated for ${userEmail}`);
        loadAdminData();
      }
    } catch (error) {
      console.error("Error updating waiting list status:", error);
      alert("Error updating waiting list status");
    }
  };

  const handleLogout = () => {
    // In a real application, this would involve clearing authentication tokens/session
    console.log("Logging out from Admin Panel...");
    // For demonstration, navigate to home or login page
    // Assuming a logout mechanism like clearing local storage token
    // localStorage.removeItem('authToken'); // Example: if using JWT
    setCurrentUser(null); // Clear current user state
    navigate(createPageUrl('Home')); // Redirect to home page
  };

  const filteredUsers = searchEmail 
    ? users.filter(user => user.email.toLowerCase().includes(searchEmail.toLowerCase()))
    : users;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // The isAdmin check here becomes a fallback, as non-admins should have been redirected by loadAdminData
  const isAdmin = currentUser?.role === 'admin';

  if (!isAdmin) {
    // This block should ideally not be reached if loadAdminData correctly redirects non-admins.
    // It acts as a safety net in case of a direct route access without proper loadAdminData execution.
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">You don't have admin permissions to view this page.</p>
            <Link to={createPageUrl('Home')}>
              <Button>Return Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              Admin Panel - {stats.totalUsers} Users, {stats.totalAppointments} Appointments
            </h1>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="experts">Expert Apps</TabsTrigger>
            <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700">Total Users</p>
                      <p className="text-2xl font-bold text-blue-900">{stats.totalUsers}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700">Total Appointments</p>
                      <p className="text-2xl font-bold text-green-900">{stats.totalAppointments}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg shadow-sm flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-700">Total Subscribers</p>
                      <p className="text-2xl font-bold text-purple-900">{stats.totalSubscribers}</p>
                    </div>
                    <Mail className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
                <div className="text-gray-600">
                  <Button onClick={loadAdminData} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh All Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  User Management ({users.length} users)
                </CardTitle>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Label htmlFor="search-email">Search by email</Label>
                    <div className="flex items-center space-x-2">
                      <Search className="w-4 h-4 text-gray-400" />
                      <Input
                        id="search-email"
                        placeholder="Enter email to search..."
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button onClick={loadAdminData} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No users found matching your search.</p>
                  ) : (
                    filteredUsers.map((user) => (
                      <div key={user.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{user.full_name || 'No name'}</h3>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              {user.has_used_ai_triage && (
                                <Badge className="bg-blue-100 text-blue-800">AI Triage Used</Badge>
                              )}
                              {user.is_on_waiting_list && (
                                <Badge className="bg-green-100 text-green-800">On Waiting List</Badge>
                              )}
                              {user.role === 'admin' && (
                                <Badge className="bg-red-100 text-red-800">Admin</Badge>
                              )}
                              {user.role === 'expert' && (
                                <Badge className="bg-purple-100 text-purple-800">Expert</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {user.has_used_ai_triage && (
                              <Button
                                onClick={() => resetUserTriageStatus(user.email)}
                                size="sm"
                                variant="outline"
                              >
                                <Zap className="w-4 h-4 mr-1" />
                                Reset AI Triage
                              </Button>
                            )}
                            {!user.is_on_waiting_list ? (
                              <Button
                                onClick={() => updateUserWaitingListStatus(user.email, true)}
                                size="sm"
                                variant="outline"
                              >
                                Add to Waiting List
                              </Button>
                            ) : (
                              <Button
                                onClick={() => updateUserWaitingListStatus(user.email, false)}
                                size="sm"
                                variant="outline"
                              >
                                Remove from Waiting List
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Appointments ({appointments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {appointments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No appointments found</p>
                  ) : (
                    appointments.map((appointment) => (
                      <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{appointment.user_email}</p>
                          <p className="text-sm text-gray-600">{appointment.issue_type}</p>
                          <Badge variant="outline">{appointment.status}</Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="experts" className="space-y-6">
            <ExpertApplicationsList />
          </TabsContent>

          <TabsContent value="subscribers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Email Subscribers ({emailSubscribers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {emailSubscribers.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No email subscribers found.</p>
                  ) : (
                    emailSubscribers.map((subscriber) => (
                      <div key={subscriber.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{subscriber.full_name || 'No name'}</p>
                          <p className="text-sm text-gray-600">{subscriber.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{subscriber.subscription_source}</Badge>
                            {subscriber.user_type !== 'unknown' && (
                              <Badge variant="outline">{subscriber.user_type}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
