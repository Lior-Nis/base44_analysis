import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Share2, Printer } from "lucide-react";
import { format } from "date-fns";

export default function ReportActions({ analysis }) {
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const handleGenerateReport = () => {
    setIsGeneratingReport(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGeneratingReport(false);
      // In a real app, this would generate and download a PDF
      alert('Medical report generated successfully!');
    }, 2000);
  };

  return (
    <>
      {/* Actions */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-900">Report Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
          >
            {isGeneratingReport ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Generate PDF Report
              </>
            )}
          </Button>
          
          <Button variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          
          <Button variant="outline" className="w-full">
            <Share2 className="w-4 h-4 mr-2" />
            Share with Doctor
          </Button>
          
          <Button variant="outline" className="w-full">
            <Printer className="w-4 h-4 mr-2" />
            Print Report
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Details - Simplified */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-900">Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Report ID:</span>
            <span className="font-mono text-slate-900">{analysis.id.slice(0, 8)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Analysis Date:</span>
            <span className="text-slate-900">{format(new Date(analysis.created_date), "MMM d, yyyy")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Analysis Time:</span>
            <span className="text-slate-900">{format(new Date(analysis.created_date), "h:mm a")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Status:</span>
            <span className="text-green-600 font-medium capitalize">{analysis.analysis_status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Anatomical Region:</span>
            <span className="text-slate-900 capitalize">{analysis.anatomical_region?.replace('_', ' ')}</span>
          </div>
        </CardContent>
      </Card>
    </>
  );
}