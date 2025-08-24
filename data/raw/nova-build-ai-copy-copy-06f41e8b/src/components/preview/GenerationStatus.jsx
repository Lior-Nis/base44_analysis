import React from "react";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function GenerationStatus({ step }) {
  const getStatusIcon = () => {
    if (step.includes("failed")) {
      return <AlertCircle className="w-8 h-8 text-red-500" />;
    }
    if (step === "Complete!") {
      return <CheckCircle className="w-8 h-8 text-green-500" />;
    }
    return <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />;
  };

  const getStatusColor = () => {
    if (step.includes("failed")) return "text-red-600";
    if (step === "Complete!") return "text-green-600";
    return "text-indigo-600";
  };

  return (
    <div className="h-[600px] bg-gradient-to-br from-indigo-50 to-purple-50 rounded-b-lg flex items-center justify-center">
      <div className="text-center">
        <div className="mb-6">
          {getStatusIcon()}
        </div>
        <h3 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
          {step === "Complete!" ? "Website Generated!" : "Generating Your Website"}
        </h3>
        <div className="space-y-3">
          <p className={`text-lg ${getStatusColor()}`}>{step}</p>
          {!step.includes("failed") && step !== "Complete!" && (
            <div className="w-64 mx-auto">
              <div className="bg-white rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full animate-pulse"></div>
              </div>
            </div>
          )}
        </div>
        
        {step !== "Complete!" && !step.includes("failed") && (
          <div className="mt-8 text-sm text-gray-600">
            <p>This may take 30-60 seconds...</p>
            <p>We're creating a professional website just for you!</p>
          </div>
        )}
      </div>
    </div>
  );
}