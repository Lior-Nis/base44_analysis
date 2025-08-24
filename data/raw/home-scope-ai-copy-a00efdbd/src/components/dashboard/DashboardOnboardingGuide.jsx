import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles,
  Zap,
  Phone,
  Calendar,
  User as UserIcon,
  ArrowRight,
  X
} from "lucide-react";

const onboardingSteps = [
  {
    icon: Sparkles,
    title: "Welcome to Your Dashboard!",
    description: "This is your central hub for managing home issues. Let's take a quick tour to see what you can do."
  },
  {
    icon: Zap,
    title: "Quick Actions",
    description: "Use the 'AI Triage' to get instant analysis of a problem, or 'Book Expert' to schedule a video call directly. These are your go-to tools for getting help fast."
  },
  {
    icon: Calendar,
    title: "Your Appointments",
    description: "The 'Appointments' tab is where you can view all your upcoming and past consultations, check their status, and access any reports from your expert."
  },
  {
    icon: UserIcon,
    title: "Manage Your Profile",
    description: "In the 'Profile' tab, you can update your personal information and manage your communication preferences at any time. And that's it! You're all set."
  }
];

export default function DashboardOnboardingGuide({ user, onGuideComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = onboardingSteps.length;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onGuideComplete();
    }
  };

  const handleSkip = () => {
    onGuideComplete();
  };
  
  const CurrentIcon = onboardingSteps[currentStep].icon;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-green-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mr-4 shrink-0">
                    <CurrentIcon className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      {onboardingSteps[currentStep].title}
                    </CardTitle>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleSkip} className="text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </Button>
              </div>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-gray-600 leading-relaxed mb-6 h-20"
                >
                  {onboardingSteps[currentStep].description}
                </motion.p>
              </AnimatePresence>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Step {currentStep + 1} of {totalSteps}
                </div>
                <Button onClick={handleNext} className="bg-green-600 hover:bg-green-700">
                  {currentStep < totalSteps - 1 ? "Next" : "Finish Tour"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-4">
                <motion.div 
                  className="bg-green-500 h-1.5 rounded-full"
                  initial={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                />
              </div>
            </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}