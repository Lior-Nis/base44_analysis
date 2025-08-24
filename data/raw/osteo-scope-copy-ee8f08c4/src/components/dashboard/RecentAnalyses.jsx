
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Calendar, User, Activity } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const classificationColors = {
  normal: "bg-green-50 text-green-700 border-green-200",
  osteopenia: "bg-yellow-50 text-yellow-700 border-yellow-200",
  osteoporosis: "bg-red-50 text-red-700 border-red-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200"
};

export default function RecentAnalyses({ analyses, isLoading }) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900">Recent Analyses</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        ) : analyses.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Activity className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>No analyses yet. Upload your first X-ray to get started.</p>
            <Link to={createPageUrl("Upload")} className="mt-4 inline-block">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Upload X-ray
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {analyses.map((analysis) => (
              <div key={analysis.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all duration-200">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <h3 className="font-semibold text-slate-900">{analysis.patient_name}</h3>
                    <span className="text-sm text-slate-500">•</span>
                    <span className="text-sm text-slate-500 capitalize">{analysis.image_type}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{format(new Date(analysis.created_date), "MMM d, yyyy")}</span>
                    </div>
                    {analysis.confidence_level && (
                      <span>Confidence: {analysis.confidence_level}%</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={classificationColors[analysis.osteoporosis_classification || 'processing']}>
                    {analysis.analysis_status === 'completed' 
                      ? analysis.osteoporosis_classification?.replace('_', ' ')
                      : analysis.analysis_status
                    }
                  </Badge>
                  <Link to={createPageUrl("Results") + `?id=${analysis.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
