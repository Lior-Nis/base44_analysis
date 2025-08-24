
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

export default function DiagnosisCard({ analysis }) {
  const getDiagnosisInfo = (classification) => {
    switch (classification) {
      case 'normal':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          title: 'Normal Bone Density',
          description: 'Bone density is within normal range. Continue regular monitoring and maintain healthy lifestyle habits.'
        };
      case 'osteopenia':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          title: 'Osteopenia Detected',
          description: 'Bone density is lower than normal but not yet osteoporotic. Consider preventive measures and lifestyle modifications.'
        };
      case 'osteoporosis':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          title: 'Osteoporosis Detected',
          description: 'Significant bone density loss detected. Immediate medical attention and treatment planning recommended.'
        };
      default:
        return {
          icon: AlertTriangle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          title: 'Analysis Pending',
          description: 'Analysis is still in progress.'
        };
    }
  };

  const diagnosisInfo = getDiagnosisInfo(analysis.osteoporosis_risk_category);

  return (
    <Card className={`${diagnosisInfo.bgColor} border-2 ${diagnosisInfo.borderColor} shadow-lg`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <diagnosisInfo.icon className={`w-6 h-6 ${diagnosisInfo.color}`} />
          <span className={`text-xl font-bold ${diagnosisInfo.color}`}>
            {diagnosisInfo.title}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-700 mb-4 leading-relaxed">
          {diagnosisInfo.description}
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="text-sm">
            <span className="text-slate-600">Analysis Confidence:</span>
            <span className="font-bold text-slate-900 ml-1">{analysis.confidence_level}%</span>
          </div>
          <Badge variant="outline" className={`${diagnosisInfo.color} border-current`}>
            AI-Powered Analysis
          </Badge>
        </div>
        
        {analysis.clinical_notes && (
          <div className="mt-4 p-3 bg-white/50 rounded-lg border border-slate-200">
            <p className="text-sm text-slate-600 font-medium mb-1">Clinical Notes:</p>
            <p className="text-sm text-slate-700">{analysis.clinical_notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
