import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AwaitingVerificationStep({ workflowId, patientName }) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold text-slate-900 flex items-center justify-center gap-2">
          <Clock className="w-6 h-6 text-amber-600" />
          Payment Received - Pending Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-center">
        <div className="p-6 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
          <CheckCircle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
          <h3 className="font-semibold text-slate-900 mb-2">Payment Confirmation Submitted</h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            Your payment confirmation has been received and is being verified by our admin team. 
            Analysis will automatically start once payment is confirmed.
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-slate-50 rounded-lg">
              <strong className="text-slate-900">Request ID:</strong>
              <p className="font-mono text-slate-600 mt-1">{workflowId?.slice(-8)}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <strong className="text-slate-900">Patient:</strong>
              <p className="text-slate-600 mt-1">{patientName}</p>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-slate-900 mb-2">What happens next?</h4>
            <ul className="text-sm text-slate-700 space-y-1 text-left">
              <li>• Admin team will verify your payment (usually within 1-2 hours)</li>
              <li>• You'll receive an email notification once verified</li>
              <li>• AI analysis will start automatically</li>
              <li>• Results will be available in your dashboard</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to={createPageUrl("Dashboard")} className="flex-1">
            <Button variant="outline" className="w-full">
              Return to Dashboard
            </Button>
          </Link>
          <Button variant="outline" className="flex-1">
            <Mail className="w-4 h-4 mr-2" />
            Contact Support
          </Button>
        </div>

        <div className="text-xs text-slate-500">
          <p>Need help? Contact us at support@osteoscope.com or call +91-XXXXX-XXXXX</p>
        </div>
      </CardContent>
    </Card>
  );
}