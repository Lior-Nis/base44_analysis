
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea"; // Still needed for Label, but Textarea is removed from Card content
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Phone,
  AlertCircle,
  User as UserIcon,
  MapPin,
  MessageSquare,
  MoreVertical
} from "lucide-react";
import { format } from "date-fns";
import { Appointment } from "@/api/entities";
import { User } from "@/api/entities"; // Import the User entity
import ReportGenerationModal from './ReportGenerationModal'; // Import the new modal

export default function ExpertAppointmentsList({ appointments, onRefresh, expertId }) {
  const [activeTab, setActiveTab] = useState('today'); // Changed default to 'today' as in initial code
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // notesData and handleNotesChange are no longer used for direct input on the card
  // as the Textarea for notes has been removed from the AppointmentCard.
  // The ReportGenerationModal will handle notes.
  // However, `handleStatusUpdate` still references `notesData`.
  // Given the outline removes the notes Textarea, `notesData` is effectively dead code
  // unless it's initialized with existing notes for read-only display or similar,
  // which is not the case for updates.
  // For `handleStatusUpdate`, we'll remove the `follow_up_notes` property
  // as the modal is now responsible for handling the full report, including notes.
  // So, `notesData` and `setNotesData` will be removed.

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled':
        return Clock;
      case 'completed':
        return CheckCircle;
      case 'cancelled':
        return XCircle;
      case 'in_progress':
        return Phone;
      default:
        return AlertCircle;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'emergency':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const handleCompleteAppointment = async (appointmentId) => {
    try {
      await Appointment.update(appointmentId, { status: 'completed' });

      // Also update customer's subscription status if it was a standard consultation
      const appointment = appointments.find(apt => apt.id === appointmentId);
      if (appointment) {
        try {
          // Get the customer and update their subscription status
          const allUsers = await User.list();
          const customer = allUsers.find(u => u.email === appointment.user_email);
          if (customer && customer.subscription_type === 'standard_consultation') {
            await User.update(customer.id, {
              subscription_status: 'used',
              subscription_type: 'none' // Clear the subscription type after use
            });
          }
        } catch (error) {
          console.log("Could not update customer subscription status:", error);
          // Don't alert the user for this, it's a background update and shouldn't block the flow.
        }
      }

      onRefresh(); // Refresh appointments and users (if users were also displayed)
    } catch (error) {
      console.error('Error completing appointment:', error);
      alert('Error completing appointment. Please try again.');
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    setUpdatingStatusId(appointmentId);
    try {
      // Removed `follow_up_notes` as notes will be managed by ReportGenerationModal
      await Appointment.update(appointmentId, {
        status: newStatus,
      });
      onRefresh();
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert('Error updating appointment. Please try again.');
    }
    setUpdatingStatusId(null);
  };

  const handleOpenReportModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowReportModal(true);
  };

  const handleReportSuccess = async () => {
    setShowReportModal(false);
    // After report generation, call handleCompleteAppointment to finalize status and update subscription
    if (selectedAppointment) {
      await handleCompleteAppointment(selectedAppointment.id);
    }
    setSelectedAppointment(null);
    // onRefresh is already called by handleCompleteAppointment
  };

  const filterAppointments = (status) => {
    if (status === 'upcoming') {
      const now = new Date();
      return appointments.filter(apt =>
        new Date(apt.appointment_date) > now && apt.status === 'scheduled'
      );
    }
    if (status === 'today') {
      const today = new Date();
      return appointments.filter(apt => {
        const apptDate = new Date(apt.appointment_date);
        return apptDate.toDateString() === today.toDateString() && apt.status === 'scheduled';
      });
    }
    return appointments.filter(apt => apt.status === status);
  };

  const AppointmentCard = ({ appointment }) => {
    const StatusIcon = getStatusIcon(appointment.status);
    const isUpcoming = new Date(appointment.appointment_date) > new Date() && appointment.status === 'scheduled';
    const isToday = new Date(appointment.appointment_date).toDateString() === new Date().toDateString();
    const isPast = new Date(appointment.appointment_date) < new Date() && appointment.status !== 'completed' && appointment.status !== 'cancelled';


    return (
      <Card className={`hover:shadow-md transition-shadow ${isToday && isUpcoming ? 'ring-2 ring-green-500' : ''}`}>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row items-start justify-between">
            <div className="flex-1 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{appointment.user_email}</h3>
                  <p className="text-sm text-gray-600">{appointment.expert_specialty}</p>
                  {appointment.priority === 'emergency' && (
                    <Badge className="bg-red-500 text-white text-xs mt-1">
                      🚨 EMERGENCY
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {format(new Date(appointment.appointment_date), 'EEEE, MMMM do, yyyy at h:mm a')}
                </div>
                <div className="flex items-center text-gray-600">
                  <UserIcon className="w-4 h-4 mr-2" />
                  Client: {appointment.user_email}
                </div>
                <div className="flex items-center text-gray-600">
                  <Badge className={getPriorityColor(appointment.priority)}>
                    {appointment.priority} priority
                  </Badge>
                </div>
                <p className="text-gray-700 font-medium">
                  Issue: {appointment.issue_type.replace(/_/g, ' ')}
                </p>
                {appointment.issue_description && (
                  <p className="text-gray-600 line-clamp-2">
                    {appointment.issue_description}
                  </p>
                )}
                {appointment.price_paid && (
                  <p className="text-xs text-green-600 mt-2 font-medium">
                    Consultation Fee: £{appointment.price_paid}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col space-y-2 mt-4 md:mt-0 md:ml-4 items-stretch md:items-end w-full md:w-auto">
              <div className="flex items-center space-x-2">
                <Badge className={getStatusColor(appointment.status)}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {appointment.status.replace('_', ' ')}
                </Badge>
                {isToday && isUpcoming && (
                  <Badge className="bg-green-100 text-green-800 animate-pulse">
                    Today!
                  </Badge>
                )}
              </div>

              {appointment.status === 'in_progress' && (
                <Button
                  size="sm"
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => handleOpenReportModal(appointment)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Finish & Create Report
                </Button>
              )}

              {appointment.status === 'scheduled' && isPast && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenReportModal(appointment)}
                  className="w-full"
                >
                  <FileText className="w-4 h-4 mr-1" />
                  Create Report
                </Button>
              )}

              {appointment.status === 'completed' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenReportModal(appointment)}
                  className="w-full"
                >
                  <FileText className="w-4 h-4 mr-1" />
                  View/Edit Report
                </Button>
              )}

              {appointment.status === 'scheduled' && !isPast && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full">
                      <MoreVertical className="h-4 w-4 mr-2" /> Options
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Appointment Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => window.open(appointment.meeting_link, '_blank')}
                      disabled={!appointment.meeting_link}
                    >
                      <Phone className="w-4 h-4 mr-2" /> {appointment.meeting_link ? 'Join Call' : 'No Link'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusUpdate(appointment.id, 'in_progress')}
                      disabled={updatingStatusId === appointment.id}
                    >
                      {updatingStatusId === appointment.id ? 'Starting...' : 'Start Consultation'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                      disabled={updatingStatusId === appointment.id}
                      className="text-red-600 focus:bg-red-50 focus:text-red-600"
                    >
                      <XCircle className="w-4 h-4 mr-2" /> Cancel Appointment
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          {/* Display existing notes for completed appointments, if they exist and are not handled by modal */}
          {appointment.status === 'completed' && appointment.follow_up_notes && (
            <div className="bg-green-50 p-3 rounded-lg border border-green-200 mt-4">
              <p className="text-sm font-medium text-green-800 mb-1">Your Notes:</p>
              <p className="text-sm text-green-700">{appointment.follow_up_notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-green-600" />
              Your Consultations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="today" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="today">
                  Today ({filterAppointments('today').length})
                </TabsTrigger>
                <TabsTrigger value="upcoming">
                  Upcoming ({filterAppointments('upcoming').length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({filterAppointments('completed').length})
                </TabsTrigger>
                <TabsTrigger value="all">
                  All ({appointments.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="today" className="space-y-4">
                {filterAppointments('today').length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No consultations scheduled for today</p>
                    <p className="text-sm">Enjoy your day off!</p>
                  </div>
                ) : (
                  filterAppointments('today').map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="upcoming" className="space-y-4">
                {filterAppointments('upcoming').length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No upcoming consultations</p>
                    <p className="text-sm">New bookings will appear here</p>
                  </div>
                ) : (
                  filterAppointments('upcoming').map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-4">
                {filterAppointments('completed').length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No completed consultations yet</p>
                    <p className="text-sm">Your consultation history will appear here</p>
                  </div>
                ) : (
                  filterAppointments('completed').map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="all" className="space-y-4">
                {appointments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No consultations assigned yet</p>
                    <p className="text-sm">New appointments will be assigned to you soon!</p>
                  </div>
                ) : (
                  appointments.map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <ReportGenerationModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSuccess={handleReportSuccess}
        appointment={selectedAppointment}
      />
    </>
  );
}
