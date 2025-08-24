import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Activity, Brain, Calculator, Microscope } from "lucide-react";

export default function TextureAnalysisProgress({ isProcessing, analysisResult, patientData }) {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (isProcessing) {
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev < 90) return prev + 1.5;
          return prev;
        });
      }, 150);
      return () => clearInterval(timer);
    } else if (analysisResult) {
      setProgress(100);
    }
  }, [isProcessing, analysisResult]);

  const analysisSteps = [
    { 
      label: "Image preprocessing & ROI extraction", 
      complete: progress > 15, 
      icon: Activity,
      description: "Enhancing contrast, noise reduction, region of interest detection"
    },
    { 
      label: "Texture feature extraction", 
      complete: progress > 35, 
      icon: Microscope,
      description: "GLCM analysis, fractal dimensions, trabecular patterns"
    },
    { 
      label: "Medical index calculations", 
      complete: progress > 60, 
      icon: Calculator,
      description: "Singh Index, Jhamaria Index, cortical thickness measurements"
    },
    { 
      label: "BMD prediction & risk assessment", 
      complete: progress > 85, 
      icon: Brain,
      description: "T-score calculation, osteoporosis classification, clinical recommendations"
    }
  ];

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900 text-center">
          {isProcessing ? "Analyzing Bone Texture..." : "Texture Analysis Complete!"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Patient Info Summary */}
        <div className="p-4 bg-slate-50 rounded-lg">
          <h3 className="font-semibold text-slate-900 mb-2">Patient: {patientData.patient_name}</h3>
          <div className="text-sm text-slate-600 space-y-1">
            <p>Age: {patientData.patient_age} • Gender: {patientData.patient_gender}</p>
            <p>Region: {patientData.anatomical_region.replace(/_/g, ' ')}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Texture Analysis Progress</span>
            <span className="font-medium text-slate-900">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Analysis Steps */}
        <div className="space-y-4">
          {analysisSteps.map((step, index) => (
            <div key={index} className={`flex gap-3 p-3 rounded-lg transition-all duration-300 ${
              step.complete ? 'bg-green-50 border border-green-200' : 'bg-slate-50'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                step.complete ? 'bg-green-100' : 'bg-slate-100'
              }`}>
                {step.complete ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <step.icon className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <span className={`font-medium block ${
                  step.complete ? 'text-slate-900' : 'text-slate-500'
                }`}>
                  {step.label}
                </span>
                <p className="text-xs text-slate-600 mt-1">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Results Preview */}
        {analysisResult && (
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-slate-900">Analysis Complete</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
              <div>
                <span className="text-slate-600">Risk Category:</span>
                <span className={`ml-1 font-medium capitalize ${
                  analysisResult.osteoporosis_risk_category === 'normal' ? 'text-green-600' :
                  analysisResult.osteoporosis_risk_category === 'osteopenia' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {analysisResult.osteoporosis_risk_category?.replace(/_/g, ' ')}
                </span>
              </div>
              <div>
                <span className="text-slate-600">Confidence:</span>
                <span className="ml-1 font-medium text-slate-900">{analysisResult.confidence_score}%</span>
              </div>
              <div>
                <span className="text-slate-600">Predicted BMD:</span>
                <span className="ml-1 font-medium text-slate-900">{analysisResult.predicted_bmd_gm_cm2?.toFixed(3)} g/cm²</span>
              </div>
              <div>
                <span className="text-slate-600">T-Score:</span>
                <span className="ml-1 font-medium text-slate-900">{analysisResult.predicted_t_score?.toFixed(1)}</span>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Redirecting to detailed texture analysis results...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}