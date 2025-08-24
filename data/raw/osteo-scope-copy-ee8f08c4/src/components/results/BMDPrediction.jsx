
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp, Activity } from "lucide-react";

export default function BMDPrediction({ analysis }) {
  const getTScoreInterpretation = (tScore) => {
    if (tScore >= -1.0) return { status: 'Normal', color: 'bg-green-50 text-green-700 border-green-200', icon: TrendingUp };
    if (tScore >= -2.5) return { status: 'Osteopenia', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Activity };
    return { status: 'Osteoporosis', color: 'bg-red-50 text-red-700 border-red-200', icon: TrendingDown };
  };

  const tScoreInfo = getTScoreInterpretation(analysis.predicted_t_score);

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900">BMD Prediction & DXA Correlation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* BMD and T-Score Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
            <h3 className="font-semibold text-slate-900 mb-2">Predicted BMD</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{analysis.predicted_bmd_gm_cm2?.toFixed(3)}</span>
              <span className="text-sm text-slate-500">g/cm²</span>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              Bone Mineral Density prediction based on radiogrammetric analysis
            </p>
          </div>

          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
            <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
              DXA T-Score
              <Badge className={tScoreInfo.color}>
                <tScoreInfo.icon className="w-3 h-3 mr-1" />
                {tScoreInfo.status}
              </Badge>
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{analysis.predicted_t_score?.toFixed(1)}</span>
              <span className="text-sm text-slate-500">SD</span>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              Standard deviations from young adult peak bone mass
            </p>
          </div>
        </div>

        {/* T-Score Reference Scale */}
        <div className="p-4 rounded-lg border border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
          <h4 className="font-semibold text-slate-900 mb-3">T-Score Reference Scale</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Normal</span>
              <span className="font-medium text-green-600">T-score ≥ -1.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Osteopenia</span>
              <span className="font-medium text-yellow-600">-2.5 &lt; T-score &lt; -1.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Osteoporosis</span>
              <span className="font-medium text-red-600">T-score ≤ -2.5</span>
            </div>
          </div>
        </div>

        {/* Clinical Interpretation */}
        <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
          <h4 className="font-semibold text-slate-900 mb-2">Clinical Interpretation</h4>
          <p className="text-sm text-slate-700 leading-relaxed">
            Based on the radiogrammetric analysis, the predicted BMD suggests{' '}
            <strong className="text-slate-900">{analysis.osteoporosis_risk_category}</strong>.{' '}
            {analysis.osteoporosis_risk_category === 'normal' 
              ? 'Continue regular monitoring and maintain current lifestyle habits.'
              : analysis.osteoporosis_risk_category === 'osteopenia'
              ? 'Consider preventive measures including calcium supplementation, vitamin D, and weight-bearing exercises.'
              : 'Immediate medical attention recommended. Consider pharmacological intervention and comprehensive bone health assessment.'
            }
          </p>
          <p className="text-xs text-slate-500 mt-2">
            <strong>Note:</strong> This AI-generated prediction should be confirmed with conventional DXA scan for definitive diagnosis.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
