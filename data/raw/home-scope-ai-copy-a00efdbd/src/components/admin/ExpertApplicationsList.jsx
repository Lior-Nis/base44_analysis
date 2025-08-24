import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Award, 
  Clock, 
  MapPin,
  FileText,
  Eye,
  Check,
  X,
  MessageSquare
} from "lucide-react";
import { ExpertApplication } from "@/api/entities";
import { SendEmail } from "@/api/integrations";
import { format } from "date-fns";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  reviewing: "bg-blue-100 text-blue-800", 
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  contacted: "bg-purple-100 text-purple-800"
};

export default function ExpertApplicationsList() {
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const apps = await ExpertApplication.list('-created_date');
      setApplications(apps);
    } catch (error) {
      console.error('Error loading applications:', error);
    }
    setIsLoading(false);
  };

  const updateApplicationStatus = async (application, newStatus) => {
    try {
      await ExpertApplication.update(application.id, {
        status: newStatus,
        admin_notes: adminNotes,
        date_contacted: newStatus === 'contacted' ? new Date().toISOString() : application.date_contacted
      });
      
      // Send email notification to applicant based on status
      let emailSubject = '';
      let emailBody = '';
      
      switch (newStatus) {
        case 'approved':
          emailSubject = 'Welcome to the HomeScope Expert Network!';
          emailBody = `
Dear ${application.full_name},

Congratulations! We're excited to inform you that your application to join the HomeScope expert network has been approved.

Next Steps:
1. Please sign up for a HomeScope account using this link: ${window.location.origin}
2. Use the same email address (${application.email}) when signing up
3. Once you've created your account, our team will upgrade your access to expert privileges
4. You'll then receive access to our expert dashboard and training materials

We're looking forward to having your ${application.specialty} expertise on our platform!

If you have any questions, please don't hesitate to contact us.

Best regards,
The HomeScope Team
          `;
          break;
        case 'rejected':
          emailSubject = 'HomeScope Expert Application Update';
          emailBody = `
Dear ${application.full_name},

Thank you for your interest in joining the HomeScope expert network.

After careful review of your application, we've decided not to move forward at this time. This decision was based on our current needs and capacity.

We encourage you to reapply in the future as our requirements may change.

Thank you for considering HomeScope, and we wish you all the best.

Best regards,
The HomeScope Team
          `;
          break;
        case 'contacted':
          emailSubject = 'HomeScope Expert Application - Additional Information Needed';
          emailBody = `
Dear ${application.full_name},

Thank you for your application to join the HomeScope expert network.

We're reviewing your application and would like to discuss your qualifications further. Someone from our team will be in touch with you shortly.

In the meantime, if you have any questions, please feel free to contact us.

Best regards,
The HomeScope Team
          `;
          break;
      }

      if (emailSubject && emailBody) {
        await SendEmail({
          to: application.email,
          subject: emailSubject,
          body: emailBody
        });
      }

      await loadApplications();
      setShowDetailModal(false);
      setAdminNotes('');
    } catch (error) {
      console.error('Error updating application:', error);
      alert('Error updating application status');
    }
  };

  const openDetailModal = (application) => {
    setSelectedApplication(application);
    setAdminNotes(application.admin_notes || '');
    setShowDetailModal(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading applications...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Expert Applications ({applications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No applications yet.</p>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div key={app.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-lg">{app.full_name}</h3>
                        <Badge className={statusColors[app.status]}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {app.email}
                        </span>
                        <span className="flex items-center">
                          <Award className="w-4 h-4 mr-1" />
                          {app.specialty}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {app.years_experience} years
                        </span>
                        {app.location && (
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {app.location}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Applied: {format(new Date(app.created_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <Button 
                      onClick={() => openDetailModal(app)}
                      variant="outline" 
                      size="sm"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Expert Application Details</DialogTitle>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{selectedApplication.full_name}</h2>
                  <Badge className={statusColors[selectedApplication.status]}>
                    {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                  </Badge>
                </div>
                <div className="text-right text-sm text-gray-500">
                  Applied: {format(new Date(selectedApplication.created_date), 'MMM dd, yyyy')}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-gray-700">Email:</label>
                  <p>{selectedApplication.email}</p>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Phone:</label>
                  <p>{selectedApplication.phone}</p>
                </div>
              </div>

              {/* Professional Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-medium text-gray-700">Specialty:</label>
                    <p>{selectedApplication.specialty}{selectedApplication.other_specialty && ` (${selectedApplication.other_specialty})`}</p>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Experience:</label>
                    <p>{selectedApplication.years_experience} years</p>
                  </div>
                </div>
                
                {selectedApplication.location && (
                  <div>
                    <label className="font-medium text-gray-700">Location/Service Area:</label>
                    <p>{selectedApplication.location}</p>
                  </div>
                )}
                
                {selectedApplication.availability && (
                  <div>
                    <label className="font-medium text-gray-700">Availability:</label>
                    <p>{selectedApplication.availability}</p>
                  </div>
                )}

                <div>
                  <label className="font-medium text-gray-700">Qualifications:</label>
                  <p className="text-sm bg-gray-50 p-3 rounded">{selectedApplication.qualifications}</p>
                </div>

                {selectedApplication.bio && (
                  <div>
                    <label className="font-medium text-gray-700">Professional Background:</label>
                    <p className="text-sm bg-gray-50 p-3 rounded">{selectedApplication.bio}</p>
                  </div>
                )}

                {selectedApplication.why_join && (
                  <div>
                    <label className="font-medium text-gray-700">Why join HomeScope:</label>
                    <p className="text-sm bg-gray-50 p-3 rounded">{selectedApplication.why_join}</p>
                  </div>
                )}
              </div>

              {/* Admin Notes */}
              <div>
                <label className="font-medium text-gray-700">Admin Notes:</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this application..."
                  className="h-24"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={() => updateApplicationStatus(selectedApplication, 'approved')}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={selectedApplication.status === 'approved'}
                >
                  <Check className="w-4 h-4 mr-1" />
                  Approve
                </Button>
                <Button 
                  onClick={() => updateApplicationStatus(selectedApplication, 'rejected')}
                  variant="destructive"
                  disabled={selectedApplication.status === 'rejected'}
                >
                  <X className="w-4 h-4 mr-1" />
                  Reject
                </Button>
                <Button 
                  onClick={() => updateApplicationStatus(selectedApplication, 'contacted')}
                  variant="outline"
                  disabled={selectedApplication.status === 'contacted'}
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Mark as Contacted
                </Button>
                <Button 
                  onClick={() => updateApplicationStatus(selectedApplication, 'reviewing')}
                  variant="outline"
                  disabled={selectedApplication.status === 'reviewing'}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Mark as Reviewing
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}