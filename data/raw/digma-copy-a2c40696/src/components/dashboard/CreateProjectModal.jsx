
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Figma, Smartphone, Monitor, Globe, Check } from "lucide-react";

const templateOptions = [
  {
    id: "blank",
    name: "Blank Canvas",
    description: "Start from scratch with an empty design",
    icon: FileText,
    preview: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&h=200&fit=crop"
  },
  {
    id: "mobile",
    name: "Mobile App",
    description: "Mobile app design template",
    icon: Smartphone,
    preview: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300&h=200&fit=crop"
  },
  {
    id: "desktop",
    name: "Desktop App",
    description: "Desktop application interface",
    icon: Monitor,
    preview: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop"
  },
  {
    id: "website",
    name: "Website",
    description: "Website design template",
    icon: Globe,
    preview: "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=300&h=200&fit=crop"
  }
];

const colorOptions = [
  { id: 'dark', value: '#0D1117', label: 'Dark' },
  { id: 'light', value: '#F9FAFB', label: 'Light' },
  { id: 'purple', value: '#F3E8FF', label: 'Purple' },
  { id: 'blue', value: '#E0F2FE', label: 'Blue' },
];

export default function CreateProjectModal({ isOpen, onClose, onCreate, teams = [] }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    template: "blank",
    team_id: "",
    background_color: "#0D1117"
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsLoading(true);
    try {
      await onCreate({
        ...formData,
        thumbnail: templateOptions.find(t => t.id === formData.template)?.preview
      });
      setFormData({ name: "", description: "", template: "blank", team_id: "", background_color: "#0D1117" });
    } catch (error) {
      console.error("Error creating project:", error);
    }
    setIsLoading(false);
  };

  const selectedTemplate = templateOptions.find(t => t.id === formData.template);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Create New Design File
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Project Details */}
          <div className="space-y-3 sm:space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                Project Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="My Awesome Design"
                className="mt-1 border-gray-200 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your project..."
                className="mt-1 h-16 sm:h-20 border-gray-200 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {teams.length > 0 && (
              <div>
                <Label htmlFor="team" className="text-sm font-medium text-gray-700">
                  Team (Optional)
                </Label>
                <Select
                  value={formData.team_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, team_id: value }))}
                >
                  <SelectTrigger className="mt-1 border-gray-200 focus:ring-purple-500">
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Personal Project</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Background Color Selection */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Background Color</Label>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {colorOptions.map((color) => (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, background_color: color.value }))}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center transition-all"
                  style={{ 
                    backgroundColor: color.value,
                    borderColor: formData.background_color === color.value ? '#8B5CF6' : '#E5E7EB'
                  }}
                  title={color.label}
                >
                  {formData.background_color === color.value && <Check className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: color.id === 'dark' ? 'white' : 'black' }}/>}
                </button>
              ))}
              <input 
                type="color"
                value={formData.background_color}
                onChange={(e) => setFormData(prev => ({ ...prev, background_color: e.target.value }))}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 bg-transparent p-1"
                style={{ borderColor: colorOptions.some(c => c.value === formData.background_color) ? '#E5E7EB' : '#8B5CF6' }}
              />
            </div>
          </div>

          {/* Template Selection */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-3 sm:mb-4 block">Choose Template</Label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {templateOptions.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, template: template.id }))}
                  className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all text-left group hover:shadow-xl hover:scale-105 ${
                    formData.template === template.id
                      ? 'border-purple-500 bg-purple-50 shadow-lg'
                      : 'border-gray-200 hover:border-purple-300 bg-white'
                  }`}
                >
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg sm:rounded-xl mb-2 sm:mb-3 overflow-hidden">
                    <img 
                      src={template.preview} 
                      alt={template.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                    <template.icon className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 flex-shrink-0" />
                    <span className="font-semibold text-xs sm:text-sm text-gray-900 truncate">{template.name}</span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{template.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 sm:pt-6 border-t border-gray-200">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.name.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 w-full sm:w-auto order-1 sm:order-2"
            >
              {isLoading ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
