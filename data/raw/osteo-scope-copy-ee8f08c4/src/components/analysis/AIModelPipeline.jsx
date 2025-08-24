import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle, XCircle, Eye, Target, Calculator, Brain } from "lucide-react";

// Component to visualize the AI pipeline stages
export default function AIModelPipeline({ analysis, showDetails = false }) {
  const [activeStage, setActiveStage] = useState(0);

  const pipelineStages = [
    {
      id: 'detection',
      name: 'Bone Detection & Segmentation',
      description: 'Multi-class bone detection with negative suppression',
      icon: Eye,
      metrics: ['Detection AP', 'Dice Score', 'False Positive Rate'],
      status: analysis?.detection_qa_score >= 0.8 ? 'pass' : analysis?.detection_qa_score >= 0.6 ? 'warning' : 'fail',
      score: analysis?.detection_qa_score || 0
    },
    {
      id: 'landmarks',
      name: 'Anatomical Landmark Regression',
      description: 'Precise landmark localization within target bone',
      icon: Target,
      metrics: ['Landmark Error (mm)', 'Consistency Score', 'Anatomical Validity'],
      status: analysis?.landmark_qa_score >= 0.8 ? 'pass' : analysis?.landmark_qa_score >= 0.6 ? 'warning' : 'fail',
      score: analysis?.landmark_qa_score || 0
    },
    {
      id: 'roi_extraction',
      name: 'Standardized ROI Extraction',
      description: 'Fixed size, oriented ROI based on landmarks',
      icon: Calculator,
      metrics: ['ROI Alignment Error', 'Size Consistency', 'Orientation Accuracy'],
      status: analysis?.roi_qa_score >= 0.8 ? 'pass' : analysis?.roi_qa_score >= 0.6 ? 'warning' : 'fail',
      score: analysis?.roi_qa_score || 0
    },
    {
      id: 'trabecular_analysis',
      name: 'Trabecular Architecture Analysis',
      description: 'High-resolution microstructure quantification',
      icon: Brain,
      metrics: ['BV/TV Proxy', 'Tb.Th', 'Tb.Sp', 'Anisotropy Index'],
      status: analysis?.analysis_qa_score >= 0.8 ? 'pass' : analysis?.analysis_qa_score >= 0.6 ? 'warning' : 'fail',
      score: analysis?.analysis_qa_score || 0
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pass': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'fail': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'fail': return XCircle;
      default: return AlertTriangle;
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900">AI Pipeline Quality Assessment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pipeline Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {pipelineStages.map((stage, index) => {
            const StatusIcon = getStatusIcon(stage.status);
            return (
              <div
                key={stage.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  activeStage === index ? 'ring-2 ring-blue-500' : ''
                } ${getStatusColor(stage.status)}`}
                onClick={() => setActiveStage(index)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <stage.icon className="w-5 h-5" />
                  <span className="font-semibold text-sm">{stage.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <StatusIcon className="w-4 h-4" />
                  <span className="text-sm font-bold">{Math.round(stage.score * 100)}%</span>
                </div>
                <Progress value={stage.score * 100} className="h-1 mt-2" />
              </div>
            );
          })}
        </div>

        {/* Detailed Stage Information */}
        {showDetails && (
          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <h4 className="font-semibold text-slate-900 mb-3">
              {pipelineStages[activeStage].name} - Details
            </h4>
            <p className="text-sm text-slate-600 mb-4">
              {pipelineStages[activeStage].description}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {pipelineStages[activeStage].metrics.map((metric, idx) => (
                <div key={idx} className="text-center p-2 bg-white rounded border">
                  <p className="text-xs text-slate-500">{metric}</p>
                  <p className="font-semibold text-slate-900">
                    {analysis?.[`${pipelineStages[activeStage].id}_${metric.toLowerCase().replace(/[^a-z0-9]/g, '_')}`] || 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overall Quality Score */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-slate-900">Overall Pipeline Confidence</h4>
            <Badge className="bg-blue-100 text-blue-800">
              {Math.round((analysis?.overall_confidence || 0) * 100)}%
            </Badge>
          </div>
          <Progress value={(analysis?.overall_confidence || 0) * 100} className="h-2" />
          <p className="text-xs text-slate-600 mt-2">
            Weighted average of all pipeline stages with domain adaptation confidence
          </p>
        </div>
      </CardContent>
    </Card>
  );
}