import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, CheckCircle, Edit3 } from "lucide-react";

export default function ROIDetectionStep({ imageUrl, roiCoordinates, detectedRegion, onApprove, onAdjust, isProcessing }) {
  const [roiBox, setRoiBox] = useState(null);

  useEffect(() => {
    if (roiCoordinates) {
      try {
        setRoiBox(JSON.parse(roiCoordinates));
      } catch (e) {
        console.error("Failed to parse ROI coordinates");
      }
    }
  }, [roiCoordinates]);

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Eye className="w-6 h-6 text-blue-600" />
          ROI Detection Complete
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Region of Interest Detected:</strong> We detected this region of interest for {detectedRegion.replace('_', ' ')} analysis. 
            Please review and approve or adjust the ROI before proceeding to payment.
          </p>
        </div>

        <div className="relative inline-block">
          <img 
            src={imageUrl} 
            alt="X-ray with ROI" 
            className="w-full max-w-md mx-auto rounded-lg border border-slate-200 shadow-sm"
          />
          
          {/* ROI Overlay */}
          {roiBox && (
            <div 
              className="absolute border-2 border-red-500 bg-red-500/20"
              style={{
                left: `${roiBox.x}%`,
                top: `${roiBox.y}%`,
                width: `${roiBox.width}%`,
                height: `${roiBox.height}%`
              }}
            >
              <div className="absolute -top-6 left-0 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                ROI
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900">ROI Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-600">Target Region:</span>
              <Badge variant="outline" className="ml-2 capitalize">
                {detectedRegion.replace('_', ' ')}
              </Badge>
            </div>
            <div>
              <span className="text-slate-600">Analysis Method:</span>
              <span className="ml-2 font-medium text-slate-900">
                {detectedRegion === 'proximal_femur' ? 'Singh Index + GLCM' :
                 detectedRegion === 'calcaneus' ? 'Jhamaria Index + GLCM' :
                 detectedRegion === 'clavicle' ? 'Cortical Thickness + GLCM' :
                 'GLCM Texture Analysis'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={onApprove}
            disabled={isProcessing}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Approve ROI
          </Button>
          <Button 
            onClick={onAdjust}
            disabled={isProcessing}
            variant="outline"
            className="flex-1"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Adjust ROI
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}