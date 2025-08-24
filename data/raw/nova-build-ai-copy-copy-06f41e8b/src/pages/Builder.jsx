import React, { useState } from "react";
import { WebsiteProject } from "@/api/entities";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import BusinessForm from "../components/home/BusinessForm";
import TemplateGallery from "../components/home/TemplateGallery";
import AIModelSelector from "../components/home/AIModelSelector";

export default function Builder() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("single_page");
  const [selectedModel, setSelectedModel] = useState("anthropic/claude-3.5-sonnet");
  const [formData, setFormData] = useState({
    business_name: "",
    business_type: "",
    description: "",
    location: "",
    contact_phone: "",
    contact_email: "",
    website_url: ""
  });

  const handleFormSubmit = async (data) => {
    setIsGenerating(true);
    try {
      const projectData = {
        ...data,
        template_type: selectedTemplate,
        ai_model: selectedModel,
        status: "draft"
      };

      const project = await WebsiteProject.create(projectData);
      navigate(createPageUrl("Editor") + `?project=${project.id}`);
    } catch (error) {
      console.error("Error creating project:", error);
    }
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Header */}
      <section className="py-12 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-8">
            <Button 
              onClick={() => navigate(createPageUrl("Home"))}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white"
          >
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Build Your Website with AI
            </h1>
            <p className="text-xl text-indigo-100 max-w-3xl mx-auto">
              Tell us about your business and our AI will create a complete, professional website tailored just for you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Builder Section */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Form Section */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3"
            >
              <Card className="glass-effect shadow-2xl border-0 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">Tell Us About Your Business</h3>
                  <p className="text-indigo-100">Fill in the details and watch your website come to life</p>
                </div>
                <CardContent className="p-6 space-y-8" id="business-form">
                  <BusinessForm 
                    onSubmit={handleFormSubmit}
                    isGenerating={isGenerating}
                    formData={formData}
                    setFormData={setFormData}
                  />
                  
                  <div className="border-t border-gray-200 pt-8">
                    <TemplateGallery 
                      selectedTemplate={selectedTemplate}
                      setSelectedTemplate={setSelectedTemplate}
                    />
                  </div>
                  
                  <div className="border-t border-gray-200 pt-8">
                    <AIModelSelector 
                      selectedModel={selectedModel}
                      setSelectedModel={setSelectedModel}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Progress Steps */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 space-y-6"
            >
              <Card className="glass-effect shadow-xl border-0">
                <CardContent className="p-6">
                  <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    How It Works
                  </h4>
                  <div className="space-y-6">
                    {[
                      { step: 1, title: "Business Details", desc: "Tell us about your services", active: true },
                      { step: 2, title: "Choose Template", desc: "Select your preferred layout", active: false },
                      { step: 3, title: "AI Generation", desc: "Watch your website build", active: false },
                      { step: 4, title: "Customize & Download", desc: "Perfect your design", active: false }
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          item.active 
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' 
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          <span className="text-sm font-bold">{item.step}</span>
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900">{item.title}</h5>
                          <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-effect shadow-xl border-0 bg-gradient-to-br from-emerald-50 to-teal-50">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Production Ready</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Every website includes professional features that work out of the box.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge className="bg-emerald-100 text-emerald-800">SEO Optimized</Badge>
                    <Badge className="bg-emerald-100 text-emerald-800">Mobile Ready</Badge>
                    <Badge className="bg-emerald-100 text-emerald-800">Fast Loading</Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}