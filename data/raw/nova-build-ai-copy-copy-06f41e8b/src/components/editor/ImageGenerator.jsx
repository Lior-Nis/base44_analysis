import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, Sparkles, Plus, Loader2 } from "lucide-react";
import { WebsiteProject } from "@/api/entities";
import { GenerateImage } from "@/api/integrations";

export default function ImageGenerator({ project, updateProject }) {
  const [prompt, setPrompt] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setGeneratedUrl(null);
    try {
      const result = await GenerateImage({ prompt });
      setGeneratedUrl(result.url);
    } catch (e) { console.error(e); }
    setIsGenerating(false);
  };

  const addImageToProject = async () => {
    if (!generatedUrl) return;
    const newImage = { prompt, url: generatedUrl };
    const updatedImages = [...(project.images || []), newImage];
    await WebsiteProject.update(project.id, { images: updatedImages });
    updateProject({ images: updatedImages });
    setGeneratedUrl(null);
    setPrompt("");
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-teal-600" />
          Image Studio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">Generate custom images for your website.</p>
        <div className="space-y-2">
          <Input placeholder="e.g., 'professional roofer fixing a tile roof'" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          <Button onClick={handleGenerate} disabled={isGenerating || !prompt} className="w-full">
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            {isGenerating ? "Generating..." : "Generate Image"}
          </Button>
        </div>
        
        {generatedUrl && (
          <div className="space-y-2 text-center">
            <img src={generatedUrl} alt={prompt} className="rounded-lg max-w-full" />
            <Button onClick={addImageToProject}>
              <Plus className="w-4 h-4 mr-2" />
              Add to Project Assets
            </Button>
          </div>
        )}

        <div className="space-y-2 pt-4">
          <h4 className="font-medium">Project Assets</h4>
          <div className="grid grid-cols-3 gap-2">
            {(project.images || []).map((img, index) => (
              <img key={index} src={img.url} alt={img.prompt} title={img.prompt} className="rounded-md w-full h-auto aspect-square object-cover" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}