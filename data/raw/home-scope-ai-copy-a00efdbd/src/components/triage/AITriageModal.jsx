
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, MessageSquare, Zap, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { InvokeLLM, UploadFile } from "@/api/integrations";
import { Appointment } from "@/api/entities";
import { User as UserEntity } from "@/api/entities";

const issueTypes = [
  { value: "leaks_water_damage", label: "Leaks & Water Damage", urgency: "high" },
  { value: "damp_mould", label: "Damp & Mould", urgency: "medium" },
  { value: "heating_hot_water", label: "Heating & No Hot Water", urgency: "high" },
  { value: "electrical", label: "Electrical Concerns", urgency: "high" },
  { value: "gas_boiler", label: "Gas & Boiler Checks", urgency: "high" },
  { value: "broken_fixtures", label: "Broken Fixtures", urgency: "low" },
  { value: "safety_hazards", label: "Home Safety Hazards", urgency: "high" },
  { value: "general", label: "General Property Concerns", urgency: "medium" }
];

export default function AITriageModal({ isOpen, onClose, onBookingRequested, user }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    issueType: "",
    description: "",
    photos: [],
    email: ""
  });
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploadingPhotos(true);
    try {
      const uploadPromises = files.map(file => UploadFile({ file }));
      const results = await Promise.all(uploadPromises);
      const photoUrls = results.map(result => result.file_url);
      
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...photoUrls]
      }));
    } catch (error) {
      console.error("Error uploading photos:", error);
      alert("Error uploading photos. Please try again.");
    }
    setUploadingPhotos(false);
  };

  const analyzeIssue = async () => {
    if (!formData.issueType || !formData.description) {
      alert("Please select an issue type and provide a description");
      return;
    }

    setIsAnalyzing(true);

    try {
      const issueInfo = issueTypes.find(t => t.value === formData.issueType);
      
      const prompt = `
        You are a UK home expert AI assistant. Analyze this home issue and provide recommendations:
        
        Issue Type: ${issueInfo?.label}
        Description: ${formData.description}
        
        Please provide:
        1. Immediate safety assessment (safe/caution/urgent)
        2. Likely cause analysis
        3. Immediate steps the user can take
        4. Whether this needs professional help (yes/no)
        5. Estimated urgency level (low/medium/high/emergency)
        6. Brief explanation of UK housing regulations if relevant
        
        Be helpful, clear, and focused on UK housing standards.
      `;

      const result = await InvokeLLM({
        prompt,
        file_urls: formData.photos.length > 0 ? formData.photos : null,
        response_json_schema: {
          type: "object",
          properties: {
            safety_level: { type: "string", enum: ["safe", "caution", "urgent"] },
            likely_cause: { type: "string" },
            immediate_steps: { type: "array", items: { type: "string" } },
            needs_professional: { type: "boolean" },
            urgency_level: { type: "string", enum: ["low", "medium", "high", "emergency"] },
            uk_regulations_note: { type: "string" },
            recommendation_summary: { type: "string" }
          }
        }
      });

      setAnalysis(result);
      setStep(2);

      // Mark that the user has used their AI triage demo (if logged in)
      try {
        // Only update if user is logged in and hasn't used it yet (to avoid unnecessary calls)
        if (user && !user.has_used_ai_triage) {
          await UserEntity.updateMyUserData({ has_used_ai_triage: true });
        }
      } catch (error) {
        // User not logged in, or error fetching/updating user data, that's fine for this non-critical path
        console.warn("Could not update user AI triage status, user might not be logged in or error:", error);
      }

    } catch (error) {
      console.error("Error analyzing issue:", error);
      alert("Error analyzing your issue. Please try again.");
    }

    setIsAnalyzing(false);
  };

  const handleBookNow = () => {
    onBookingRequested({
      issueType: formData.issueType,
      description: formData.description,
      urgency: analysis?.urgency_level || "medium",
      photos: formData.photos,
      email: formData.email // Pass email for waiting list
    });
    onClose();
  };

  const getSafetyColor = (level) => {
    switch (level) {
      case 'safe': return 'bg-green-100 text-green-800';
      case 'caution': return 'bg-yellow-100 text-yellow-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSafetyIcon = (level) => {
    switch (level) {
      case 'safe': return CheckCircle;
      case 'caution': return Clock;
      case 'urgent': return AlertTriangle;
      default: return MessageSquare;
    }
  };

  if (user && user.has_used_ai_triage) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-green-600 flex items-center justify-center">
              <Zap className="w-6 h-6 mr-2" />
              Triage Demo
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">You've already used your free demo!</h3>
            <p className="text-gray-600 mb-6">
              Thanks for trying out our Triage. This feature will be fully available at launch. Join our waiting list to be notified!
            </p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={onBookingRequested}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Join Waiting List
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-600 flex items-center">
            <Zap className="w-6 h-6 mr-2" />
            Home Issue Triage
          </DialogTitle>
          <p className="text-gray-600">
            Get instant insights about your home issue and expert recommendations
          </p>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <Label htmlFor="issue-type-select">What type of issue are you experiencing? *</Label>
              <Select value={formData.issueType} onValueChange={(value) => handleInputChange('issueType', value)}>
                <SelectTrigger id="issue-type-select">
                  <SelectValue placeholder="Select issue type" />
                </SelectTrigger>
                <SelectContent>
                  {issueTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description-textarea">Describe your issue in detail *</Label>
              <Textarea
                id="description-textarea"
                placeholder="Please describe what you're experiencing... When did it start? Where is it located? Any recent changes?"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="h-32"
              />
            </div>

            <div>
              <Label>Upload photos (optional but helpful)</Label>
              <div className="mt-2">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition-colors"
                >
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">
                      {uploadingPhotos ? "Uploading..." : "Click to upload photos"}
                    </p>
                  </div>
                </label>
                {formData.photos.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-green-600">
                      {formData.photos.length} photo(s) uploaded successfully
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email-input">Your email (for follow-up)</Label>
              <Input
                id="email-input"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your@email.com"
              />
            </div>

            <Button 
              onClick={analyzeIssue}
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={!formData.issueType || !formData.description || isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <MessageSquare className="w-4 h-4 mr-2 animate-pulse" />
                  Analyzing Your Issue...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Get Analysis
                </>
              )}
            </Button>
          </div>
        )}

        {step === 2 && analysis && (
          <div className="space-y-6">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
                  Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Badge className={getSafetyColor(analysis.safety_level)}>
                    {React.createElement(getSafetyIcon(analysis.safety_level), { className: "w-4 h-4 mr-1" })}
                    Safety Level: {analysis.safety_level.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">
                    Urgency: {analysis.urgency_level.toUpperCase()}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Likely Cause:</h4>
                  <p className="text-gray-700">{analysis.likely_cause}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Immediate Steps You Can Take:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {analysis.immediate_steps?.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                </div>

                {analysis.uk_regulations_note && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-blue-800">UK Housing Standards:</h4>
                    <p className="text-blue-700 text-sm">{analysis.uk_regulations_note}</p>
                  </div>
                )}

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-green-800">Our Recommendation:</h4>
                  <p className="text-green-700">{analysis.recommendation_summary}</p>
                </div>
              </CardContent>
            </Card>

            {analysis.needs_professional && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                      Professional Help Recommended
                    </h3>
                    <p className="text-yellow-700 mb-4">
                      Based on your issue, we recommend speaking with one of our licensed experts for proper guidance.
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <p className="text-blue-800 font-medium text-sm">
                        🚀 HomeScope is launching soon! Join our waiting list to be first in line for expert consultations.
                      </p>
                    </div>
                    <div className="flex gap-3 justify-center">
                      <Button 
                        onClick={handleBookNow}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Join Waiting List for Expert Access
                      </Button>
                      <Button variant="outline" onClick={onClose}>
                        I'll Handle This Myself
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {!analysis.needs_professional && (
              <div className="text-center space-y-4">
                <p className="text-gray-600">
                  Good news! This seems like something you might be able to handle yourself with the steps above.
                </p>
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="text-blue-800 font-medium text-sm">
                    🚀 Want expert advice anyway? Join our waiting list for upcoming launch access!
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button onClick={onClose} variant="outline">
                    Thanks, I'm Good!
                  </Button>
                  <Button 
                    onClick={handleBookNow}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Join Waiting List Anyway
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
