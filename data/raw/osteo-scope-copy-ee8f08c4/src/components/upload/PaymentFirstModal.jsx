
import React, { useState } from 'react';
import { AnalysisWorkflow } from "@/api/entities";
import { User } from "@/api/entities";
import { SendEmail } from "@/api/integrations";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Smartphone, Copy, Check, QrCode, Upload, Shield } from "lucide-react";
import { createPageUrl } from '@/utils';

const QR_CODE_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/d07d24ac3_upiGpay.jpg";
const UPI_ID = "akr.karunanithi@okhdfcbank";

export default function PaymentFirstModal({ isOpen, onWorkflowCreated }) {
  const [hasConfirmedPayment, setHasConfirmedPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(UPI_ID);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = UPI_ID;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const handlePaymentConfirmation = () => {
    setHasConfirmedPayment(true);
    setToastMessage("Payment confirmation received. You can now proceed to upload your X-ray.");
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleProceedToUpload = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Get current user with proper error handling
      const user = await User.me();
      if (!user || !user.email) {
        throw new Error("User authentication failed");
      }

      // Create audit log entry
      const auditLog = [{
        event: "workflow_initiated",
        timestamp: new Date().toISOString(),
        user: user.email,
        payment_confirmed: true
      }];

      // Create workflow with all required fields
      const workflowData = {
        user_email: user.email,
        payment_status: "pending", // Set to pending initially, will be flagged for admin after patient info is added
        workflow_step: "upload",
        payment_amount_inr: 199,
        audit_log: JSON.stringify(auditLog)
      };

      console.log("Creating workflow with data:", workflowData);
      const newWorkflow = await AnalysisWorkflow.create(workflowData);
      
      if (!newWorkflow || !newWorkflow.id) {
        throw new Error("Failed to create workflow - no ID returned");
      }

      console.log("Workflow created successfully:", newWorkflow.id);

      // Send admin notification with better error handling
      try {
        await SendEmail({
          to: "admin@osteoscope.com", // Replace with actual admin email
          subject: `New Analysis Payment Confirmed - Request #${newWorkflow.id.slice(-6)}`,
          body: `
Hello Admin,

A user has confirmed payment for X-ray analysis and is ready to upload.

Details:
- User Email: ${user.email}
- User Name: ${user.full_name || 'Not provided'}
- Request ID: #${newWorkflow.id.slice(-6)}
- Full Workflow ID: ${newWorkflow.id}
- Payment Amount: ₹199
- Timestamp: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
- Status: Awaiting Verification

Please verify the payment and approve the analysis when ready.

Best regards,
OsteoScope System
          `
        });
        console.log("Admin notification sent successfully");
      } catch (emailError) {
        console.error("Failed to send admin notification:", emailError);
        // Don't fail the workflow creation for email errors
      }

      // Navigate to upload page with workflow ID
      onWorkflowCreated(newWorkflow.id);

    } catch (error) {
      console.error("Detailed error in handleProceedToUpload:", error);
      
      // Provide more specific error messages
      if (error.message.includes("authentication")) {
        setError("Authentication error. Please log in and try again.");
      } else if (error.message.includes("workflow")) {
        setError("Failed to create analysis request. Please try again.");
      } else if (error.message.includes("network")) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(`Error: ${error.message || "Could not initiate analysis. Please try again or contact support."}`);
      }
      
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[525px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-blue-900">
            Discover Your Bone Strength & Predict Fracture Risk!
          </DialogTitle>
          <DialogDescription className="text-center text-slate-700 leading-relaxed">
            Your X-ray analysis will reveal the true strength of your bones and help predict possible fractures.
            <br /><br />
            <span className="text-slate-500 line-through text-lg">Original Price: ₹3,999</span>
            <br />
            <span className="text-green-600 font-bold text-xl">Now Only: ₹199</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-slate-800">1. Scan QR Code</h3>
            <div className="inline-block p-3 bg-white rounded-lg shadow-md border">
              <img src={QR_CODE_URL} alt="UPI QR Code" className="w-48 h-48" />
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-slate-800">2. Or use UPI ID</h3>
            <div className="flex items-center justify-between p-3 bg-slate-100 rounded-lg max-w-sm mx-auto">
              <span className="font-mono text-slate-800">{UPI_ID}</span>
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                <span className="ml-2">{copied ? 'Copied' : 'Copy'}</span>
              </Button>
            </div>
          </div>

          <Alert className="bg-yellow-50 border-yellow-200">
             <Shield className="h-4 w-4 text-yellow-600" />
             <AlertDescription className="text-yellow-800 text-xs">After payment, click "I Have Paid" below, then "Proceed to Upload." Verification is manual.</AlertDescription>
          </Alert>

          {toastMessage && (
            <Alert className="bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">{toastMessage}</AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-3">
            {!hasConfirmedPayment ? (
              <Button onClick={handlePaymentConfirmation} className="w-full">
                I Have Paid ₹199
              </Button>
            ) : (
              <Button 
                onClick={handleProceedToUpload} 
                disabled={isProcessing} 
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Initiating Analysis...
                  </div>
                ) : (
                  "Proceed to Upload File"
                )}
              </Button>
            )}
            <Button variant="outline" onClick={() => window.history.back()}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
