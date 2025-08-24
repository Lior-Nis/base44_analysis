import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Activity, Brain, FileText } from "lucide-react";

export default function AnalysisProgress({ isProcessing, analysisResult, patientData }) {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (isProcessing) {
      const timer = setInterval(() => {
        setProgress(prev => {
          if (prev < 90) return prev + 2;
          return prev;
        });
      }, 100);
      return () => clearInterval(timer);
    } else if (analysisResult) {
      setProgress(100);
    }
  }, [isProcessing, analysisResult]);

  const analysisSteps = [
    { label: "Image preprocessing", complete: progress > 20, icon: FileText },
    { label: "Anatomical landmark detection", complete: progress > 40, icon: Activity },
    { label: "AI trabecular analysis", complete: progress > 70, icon: Brain },
    { label: "BMD prediction", complete: progress > 90, icon: CheckCircle }
  ];

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900 text-center">
          {isProcessing ? "Analyzing X-ray..." : "Analysis Complete!"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Patient Info Summary */}
        <div className="p-4 bg-slate-50 rounded-lg">
          <h3 className="font-semibold text-slate-900 mb-2">Patient: {patientData.patient_name}</h3>
          <div className="text-sm text-slate-600 space-y-1">
            <p>Age: {patientData.patient_age} • Gender: {patientData.patient_gender}</p>
            <p>X-ray Type: {patientData.image_type}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Analysis Progress</span>
            <span className="font-medium text-slate-900">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Analysis Steps */}
        <div className="space-y-3">
          {analysisSteps.map((step, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step.complete ? 'bg-green-100' : 'bg-slate-100'
              }`}>
                {step.complete ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <step.icon className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <span className={`font-medium ${
                step.complete ? 'text-slate-900' : 'text-slate-500'
              }`}>
                {step.label}
              </span>
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
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-600">Classification:</span>
                <span className={`ml-1 font-medium capitalize ${
                  analysisResult.osteoporosis_classification === 'normal' ? 'text-green-600' :
                  analysisResult.osteoporosis_classification === 'osteopenia' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {analysisResult.osteoporosis_classification}
                </span>
              </div>
              <div>
                <span className="text-slate-600">Confidence:</span>
                <span className="ml-1 font-medium text-slate-900">{analysisResult.confidence_level}%</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Redirecting to detailed results...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}