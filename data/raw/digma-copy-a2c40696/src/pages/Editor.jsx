
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import {
  ArrowLeft,
  MousePointer,
  Square,
  Circle,
  Type,
  Image,
  Download,
  Users,
  Share2,
  Play,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Move,
  Pen,
  Frame,
  Minus
} from "lucide-react";

import Canvas from "../components/editor/Canvas";
import LayersPanel from "../components/editor/LayersPanel";
import PropertiesPanel from "../components/editor/PropertiesPanel";
import ToolBar from "../components/editor/ToolBar";
import ComponentsPanel from "../components/editor/ComponentsPanel";
import CollaborationIndicator from "../components/editor/CollaborationIndicator";
import AIChat from "../components/editor/AIChat";

export default function Editor() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [project, setProject] = useState(null);
  const [selectedTool, setSelectedTool] = useState("select");
  const [selectedElements, setSelectedElements] = useState([]);
  const [canvasElements, setCanvasElements] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showLayersPanel, setShowLayersPanel] = useState(true);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(true);
  const [showComponentsPanel, setShowComponentsPanel] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(0);

  useEffect(() => {
    loadProject();
  }, []);

  const loadProject = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const projectId = urlParams.get('projectId');

      if (projectId) {
        const projectData = await base44.entities.Project.list();
        const currentProject = projectData.find(p => p.id === projectId);
        if (currentProject) {
          setProject(currentProject);
          setCanvasElements(currentProject.canvas_data?.elements || []);
          if (currentProject.canvas_data?.zoom) setZoom(currentProject.canvas_data.zoom);
          if (currentProject.canvas_data?.panOffset) setPanOffset(currentProject.canvas_data.panOffset);
        }
      }
    } catch (error) {
      console.error("Error loading project:", error);
    }
  };

  const saveProject = useCallback(async () => {
    if (!project) return;

    try {
      await base44.entities.Project.update(project.id, {
        canvas_data: {
          elements: canvasElements,
          zoom,
          panOffset
        },
        last_accessed: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error saving project:", error);
    }
  }, [project, canvasElements, zoom, panOffset]);

  // Auto-save every 10 seconds
  useEffect(() => {
    const interval = setInterval(saveProject, 10000);
    return () => clearInterval(interval);
  }, [saveProject]);

  const handleProjectUpdate = useCallback(async (updates) => {
    if (!project) return;
    const updatedProject = { ...project, ...updates };
    setProject(updatedProject); // Optimistic update
    await base44.entities.Project.update(project.id, updates);
  }, [project]);

  const addElement = (elementData) => {
    const newElement = {
      id: Date.now().toString(),
      type: elementData.type,
      x: elementData.x || 100,
      y: elementData.y || 100,
      width: elementData.width || 100,
      height: elementData.height || 100,
      ...elementData
    };

    setCanvasElements(prev => {
      const updatedElements = [...prev, newElement];
      if (newElement.type === 'frame') {
        const frameCount = updatedElements.filter(el => el.type === 'frame').length;
        newElement.name = `Frame ${frameCount}`;
      }
      return updatedElements;
    });
    setSelectedElements([newElement.id]);
    addToHistory();
  };

  const updateElement = (elementId, updates) => {
    setCanvasElements(prev =>
      prev.map(el => el.id === elementId ? { ...el, ...updates } : el)
    );
    addToHistory();
  };

  const deleteElements = (elementIds) => {
    setCanvasElements(prev => prev.filter(el => !elementIds.includes(el.id)));
    setSelectedElements([]);
    addToHistory();
  };

  const reorderElements = (fromIndex, toIndex) => {
    const newElements = [...canvasElements];
    const [movedElement] = newElements.splice(fromIndex, 1);
    newElements.splice(toIndex, 0, movedElement);
    setCanvasElements(newElements);
    addToHistory();
  };

  const addToHistory = () => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyStep + 1);
      newHistory.push([...canvasElements]);
      return newHistory.slice(-50);
    });
    setHistoryStep(prev => prev + 1);
  };

  const undo = () => {
    if (historyStep > 0) {
      setHistoryStep(prev => {
        const newStep = prev - 1;
        setCanvasElements(history[newStep]);
        return newStep;
      });
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(prev => {
        const newStep = prev + 1;
        setCanvasElements(history[newStep]);
        return newStep;
      });
    }
  };

  const tools = [
    { id: "select", icon: MousePointer, label: "Select" },
    { id: "hand", icon: Move, label: "Hand" },
    { type: 'divider' },
    { id: "frame", icon: Frame, label: "Frame" },
    { id: "rectangle", icon: Square, label: "Rectangle" },
    { id: "circle", icon: Circle, label: "Ellipse" },
    { id: "line", icon: Minus, label: "Line" },
    { id: "pen", icon: Pen, label: "Pen Tool" },
    { id: "text", icon: Type, label: "Text" },
    { id: "image", icon: Image, label: "Image" },
  ];

  return (
    <div className="h-screen bg-[#0d1117] flex flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="h-12 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(createPageUrl("Dashboard"))}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <h1 className="text-white font-medium">{project?.name || "Untitled"}</h1>
            <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
              Saved
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={historyStep === 0}
            className="p-2 text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={historyStep >= history.length - 1}
            className="p-2 text-gray-400 hover:text-white disabled:opacity-50 transition-colors"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-[#30363d] mx-2" />

          <CollaborationIndicator projectId={project?.id} />

          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Share2 className="w-4 h-4 mr-2 inline" />
            Share
          </button>

          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Play className="w-4 h-4 mr-2 inline" />
            Present
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-12 bg-[#161b22] border-r border-[#30363d] flex flex-col">
          <ToolBar
            tools={tools}
            selectedTool={selectedTool}
            onToolSelect={setSelectedTool}
          />
        </div>

        {/* Layers Panel */}
        {showLayersPanel && (
          <div className="w-60 bg-[#161b22] border-r border-[#30363d] flex flex-col">
            <LayersPanel
              elements={canvasElements}
              selectedElements={selectedElements}
              onSelectionChange={setSelectedElements}
              onElementUpdate={updateElement}
              onElementDelete={deleteElements}
              onElementReorder={reorderElements}
            />
          </div>
        )}

        {/* Components Panel */}
        {showComponentsPanel && (
          <div className="w-60 bg-[#161b22] border-r border-[#30363d]">
            <ComponentsPanel
              projectId={project?.id}
              onAddElement={addElement}
            />
          </div>
        )}

        {/* Main Canvas Area with AI Chat at bottom */}
        <div className="flex-1 flex flex-col bg-[#0d1117] relative">
          {/* Canvas Controls */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-1 text-sm text-gray-300">
              {Math.round(zoom * 100)}%
            </div>
            <button
              onClick={() => setZoom(prev => Math.min(prev * 1.2, 5))}
              className="bg-[#161b22] border border-[#30363d] rounded-lg p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(prev => Math.max(prev / 1.2, 0.1))}
              className="bg-[#161b22] border border-[#30363d] rounded-lg p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          {/* Canvas */}
          <div className="flex-1">
            <Canvas
              ref={canvasRef}
              elements={canvasElements}
              selectedElements={selectedElements}
              selectedTool={selectedTool}
              zoom={zoom}
              panOffset={panOffset}
              onElementsChange={setCanvasElements}
              onSelectionChange={setSelectedElements}
              onAddElement={addElement}
              onUpdateElement={updateElement}
              onZoomChange={setZoom}
              onPanChange={setPanOffset}
              backgroundColor={project?.background_color}
            />
          </div>

          {/* AI Chat Panel at Bottom */}
          <div className="h-80 bg-[#161b22] border-t border-[#30363d]">
            <AIChat
              projectId={project?.id}
              elements={canvasElements}
              selectedElements={selectedElements}
              onAddElement={addElement}
              onUpdateElement={updateElement}
              onElementDelete={deleteElements}
              onElementsChange={setCanvasElements}
              onRevertChanges={(messageId, elementsSnapshot) => {
                setCanvasElements(elementsSnapshot);
                setSelectedElements([]);
              }}
              canvasSnapshot={canvasElements}
            />
          </div>
        </div>

        {/* Properties Panel */}
        {showPropertiesPanel && (
          <div className="w-72 bg-[#161b22] border-l border-[#30363d]">
            <PropertiesPanel
              selectedElements={selectedElements.map(id =>
                canvasElements.find(el => el.id === id)
              ).filter(Boolean)}
              onElementUpdate={updateElement}
              project={project}
              onProjectUpdate={handleProjectUpdate}
            />
          </div>
        )}
      </div>

      {/* Panel Toggle Buttons */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        <button
          onClick={() => setShowLayersPanel(!showLayersPanel)}
          className={`px-3 py-1 rounded text-xs transition-colors ${
            showLayersPanel
              ? 'bg-blue-600 text-white'
              : 'bg-[#161b22] text-gray-400 hover:text-white'
          }`}
        >
          Layers
        </button>
        <button
          onClick={() => setShowComponentsPanel(!showComponentsPanel)}
          className={`px-3 py-1 rounded text-xs transition-colors ${
            showComponentsPanel
              ? 'bg-blue-600 text-white'
              : 'bg-[#161b22] text-gray-400 hover:text-white'
          }`}
        >
          Components
        </button>
        <button
          onClick={() => setShowPropertiesPanel(!showPropertiesPanel)}
          className={`px-3 py-1 rounded text-xs transition-colors ${
            showPropertiesPanel
              ? 'bg-blue-600 text-white'
              : 'bg-[#161b22] text-gray-400 hover:text-white'
          }`}
        >
          Properties
        </button>
      </div>
    </div>
  );
}
