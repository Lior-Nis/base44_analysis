import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Package } from "lucide-react";

export default function ComponentsPanel({ projectId, onAddElement }) {
  const [components, setComponents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      loadComponents();
    }
  }, [projectId]);

  const loadComponents = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      const data = await base44.entities.Component.filter(
        { project_id: projectId },
        "-created_date"
      );
      setComponents(data);
    } catch (error) {
      console.error("Error loading components:", error);
    }
    setIsLoading(false);
  };

  const filteredComponents = components.filter(component =>
    component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    component.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateComponent = async (selectedElements) => {
    if (!selectedElements.length || !projectId) return;
    
    try {
      const componentData = {
        element_data: selectedElements[0], // For now, use first selected element
        thumbnail: generateThumbnail(selectedElements[0])
      };
      
      const newComponent = await base44.entities.Component.create({
        name: `Component ${components.length + 1}`,
        project_id: projectId,
        ...componentData
      });
      
      setComponents([newComponent, ...components]);
    } catch (error) {
      console.error("Error creating component:", error);
    }
  };

  const generateThumbnail = (element) => {
    // This would generate a thumbnail of the element
    // For now, return a placeholder
    return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop";
  };

  const handleAddComponent = (component) => {
    if (onAddElement) {
      onAddElement({
        ...component.element_data,
        x: 100 + Math.random() * 100, // Add some randomness to position
        y: 100 + Math.random() * 100
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#30363d]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white">Components</h3>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white h-6 px-2"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
          <Input
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-7 bg-[#0d1117] border-[#30363d] text-white text-sm h-8"
          />
        </div>
      </div>

      {/* Components List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4">
            <div className="space-y-3">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-16 bg-[#30363d] rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        ) : filteredComponents.length === 0 ? (
          <div className="p-4 text-center">
            <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <div className="text-sm text-gray-400 mb-1">No components yet</div>
            <div className="text-xs text-gray-500">
              Create reusable design components
            </div>
          </div>
        ) : (
          <div className="p-2">
            {filteredComponents.map((component) => (
              <div
                key={component.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#30363d] cursor-pointer transition-colors group"
                onClick={() => handleAddComponent(component)}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-[#30363d]">
                  {component.thumbnail ? (
                    <img 
                      src={component.thumbnail} 
                      alt={component.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Package className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {component.name}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {component.category || "General"}
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white h-6 px-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddComponent(component);
                  }}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}