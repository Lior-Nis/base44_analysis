
import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";

const Canvas = forwardRef(({
  elements = [],
  selectedElements = [],
  selectedTool,
  zoom = 1,
  panOffset = { x: 0, y: 0 },
  onElementsChange,
  onSelectionChange,
  onAddElement,
  onUpdateElement,
  onZoomChange,
  onPanChange,
  backgroundColor
}, ref) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [isPanning, setIsPanning] = useState(false);
  const [drawingElement, setDrawingElement] = useState(null);
  const [isDraggingElement, setIsDraggingElement] = useState(false);
  const [draggedElement, setDraggedElement] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [penPath, setPenPath] = useState(null);
  const [previewPoint, setPreviewPoint] = useState(null);

  const getMousePosition = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - panOffset.x) / zoom,
      y: (e.clientY - rect.top - panOffset.y) / zoom
    };
  }, [zoom, panOffset]);

  const finishPenDrawing = useCallback(() => {
    if (!penPath || penPath.points.length < 2) {
      setPenPath(null);
      setPreviewPoint(null);
      return;
    }

    const xs = penPath.points.map(p => p.x);
    const ys = penPath.points.map(p => p.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);

    const finalElement = {
      ...penPath,
      id: Date.now().toString(),
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      points: penPath.points.map(p => ({ x: p.x - minX, y: p.y - minY })),
    };

    onAddElement(finalElement);
    setPenPath(null);
    setPreviewPoint(null);
  }, [penPath, onAddElement]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && penPath) {
        finishPenDrawing();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [penPath, finishPenDrawing]);

  useEffect(() => {
    if (selectedTool !== 'pen' && penPath) {
      finishPenDrawing();
    }
  }, [selectedTool, penPath, finishPenDrawing]);


  const getElementAtPosition = useCallback((pos) => {
    // Check elements in reverse order (top to bottom)
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      // For pen and line, check based on bounding box for selection
      // More advanced hit testing for lines/paths might be needed for precise selection
      if (element.visible !== false && 
          pos.x >= element.x && pos.x <= element.x + element.width &&
          pos.y >= element.y && pos.y <= element.y + element.height) {
        return element;
      }
    }
    return null;
  }, [elements]);

  const handleMouseDown = useCallback((e) => {
    const pos = getMousePosition(e);
    
    if (selectedTool === 'pen') {
      if (penPath) {
        setPenPath(prev => ({
          ...prev,
          points: [...prev.points, pos]
        }));
      } else {
        setPenPath({
          type: 'pen',
          points: [pos],
          stroke: '#FFFFFF',
          strokeWidth: 2,
          fill: 'transparent',
          opacity: 1,
          rotation: 0,
          scale: 1,
        });
      }
      return;
    }

    setDragStart(pos);

    if (selectedTool === "hand" || e.button === 1) {
      setIsPanning(true);
      return;
    }

    if (selectedTool === "select") {
      const clickedElement = getElementAtPosition(pos);
      
      if (clickedElement) {
        // If element is locked, don't allow dragging
        if (clickedElement.locked) {
          onSelectionChange([clickedElement.id]);
          return;
        }

        // Select the element if not already selected
        if (!selectedElements.includes(clickedElement.id)) {
          onSelectionChange([clickedElement.id]);
        }

        // Start dragging the element
        setIsDraggingElement(true);
        setDraggedElement(clickedElement);
        setDragOffset({
          x: pos.x - clickedElement.x,
          y: pos.y - clickedElement.y
        });
        return;
      } else {
        onSelectionChange([]);
      }
      return;
    }

    // Start drawing a new element
    if (["rectangle", "circle", "text", "frame", "line"].includes(selectedTool)) {
      setIsDrawing(true);
      const newElement = {
        type: selectedTool,
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        fill: (selectedTool === "text" || selectedTool === "frame" || selectedTool === "line") ? "transparent" : "#3b82f6",
        fillType: 'solid', // default fill type
        stroke: (selectedTool === "text" || selectedTool === "line") ? "#FFFFFF" : selectedTool === 'frame' ? '#555555' : "transparent",
        strokeWidth: (selectedTool === "line") ? 2 : 1,
        text: selectedTool === "text" ? "Type here..." : undefined,
        opacity: 1,
        rotation: 0,
        scale: 1,
        x1: (selectedTool === "line") ? pos.x : undefined,
        y1: (selectedTool === "line") ? pos.y : undefined,
        x2: (selectedTool === "line") ? pos.x : undefined,
        y2: (selectedTool === "line") ? pos.y : undefined,
      };
      setDrawingElement(newElement);
    }
  }, [selectedTool, elements, selectedElements, getMousePosition, getElementAtPosition, onSelectionChange, penPath]);

  const handleMouseMove = useCallback((e) => {
    const pos = getMousePosition(e);

    if (penPath) {
      setPreviewPoint(pos);
      return;
    }

    if (isPanning && dragStart) {
      const deltaX = (pos.x - dragStart.x) * zoom;
      const deltaY = (pos.y - dragStart.y) * zoom;
      onPanChange({
        x: panOffset.x + deltaX,
        y: panOffset.y + deltaY
      });
      return;
    }

    if (isDraggingElement && draggedElement && dragStart) {
      // Update the element position
      const newX = pos.x - dragOffset.x;
      const newY = pos.y - dragOffset.y;
      
      onUpdateElement(draggedElement.id, {
        x: newX,
        y: newY
      });
      return;
    }

    if (isDrawing && drawingElement && dragStart) {
      if (drawingElement.type === 'line') {
        const xMin = Math.min(dragStart.x, pos.x);
        const yMin = Math.min(dragStart.y, pos.y);
        const width = Math.abs(pos.x - dragStart.x);
        const height = Math.abs(pos.y - dragStart.y);

        setDrawingElement({
          ...drawingElement,
          x: xMin,
          y: yMin,
          width: width,
          height: height,
          x1: dragStart.x,
          y1: dragStart.y,
          x2: pos.x,
          y2: pos.y,
        });
      } else {
        const width = pos.x - dragStart.x;
        const height = pos.y - dragStart.y;
        
        setDrawingElement({
          ...drawingElement,
          width: Math.abs(width),
          height: Math.abs(height),
          x: width < 0 ? pos.x : dragStart.x,
          y: height < 0 ? pos.y : dragStart.y
        });
      }
    }
  }, [isPanning, isDraggingElement, isDrawing, drawingElement, draggedElement, dragStart, dragOffset, getMousePosition, zoom, panOffset, onPanChange, onUpdateElement, penPath]);

  const handleMouseUp = useCallback(() => {
    if (penPath) {
      // Don't do anything on mouse up for pen tool, it's click-based
      return;
    }

    if (isPanning) {
      setIsPanning(false);
    }

    if (isDraggingElement) {
      setIsDraggingElement(false);
      setDraggedElement(null);
      setDragOffset({ x: 0, y: 0 });
    }

    if (isDrawing && drawingElement) {
      if (drawingElement.width > 5 || drawingElement.height > 5) {
        onAddElement(drawingElement);
      }
      setIsDrawing(false);
      setDrawingElement(null);
    }

    setDragStart(null);
  }, [isPanning, isDraggingElement, isDrawing, drawingElement, onAddElement, penPath]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5, zoom * delta));
    onZoomChange(newZoom);
  }, [zoom, onZoomChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      return () => canvas.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  const getBorderRadius = (element) => {
    if (element.borderRadiusTopLeft || element.borderRadiusTopRight || element.borderRadiusBottomLeft || element.borderRadiusBottomRight) {
      return `${element.borderRadiusTopLeft || 0}px ${element.borderRadiusTopRight || 0}px ${element.borderRadiusBottomRight || 0}px ${element.borderRadiusBottomLeft || 0}px`;
    }
    return element.borderRadius ? `${element.borderRadius}px` : '0px';
  };

  const getCursor = () => {
    if (selectedTool === "hand" || isPanning) return "grab";
    if (isDraggingElement) return "grabbing";
    if (selectedTool === "select") return "default";
    if (selectedTool === 'pen') return "crosshair";
    return "crosshair";
  };

  const renderElement = (element) => {
    const isSelected = selectedElements.includes(element.id);
    const isBeingDragged = isDraggingElement && draggedElement?.id === element.id;
    
    const baseTransform = `translate(${element.x * zoom + panOffset.x}px, ${element.y * zoom + panOffset.y}px)`;
    const scaleTransform = element.scale && element.scale !== 1 ? ` scale(${element.scale})` : '';
    const rotateTransform = element.rotation && element.rotation !== 0 ? ` rotate(${element.rotation}deg)` : '';
    const zoomTransform = ` scale(${zoom})`;
    
    const transform = `${baseTransform}${scaleTransform}${rotateTransform}${zoomTransform}`;
    
    const style = {
      transform,
      transformOrigin: '0 0',
      opacity: element.opacity !== undefined ? element.opacity : 1,
      mixBlendMode: element.mixBlendMode || 'normal',
      cursor: selectedTool === "select" && !element.locked ? "move" : "default",
      userSelect: "none",
      pointerEvents: element.visible === false ? "none" : "auto"
    };

    // Handle different fill types
    const getFillStyle = (element) => {
      if (element.fillType === 'gradient') {
        return { background: element.fill };
      } else if (element.fillType === 'image' && element.backgroundImage) {
        return { 
          backgroundImage: `url(${element.backgroundImage})`,
          backgroundSize: element.backgroundSize || 'cover',
          backgroundPosition: element.backgroundPosition || 'center',
          backgroundRepeat: 'no-repeat'
        };
      } else {
        return { backgroundColor: element.fill };
      }
    };

    const commonProps = {
      key: element.id,
      className: `absolute select-none ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''
      } ${
        isBeingDragged ? 'z-50' : ''
      } ${
        element.locked ? 'cursor-not-allowed' : ''
      }`,
      style
    };

    switch (element.type) {
      case "rectangle":
      case "frame":
        return (
          <div
            {...commonProps}
            style={{
              ...style,
              width: element.width,
              height: element.height,
              ...getFillStyle(element),
              border: element.stroke !== "transparent" ? `${element.strokeWidth || 1}px solid ${element.stroke}` : "none",
              borderRadius: getBorderRadius(element),
              boxShadow: element.boxShadow || 'none'
            }}
          >
            {element.type === 'frame' && (
              <div 
                className="absolute -top-5 left-0 text-xs text-gray-300 bg-[#161b22] px-1.5 py-0.5 pointer-events-none"
                style={{
                  transform: `scale(${1 / zoom})`,
                  transformOrigin: 'top left',
                  whiteSpace: 'nowrap'
                }}
              >
                {element.name || "Frame"}
              </div>
            )}
          </div>
        );
      
      case "circle":
        return (
          <div
            {...commonProps}
            style={{
              ...style,
              width: element.width,
              height: element.height,
              ...getFillStyle(element),
              border: element.stroke !== "transparent" ? `${element.strokeWidth || 1}px solid ${element.stroke}` : "none",
              borderRadius: element.type === "circle" ? "50%" : getBorderRadius(element),
              boxShadow: element.boxShadow || 'none'
            }}
          />
        );
      
      case "text":
        return (
          <div
            {...commonProps}
            style={{
              ...style,
              minWidth: element.width || 100,
              minHeight: element.height || 20,
              color: element.stroke || "#000000",
              fontSize: `${(element.fontSize || 16)}px`,
              fontFamily: element.fontFamily || "Inter, sans-serif",
              fontWeight: element.fontWeight || "400",
              fontStyle: element.fontStyle || "normal",
              textDecoration: element.textDecoration || "none",
              lineHeight: element.lineHeight || 1.2,
              letterSpacing: element.letterSpacing ? `${element.letterSpacing}px` : 'normal',
              textAlign: element.textAlign || 'left',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflow: 'hidden'
            }}
          >
            {element.text || "Type here..."}
          </div>
        );
      
      case "line": {
        // Calculate relative coordinates for SVG line based on element's bounding box
        const x1_rel = element.x1 - element.x;
        const y1_rel = element.y1 - element.y;
        const x2_rel = element.x2 - element.x;
        const y2_rel = element.y2 - element.y;

        return (
          <div
            {...commonProps}
            style={{
              ...style,
              width: element.width,
              height: element.height,
            }}
          >
            <svg
              width={element.width || 1}
              height={element.height || 1}
              className="overflow-visible absolute top-0 left-0"
              style={{ pointerEvents: 'stroke', cursor: selectedTool === "select" && !element.locked ? "move" : "default" }}
            >
              <line
                x1={x1_rel}
                y1={y1_rel}
                x2={x2_rel}
                y2={y2_rel}
                stroke={element.stroke || '#FFFFFF'}
                strokeWidth={(element.strokeWidth || 2)} 
                strokeLinecap="round" 
              />
            </svg>
          </div>
        );
      }
      
      case "pen": {
        const pathData = element.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

        return (
           <div {...commonProps}>
            <svg
              width={element.width || 1}
              height={element.height || 1}
              className="overflow-visible"
              style={{ pointerEvents: 'stroke' }}
            >
              <path
                d={pathData}
                fill="none"
                stroke={element.stroke}
                strokeWidth={element.strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
           </div>
        );
      }
      
      default:
        return null;
    }
  };

  const renderPenPreview = () => {
    if (!penPath || !previewPoint) return null;
    const lastPoint = penPath.points[penPath.points.length - 1];
    
    // Draw existing path
    const pathData = penPath.points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x * zoom + panOffset.x} ${p.y * zoom + panOffset.y}`).join(' ');

    // Draw preview line
    const previewLineData = `M ${lastPoint.x * zoom + panOffset.y} ${lastPoint.y * zoom + panOffset.y} L ${previewPoint.x * zoom + panOffset.x} ${previewPoint.y * zoom + panOffset.y}`;
    
    return (
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <path
          d={pathData}
          fill="none"
          stroke={penPath.stroke || '#FFFFFF'}
          strokeWidth={penPath.strokeWidth || 2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={previewLineData}
          fill="none"
          stroke={penPath.stroke || '#FFFFFF'}
          strokeWidth={(penPath.strokeWidth || 2) * 0.8}
          strokeDasharray="4 4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return (
    <div
      ref={canvasRef}
      className="w-full h-full relative overflow-hidden"
      style={{ cursor: getCursor(), backgroundColor: backgroundColor || '#0D1117' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
          backgroundPosition: `${panOffset.x % (20 * zoom)}px ${panOffset.y % (20 * zoom)}px`
        }}
      />

      {/* Canvas Elements */}
      {elements.map(renderElement)}

      {/* Pen Tool Preview */}
      {renderPenPreview()}

      {/* Drawing Preview */}
      {drawingElement && renderElement({ ...drawingElement, id: 'preview' })}

      {/* Center Marker */}
      <div
        className="absolute w-px h-px bg-red-500 opacity-50 pointer-events-none"
        style={{
          left: panOffset.x,
          top: panOffset.y,
          transform: 'translate(-0.5px, -0.5px)'
        }}
      />

      {/* Selection Info */}
      {selectedElements.length > 0 && (
        <div className="absolute top-4 right-4 bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-gray-300 pointer-events-none">
          {selectedElements.length} selected
        </div>
      )}
    </div>
  );
});

Canvas.displayName = "Canvas";

export default Canvas;
