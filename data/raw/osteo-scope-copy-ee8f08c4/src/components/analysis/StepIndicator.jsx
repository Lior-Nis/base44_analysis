import React from 'react';
import { CheckCircle, Circle, Clock } from "lucide-react";

export default function StepIndicator({ steps, currentStep }) {
  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.key === currentStep);
  };

  const currentIndex = getCurrentStepIndex();

  return (
    <div className="flex items-center justify-center space-x-2 md:space-x-4 mb-8 overflow-x-auto">
      {steps.map((step, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isUpcoming = index > currentIndex;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors ${
                isCompleted
                  ? 'bg-green-600 text-white'
                  : isCurrent
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : isCurrent ? (
                  <Clock className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </div>
              <span className={`mt-2 text-xs font-medium text-center max-w-20 ${
                isCurrent ? 'text-slate-900' : 'text-slate-500'
              }`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-8 md:w-12 h-0.5 mx-2 transition-colors ${
                index < currentIndex ? 'bg-green-600' : 'bg-slate-200'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}