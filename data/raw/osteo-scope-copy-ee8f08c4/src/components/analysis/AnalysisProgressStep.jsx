import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Activity, Calculator, CheckCircle } from "lucide-react";

export default function AnalysisProgressStep({ workflowData }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev < 100) return prev + 2;
        return prev;
      });
    }, 200);
    return () => clearInterval(timer);
  }, []);

  const analysisSteps = [
    { 
      label: "Image preprocessing", 
      complete: progress > 25, 
      icon: Activity 
    },
    { 
      label: "ROI extraction", 
      complete: progress > 50, 
      icon: Calculator 
    },
    { 
      label: "Texture analysis", 
      complete: progress > 75, 
      icon: Brain 
    },
    { 
      label: "Generating report", 
      complete: progress > 95, 
      icon: CheckCircle 
    }
  ];

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-bold text-slate-900">
          Analyzing X-ray for {workflowData.patient_name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Analysis Progress</span>
            <span className="font-medium text-slate-900">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-3">
          {analysisSteps.map((step, index) => (
            <div key={index} className={`flex gap-3 p-3 rounded-lg transition-all duration-300 ${
              step.complete ? 'bg-green-50 border border-green-200' : 'bg-slate-50'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step.complete ? 'bg-green-100' : 'bg-slate-100'
              }`}>
                <step.icon className={`w-4 h-4 ${
                  step.complete ? 'text-green-600' : 'text-slate-400'
                }`} />
              </div>
              <span className={`font-medium ${
                step.complete ? 'text-slate-900' : 'text-slate-500'
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {progress >= 100 && (
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
            <p className="text-green-700 font-medium">Analysis Complete!</p>
            <p className="text-sm text-slate-600">Redirecting to results...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}