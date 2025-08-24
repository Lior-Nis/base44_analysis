import React, { useState, useRef, useEffect } from "react";
import { AnalysisWorkflow } from "@/api/entities";
import { XRayAnalysis } from "@/api/entities";
import { User } from "@/api/entities";
import { UploadFile, InvokeLLM, SendEmail } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Upload, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Eye, 
  CreditCard, 
  FileImage,
  Shield,
  Clock,
  Smartphone
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import StepIndicator from "../components/analysis/StepIndicator";
import ImageUploadStep from "../components/analysis/ImageUploadStep";
import XRayDetectionStep from "../components/analysis/XRayDetectionStep";
import ROIDetectionStep from "../components/analysis/ROIDetectionStep";
import PaymentStep from "../components/analysis/PaymentStep";
import AwaitingVerificationStep from "../components/analysis/AwaitingVerificationStep";
import AnalysisProgressStep from "../components/analysis/AnalysisProgressStep";

const QR_CODE_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/d07d24ac3_upiGpay.jpg";

export default function NewAnalysisPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [workflowId, setWorkflowId] = useState(null);
  const [currentStep, setCurrentStep] = useState("upload");
  const [workflowData, setWorkflowData] = useState({
    patient_name: "",
    uploaded_image_url: "",
    is_xray_confirmed: false,
    detected_anatomical_region: "unknown",
    roi_coordinates: "",
    roi_approved: false,
    payment_status: "pending",
    workflow_step: "upload"
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Failed to load user:", error);
      setError("Please log in to continue");
    }
  };

  const createOrUpdateWorkflow = async (updates) => {
    try {
      const updatedData = { ...workflowData, ...updates, user_email: currentUser?.email };
      
      if (workflowId) {
        await AnalysisWorkflow.update(workflowId, updatedData);
      } else {
        const newWorkflow = await AnalysisWorkflow.create(updatedData);
        setWorkflowId(newWorkflow.id);
      }
      
      setWorkflowData(updatedData);
      return true;
    } catch (error) {
      console.error("Failed to update workflow:", error);
      setError("Failed to save progress");
      return false;
    }
  };

  const handleImageUpload = async (file, patientName) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Upload image
      const { file_url } = await UploadFile({ file });
      
      // Detect if it's an X-ray
      const xrayDetection = await InvokeLLM({
        prompt: `Analyze this medical image and determine if it is an X-ray image. Consider factors like bone visibility, grayscale appearance, medical imaging characteristics, and anatomical structures. Return a binary classification.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            is_xray: { type: "boolean" },
            confidence: { type: "number" },
            detected_region: { type: "string", enum: ["proximal_femur", "calcaneus", "clavicle", "lumbar_spine", "unknown"] },
            reasoning: { type: "string" }
          }
        }
      });

      if (!xrayDetection.is_xray) {
        setError("Uploaded image is not an X-ray. Please upload a valid X-ray image.");
        setIsProcessing(false);
        return;
      }

      // Update workflow
      await createOrUpdateWorkflow({
        patient_name: patientName,
        uploaded_image_url: file_url,
        is_xray_confirmed: true,
        detected_anatomical_region: xrayDetection.detected_region,
        workflow_step: "roi_detection"
      });

      setCurrentStep("roi_detection");
    } catch (error) {
      setError("Failed to process image. Please try again.");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleROIDetection = async () => {
    setIsProcessing(true);
    try {
      // Generate ROI coordinates using AI
      const roiDetection = await InvokeLLM({
        prompt: `Analyze this ${workflowData.detected_anatomical_region} X-ray image and identify the optimal Region of Interest (ROI) for osteoporosis analysis. Provide bounding box coordinates and key anatomical landmarks.`,
        file_urls: [workflowData.uploaded_image_url],
        response_json_schema: {
          type: "object",
          properties: {
            roi_box: {
              type: "object",
              properties: {
                x: { type: "number" },
                y: { type: "number" },
                width: { type: "number" },
                height: { type: "number" }
              }
            },
            anatomical_landmarks: { type: "array", items: { type: "string" } },
            roi_description: { type: "string" }
          }
        }
      });

      await createOrUpdateWorkflow({
        roi_coordinates: JSON.stringify(roiDetection.roi_box),
        workflow_step: "roi_approval"
      });

      setCurrentStep("roi_approval");
    } catch (error) {
      setError("Failed to detect ROI. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleROIApproval = async () => {
    await createOrUpdateWorkflow({
      roi_approved: true,
      workflow_step: "payment"
    });
    setCurrentStep("payment");
  };

  const handlePaymentClaim = async () => {
    setIsProcessing(true);
    try {
      await createOrUpdateWorkflow({
        payment_status: "awaiting_verification",
        workflow_step: "awaiting_verification"
      });

      // Notify admin
      await SendEmail({
        to: "admin@example.com", // Replace with actual admin email
        subject: "New Payment Confirmation Submitted",
        body: `
          A new payment confirmation has been submitted:
          
          User: ${currentUser.email}
          Patient: ${workflowData.patient_name}
          Workflow ID: ${workflowId}
          Amount: ₹199
          Region: ${workflowData.detected_anatomical_region}
          
          Please verify the payment in the admin panel.
        `
      });

      setCurrentStep("awaiting_verification");
    } catch (error) {
      setError("Failed to submit payment confirmation");
    } finally {
      setIsProcessing(false);
    }
  };

  const steps = [
    { key: "upload", label: "Upload X-ray" },
    { key: "roi_detection", label: "ROI Detection" },
    { key: "roi_approval", label: "ROI Approval" },
    { key: "payment", label: "Payment" },
    { key: "awaiting_verification", label: "Verification" },
    { key: "analysis", label: "Analysis" },
    { key: "completed", label: "Results" }
  ];

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8 flex items-center justify-center">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg p-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-amber-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Authentication Required</h2>
            <p className="text-slate-600">Please log in to start a new analysis.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">X-ray Analysis Workflow</h1>
          <p className="text-slate-600">AI-powered osteoporosis screening with payment verification</p>
        </div>

        {/* Step Indicator */}
        <StepIndicator steps={steps} currentStep={currentStep} />

        {/* Privacy Notice */}
        {currentStep === "upload" && (
          <Alert className="bg-blue-50 border-blue-200">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Privacy Notice:</strong> Images and payment info are used only for analysis and will be stored securely. 
              Do not upload personal identifiers not needed for analysis.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
            {error.includes("not an X-ray") && (
              <Button 
                className="mt-2" 
                variant="outline" 
                onClick={() => {
                  setError(null);
                  setCurrentStep("upload");
                }}
              >
                Upload Another Image
              </Button>
            )}
          </Alert>
        )}

        {/* Step Content */}
        {currentStep === "upload" && (
          <ImageUploadStep 
            onImageUpload={handleImageUpload}
            isProcessing={isProcessing}
          />
        )}

        {currentStep === "roi_detection" && (
          <XRayDetectionStep 
            imageUrl={workflowData.uploaded_image_url}
            detectedRegion={workflowData.detected_anatomical_region}
            onContinue={handleROIDetection}
            isProcessing={isProcessing}
          />
        )}

        {currentStep === "roi_approval" && (
          <ROIDetectionStep 
            imageUrl={workflowData.uploaded_image_url}
            roiCoordinates={workflowData.roi_coordinates}
            detectedRegion={workflowData.detected_anatomical_region}
            onApprove={handleROIApproval}
            onAdjust={() => setError("ROI adjustment feature coming soon")}
            isProcessing={isProcessing}
          />
        )}

        {currentStep === "payment" && (
          <PaymentStep 
            onPaymentClaimed={handlePaymentClaim}
            isProcessing={isProcessing}
            qrCodeUrl={QR_CODE_URL}
          />
        )}

        {currentStep === "awaiting_verification" && (
          <AwaitingVerificationStep 
            workflowId={workflowId}
            patientName={workflowData.patient_name}
          />
        )}

        {currentStep === "analysis" && (
          <AnalysisProgressStep 
            workflowData={workflowData}
          />
        )}
      </div>
    </div>
  );
}