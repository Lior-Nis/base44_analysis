import React, { useState, useEffect } from "react";
import { WebsiteProject } from "@/api/entities";
import { InvokeLLM, GenerateImage } from "@/api/integrations";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, RefreshCw, Loader2, Menu, X, Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";

import DevicePreview from "../components/editor/DevicePreview";
import GenerationStatus from "../components/preview/GenerationStatus";
import ContentManager from "../components/editor/ContentManager";
import StyleEditor from "../components/editor/StyleEditor";
import ImageGenerator from "../components/editor/ImageGenerator";
import PageManager from "../components/editor/PageManager";
import DownloadManager from "../components/editor/DownloadManager";
import EditorSidebar from "../components/editor/EditorSidebar";

export default function Editor() {
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDownload, setShowDownload] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("content");

  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('project');

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      const projects = await WebsiteProject.filter({ id: projectId });
      if (projects.length > 0) {
        const projectData = projects[0];
        setProject(projectData);
        if (!projectData.generated_html) {
          generateWebsite(projectData);
        }
      }
    } catch (error) {
      console.error("Error loading project:", error);
    }
    setLoading(false);
  };

  const updateProjectState = (updatedData) => {
    setProject(prev => ({ ...prev, ...updatedData }));
  };

  const generateWebsite = async (projectData) => {
    setIsGenerating(true);
    setGenerationStep("Analyzing your business...");

    try {
      const prompt = createGenerationPrompt(projectData);
      setGenerationStep("Generating website content...");
      
      const response = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            html: { type: "string" },
            css: { type: "string" },
            js: { type: "string" }
          }
        }
      });

      setGenerationStep("Finalizing your website...");

      const updatedProject = await WebsiteProject.update(projectData.id, {
        generated_html: response.html,
        generated_css: response.css,
        generated_js: response.js || "",
        generation_prompt: prompt,
        status: "generated"
      });

      setProject(updatedProject);
      setGenerationStep("Complete!");
    } catch (error) {
      console.error("Error generating website:", error);
      setGenerationStep("Generation failed. Please try again.");
    }
    
    setIsGenerating(false);
  };

  const createGenerationPrompt = (projectData) => {
    return `Create a professional, modern website for ${projectData.business_name}, a ${projectData.business_type.replace(/_/g, ' ')} business.

Business Details:
- Name: ${projectData.business_name}
- Type: ${projectData.business_type.replace(/_/g, ' ')}
- Description: ${projectData.description}
- Location: ${projectData.location || 'Local area'}
- Phone: ${projectData.contact_phone || 'Contact for phone'}
- Email: ${projectData.contact_email || 'Contact for email'}
- Template: ${projectData.template_type}

Requirements:
1. Create a complete HTML5 website with semantic structure
2. Use Tailwind CSS for styling (include CDN)
3. Make it fully responsive (mobile-first)
4. Include SEO optimization (meta tags, structured data)
5. Add smooth animations and modern design elements
6. Include these sections: Hero, Services, About, Testimonials, Contact
7. Use professional color scheme appropriate for the business type
8. Add call-to-action buttons throughout
9. Include contact forms and business information
10. Generate clean, production-ready code

Return the response as JSON with three properties:
- html: Complete HTML document
- css: Additional custom CSS (if needed beyond Tailwind)
- js: JavaScript for interactions and animations`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h2>
          <Button onClick={() => navigate(createPageUrl("Home"))}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Modern Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(createPageUrl("Projects"))}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900">{project.business_name}</h1>
              <p className="text-sm text-gray-500 capitalize">{project.business_type.replace(/_/g, ' ')}</p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden hover:bg-gray-100"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => generateWebsite(project)}
              disabled={isGenerating}
              className="hidden sm:flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              Regenerate
            </Button>
            
            <Button
              onClick={() => setShowDownload(true)}
              disabled={!project.generated_html}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <EditorSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          project={project}
          updateProject={updateProjectState}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          {isGenerating ? (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50">
              <GenerationStatus step={generationStep} />
            </div>
          ) : (
            <div className="flex-1">
              <DevicePreview 
                htmlContent={project.generated_html} 
                theme={project.theme}
              />
            </div>
          )}
        </main>
      </div>

      <DownloadManager
        isOpen={showDownload}
        onClose={() => setShowDownload(false)}
        project={project}
      />
    </div>
  );
}