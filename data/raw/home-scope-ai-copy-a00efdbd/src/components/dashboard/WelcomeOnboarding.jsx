import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { 
  CheckCircle, 
  Phone, 
  Zap, 
  Download, 
  Calendar, 
  Settings,
  X,
  Sparkles
} from "lucide-react";

export default function WelcomeOnboarding({ user, onDismiss, onBookingClick, onTriageClick }) {
  const checklistItems = [
    {
      icon: Phone,
      text: "Book a video inspection",
      description: "Connect with UK experts instantly",
      action: "book",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: Zap,
      text: "Submit an issue via AI Triage",
      description: "Get instant analysis of your home problems",
      action: "triage",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: Download,
      text: "Download your Free Home Safety Guide",
      description: "Essential checklist for UK homes",
      action: "download",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: Calendar,
      text: "View upcoming or past bookings",
      description: "Manage all your consultations",
      action: "appointments",
      color: "bg-orange-100 text-orange-600"
    },
    {
      icon: Settings,
      text: "Manage your profile and preferences",
      description: "Customize your HomeScope experience",
      action: "profile",
      color: "bg-gray-100 text-gray-600"
    }
  ];

  const handleAction = (action) => {
    switch (action) {
      case 'book':
        onBookingClick();
        break;
      case 'triage':
        onTriageClick();
        break;
      case 'download':
        window.open('#', '_blank');
        break;
      case 'appointments':
        // Scroll to appointments or change tab
        break;
      case 'profile':
        // Switch to profile tab
        break;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="mb-8"
    >
      <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-blue-50 shadow-lg">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Welcome to HomeScope 👋
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Hi {user?.full_name || 'there'}! Here's what you can do next:
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4">
            {checklistItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="font-semibold text-gray-900">{item.text}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  </div>
                </div>
                <Button
                  onClick={() => handleAction(item.action)}
                  size="sm"
                  variant="outline"
                  className="hover:bg-green-50 hover:border-green-300"
                >
                  Go
                </Button>
              </motion.div>
            ))}
          </div>

          <div className="text-center pt-4 border-t border-gray-200">
            <Button 
              onClick={onDismiss}
              className="bg-green-600 hover:bg-green-700 px-8"
            >
              Get Started with HomeScope
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              You can always access these features from your dashboard
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}