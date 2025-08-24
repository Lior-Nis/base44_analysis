import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusSquare, Plus, Loader2, File } from "lucide-react";
import { WebsiteProject } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";

export default function PageManager({ project, updateProject }) {
  const [pageTitle, setPageTitle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePage = async () => {
    if (!pageTitle) return;
    setIsGenerating(true);
    
    const slug = pageTitle.toLowerCase().replace(/\s+/g, '-');
    const prompt = `Generate the complete HTML body content for a webpage titled "${pageTitle}" for a ${project.business_type.replace(/_/g, ' ')} business named ${project.business_name}. The content should be detailed and professional. Use Tailwind CSS classes for styling. Do not include <html>, <head>, or <body> tags, only the content that would go inside the body.`;

    try {
      const response = await InvokeLLM({ prompt });
      const newPage = { title: pageTitle, slug, html: response };
      const updatedPages = [...(project.pages || []), newPage];
      await WebsiteProject.update(project.id, { pages: updatedPages });
      updateProject({ pages: updatedPages });
      setPageTitle("");
    } catch (e) { console.error(e); }
    setIsGenerating(false);
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusSquare className="w-5 h-5 text-cyan-600" />
          Page Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">Add new pages to your website, like service or location pages.</p>
        <div className="flex gap-2">
          <Input placeholder="e.g., Residential Plumbing Services" value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} />
          <Button onClick={handleGeneratePage} disabled={isGenerating || !pageTitle}>
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </Button>
        </div>

        <div className="space-y-2 pt-4">
          <h4 className="font-medium">Generated Pages</h4>
          <div className="space-y-2">
            {(project.pages || []).map((page, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                <div className="flex items-center gap-2">
                  <File className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{page.title}</span>
                </div>
                <span className="text-xs text-gray-400">/{page.slug}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}