
import React, { useState, useEffect } from 'react';
import { User as UserEntity } from '@/api/entities';
import { Appointment } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Home, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  LogOut 
} from 'lucide-react';
import { Link } from "react-router-dom";

import ExpertAppointmentsList from '../components/expert/ExpertAppointmentsList';
import ExpertProfile from '../components/expert/ExpertProfile';

export default function ExpertDashboard() {
  const [expert, setExpert] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadExpertData = async () => {
    try {
      const currentUser = await UserEntity.me();
      
      // Check if user is an expert by looking for expert_specialty
      if (!currentUser.expert_specialty) {
        // Redirect non-experts to regular dashboard
        window.location.href = createPageUrl('Dashboard');
        return;
      }
      
      setExpert(currentUser);
      
      // Load appointments assigned to this expert
      const expertAppointments = await Appointment.filter({ 
        expert_id: currentUser.id 
      }, '-appointment_date');
      
      setAppointments(expertAppointments);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading expert data:", error);
      // Redirect to login if not authenticated
      window.location.href = '/';
    }
  };

  useEffect(() => {
    loadExpertData();
  }, []);

  // Modified loadAppointments to use Appointment.filter based on expert ID
  const loadAppointments = async (currentExpert) => {
    if (!currentExpert) return; // Guard clause if expert is not yet loaded or null
    try {
      const expertAppointments = await Appointment.filter({ 
        expert_id: currentExpert.id 
      }, '-appointment_date');
      setAppointments(expertAppointments);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await UserEntity.logout();
      window.location.href = createPageUrl('Home');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getTodayStats = () => {
    const today = new Date();
    const todayAppointments = appointments.filter(apt => {
      const apptDate = new Date(apt.appointment_date);
      return apptDate.toDateString() === today.toDateString();
    });
    
    return {
      total: todayAppointments.length,
      scheduled: todayAppointments.filter(apt => apt.status === 'scheduled').length,
      completed: todayAppointments.filter(apt => apt.status === 'completed').length,
      inProgress: todayAppointments.filter(apt => apt.status === 'in_progress').length
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Expert Dashboard...</p>
        </div>
      </div>
    );
  }

  const todayStats = getTodayStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to={createPageUrl('Home')} className="flex items-center">
               <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/52d7270f2_homescope_logo_transparent.png" 
                alt="HomeScope Logo" 
                className="h-16 w-auto object-contain"
              />
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {expert?.full_name}!</span>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main column */}
          <div className="lg:col-span-2">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{todayStats.total}</p>
                      <p className="text-gray-600">Today's Calls</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                      <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{todayStats.scheduled}</p>
                      <p className="text-gray-600">Scheduled</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                      <AlertCircle className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{todayStats.inProgress}</p>
                      <p className="text-gray-600">In Progress</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{todayStats.completed}</p>
                      <p className="text-gray-600">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Appointments List */}
            <ExpertAppointmentsList 
              appointments={appointments} 
              onRefresh={() => loadAppointments(expert)}
              expertId={expert?.id}
            />
          </div>

          {/* Right column for profile */}
          <div className="lg:col-span-1">
            <ExpertProfile expert={expert} onUpdate={loadExpertData} />
          </div>
        </div>
      </div>
    </div>
  );
}
