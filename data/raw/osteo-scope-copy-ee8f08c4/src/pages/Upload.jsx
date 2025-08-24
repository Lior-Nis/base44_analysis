
import React, { useState, useEffect } from "react";
import { AnalysisWorkflow } from "@/api/entities";
// Removed XRayAnalysis and User as they are not used in this file for UploadPage functionality
import { UploadFile } from "@/api/integrations"; // Removed InvokeLLM as it's not used in this file
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AlertTriangle, AlertCircle, Shield } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

import PaymentFirstModal from "../components/upload/PaymentFirstModal";
import ImageUploadZone from "../components/upload/ImageUploadZone";
import PatientInfoForm from "../components/upload/PatientInfoForm";
import TextureAnalysisProgress from "../components/upload/TextureAnalysisProgress";

export default function UploadPage() {
  const navigate = useNavigate();
  const [workflowId, setWorkflowId] = useState(null);
  const [workflow, setWorkflow] = useState(null);
  const [currentStep, setCurrentStep] = useState("loading");
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('workflowId');
    if (id) {
      setWorkflowId(id);
      loadWorkflow(id);
    } else {
      setCurrentStep("payment");
    }
  }, []);

  // Polling mechanism to react to admin actions that change workflow status
  // This addresses "Fix Admin Panel Button Actions" from the user's perspective
  useEffect(() => {
    let intervalId;
    // Only poll if a workflow is loaded and its status is pending admin verification or analysis in progress
    if (workflowId && workflow && (workflow.workflow_step === 'awaiting_verification' || workflow.workflow_step === 'analysis_in_progress')) {
      intervalId = setInterval(() => {
        console.log("Polling workflow for updates...");
        loadWorkflow(workflowId);
      }, 15000); // Poll every 15 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [workflowId, workflow?.workflow_step]); // Re-run effect if workflowId or workflow_step changes

  const loadWorkflow = async (id) => {
    try {
      setCurrentStep("loading");
      console.log("Loading workflow with ID:", id);
      
      const workflows = await AnalysisWorkflow.list('-created_date', 100);
      const wf = workflows.find(w => w.id === id);
      
      if (!wf) {
        console.error("Workflow not found:", id);
        setError("Invalid analysis session. Please start again.");
        setCurrentStep("payment");
        return;
      }

      console.log("Loaded workflow:", wf);
      setWorkflow(wf);
      
      // Determine which step to show based on workflow data and current workflow_step
      if (!wf.uploaded_image_url) {
        setCurrentStep("upload");
      } else if (!wf.patient_name) {
        setCurrentStep("patient_info");
      } else if (wf.workflow_step === 'awaiting_verification') {
        setCurrentStep("analysis"); // Awaiting admin to verify payment
      } else if (wf.workflow_step === 'analysis_in_progress') {
        setCurrentStep("analysis_progress"); // Analysis is currently running
      } else if (wf.workflow_step === 'analysis_complete') {
        // Navigate to results page once analysis is complete
        navigate(createPageUrl("AnalysisResult") + `?workflowId=${id}`);
        return; // Exit early as we are navigating away
      } else {
        // Fallback for any other or unexpected workflow_step, might lead to "awaiting admin" if not handled specifically
        setCurrentStep("analysis"); 
      }
      
    } catch (e) {
      console.error("Failed to load workflow:", e);
      setError("Could not load analysis session. Please start again.");
      setCurrentStep("payment");
    }
  };
  
  const handleWorkflowCreated = (newId) => {
    console.log("Workflow created, redirecting with ID:", newId);
    // Use replace to avoid back button issues
    window.location.replace(createPageUrl("Upload") + `?workflowId=${newId}`);
  };

  const updateWorkflow = async (updates) => {
    setIsProcessing(true);
    setError(null);
    
    try {
      console.log("Updating workflow with:", updates);
      
      // Create audit log entry
      const currentLog = JSON.parse(workflow.audit_log || "[]");
      const eventKey = Object.keys(updates)[0];
      currentLog.push({ 
        event: `update_${eventKey}`, 
        timestamp: new Date().toISOString(),
        details: updates 
      });
      
      const finalUpdates = { 
        ...updates, 
        audit_log: JSON.stringify(currentLog) 
      };
      
      console.log("Final updates to be sent:", finalUpdates);
      
      const updatedWf = await AnalysisWorkflow.update(workflowId, finalUpdates);
      console.log("Workflow updated successfully:", updatedWf);
      
      // Reload the workflow to get fresh data
      await loadWorkflow(workflowId);
      
      return updatedWf;
      
    } catch (e) {
      console.error("Failed to update workflow:", e);
      setError(`Failed to save progress: ${e.message || "Please try again."}`);
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) {
      setError("No file selected. Please choose an X-ray image.");
      return;
    }

    console.log("Starting file upload:", file.name);
    const wfUpdate = await updateWorkflow({ workflow_step: 'image_uploading' });
    if (!wfUpdate) return;
    
    try {
      const { file_url } = await UploadFile({ file });
      console.log("File uploaded successfully:", file_url);
      
      await updateWorkflow({ 
        uploaded_image_url: file_url, 
        workflow_step: 'patient_info' 
      });
      
      setCurrentStep("patient_info");
      
    } catch (e) {
      console.error("File upload failed:", e);
      setError(`File upload failed: ${e.message || "Please try again."}`);
      await updateWorkflow({ 
        error_message: `File upload failed: ${e.message}`,
        workflow_step: 'upload' // Reset to upload step
      });
    }
  };

  const handlePatientSubmit = async (data) => {
    console.log("Submitting patient data:", data);
    
    // Validate required fields
    if (!data.patient_name || !data.patient_age || !data.patient_gender || !data.anatomical_region) {
      setError("Please fill in all required fields.");
      return;
    }
    
    // Make sure we're mapping the form data correctly to the workflow fields
    const workflowUpdate = {
      patient_name: data.patient_name,
      patient_age: parseInt(data.patient_age), // Ensure it's a number
      patient_gender: data.patient_gender,
      analysis_notes: data.analysis_notes || "",
      detected_anatomical_region: data.anatomical_region, // Explicitly map anatomical_region from form to detected_anatomical_region in DB
      workflow_step: 'awaiting_verification',
      payment_status: 'awaiting_verification' // Flag for admin queue *after* info is submitted
    };
    
    console.log("Workflow update data:", workflowUpdate);
    
    const updateResult = await updateWorkflow(workflowUpdate);
    
    if (updateResult) {
      setCurrentStep("analysis");
    }
  };

  if (currentStep === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading analysis session...</p>
        </div>
      </div>
    );
  }

  if (currentStep === "payment") {
    return <PaymentFirstModal isOpen={true} onWorkflowCreated={handleWorkflowCreated} />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Texture-Based Osteoporosis Screening</h1>
          <p className="text-slate-600">Follow the steps below to complete your analysis request.</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {currentStep === "upload" && (
          <ImageUploadZone onFileUpload={handleFileUpload} isProcessing={isProcessing} />
        )}
        
        {currentStep === "patient_info" && workflow && (
           <PatientInfoForm 
             onSubmit={handlePatientSubmit}
             isProcessing={isProcessing}
             uploadedFile={{ name: workflow.uploaded_image_url.split('/').pop(), url: workflow.uploaded_image_url }}
           />
        )}
        
        {/* Display when awaiting admin verification */}
        {currentStep === "analysis" && workflow && workflow.workflow_step === 'awaiting_verification' && (
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-center">Awaiting Admin Verification</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                        <Shield className="w-8 h-8 text-blue-600" />
                    </div>
                    <p className="text-slate-700">Your request has been submitted successfully. The analysis will begin once an administrator verifies your payment.</p>
                    <p className="text-sm text-slate-500">You will receive an email notification when the analysis starts and when the results are ready.</p>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <p className="text-sm text-slate-600">
                            <strong>Request ID:</strong> #{workflowId?.slice(-8) || 'Unknown'}
                        </p>
                        <p className="text-sm text-slate-600">
                            <strong>Status:</strong> Awaiting payment verification
                        </p>
                    </div>
                    <Link to={createPageUrl("Dashboard")}>
                        <Button variant="outline">Return to Dashboard</Button>
                    </Link>
                </CardContent>
            </Card>
        )}

        {/* Display when analysis is in progress */}
        {currentStep === "analysis_progress" && workflow && workflow.workflow_step === 'analysis_in_progress' && (
          <TextureAnalysisProgress workflowId={workflowId} />
        )}
      </div>
    </div>
  );
}
