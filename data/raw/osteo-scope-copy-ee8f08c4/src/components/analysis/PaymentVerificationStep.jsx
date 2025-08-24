import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";

export default function PaymentVerificationStep({ workflowData }) {
  const getStatusDisplay = () => {
    switch (workflowData.payment_status) {
      case 'verified':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          title: 'Payment Verified',
          message: 'Payment successful! Starting texture analysis...'
        };
      case 'manual_verification':
        return {
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          title: 'Manual Verification Required',
          message: 'Payment received — pending verification. Analysis will start after confirmation.'
        };
      case 'failed':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: 'Payment Not Verified',
          message: 'Payment not verified. Please retry or contact support.'
        };
      default:
        return {
          icon: Clock,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          title: 'Verifying Payment',
          message: 'Please wait while we verify your payment...'
        };
    }
  };

  const status = getStatusDisplay();

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardContent className="p-8 text-center">
        <status.icon className={`w-16 h-16 ${status.color} mx-auto mb-4`} />
        <h3 className={`text-xl font-bold ${status.color} mb-4`}>{status.title}</h3>
        
        <Alert className={`${status.bgColor} ${status.borderColor} border-2`}>
          <AlertTriangle className={`h-4 w-4 ${status.color}`} />
          <AlertDescription className={status.color}>
            {status.message}
          </AlertDescription>
        </Alert>

        {workflowData.payment_status === 'pending' && (
          <div className="mt-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}