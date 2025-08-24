import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brush, Save, Sparkles } from "lucide-react";
import { WebsiteProject } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";

export default function StyleEditor({ project, updateProject }) {
  const [theme, setTheme] = useState(project.theme || {
    primary_color: "#3b82f6",
    secondary_color: "#6366f1",
    font_family: "Inter, sans-serif"
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field, value) => {
    setTheme(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await WebsiteProject.update(project.id, { theme });
    updateProject({ theme });
    setIsSaving(false);
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brush className="w-5 h-5 text-purple-600" />
          Style Editor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-gray-600">
          Customize your website's colors and fonts. The preview will update in real-time.
        </p>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Primary Color</Label>
            <Input type="color" value={theme.primary_color} onChange={(e) => { handleInputChange('primary_color', e.target.value); updateProject({ theme: { ...theme, primary_color: e.target.value } }); }} />
          </div>
          <div className="space-y-2">
            <Label>Secondary Color</Label>
            <Input type="color" value={theme.secondary_color} onChange={(e) => { handleInputChange('secondary_color', e.target.value); updateProject({ theme: { ...theme, secondary_color: e.target.value } }); }} />
          </div>
          <div className="space-y-2">
            <Label>Font Family</Label>
            <Select value={theme.font_family} onValueChange={(val) => { handleInputChange('font_family', val); updateProject({ theme: { ...theme, font_family: val } }); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter, sans-serif">Inter (Modern)</SelectItem>
                <SelectItem value="Roboto, sans-serif">Roboto (Classic)</SelectItem>
                <SelectItem value="Lato, sans-serif">Lato (Friendly)</SelectItem>
                <SelectItem value="Georgia, serif">Georgia (Elegant)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Saving..." : "Save Style"}
        </Button>
      </CardContent>
    </Card>
  );
}