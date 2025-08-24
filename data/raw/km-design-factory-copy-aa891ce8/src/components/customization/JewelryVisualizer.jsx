
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Eye, Download, RefreshCw, Sparkles, Image as ImageIcon, Info } from "lucide-react";
import { GenerateImage } from "@/api/integrations";

export default function JewelryVisualizer({ design, uploadedImage, description, onDescriptionChange }) {
  const [generatedImage, setGeneratedImage] = useState(null);
  const [generating, setGenerating] = useState(false);

  const generateVisualization = async () => {
    if (!description.trim()) {
      alert('Please enter a description for the jewelry visualization');
      return;
    }

    setGenerating(true);
    try {
      // Create enhanced prompt that can incorporate the uploaded image context
      let prompt = description.trim();
      
      // Add context about uploaded image if available
      if (uploadedImage) {
        prompt += ". Incorporate elements from the uploaded reference image/logo provided by the customer";
      }
      
      // Add jewelry photography enhancement
      prompt += ". Ultra-realistic luxury jewelry product photography, photographed on luxurious black velvet background with professional studio lighting, macro lens detail showing surface textures and reflections, high-end jewelry catalog style, dramatic shadows and highlights, 8K ultra-high resolution, commercial product photography perfection";
      
      console.log('Generated prompt:', prompt);
      
      const result = await GenerateImage({ 
        prompt: prompt,
        ...(uploadedImage && { file_urls: [uploadedImage] })
      });
      
      setGeneratedImage(result.url);
    } catch (error) {
      console.error('Error generating visualization:', error);
      alert('Failed to generate visualization. Please try again.');
    }
    setGenerating(false);
  };

  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `${design.design_name || 'jewelry-design'}-visualization.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card className="bg-white border-yellow-500/30 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white border-b border-yellow-500/30">
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-purple-300" />
          Special Instructions & AI Visualization
          <Badge className="bg-purple-500/20 text-purple-200 font-bold">Optional Reference</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6 bg-white">
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
                <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                    <h4 className="font-semibold text-blue-900">One Box, Two Purposes</h4>
                    <p className="text-blue-800 text-sm leading-relaxed mt-1">
                        The description you enter below serves as your <strong>final special instructions</strong> for our jewelers and will be saved with your order. You can also use this same description to generate an optional AI-powered visualization to help guide the design process.
                    </p>
                </div>
            </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="image-description" className="text-black font-semibold">
              Detailed Jewelry Description & Special Instructions
            </Label>
            <Textarea
              id="image-description"
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="e.g., A delicate rose gold necklace with a small heart pendant featuring a brilliant moissanite stone, with subtle engraved details around the heart border..."
              className="border-gray-300 focus:border-purple-500 min-h-[140px] mt-2"
              rows={6}
            />
          </div>
          {uploadedImage && (
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2 justify-center">
                <ImageIcon className="w-4 h-4 text-gray-600" />
                <p className="text-gray-800 text-sm font-medium">
                  Your uploaded image will be referenced in the visualization.
                </p>
              </div>
            </div>
          )}
        </div>

        <Button 
          onClick={generateVisualization}
          disabled={generating || !description.trim()}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 text-lg shadow-lg"
        >
          {generating ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              Creating Visualization...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Click to see AI visualization
            </>
          )}
        </Button>

        {generatedImage && (
          <div className="space-y-4">
            <div className="aspect-square rounded-xl overflow-hidden border-2 border-yellow-500/30 shadow-xl">
              <img 
                src={generatedImage} 
                alt="AI Generated Jewelry Visualization"
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={downloadImage}
                variant="outline"
                className="flex-1 border-purple-500 text-purple-600 hover:bg-purple-50"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Reference
              </Button>
              
              <Button
                onClick={generateVisualization}
                variant="outline"
                className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50"
                disabled={generating}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Eye className="w-4 h-4 text-white" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-purple-900">Artisan Reference Ready</h4>
                  <p className="text-purple-700 text-sm leading-relaxed">
                    This visualization incorporates your description{uploadedImage ? ' and uploaded image' : ''} and will be provided to our 
                    master jewelers as a reference for crafting your custom piece. The more detailed 
                    your description, the more accurate the reference image will be.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {generating && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" />
              <div className="space-y-1">
                <p className="font-medium text-gray-900">Creating Your Visualization</p>
                <p className="text-gray-600 text-sm">
                  Generating detailed reference image from your description{uploadedImage ? ' and uploaded image' : ''}...
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
