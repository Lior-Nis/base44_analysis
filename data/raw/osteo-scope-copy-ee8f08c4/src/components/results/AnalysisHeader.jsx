
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, Image } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AnalysisHeader({ analysis }) {
  const navigate = useNavigate();

  const classificationColors = {
    normal: "bg-green-50 text-green-700 border-green-200",
    osteopenia: "bg-yellow-50 text-yellow-700 border-yellow-200",
    osteoporosis: "bg-red-50 text-red-700 border-red-200"
  };

  return (
    <>
      {/* Back Button */}
      <Button
        variant="outline"
        onClick={() => navigate(createPageUrl("Dashboard"))}
        className="mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      {/* Header Card */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                Osteoporosis Analysis Report
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{analysis.patient_name}</span>
                  <span>•</span>
                  <span>{analysis.patient_age} years old</span>
                  <span>•</span>
                  <span className="capitalize">{analysis.patient_gender}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(analysis.created_date), "MMM d, yyyy 'at' h:mm a")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Image className="w-4 h-4" />
                  <span className="capitalize">{analysis.image_type} X-ray</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={classificationColors[analysis.osteoporosis_risk_category]} size="lg">
                {analysis.osteoporosis_risk_category?.toUpperCase()}
              </Badge>
              <div className="text-right">
                <p className="text-sm text-slate-500">Confidence</p>
                <p className="font-bold text-lg text-slate-900">{analysis.confidence_level}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
