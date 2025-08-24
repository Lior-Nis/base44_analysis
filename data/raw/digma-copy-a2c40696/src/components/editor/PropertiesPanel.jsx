
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Bold, 
  Italic, 
  Underline,
  CornerUpLeft,
  Wand2,
  Layers,
  Move3D,
  Palette,
  Image as ImageIcon,
  Plus,
  X
} from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function PropertiesPanel({ selectedElements = [], onElementUpdate, project, onProjectUpdate }) {
  const [gradientStops, setGradientStops] = useState([
    { position: 0, color: '#3b82f6' },
    { position: 100, color: '#8b5cf6' }
  ]);

  if (selectedElements.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-[#30363d]">
          <h3 className="text-sm font-medium text-white">Canvas Properties</h3>
        </div>
        <div className="flex-1 p-4 space-y-6">
            <div>
              <Label className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Background Color</Label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={project?.background_color || "#0D1117"}
                  onChange={(e) => onProjectUpdate({ background_color: e.target.value })}
                  className="w-8 h-8 rounded border border-[#30363d] bg-transparent"
                />
                <Input
                  value={project?.background_color || "#0D1117"}
                  onChange={(e) => onProjectUpdate({ background_color: e.target.value })}
                  className="flex-1 bg-[#0d1117] border-[#30363d] text-white text-sm h-8"
                />
              </div>
            </div>
        </div>
      </div>
    );
  }

  const element = selectedElements[0];
  const isMultipleSelection = selectedElements.length > 1;

  const handlePropertyChange = (property, value) => {
    selectedElements.forEach(el => {
      onElementUpdate(el.id, { [property]: value });
    });
  };

  const handleGradientChange = (type, angle = 0) => {
    const gradient = gradientStops
      .sort((a, b) => a.position - b.position)
      .map(stop => `${stop.color} ${stop.position}%`)
      .join(', ');
    
    const gradientValue = type === 'linear' 
      ? `linear-gradient(${angle}deg, ${gradient})`
      : `radial-gradient(circle, ${gradient})`;
    
    handlePropertyChange('fill', gradientValue);
    handlePropertyChange('fillType', 'gradient');
    handlePropertyChange('gradientType', type);
    handlePropertyChange('gradientAngle', angle);
  };

  const addGradientStop = () => {
    const newStop = {
      position: 50,
      color: '#ffffff'
    };
    setGradientStops([...gradientStops, newStop].sort((a, b) => a.position - b.position));
  };

  const removeGradientStop = (index) => {
    if (gradientStops.length > 2) {
      setGradientStops(gradientStops.filter((_, i) => i !== index));
    }
  };

  const updateGradientStop = (index, property, value) => {
    const updatedStops = [...gradientStops];
    updatedStops[index] = { ...updatedStops[index], [property]: value };
    setGradientStops(updatedStops);
    
    // Update the gradient immediately
    if (element.gradientType) {
      handleGradientChange(element.gradientType, element.gradientAngle || 0);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Upload the file using Base44's file upload integration
      // Assuming base44 is available globally or passed via props/context
      // For demonstration purposes, this part will remain as is based on the original code's assumption.
      // In a real app, 'base44' would need to be defined/imported.
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      handlePropertyChange('fill', `url(${file_url})`);
      handlePropertyChange('fillType', 'image');
      handlePropertyChange('backgroundImage', file_url);
      handlePropertyChange('backgroundSize', 'cover');
      handlePropertyChange('backgroundPosition', 'center');
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#30363d]">
        <h3 className="text-sm font-medium text-white">Properties</h3>
        {isMultipleSelection && (
          <div className="text-xs text-gray-400 mt-1">
            {selectedElements.length} elements selected
            <div className="mt-2 p-2 bg-blue-600/20 rounded text-blue-300">
              Changes will apply to all selected elements
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions for Multiple Selection */}
      {isMultipleSelection && (
        <div className="p-4 border-b border-[#30363d] bg-[#21262d]">
          <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
            Bulk Actions
          </h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePropertyChange('fill', '#3b82f6')}
              className="text-xs"
            >
              Blue Fill
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePropertyChange('fill', '#ef4444')}
              className="text-xs"
            >
              Red Fill
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePropertyChange('opacity', 0.5)}
              className="text-xs"
            >
              50% Opacity
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handlePropertyChange('stroke', '#ffffff')}
              className="text-xs"
            >
              White Stroke
            </Button>
          </div>
        </div>
      )}

      {/* Properties */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Position & Size */}
        <div>
          <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Move3D className="w-3 h-3" />
            Position & Size {isMultipleSelection && "(First Selected)"}
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-300">X</Label>
              <Input
                type="number"
                value={Math.round(element.x)}
                onChange={(e) => handlePropertyChange('x', parseFloat(e.target.value) || 0)}
                className="mt-1 bg-[#0d1117] border-[#30363d] text-white text-sm h-8"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-300">Y</Label>
              <Input
                type="number"
                value={Math.round(element.y)}
                onChange={(e) => handlePropertyChange('y', parseFloat(e.target.value) || 0)}
                className="mt-1 bg-[#0d1117] border-[#30363d] text-white text-sm h-8"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-300">W</Label>
              <Input
                type="number"
                value={Math.round(element.width)}
                onChange={(e) => handlePropertyChange('width', parseFloat(e.target.value) || 0)}
                className="mt-1 bg-[#0d1117] border-[#30363d] text-white text-sm h-8"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-300">H</Label>
              <Input
                type="number"
                value={Math.round(element.height)}
                onChange={(e) => handlePropertyChange('height', parseFloat(e.target.value) || 0)}
                className="mt-1 bg-[#0d1117] border-[#30363d] text-white text-sm h-8"
              />
            </div>
          </div>
        </div>

        {/* Corner Radius */}
        {(element.type === "rectangle" || element.type === "frame") && (
          <div>
            <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <CornerUpLeft className="w-3 h-3" />
              Corner Radius
            </h4>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-gray-300">All Corners</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Slider
                    value={[element.borderRadius || 0]}
                    onValueChange={(value) => {
                      const v = value[0];
                      handlePropertyChange('borderRadius', v);
                      handlePropertyChange('borderRadiusTopLeft', v);
                      handlePropertyChange('borderRadiusTopRight', v);
                      handlePropertyChange('borderRadiusBottomLeft', v);
                      handlePropertyChange('borderRadiusBottomRight', v);
                    }}
                    min={0}
                    max={Math.min(element.width, element.height) / 2}
                    step={1}
                    className="flex-1"
                  />
                  <div className="text-xs text-gray-300 w-8 text-right">
                    {element.borderRadius || 0}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-300">Top Left</Label>
                  <Input
                    type="number"
                    value={element.borderRadiusTopLeft ?? ''}
                    onChange={(e) => handlePropertyChange('borderRadiusTopLeft', parseFloat(e.target.value) || 0)}
                    placeholder={String(element.borderRadius || 0)}
                    className="mt-1 bg-[#0d1117] border-[#30363d] text-white text-sm h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-300">Top Right</Label>
                  <Input
                    type="number"
                    value={element.borderRadiusTopRight ?? ''}
                    onChange={(e) => handlePropertyChange('borderRadiusTopRight', parseFloat(e.target.value) || 0)}
                    placeholder={String(element.borderRadius || 0)}
                    className="mt-1 bg-[#0d1117] border-[#30363d] text-white text-sm h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-300">Bottom Left</Label>
                  <Input
                    type="number"
                    value={element.borderRadiusBottomLeft ?? ''}
                    onChange={(e) => handlePropertyChange('borderRadiusBottomLeft', parseFloat(e.target.value) || 0)}
                    placeholder={String(element.borderRadius || 0)}
                    className="mt-1 bg-[#0d1117] border-[#30363d] text-white text-sm h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-300">Bottom Right</Label>
                  <Input
                    type="number"
                    value={element.borderRadiusBottomRight ?? ''}
                    onChange={(e) => handlePropertyChange('borderRadiusBottomRight', parseFloat(e.target.value) || 0)}
                    placeholder={String(element.borderRadius || 0)}
                    className="mt-1 bg-[#0d1117] border-[#30363d] text-white text-sm h-8"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fill & Stroke */}
        {element.type !== "text" && (
          <div>
            <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Palette className="w-3 h-3" />
              Fill & Stroke
            </h4>
            
            <Tabs defaultValue="solid" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-[#30363d]">
                <TabsTrigger value="solid" className="text-xs">Solid</TabsTrigger>
                <TabsTrigger value="gradient" className="text-xs">Gradient</TabsTrigger>
                <TabsTrigger value="image" className="text-xs">Image</TabsTrigger>
              </TabsList>
              
              <TabsContent value="solid" className="space-y-4 mt-4">
                <div>
                  <Label className="text-xs text-gray-300">Fill Color</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="color"
                      value={element.fillType === 'solid' || !element.fillType ? (element.fill || "#3b82f6") : "#3b82f6"}
                      onChange={(e) => {
                        handlePropertyChange('fill', e.target.value);
                        handlePropertyChange('fillType', 'solid');
                      }}
                      className="w-8 h-8 rounded border border-[#30363d] bg-transparent"
                    />
                    <Input
                      value={element.fillType === 'solid' || !element.fillType ? (element.fill || "#3b82f6") : "#3b82f6"}
                      onChange={(e) => {
                        handlePropertyChange('fill', e.target.value);
                        handlePropertyChange('fillType', 'solid');
                      }}
                      className="flex-1 bg-[#0d1117] border-[#30363d] text-white text-sm h-8"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="gradient" className="space-y-4 mt-4">
                <div>
                  <Label className="text-xs text-gray-300 mb-2 block">Gradient Type</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={element.gradientType === 'linear' ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleGradientChange('linear', element.gradientAngle || 0)}
                      className="flex-1"
                    >
                      Linear
                    </Button>
                    <Button
                      variant={element.gradientType === 'radial' ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleGradientChange('radial')}
                      className="flex-1"
                    >
                      Radial
                    </Button>
                  </div>
                </div>

                {element.gradientType === 'linear' && (
                  <div>
                    <Label className="text-xs text-gray-300">Angle</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Slider
                        value={[element.gradientAngle || 0]}
                        onValueChange={(value) => {
                          handlePropertyChange('gradientAngle', value[0]);
                          handleGradientChange('linear', value[0]);
                        }}
                        min={0}
                        max={360}
                        step={1}
                        className="flex-1"
                      />
                      <div className="text-xs text-gray-300 w-12 text-right">
                        {element.gradientAngle || 0}°
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs text-gray-300">Color Stops</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addGradientStop}
                      className="h-6 px-2"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {gradientStops.map((stop, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="color"
                          value={stop.color}
                          onChange={(e) => updateGradientStop(index, 'color', e.target.value)}
                          className="w-6 h-6 rounded border border-[#30363d] bg-transparent"
                        />
                        <Input
                          type="number"
                          value={stop.position}
                          onChange={(e) => updateGradientStop(index, 'position', parseFloat(e.target.value) || 0)}
                          min={0}
                          max={100}
                          className="flex-1 bg-[#0d1117] border-[#30363d] text-white text-sm h-6"
                        />
                        <span className="text-xs text-gray-400">%</span>
                        {gradientStops.length > 2 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeGradientStop(index)}
                            className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="image" className="space-y-4 mt-4">
                <div>
                  <Label className="text-xs text-gray-300 mb-2 block">Upload Image</Label>
                  <div className="border-2 border-dashed border-[#30363d] rounded-lg p-4 text-center hover:border-[#404040] transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-400">Click to upload image</span>
                      <span className="text-xs text-gray-500">PNG, JPG, SVG</span>
                    </label>
                  </div>
                </div>

                {element.fillType === 'image' && element.backgroundImage && (
                  <div>
                    <Label className="text-xs text-gray-300">Background Size</Label>
                    <Select
                      value={element.backgroundSize || 'cover'}
                      onValueChange={(value) => handlePropertyChange('backgroundSize', value)}
                    >
                      <SelectTrigger className="mt-1 bg-[#0d1117] border-[#30363d] text-white text-sm h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cover">Cover</SelectItem>
                        <SelectItem value="contain">Contain</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="100% 100%">Stretch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="mt-4">
              <Label className="text-xs text-gray-300">Stroke</Label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={element.stroke === "transparent" ? "#000000" : (element.stroke || "#000000")}
                  onChange={(e) => handlePropertyChange('stroke', e.target.value)}
                  className="w-8 h-8 rounded border border-[#30363d] bg-transparent"
                />
                <Input
                  value={element.stroke === "transparent" ? "" : (element.stroke || "")}
                  onChange={(e) => handlePropertyChange('stroke', e.target.value || "transparent")}
                  placeholder="transparent"
                  className="flex-1 bg-[#0d1117] border-[#30363d] text-white text-sm h-8"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs text-gray-300">Stroke Width</Label>
              <div className="flex items-center gap-2 mt-1">
                <Slider
                  value={[element.strokeWidth || 1]}
                  onValueChange={(value) => handlePropertyChange('strokeWidth', value[0])}
                  min={0}
                  max={20}
                  step={1}
                  className="flex-1"
                />
                <div className="text-xs text-gray-300 w-8 text-right">
                  {element.strokeWidth || 1}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Text Properties */}
        {element.type === "text" && (
          <div>
            <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
              Text
            </h4>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-gray-300">Content</Label>
                <Input
                  value={element.text || ""}
                  onChange={(e) => handlePropertyChange('text', e.target.value)}
                  className="mt-1 bg-[#0d1117] border-[#30363d] text-white text-sm"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-300">Font Size</Label>
                  <Input
                    type="number"
                    value={element.fontSize || 16}
                    onChange={(e) => handlePropertyChange('fontSize', parseFloat(e.target.value) || 16)}
                    className="mt-1 bg-[#0d1117] border-[#30363d] text-white text-sm h-8"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-300">Color</Label>
                  <div className="flex items-center gap-1 mt-1">
                    <input
                      type="color"
                      value={element.stroke || "#000000"}
                      onChange={(e) => handlePropertyChange('stroke', e.target.value)}
                      className="w-8 h-8 rounded border border-[#30363d] bg-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs text-gray-300">Font Family</Label>
                <Select
                  value={element.fontFamily || "Inter"}
                  onValueChange={(value) => handlePropertyChange('fontFamily', value)}
                >
                  <SelectTrigger className="mt-1 bg-[#0d1117] border-[#30363d] text-white text-sm h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Helvetica">Helvetica</SelectItem>
                    <SelectItem value="Times">Times New Roman</SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                    <SelectItem value="Verdana">Verdana</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant={element.fontWeight >= 600 ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePropertyChange('fontWeight', element.fontWeight >= 600 ? 400 : 700)}
                  className="w-8 h-8 p-0"
                >
                  <Bold className="w-3 h-3" />
                </Button>
                <Button
                  variant={element.fontStyle === "italic" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePropertyChange('fontStyle', element.fontStyle === "italic" ? "normal" : "italic")}
                  className="w-8 h-8 p-0"
                >
                  <Italic className="w-3 h-3" />
                </Button>
                <Button
                  variant={element.textDecoration === "underline" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePropertyChange('textDecoration', element.textDecoration === "underline" ? "none" : "underline")}
                  className="w-8 h-8 p-0"
                >
                  <Underline className="w-3 h-3" />
                </Button>
              </div>

              <div>
                <Label className="text-xs text-gray-300">Text Align</Label>
                <div className="flex items-center gap-1 mt-2">
                  <Button
                    variant={element.textAlign === "left" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePropertyChange('textAlign', 'left')}
                    className="w-8 h-8 p-0"
                  >
                    <AlignLeft className="w-3 h-3" />
                  </Button>
                  <Button
                    variant={element.textAlign === "center" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePropertyChange('textAlign', 'center')}
                    className="w-8 h-8 p-0"
                  >
                    <AlignCenter className="w-3 h-3" />
                  </Button>
                  <Button
                    variant={element.textAlign === "right" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePropertyChange('textAlign', 'right')}
                    className="w-8 h-8 p-0"
                  >
                    <AlignRight className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transform */}
        <div>
          <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
            Transform
          </h4>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-gray-300">Rotation</Label>
              <div className="flex items-center gap-3 mt-2">
                <Slider
                  value={[element.rotation || 0]}
                  onValueChange={(value) => handlePropertyChange('rotation', value[0])}
                  min={-180}
                  max={180}
                  step={1}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={element.rotation || 0}
                  onChange={(e) => handlePropertyChange('rotation', parseFloat(e.target.value) || 0)}
                  className="w-16 bg-[#0d1117] border-[#30363d] text-white text-sm h-8"
                />
                <div className="text-xs text-gray-300">°</div>
              </div>
            </div>

            <div>
              <Label className="text-xs text-gray-300">Scale</Label>
              <div className="flex items-center gap-3 mt-2">
                <Slider
                  value={[element.scale || 1]}
                  onValueChange={(value) => handlePropertyChange('scale', value[0])}
                  min={0.1}
                  max={3}
                  step={0.1}
                  className="flex-1"
                />
                <div className="text-xs text-gray-300 w-12 text-right">
                  {(element.scale || 1).toFixed(1)}x
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Opacity */}
        <div>
          <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Layers className="w-3 h-3" />
            Opacity
          </h4>
          <div className="flex items-center gap-3">
            <Slider
              value={[(element.opacity !== undefined ? element.opacity : 1) * 100]}
              onValueChange={(value) => handlePropertyChange('opacity', value[0] / 100)}
              min={0}
              max={100}
              step={1}
              className="flex-1"
            />
            <Input
              type="number"
              value={Math.round((element.opacity !== undefined ? element.opacity : 1) * 100)}
              onChange={(e) => handlePropertyChange('opacity', (parseFloat(e.target.value) || 0) / 100)}
              min={0}
              max={100}
              className="w-16 bg-[#0d1117] border-[#30363d] text-white text-sm h-8"
            />
            <div className="text-xs text-gray-300">%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
