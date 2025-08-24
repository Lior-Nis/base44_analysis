
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText, 
  Phone,
  AlertCircle,
  User as UserIcon,
  Star // Added Star icon
} from "lucide-react";
import { format } from "date-fns";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Appointment } from "@/api/entities";
import { ExpertReview } from "@/api/entities"; // Import new entity
import { User } from "@/api/entities"; // Import User entity
import ReviewModal from './ReviewModal'; // Import new modal

export default function AppointmentsList({ appointments, onRefresh }) {
  const [cancellingId, setCancellingId] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedAppointmentForReview, setSelectedAppointmentForReview] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [appointments]); // Dependency on appointments to refetch reviews if the list changes

  const fetchReviews = async () => {
    try {
      // Assuming User.me() returns the current logged-in user object which has an 'email' field
      const currentUser = await User.me();
      if (currentUser && currentUser.email) {
        const userReviews = await ExpertReview.filter({ customer_email: currentUser.email });
        setReviews(userReviews);
      } else {
        console.warn("Current user not found or email is missing, cannot fetch reviews.");
        setReviews([]); // Clear reviews if user is not available
      }
    } catch(error) {
      console.error("Error fetching reviews:", error);
      // Optionally, show a user-friendly error message
    }
  };

  const hasReview = (appointmentId) => {
    return reviews.some(review => review.appointment_id === appointmentId);
  };
  
  const handleOpenReviewModal = (appointment) => {
    setSelectedAppointmentForReview(appointment);
    setShowReviewModal(true);
  };
  
  const handleReviewSuccess = () => {
    setShowReviewModal(false);
    setSelectedAppointmentForReview(null);
    fetchReviews(); // Refresh reviews list after a new review is submitted
    onRefresh(); // Refresh appointments, in case their state needs updating (e.g., if a review status is linked to appointment status)
  };

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
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    
    setCancellingId(appointmentId);
    try {
      await Appointment.update(appointmentId, { status: 'cancelled' });
      onRefresh(); // Refresh the appointments list after cancellation
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      alert('Error cancelling appointment. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  const filterAppointments = (status) => {
    const now = new Date();
    if (status === 'upcoming') {
      return appointments.filter(apt => 
        new Date(apt.appointment_date) > now && apt.status === 'scheduled'
      );
    }
    if (status === 'past') {
      return appointments.filter(apt => 
        (new Date(apt.appointment_date) < now && (apt.status === 'scheduled' || apt.status === 'in_progress')) || apt.status === 'completed' || apt.status === 'cancelled'
      );
    }
    return appointments.filter(apt => apt.status === status);
  };

  const AppointmentCard = ({ appointment }) => {
    const StatusIcon = getStatusIcon(appointment.status);
    const appointmentDate = new Date(appointment.appointment_date);
    const now = new Date();
    // An appointment is 'upcoming' if its date is in the future AND it's scheduled.
    const isUpcoming = appointmentDate > now && appointment.status === 'scheduled';
    // An appointment can be reviewed if it's completed AND no review exists for it yet.
    const canReview = appointment.status === 'completed' && !hasReview(appointment.id);
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{appointment.expert_name}</h3>
                  <p className="text-sm text-gray-600">{appointment.expert_specialty}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {format(appointmentDate, 'EEEE, MMMM do, yyyy at h:mm a')}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(appointment.status)}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {appointment.status.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline" className={getPriorityColor(appointment.priority)}>
                    {appointment.priority} priority
                  </Badge>
                </div>

                <p className="text-sm text-gray-700 font-medium">
                  Issue: {appointment.issue_type.replace(/_/g, ' ')}
                </p>
                
                {appointment.issue_description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {appointment.issue_description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col space-y-2 ml-4 items-end">
              {isUpcoming && appointment.meeting_link && (
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700 w-full"
                  onClick={() => window.open(appointment.meeting_link, '_blank')}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Join Call
                </Button>
              )}

              {appointment.report_summary && (
                <Link to={createPageUrl(`ReportViewer?id=${appointment.id}`)} target="_blank">
                  <Button size="sm" variant="outline" className="w-full">
                    <FileText className="w-4 h-4 mr-1" />
                    View Report
                  </Button>
                </Link>
              )}
              
              {canReview && (
                 <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenReviewModal(appointment)}
                  className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 w-full"
                >
                  <Star className="w-4 h-4 mr-1" />
                  Leave a Review
                </Button>
              )}

              {isUpcoming && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCancelAppointment(appointment.id)}
                  disabled={cancellingId === appointment.id}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full"
                >
                  {cancellingId === appointment.id ? 'Cancelling...' : 'Cancel'}
                </Button>
              )}
            </div>
          </div>
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
              Your Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upcoming" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="upcoming">
                  Upcoming ({filterAppointments('upcoming').length})
                </TabsTrigger>
                <TabsTrigger value="past">
                  Past ({filterAppointments('past').length})
                </TabsTrigger>
                <TabsTrigger value="cancelled">
                  Cancelled ({filterAppointments('cancelled').length})
                </TabsTrigger>
                <TabsTrigger value="all">
                  All ({appointments.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-4">
                {filterAppointments('upcoming').length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No upcoming appointments</p>
                    <p className="text-sm">Book a consultation to get started!</p>
                  </div>
                ) : (
                  filterAppointments('upcoming').map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-4">
                {filterAppointments('past').length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No past appointments</p>
                    <p className="text-sm">Your consultation history will appear here</p>
                  </div>
                ) : (
                  filterAppointments('past').map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="cancelled" className="space-y-4">
                {filterAppointments('cancelled').length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <XCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No cancelled appointments</p>
                  </div>
                ) : (
                  filterAppointments('cancelled').map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="all" className="space-y-4">
                {appointments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No appointments yet</p>
                    <p className="text-sm">Book your first consultation to get started!</p>
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
      <ReviewModal 
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSuccess={handleReviewSuccess}
        appointment={selectedAppointmentForReview}
      />
    </>
  );
}
