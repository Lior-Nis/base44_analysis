import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Microscope, Grid, Layers, Network, Zap } from "lucide-react";

export default function TrabecularMetrics({ analysis }) {
  const metrics = [
    {
      name: "BV/TV Proxy",
      value: analysis?.bv_tv_proxy?.toFixed(3),
      unit: "",
      description: "Bone Volume / Total Volume ratio proxy",
      icon: Grid,
      normal_range: "0.150-0.250",
      interpretation: analysis?.bv_tv_proxy >= 0.15 ? "Normal" : "Low Bone Volume"
    },
    {
      name: "Tb.Th",
      value: analysis?.trabecular_thickness?.toFixed(0),
      unit: "μm",
      description: "Mean trabecular thickness",
      icon: Layers,
      normal_range: "120-180 μm",
      interpretation: analysis?.trabecular_thickness >= 120 ? "Normal" : "Thinned Trabeculae"
    },
    {
      name: "Tb.Sp",
      value: analysis?.trabecular_separation?.toFixed(0),
      unit: "μm",
      description: "Mean trabecular separation",
      icon: Network,
      normal_range: "400-800 μm",
      interpretation: analysis?.trabecular_separation <= 800 ? "Normal" : "Increased Separation"
    },
    {
      name: "Anisotropy Index",
      value: analysis?.anisotropy_index?.toFixed(3),
      unit: "",
      description: "Directional preference of trabecular structure",
      icon: Zap,
      normal_range: "1.5-2.5",
      interpretation: analysis?.anisotropy_index >= 1.5 ? "Normal" : "Loss of Directionality"
    },
    {
      name: "Connectivity Density",
      value: analysis?.connectivity_density?.toFixed(2),
      unit: "mm⁻³",
      description: "Trabecular connectivity per unit volume",
      icon: Network,
      normal_range: "3.0-8.0 mm⁻³",
      interpretation: analysis?.connectivity_density >= 3.0 ? "Well Connected" : "Poor Connectivity"
    },
    {
      name: "SMI",
      value: analysis?.structure_model_index?.toFixed(2),
      unit: "",
      description: "Structure Model Index (plate vs rod-like)",
      icon: Microscope,
      normal_range: "0.0-3.0",
      interpretation: analysis?.structure_model_index <= 2.0 ? "Plate-like" : "Rod-like"
    }
  ];

  const getInterpretationColor = (interpretation) => {
    if (interpretation.includes("Normal") || interpretation.includes("Well") || interpretation.includes("Plate-like")) {
      return "bg-green-100 text-green-800";
    } else if (interpretation.includes("Low") || interpretation.includes("Thinned") || interpretation.includes("Poor")) {
      return "bg-red-100 text-red-800";
    } else {
      return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Microscope className="w-6 h-6 text-purple-600" />
          Trabecular Architecture Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {metrics.map((metric, index) => (
            <div key={index} className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
              <div className="flex items-center gap-2 mb-3">
                <metric.icon className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold text-slate-900">{metric.name}</h4>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900">
                    {metric.value !== undefined ? metric.value : 'N/A'}
                  </span>
                  {metric.unit && (
                    <span className="text-sm text-slate-500">{metric.unit}</span>
                  )}
                </div>
                
                <p className="text-xs text-slate-600">{metric.description}</p>
                
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">
                    <strong>Normal Range:</strong> {metric.normal_range}
                  </p>
                  <Badge className={`text-xs ${getInterpretationColor(metric.interpretation)}`}>
                    {metric.interpretation}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Quality Metrics */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
          <h4 className="font-semibold text-slate-900 mb-3">Analysis Quality Indicators</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <p className="text-slate-600">ROI Size</p>
              <p className="font-bold text-slate-900">
                {analysis?.roi_size_mm ? JSON.parse(analysis.roi_size_mm).width + 'mm' : 'N/A'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-slate-600">Processing Time</p>
              <p className="font-bold text-slate-900">
                {analysis?.processing_time_ms ? (analysis.processing_time_ms / 1000).toFixed(1) + 's' : 'N/A'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-slate-600">Model Version</p>
              <p className="font-bold text-slate-900">{analysis?.model_version || 'v1.0'}</p>
            </div>
            <div className="text-center">
              <p className="text-slate-600">Domain Score</p>
              <p className="font-bold text-slate-900">
                {analysis?.domain_adaptation_score ? Math.round(analysis.domain_adaptation_score * 100) + '%' : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}