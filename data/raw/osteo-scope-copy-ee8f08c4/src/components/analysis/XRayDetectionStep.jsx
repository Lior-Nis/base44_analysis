import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Eye } from "lucide-react";

export default function XRayDetectionStep({ imageUrl, detectedRegion, onContinue, isProcessing }) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-green-600" />
          X-ray Validated Successfully
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <img 
              src={imageUrl} 
              alt="Uploaded X-ray" 
              className="w-full max-w-md mx-auto rounded-lg border border-slate-200 shadow-sm"
            />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Detection Results</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Image Type:</span>
                  <Badge className="bg-green-50 text-green-700 border-green-200">
                    X-ray Confirmed
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Detected Region:</span>
                  <Badge variant="outline" className="capitalize">
                    {detectedRegion.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                ✓ Image quality is suitable for analysis<br/>
                ✓ Anatomical region detected successfully<br/>
                ✓ Ready for ROI detection
              </p>
            </div>
          </div>
        </div>

        <Button 
          onClick={onContinue}
          disabled={isProcessing}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
        >
          {isProcessing ? "Detecting ROI..." : "Continue to ROI Detection"}
        </Button>
      </CardContent>
    </Card>
  );
}