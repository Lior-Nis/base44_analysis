
import React, { useState } from "react";
import { Eye, EyeOff, Lock, Square, Circle, Type, Trash2, Pen, Frame, Minus } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function LayersPanel({
  elements = [],
  selectedElements = [],
  onSelectionChange,
  onElementUpdate,
  onElementDelete,
  onElementReorder
}) {
  const [editingLayerId, setEditingLayerId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [draggedElement, setDraggedElement] = useState(null);
  const [dragOverElement, setDragOverElement] = useState(null);
  const [dropPosition, setDropPosition] = useState(null); // 'above' or 'below'

  const getElementIcon = (type) => {
    switch (type) {
      case "rectangle": return Square;
      case "circle": return Circle;
      case "text": return Type;
      case "frame": return Frame;
      case "line": return Minus;
      case "pen": return Pen;
      default: return Square;
    }
  };

  const handleElementClick = (elementId, e) => {
    e.preventDefault();
    
    // Handle multi-selection with Ctrl/Cmd key
    if (e.ctrlKey || e.metaKey) {
      const isSelected = selectedElements.includes(elementId);
      if (isSelected) {
        onSelectionChange(selectedElements.filter(id => id !== elementId));
      } else {
        onSelectionChange([...selectedElements, elementId]);
      }
      return;
    }

    // Handle range selection with Shift key
    if (e.shiftKey && selectedElements.length > 0) {
      // Find the last selected element in the current display order (which is reversed)
      // We need to work with the original `elements` array for indexing, then filter/map
      const currentElementsOrder = [...elements].reverse();
      const lastSelectedId = selectedElements[selectedElements.length - 1];

      // Find indices in the current displayed order
      const lastSelectedIndexInDisplay = currentElementsOrder.findIndex(el => el.id === lastSelectedId);
      const clickedIndexInDisplay = currentElementsOrder.findIndex(el => el.id === elementId);
      
      if (lastSelectedIndexInDisplay !== -1 && clickedIndexInDisplay !== -1) {
        const start = Math.min(lastSelectedIndexInDisplay, clickedIndexInDisplay);
        const end = Math.max(lastSelectedIndexInDisplay, clickedIndexInDisplay);
        
        // Slice based on the display order and get their IDs
        const rangeIds = currentElementsOrder.slice(start, end + 1).map(el => el.id);
        
        // Add new range IDs to existing selected, ensuring uniqueness
        onSelectionChange([...new Set([...selectedElements, ...rangeIds])]);
        return;
      }
    }

    // Regular single selection
    const isSelected = selectedElements.includes(elementId);
    if (isSelected && selectedElements.length === 1) { // If it's the only selected and clicked again, deselect
      onSelectionChange([]);
    } else if (!isSelected) { // If not selected, select just this one
      onSelectionChange([elementId]);
    } else { // If already selected but multi-selected, treat as single selection if no modifier keys
      onSelectionChange([elementId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedElements.length === elements.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(elements.map(el => el.id));
    }
  };

  const handleDoubleClick = (element) => {
    setEditingLayerId(element.id);
    setEditingName(element.name || `${element.type.charAt(0).toUpperCase() + element.type.slice(1)} ${elements.indexOf(element) + 1}`);
  };

  const handleNameChange = (elementId) => {
    if (editingName.trim()) {
      onElementUpdate(elementId, { name: editingName.trim() });
    }
    setEditingLayerId(null);
    setEditingName("");
  };

  const handleKeyPress = (e, elementId) => {
    if (e.key === 'Enter') {
      handleNameChange(elementId);
    } else if (e.key === 'Escape') {
      setEditingLayerId(null);
      setEditingName("");
    }
  };

  const toggleVisibility = (elementId) => {
    const element = elements.find(el => el.id === elementId);
    if (element) {
      onElementUpdate(elementId, { visible: !element.visible });
    }
  };

  const toggleLock = (elementId) => {
    const element = elements.find(el => el.id === elementId);
    if (element) {
      onElementUpdate(elementId, { locked: !element.locked });
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e, element) => {
    // Prevent drag if locked or if multiple elements are selected (for simplicity of this drag behavior)
    if (element.locked || selectedElements.length > 1) {
      e.preventDefault();
      return;
    }
    setDraggedElement(element);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', element.id);
  };

  const handleDragOver = (e, targetElement) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (!draggedElement || draggedElement.id === targetElement.id) {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;

    // Determine if we're in the upper or lower half
    const position = y < height / 2 ? 'above' : 'below';

    setDragOverElement(targetElement.id);
    setDropPosition(position);
  };

  const handleDragLeave = () => {
    setDragOverElement(null);
    setDropPosition(null);
  };

  const handleDrop = (e, targetElement) => {
    e.preventDefault();
    
    if (!draggedElement || draggedElement.id === targetElement.id) {
      return;
    }

    const draggedIndex = elements.findIndex(el => el.id === draggedElement.id);
    const targetIndex = elements.findIndex(el => el.id === targetElement.id);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      return;
    }

    // Calculate new position based on drop position
    // `elements` array is indexed 0 (bottom) to N (top)
    // Display order is N (top) to 0 (bottom)
    // Dropping 'above' in display means moving towards the top (higher index) in original array
    // Dropping 'below' in display means moving towards the bottom (lower index) in original array

    let newIndex = targetIndex; // Default is to place before target in original array (above in display)
    if (dropPosition === 'below') {
      newIndex = targetIndex + 1; // Place after target in original array (below in display)
    }
    
    // Adjust for array manipulation: if the element is dragged from an earlier position
    // and dropped at or after its original position, the effective index shifts by -1
    // because the element at the `draggedIndex` will be removed first.
    if (draggedIndex < newIndex) {
      newIndex -= 1;
    }

    // Call the reorder function
    if (onElementReorder) {
      onElementReorder(draggedIndex, newIndex);
    }

    // Clean up drag state
    setDraggedElement(null);
    setDragOverElement(null);
    setDropPosition(null);
  };

  const handleDragEnd = () => {
    setDraggedElement(null);
    setDragOverElement(null);
    setDropPosition(null);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[#30363d]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-white">Layers</h3>
          <button
            onClick={handleSelectAll}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            {selectedElements.length === elements.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
        <div className="text-xs text-gray-400">
          {elements.length} {elements.length === 1 ? 'layer' : 'layers'}
          {selectedElements.length > 0 && (
            <span className="text-blue-400 ml-2">
              • {selectedElements.length} selected
            </span>
          )}
        </div>
      </div>

      {/* Multi-selection Actions */}
      {selectedElements.length > 1 && (
        <div className="p-3 border-b border-[#30363d] bg-[#21262d]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onElementDelete(selectedElements)}
              className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
            >
              Delete ({selectedElements.length})
            </button>
            <button
              onClick={() => {
                // Determine the visibility state of the first selected element
                // and toggle all selected elements to the opposite state.
                const firstSelectedElement = elements.find(el => el.id === selectedElements[0]);
                if (firstSelectedElement) {
                  const targetVisibility = !(firstSelectedElement.visible !== false); // If true, make false, if false, make true
                  selectedElements.forEach(id => {
                    onElementUpdate(id, { visible: targetVisibility });
                  });
                }
              }}
              className="px-2 py-1 text-xs bg-[#30363d] hover:bg-[#404040] text-gray-300 rounded transition-colors"
            >
              Toggle Visibility
            </button>
            <button
              onClick={() => {
                const firstSelectedElement = elements.find(el => el.id === selectedElements[0]);
                if (firstSelectedElement) {
                  const targetLockState = !(firstSelectedElement.locked === true);
                  selectedElements.forEach(id => {
                    onElementUpdate(id, { locked: targetLockState });
                  });
                }
              }}
              className="px-2 py-1 text-xs bg-[#30363d] hover:bg-[#404040] text-gray-300 rounded transition-colors"
            >
              Toggle Lock
            </button>
          </div>
        </div>
      )}

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto">
        {elements.length === 0 ? (
          <div className="p-4 text-center text-gray-400 text-sm">
            No layers yet
            <br />
            <span className="text-xs">Start designing to see layers here</span>
          </div>
        ) : (
          <div className="p-2">
            {elements.slice().reverse().map((element, reversedIndex) => {
              const Icon = getElementIcon(element.type);
              const isSelected = selectedElements.includes(element.id);
              const isVisible = element.visible !== false;
              const isLocked = element.locked === true;
              const isEditing = editingLayerId === element.id;
              const isDraggedOver = dragOverElement === element.id;
              const originalIndex = elements.length - 1 - reversedIndex;

              return (
                <div key={element.id} className="relative">
                  {/* Drop indicator above */}
                  {isDraggedOver && dropPosition === 'above' && (
                    <div className="absolute top-0 left-1 right-1 h-1 bg-blue-500 rounded-full z-10 pointer-events-none" />
                  )}

                  <div
                    draggable={!isLocked && selectedElements.length <= 1} // Only drag if not locked and only single element selected
                    onDragStart={(e) => handleDragStart(e, element)}
                    onDragOver={(e) => handleDragOver(e, element)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, element)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200 group relative ${
                      isSelected
                        ? "bg-blue-600 text-white"
                        : "hover:bg-[#30363d] text-gray-300"
                    } ${
                      draggedElement?.id === element.id ? 'opacity-50' : ''
                    } ${
                      isDraggedOver ? 'bg-[#30363d]/70' : ''
                    }`}
                    onClick={(e) => !isEditing && handleElementClick(element.id, e)}
                    onDoubleClick={() => handleDoubleClick(element)}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />

                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onBlur={() => handleNameChange(element.id)}
                          onKeyDown={(e) => handleKeyPress(e, element.id)}
                          className="text-sm bg-[#0d1117] border-[#30363d] text-white h-6 px-2"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <>
                          <div className="text-sm font-medium truncate">
                            {element.name || `${element.type.charAt(0).toUpperCase() + element.type.slice(1)} ${originalIndex + 1}`}
                          </div>
                          {element.type === "text" && element.text && (
                            <div className="text-xs opacity-70 truncate">
                              {element.text}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleVisibility(element.id);
                          }}
                          className="p-1 hover:bg-white/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                        >
                          {isVisible ? (
                            <Eye className="w-3 h-3" />
                          ) : (
                            <EyeOff className="w-3 h-3" />
                          )}
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLock(element.id);
                          }}
                          className="p-1 hover:bg-white/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Lock className={`w-3 h-3 ${isLocked ? 'opacity-100' : 'opacity-50'}`} />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onElementDelete([element.id]);
                          }}
                          className="p-1 hover:bg-red-500/20 rounded transition-colors opacity-0 group-hover:opacity-100 text-red-400"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Drop indicator below */}
                  {isDraggedOver && dropPosition === 'below' && (
                    <div className="absolute bottom-0 left-1 right-1 h-1 bg-blue-500 rounded-full z-10 pointer-events-none" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
