
import React, { useState, useEffect } from "react";
import { XRayAnalysis } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AlertTriangle } from "lucide-react";

import AnalysisHeader from "../components/results/AnalysisHeader";
import MedicalIndices from "../components/results/MedicalIndices";
import DiagnosisCard from "../components/results/DiagnosisCard";
import BMDPrediction from "../components/results/BMDPrediction";
import ReportActions from "../components/results/ReportActions";
import XRayImageViewer from "../components/results/XRayImageViewer";

export default function ResultsPage() {
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const analysisId = urlParams.get('id');
      
      if (!analysisId) {
        // Show all analyses if no specific ID
        const analyses = await XRayAnalysis.list('-created_date', 1);
        if (analyses.length > 0) {
          setAnalysis(analyses[0]);
        } else {
          setError("No analysis found");
        }
      } else {
        const analyses = await XRayAnalysis.list('-created_date', 100);
        const foundAnalysis = analyses.find(a => a.id === analysisId);
        if (foundAnalysis) {
          setAnalysis(foundAnalysis);
        } else {
          setError("Analysis not found");
        }
      }
    } catch (error) {
      setError("Failed to load analysis");
      console.error("Error loading analysis:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading analysis results...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "No analysis found"}</p>
          <button 
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="text-blue-600 hover:underline"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <AnalysisHeader analysis={analysis} />
        
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Results - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            <DiagnosisCard analysis={analysis} />
            <MedicalIndices analysis={analysis} />
            <BMDPrediction analysis={analysis} />
          </div>

          {/* Side Panel - 1/3 width */}
          <div className="space-y-6">
            <XRayImageViewer analysis={analysis} />
            <ReportActions analysis={analysis} />
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 text-center text-xs text-slate-500 max-w-2xl mx-auto p-4 bg-slate-100/70 rounded-lg border border-slate-200">
          <div className="flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <strong className="text-slate-700">Disclaimer</strong>
          </div>
          <p className="mt-1">
            This app is intended for research purposes only. Users are strongly advised to consult a qualified doctor before starting any medication.
          </p>
        </div>
        
      </div>
    </div>
  );
}
