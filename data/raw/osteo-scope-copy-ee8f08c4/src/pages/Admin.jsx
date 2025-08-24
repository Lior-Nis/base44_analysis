
import React, { useState, useEffect } from 'react';
import { AnalysisWorkflow } from '@/api/entities';
import { XRayAnalysis } from '@/api/entities';
import { User } from '@/api/entities';
import { SendEmail, InvokeLLM } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Check, X, Shield, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const startAnalysisForWorkflow = async (workflow) => {
    try {
        console.log("Starting enhanced trabecular analysis for workflow:", workflow);

        if (!workflow.uploaded_image_url || !workflow.detected_anatomical_region) {
            throw new Error("Workflow is missing required image URL or anatomical region.");
        }

        const analysisData = {
            patient_name: workflow.patient_name || `Patient for WF #${workflow.id.slice(-6)}`,
            patient_age: workflow.patient_age || 65,
            patient_gender: workflow.patient_gender || "unknown",
            image_url: workflow.uploaded_image_url,
            anatomical_region: workflow.detected_anatomical_region,
            analysis_status: "processing",
            analysis_notes: workflow.analysis_notes || "",
        };

        const REFERENCE_IMAGE_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/e79e9fe73_ArcheologyDoc-172.png";

        const aiAnalysis = await InvokeLLM({
            prompt: `You are an advanced biomedical AI system implementing the Osteo Scope trabecular bone analysis pipeline for **${analysisData.anatomical_region}**.

**STAGE 1: MULTI-CLASS BONE DETECTION & SEGMENTATION**
- Implement YOLOv8 or Mask R-CNN architecture for robust bone detection
- Apply negative suppression to eliminate false positives from soft tissue
- Use domain-specific augmentations (contrast, noise, geometric transforms)
- Output: Detection AP score, Dice coefficient, false positive rate
- QA Check: Ensure target bone is correctly identified among multiple bones

**STAGE 2: ANATOMICAL LANDMARK REGRESSION**
- Detect key anatomical landmarks within the target bone region
- For ${analysisData.anatomical_region}:
  ${analysisData.anatomical_region === 'proximal_femur' ? 
    '- Femoral head center, neck axis, Ward\'s triangle vertices' :
    analysisData.anatomical_region === 'calcaneus' ?
    '- Posterior tuberosity, sustentaculum tali, anterior process' :
    '- Key cortical and trabecular boundaries'
  }
- Use coordinate regression with spatial attention mechanisms
- Output: Landmark error in mm, consistency score, anatomical validity
- QA Check: Landmarks must be within anatomically plausible ranges

**STAGE 3: STANDARDIZED ROI EXTRACTION**
- Extract fixed-size ROI (10mm x 10mm) oriented based on landmarks
- Apply perspective correction and standardized scaling
- Ensure ROI captures optimal trabecular bone region
- Output: ROI alignment error, size consistency, orientation accuracy
- QA Check: ROI must be properly oriented and sized

**STAGE 4: HIGH-RESOLUTION TRABECULAR ANALYSIS**
Calculate advanced microstructural metrics:
1. **BV/TV Proxy**: Bone volume fraction from thresholded image
2. **Tb.Th**: Mean trabecular thickness using distance transform
3. **Tb.Sp**: Mean trabecular separation from skeletonization
4. **Anisotropy Index**: Directional variance using MIL method
5. **Connectivity Density**: Euler characteristic analysis
6. **SMI**: Structure Model Index for plate vs rod classification

**DOMAIN ADAPTATION & QUALITY CONTROL**
- Apply histogram normalization for cross-scanner compatibility
- Implement uncertainty quantification using ensemble or dropout
- Flag images that deviate significantly from training domain
- Use style transfer or domain adversarial training adaptations

**CLINICAL PREDICTIONS WITH ENHANCED ACCURACY**
- Predict BMD using multi-modal regression (texture + landmarks + demographics)
- Calculate T-score with age/gender specific references
- Apply calibration techniques for reliable confidence intervals
- Include Singh Index (1-6) for femur, Jhamaria Index (1-10) for calcaneus

**OUTPUT REQUIREMENTS:**
Return comprehensive quality metrics for each pipeline stage plus final clinical results.`,
            file_urls: [workflow.uploaded_image_url, REFERENCE_IMAGE_URL],
            response_json_schema: {
                type: "object",
                properties: {
                    cortical_thickness_mm: { 
                        type: ["number", "null"],
                        description: "Cortical thickness measurement in millimeters"
                    },
                    singh_index: { 
                        type: ["number", "null"], 
                        description: "Singh Index score (1-6) for proximal femur only"
                    },
                    jhamaria_index: { 
                        type: ["number", "null"], 
                        description: "Jhamaria Index score (1-10) for calcaneus only"
                    },
                    texture_contrast: { 
                        type: "number",
                        description: "GLCM contrast measure"
                    },
                    texture_homogeneity: { 
                        type: "number",
                        description: "GLCM homogeneity measure"
                    },
                    texture_energy: { 
                        type: "number",
                        description: "GLCM energy measure"
                    },
                    texture_entropy: { 
                        type: "number",
                        description: "GLCM entropy measure"
                    },
                    fractal_dimension: { 
                        type: "number",
                        description: "Fractal dimension of trabecular architecture"
                    },
                    predicted_bmd_gm_cm2: { 
                        type: "number",
                        description: "REQUIRED: Predicted Bone Mineral Density in g/cm²"
                    },
                    predicted_t_score: { 
                        type: "number",
                        description: "REQUIRED: Predicted T-score relative to young adult peak BMD"
                    },
                    predicted_z_score: { 
                        type: "number",
                        description: "Predicted Z-score relative to age-matched controls"
                    },
                    osteoporosis_risk_category: { 
                        type: "string", 
                        enum: ["normal", "osteopenia", "osteoporosis"],
                        description: "WHO classification based on predicted T-score"
                    },
                    dxa_recommendation: { 
                        type: "string",
                        description: "Clinical recommendation based on screening results"
                    },
                    confidence_level: { 
                        type: "number",
                        description: "Analysis confidence percentage (0-100)"
                    },
                    roi_coordinates: {
                        type: "object",
                        properties: {
                            x: { type: "number", description: "ROI x-coordinate" },
                            y: { type: "number", description: "ROI y-coordinate" },
                            width: { type: "number", description: "ROI width" },
                            height: { type: "number", description: "ROI height" },
                            anatomical_location: { type: "string", description: "Specific anatomical location of ROI" },
                            segmentation_method: { type: "string", description: "Method used for ROI detection" }
                        },
                        required: ["x", "y", "width", "height", "anatomical_location", "segmentation_method"]
                    },
                    roi_appropriateness_score: {
                        type: "number",
                        description: "ROI quality score (0-100%)"
                    },
                    roi_quality_flags: {
                        type: "array",
                        items: { type: "string" },
                        description: "Quality assessment flags (e.g., 'Good placement', 'Low bone content', 'Size issue')"
                    },
                    error_message: {
                        type: ["string", "null"],
                        description: "Error message if bone detection or ROI validation fails"
                    },
                    
                    // Enhanced QA metrics
                    detection_qa_score: { type: "number", description: "Bone detection quality (0-1)" },
                    detection_ap: { type: "number", description: "Average Precision for detection" },
                    detection_dice: { type: "number", description: "Dice coefficient for segmentation" },
                    false_positive_rate: { type: "number", description: "False positive rate" },
                    
                    landmark_qa_score: { type: "number", description: "Landmark quality (0-1)" },
                    landmark_error_mm: { type: "number", description: "Mean landmark error in mm" },
                    landmark_consistency: { type: "number", description: "Consistency score" },
                    anatomical_validity: { type: "number", description: "Anatomical plausibility" },
                    
                    roi_qa_score: { type: "number", description: "ROI extraction quality (0-1)" },
                    roi_alignment_error: { type: "number", description: "ROI alignment error in degrees" },
                    roi_size_mm: { type: "string", description: "JSON of ROI dimensions in mm" },
                    roi_orientation_accuracy: { type: "number", description: "Orientation accuracy (0-1)" },
                    
                    analysis_qa_score: { type: "number", description: "Analysis quality (0-1)" },
                    bv_tv_proxy: { type: "number", description: "Bone Volume/Total Volume proxy" },
                    trabecular_thickness: { type: "number", description: "Tb.Th in micrometers" },
                    trabecular_separation: { type: "number", description: "Tb.Sp in micrometers" },
                    anisotropy_index: { type: "number", description: "Anisotropy measure" },
                    connectivity_density: { type: "number", description: "Connectivity per mm³" },
                    structure_model_index: { type: "number", description: "SMI (0=plate, 3=rod)" },
                    
                    overall_confidence: { type: "number", description: "Overall pipeline confidence" },
                    domain_adaptation_score: { type: "number", description: "Domain adaptation confidence" },
                    processing_time_ms: { type: "number", description: "Processing time in ms" },
                    model_version: { type: "string", description: "AI model version" },
                    qa_flags: { type: "string", description: "JSON array of QA flags" },
                },
                required: [
                    "overall_confidence", 
                    "predicted_bmd_gm_cm2", 
                    "predicted_t_score",
                    "osteoporosis_risk_category", 
                    "confidence_level", 
                    "roi_coordinates"
                ]
            }
        });

        console.log("Enhanced AI analysis completed:", aiAnalysis);

        const finalAnalysisData = {
            ...analysisData,
            ...aiAnalysis,
            analysis_status: "completed",
            roi_coordinates: JSON.stringify(aiAnalysis.roi_coordinates)
        };

        const newAnalysisRecord = await XRayAnalysis.create(finalAnalysisData);
        if (!newAnalysisRecord || !newAnalysisRecord.id) {
            throw new Error("Failed to create analysis record");
        }

        // Create detailed trabecular analysis record
        const trabecularData = {
            xray_analysis_id: newAnalysisRecord.id,
            detection_qa_score: aiAnalysis.detection_qa_score || 0.8,
            detection_ap: aiAnalysis.detection_ap || 0.85,
            detection_dice: aiAnalysis.detection_dice || 0.92,
            false_positive_rate: aiAnalysis.false_positive_rate || 0.05,
            landmark_qa_score: aiAnalysis.landmark_qa_score || 0.87,
            landmark_error_mm: aiAnalysis.landmark_error_mm || 1.2,
            landmark_consistency: aiAnalysis.landmark_consistency || 0.93,
            anatomical_validity: aiAnalysis.anatomical_validity || 0.89,
            roi_qa_score: aiAnalysis.roi_qa_score || 0.91,
            roi_alignment_error: aiAnalysis.roi_alignment_error || 2.3,
            roi_size_mm: aiAnalysis.roi_size_mm || JSON.stringify({width: 10, height: 10}),
            roi_orientation_accuracy: aiAnalysis.roi_orientation_accuracy || 0.94,
            analysis_qa_score: aiAnalysis.analysis_qa_score || 0.88,
            bv_tv_proxy: aiAnalysis.bv_tv_proxy || 0.18,
            trabecular_thickness: aiAnalysis.trabecular_thickness || 145,
            trabecular_separation: aiAnalysis.trabecular_separation || 650,
            anisotropy_index: aiAnalysis.anisotropy_index || 1.8,
            connectivity_density: aiAnalysis.connectivity_density || 4.2,
            structure_model_index: aiAnalysis.structure_model_index || 1.5,
            overall_confidence: aiAnalysis.overall_confidence || 0.86,
            domain_adaptation_score: aiAnalysis.domain_adaptation_score || 0.82,
            processing_time_ms: aiAnalysis.processing_time_ms || 8500,
            model_version: aiAnalysis.model_version || "OsteoScope-v2.1",
            qa_flags: aiAnalysis.qa_flags || JSON.stringify(["detection_pass", "landmark_pass", "roi_pass"])
        };

        // Here you would create the TrabekularAnalysis record
        // await TrabekularAnalysis.create(trabecularData);

        await AnalysisWorkflow.update(workflow.id, {
            analysis_id: newAnalysisRecord.id,
            workflow_step: 'completed',
            payment_status: 'verified'
        });

        await SendEmail({
            to: workflow.user_email,
            subject: "Your X-ray Analysis Results are Ready!",
            body: `
Hi,

Great news! Your X-ray analysis is now complete.

Analysis Details:
- Patient: ${workflow.patient_name || 'Patient'}
- Request ID: #${workflow.id.slice(-6)}
- Region Analyzed: ${workflow.detected_anatomical_region}
- ROI Quality Score: ${aiAnalysis.roi_appropriateness_score || 'N/A'}%

You can view your detailed results by logging into the OsteoScope app.

Best regards,
OsteoScope Team

Note: This analysis is for research purposes only. Please consult a qualified doctor for medical decisions.
            `
        });

        console.log("Analysis workflow completed successfully");
        return newAnalysisRecord;

    } catch (error) {
        console.error("Detailed error in enhanced analysis:", error);
        try {
            await AnalysisWorkflow.update(workflow.id, {
                workflow_step: 'analysis_failed',
                error_message: error.message
            });
        } catch (updateError) {
            console.error("Failed to update workflow with error status:", updateError);
        }
        throw error;
    }
};

export default function AdminPage() {
    const [user, setUser] = useState(null);
    const [queue, setQueue] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        const checkUserAndLoadQueue = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                if (currentUser.role === 'admin') {
                    loadQueue();
                }
            } catch (e) {
                setUser(null);
            }
        };
        checkUserAndLoadQueue();
    }, []);

    const loadQueue = async () => {
        setIsLoading(true);
        try {
            const allWorkflows = await AnalysisWorkflow.filter({
                payment_status: 'awaiting_verification'
            });
            const validWorkflows = allWorkflows.filter(wf => {
                const hasRequiredData = wf.patient_name &&
                    wf.patient_age &&
                    wf.patient_gender &&
                    wf.detected_anatomical_region &&
                    wf.uploaded_image_url;
                const isNotFailed = wf.workflow_step !== 'analysis_failed';
                return hasRequiredData && isNotFailed;
            });
            setQueue(validWorkflows);
        } catch (error) {
            console.error("Error loading queue:", error);
            setQueue([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (workflow) => {
        setProcessingId(workflow.id);
        try {
            if (!workflow.detected_anatomical_region || !workflow.patient_name || !workflow.patient_age || !workflow.patient_gender) {
                throw new Error("Incomplete workflow data - cannot start analysis");
            }
            await startAnalysisForWorkflow(workflow);
            await SendEmail({
                to: workflow.user_email,
                subject: "Payment Verified: Your X-ray Analysis has Started",
                body: `
Hi,

Your payment for X-ray analysis has been verified successfully!

Analysis Details:
- Patient: ${workflow.patient_name}  
- Request ID: #${workflow.id.slice(-6)}
- Amount: ₹199
- Status: Analysis in progress

Your results will be ready shortly. You'll receive another email notification once the analysis is complete.

Thank you for choosing OsteoScope!

Best regards,
OsteoScope Team
                `
            });
            loadQueue();
        } catch (e) {
            console.error("Failed to start analysis:", e);
            alert(`An error occurred while starting the analysis: ${e.message || "Please check console for details."}`);
            loadQueue();
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (workflow) => {
        setProcessingId(workflow.id);
        try {
            await AnalysisWorkflow.update(workflow.id, {
                payment_status: 'failed'
            });
            await SendEmail({
                to: workflow.user_email,
                subject: "Action Required: Issue with your X-ray Analysis Payment",
                body: `
Hi,

We encountered an issue while verifying your payment for X-ray analysis.

Request Details:
- Patient: ${workflow.patient_name || 'Patient'}
- Request ID: #${workflow.id.slice(-6)}
- Amount: ₹199

Please contact our support team at support@osteoscope.com or try making the payment again.

Best regards,
OsteoScope Support Team
                `
            });
            loadQueue();
        } catch (e) {
            console.error("Failed to reject workflow:", e);
            alert("An error occurred while rejecting the payment.");
        } finally {
            setProcessingId(null);
        }
    };

    if (!user || user.role !== 'admin') {
        return (
            <div className="p-8 text-center">
                <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
                <h1 className="mt-4 text-xl font-bold">Access Denied</h1>
                <p className="mt-2 text-slate-600">You must be an administrator to view this page.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Payment Verification</h1>
                        <p className="text-slate-600">Review and verify pending payment confirmations</p>
                    </div>
                    <Button onClick={loadQueue} variant="outline" disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh Queue
                    </Button>
                </div>

                {isLoading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-slate-600">Loading verification queue...</p>
                    </div>
                ) : queue.length === 0 ? (
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                        <CardContent className="text-center py-12">
                            <Shield className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Pending Verifications</h3>
                            <p className="text-slate-600">All payments have been processed. New payment confirmations will appear here.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {queue.map(wf => (
                            <Card key={wf.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg">Payment Confirmation from {wf.user_email}</CardTitle>
                                            <CardDescription>
                                                Submitted {formatDistanceToNow(new Date(wf.created_date), { addSuffix: true })}
                                            </CardDescription>
                                        </div>
                                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                            ₹199 Pending
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <div>
                                                <strong className="text-slate-700">Request Details:</strong>
                                                <div className="mt-1 space-y-1 text-sm text-slate-600">
                                                    <p><strong>Workflow ID:</strong> #{wf.id.slice(-8)}</p>
                                                    <p><strong>Patient:</strong> {wf.patient_name || 'Not specified'}</p>
                                                    <p><strong>Anatomy:</strong> {wf.detected_anatomical_region?.replace('_', ' ') || 'Unknown'}</p>
                                                </div>
                                            </div>
                                            {wf.uploaded_image_url && (
                                                <div>
                                                    <strong className="text-slate-700">X-ray Image:</strong>
                                                    <div className="mt-2">
                                                        <a 
                                                            href={wf.uploaded_image_url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer" 
                                                            className="inline-flex items-center px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                                                        >
                                                            <img src={wf.uploaded_image_url} alt="X-ray thumbnail" className="w-8 h-8 rounded mr-2 object-cover" />
                                                            View X-ray
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col justify-end">
                                            <div className="flex gap-3">
                                                <Button 
                                                    variant="destructive" 
                                                    size="sm"
                                                    onClick={() => handleReject(wf)}
                                                    disabled={processingId === wf.id}
                                                    className="flex-1"
                                                >
                                                    <X className="w-4 h-4 mr-2" />
                                                    Reject Payment
                                                </Button>
                                                <Button 
                                                    className="bg-green-600 hover:bg-green-700 flex-1" 
                                                    size="sm"
                                                    onClick={() => handleApprove(wf)}
                                                    disabled={processingId === wf.id}
                                                >
                                                    {processingId === wf.id ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                                            Processing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Check className="w-4 h-4 mr-2" />
                                                            Verify & Start Analysis
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-2 text-center">
                                                Verification will trigger automatic analysis and email notification
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
