
import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, Plus, X, Sparkles, User, Target, Calendar, Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  { id: 1, title: "About You", icon: User },
  { id: 2, title: "Your Topics", icon: Target },
  { id: 3, title: "Schedule", icon: Calendar },
  { id: 4, title: "Style", icon: Palette },
];

export default function WelcomeWizard({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    field_of_knowledge: "",
    topics: [],
    frequency: "",
    target_audience: "",
    writing_tone: "friendly"
  });
  const [newTopic, setNewTopic] = useState("");

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(formData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addTopic = () => {
    if (newTopic.trim() && !formData.topics.includes(newTopic.trim())) {
      setFormData(prev => ({
        ...prev,
        topics: [...prev.topics, newTopic.trim()]
      }));
      setNewTopic("");
    }
  };

  const removeTopic = (topic) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.filter(t => t !== topic)
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.field_of_knowledge.trim() !== "";
      case 2:
        return formData.topics.length > 0;
      case 3:
        return formData.frequency !== "";
      case 4:
        return formData.target_audience.trim() !== "";
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl glass-card rounded-3xl shadow-3xl border border-white/30 p-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="w-10 h-10 text-orange-500" />
            <h1 className="text-4xl font-bold text-gray-900">Welcome to NewsletterAI</h1>
          </div>
          <p className="text-gray-700 text-lg">Let's set up your AI-powered newsletter in just a few steps</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${
                  currentStep >= step.id 
                    ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg' 
                    : 'bg-white/30 text-gray-500 border border-white/30'
                }`}>
                  <step.icon className="w-6 h-6" />
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-2 transition-all duration-300 ${
                    currentStep > step.id ? 'bg-gradient-to-r from-orange-400 to-orange-500' : 'bg-white/30'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {currentStep === 1 && (
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-gray-900">Tell us about yourself</h3>
                <div className="space-y-2">
                  <label htmlFor="field" className="text-sm font-medium text-gray-700">What's your field of expertise?</label>
                  <input
                    id="field"
                    placeholder="e.g., Technology, Marketing, Finance, Health..."
                    value={formData.field_of_knowledge}
                    onChange={(e) => setFormData(prev => ({ ...prev, field_of_knowledge: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/30 border border-white/30 rounded-2xl backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <h3 className="text-2xl font-semibold text-gray-900">What topics interest you?</h3>
                <div className="space-y-2">
                  <label htmlFor="topics" className="text-sm font-medium text-gray-700">Add topics you want to write about</label>
                  <div className="flex gap-2">
                    <input
                      id="topics"
                      placeholder="e.g., AI trends, SEO tips, Productivity..."
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTopic()}
                      className="flex-1 px-4 py-3 bg-white/30 border border-white/30 rounded-2xl backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                    />
                    <button 
                      onClick={addTopic} 
                      className="px-4 py-3 bg-white/30 border border-white/30 rounded-2xl hover:bg-white/40 transition-all duration-300"
                    >
                      <Plus className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.topics.map((topic) => (
                      <span key={topic} className="bg-white/40 text-gray-800 px-3 py-2 rounded-full text-sm font-medium border border-white/30 flex items-center gap-2">
                        {topic}
                        <button
                          onClick={() => removeTopic(topic)}
                          className="text-gray-600 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-gray-900">How often do you want to send?</h3>
                  <div className="space-y-2">
                    <label htmlFor="frequency" className="text-sm font-medium text-gray-700">Newsletter frequency</label>
                    <Select value={formData.frequency} onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value }))}>
                      <SelectTrigger className="w-full px-4 py-3 bg-white/30 border border-white/30 rounded-2xl backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300">
                        <SelectValue placeholder="Choose frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-gray-900">Final touches</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="audience" className="text-sm font-medium text-gray-700">Who is your target audience?</label>
                      <textarea
                        id="audience"
                        placeholder="e.g., Small business owners, Tech professionals, Students..."
                        value={formData.target_audience}
                        onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/30 border border-white/30 rounded-2xl backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="tone" className="text-sm font-medium text-gray-700">Writing tone</label>
                      <Select value={formData.writing_tone} onValueChange={(value) => setFormData(prev => ({ ...prev, writing_tone: value }))}>
                        <SelectTrigger className="w-full px-4 py-3 bg-white/30 border border-white/30 rounded-2xl backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300">
                          <SelectValue placeholder="Choose tone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="authoritative">Authoritative</SelectItem>
                          <SelectItem value="conversational">Conversational</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between pt-8 mt-8 border-t border-white/30">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 ${
              currentStep === 1 
                ? 'bg-white/20 text-gray-400 cursor-not-allowed' 
                : 'bg-white/30 border border-white/30 text-gray-800 hover:bg-white/40'
            }`}
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`px-8 py-3 rounded-2xl font-medium transition-all duration-300 flex items-center justify-center ${
              canProceed()
                ? 'bg-black text-white hover:bg-gray-800 shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {currentStep === steps.length ? "Get Started" : "Next"}
            <ChevronRight className="w-4 h-4 ml-2 inline" />
          </button>
        </div>
      </div>
    </div>
  );
}
