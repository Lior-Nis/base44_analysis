
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Appointment } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Loader2, FileText, Sparkles } from "lucide-react";

export default function ReportGenerationModal({ isOpen, onClose, onSuccess, appointment }) {
  const [reportData, setReportData] = useState({
    summary: '',
    issues: '',
    recommendations: '',
    followUp: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (appointment) {
      setReportData({
        summary: appointment.report_summary || '',
        issues: appointment.report_issues_identified || '',
        recommendations: appointment.report_recommendations || '',
        followUp: appointment.report_follow_up_actions || ''
      });
    }
  }, [appointment]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Generate a formatted report using AI
      const prompt = `
        You are a helpful assistant for HomeScope, a home expert consultation service.
        Generate a professional and clear consultation report in Markdown format based on the following details.
        The report should be ready to be presented to a customer. Use clear headings, bold text, and bullet points.

        - **Customer Issue:** ${appointment.issue_type.replace(/_/g, ' ')}
        - **Appointment Date:** ${new Date(appointment.appointment_date).toLocaleDateString()}
        
        Please include the following sections in your report:

        ### Consultation Summary
        ${reportData.summary}

        ### Issues Identified
        ${reportData.issues}

        ### Expert Recommendations
        ${reportData.recommendations}

        ### Required Follow-Up Actions
        ${reportData.followUp}
      `;

      const formattedReport = await InvokeLLM({ prompt });

      // 2. Update the appointment with both the structured data and the formatted report
      await Appointment.update(appointment.id, {
        report_summary: reportData.summary,
        report_issues_identified: reportData.issues,
        report_recommendations: reportData.recommendations,
        report_follow_up_actions: reportData.followUp,
        follow_up_notes: formattedReport, // Store the full AI-generated report text
        status: 'completed'
      });

      onSuccess();
    } catch (error) {
      console.error("Error saving report:", error);
      alert("There was an error saving the report. Please try again.");
    }
    setIsSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="w-6 h-6 mr-2 text-green-600" />
            Generate Consultation Report
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
             <Sparkles className="w-4 h-4 text-purple-500" />
             AI will help format this into a professional report for the customer.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div>
            <Label htmlFor="summary">Consultation Summary</Label>
            <Textarea
              id="summary"
              value={reportData.summary}
              onChange={(e) => setReportData(prev => ({ ...prev, summary: e.target.value }))}
              placeholder="A concise overview of the discussion..."
              className="h-24"
            />
          </div>
          <div>
            <Label htmlFor="issues">Issues Identified</Label>
            <Textarea
              id="issues"
              value={reportData.issues}
              onChange={(e) => setReportData(prev => ({ ...prev, issues: e.target.value }))}
              placeholder="A clear breakdown of the problem(s) diagnosed..."
              className="h-24"
            />
          </div>
          <div>
            <Label htmlFor="recommendations">Expert Recommendations</Label>
            <Textarea
              id="recommendations"
              value={reportData.recommendations}
              onChange={(e) => setReportData(prev => ({ ...prev, recommendations: e.target.value }))}
              placeholder="Specific advice and steps the customer should take..."
              className="h-24"
            />
          </div>
          <div>
            <Label htmlFor="followUp">Required Follow-Up Actions</Label>
            <Textarea
              id="followUp"
              value={reportData.followUp}
              onChange={(e) => setReportData(prev => ({ ...prev, followUp: e.target.value }))}
              placeholder="e.g., 'Recommend contacting a Gas Safe registered engineer for a boiler check.'"
              className="h-24"
            />
          </div>
        </div>

        <DialogFooter>
           <Button variant="outline" onClick={onClose}>Cancel</Button>
           <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Report...
              </>
            ) : (
               <>
                <Sparkles className="mr-2 h-4 w-4" />
                Save and Complete
               </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
