import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Layout, Layers, Check } from "lucide-react";

const templates = [
  {
    id: "single_page",
    name: "Single Page",
    description: "All content on one scrollable page - perfect for most service businesses",
    icon: Layout,
    features: ["Hero Section", "Services", "About", "Contact", "Testimonials"],
    recommended: true
  },
  {
    id: "multi_page",
    name: "Multi Page",
    description: "Separate pages for different sections - ideal for larger businesses",
    icon: Layers,
    features: ["Homepage", "About Page", "Services Page", "Contact Page", "Blog Ready"],
    recommended: false
  }
];

export default function TemplateGallery({ selectedTemplate, setSelectedTemplate }) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-lg font-semibold text-gray-900">Choose Template Style</Label>
        <p className="text-sm text-gray-600 mt-1">Select the structure that works best for your business</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        {templates.map((template) => (
          <Card
            key={template.id}
            className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
              selectedTemplate === template.id
                ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedTemplate === template.id
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <template.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      {template.name}
                      {template.recommended && (
                        <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                          Recommended
                        </Badge>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                  </div>
                </div>
                {selectedTemplate === template.id && (
                  <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Includes:
                </p>
                <div className="flex flex-wrap gap-2">
                  {template.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}