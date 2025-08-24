import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image } from "lucide-react";

export default function XRayImageViewer({ analysis }) {
  if (!analysis || !analysis.image_url) {
    return null;
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Image className="w-5 h-5 text-blue-600" />
            Analyzed Image
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-square w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
          <img
            src={analysis.image_url}
            alt={`X-ray for ${analysis.patient_name}`}
            className="w-full h-full object-cover"
          />
        </div>
      </CardContent>
    </Card>
  );
}