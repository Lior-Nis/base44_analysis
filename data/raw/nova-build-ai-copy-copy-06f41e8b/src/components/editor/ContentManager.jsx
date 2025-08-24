import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Save, Sparkles } from "lucide-react";
import { WebsiteProject } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";

export default function ContentManager({ project, updateProject }) {

  // In a real scenario, we would parse the HTML to extract content.
  // For this version, we'll work with the main business description.
  const [description, setDescription] = React.useState(project.description || "");
  const [isSaving, setIsSaving] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await WebsiteProject.update(project.id, { description });
      updateProject({ description });
    } catch (e) { console.error(e); }
    setIsSaving(false);
  };

  const handleRewrite = async () => {
    setIsGenerating(true);
    try {
      const result = await InvokeLLM({
        prompt: `Rewrite this business description to be more engaging and professional for a website. Keep it around the same length.\n\nOriginal: "${description}"\n\nRewritten:`
      });
      if (typeof result === 'string') {
        setDescription(result);
      }
    } catch (e) { console.error(e); }
    setIsGenerating(false);
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          Content Manager
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Edit the core content of your website. Changes will be used in future regenerations.
        </p>
        <div className="space-y-2">
          <label className="font-medium">Main Business Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={8}
            className="resize-none"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={isSaving || isGenerating}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Description"}
          </Button>
          <Button variant="outline" onClick={handleRewrite} disabled={isSaving || isGenerating}>
            <Sparkles className="w-4 h-4 mr-2" />
            {isGenerating ? "Rewriting..." : "AI Rewrite"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}