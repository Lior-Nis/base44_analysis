import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Appointment } from '@/api/entities';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Home, Calendar, User, FileText, AlertTriangle, Shield, CheckCircle, Printer } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function ReportViewer() {
  const [appointment, setAppointment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { appointmentId } = useParams();

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!appointmentId) return;
      try {
        const data = await Appointment.get(appointmentId);
        setAppointment(data);
      } catch (error) {
        console.error("Failed to fetch appointment:", error);
      }
      setIsLoading(false);
    };
    fetchAppointment();
  }, [appointmentId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your report...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Report Not Found</h1>
          <p className="text-gray-600">The report you are looking for does not exist or could not be loaded.</p>
          <Link to={createPageUrl('Dashboard')}>
            <Button className="mt-4">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const renderMarkdown = (content) => {
    if (!content) return <p className="text-gray-500 italic">No information provided.</p>;
    return <ReactMarkdown className="prose prose-green max-w-none">{content}</ReactMarkdown>;
  };

  return (
    <>
      <style>{`
        @media print {
          .no-print {
            display: none;
          }
          body {
            background-color: white;
          }
          .printable-content {
            box-shadow: none;
            border: none;
          }
        }
      `}</style>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <header className="flex justify-between items-center mb-8 no-print">
            <Link to={createPageUrl('Dashboard')} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-800">HomeScope</span>
            </Link>
            <Button onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-2" />
              Print or Save as PDF
            </Button>
          </header>

          <Card className="printable-content">
            <CardHeader className="border-b bg-gray-50 p-6">
              <CardTitle className="text-3xl font-bold text-gray-900">Expert Consultation Report</CardTitle>
              <div className="text-gray-600 space-y-1 mt-2">
                <div className="flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  <span>Report for Appointment ID: {appointment.id}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Date of Consultation: {format(new Date(appointment.appointment_date), 'EEEE, MMMM do, yyyy')}</span>
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  <span>Consulting Expert: {appointment.expert_name} ({appointment.expert_specialty})</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
                  <Shield className="w-6 h-6 mr-3 text-green-600" />
                  Summary of Discussion
                </h2>
                {renderMarkdown(appointment.report_summary)}
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
                  <AlertTriangle className="w-6 h-6 mr-3 text-yellow-600" />
                  Issues Identified
                </h2>
                {renderMarkdown(appointment.report_issues_identified)}
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
                  <CheckCircle className="w-6 h-6 mr-3 text-blue-600" />
                  Expert Recommendations
                </h2>
                {renderMarkdown(appointment.report_recommendations)}
              </section>

               <section>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
                  <FileText className="w-6 h-6 mr-3 text-purple-600" />
                  Follow-Up Actions
                </h2>
                {renderMarkdown(appointment.report_follow_up_actions)}
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}