import React, { useState } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { GripVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import StatusCell from "./cells/StatusCell";
import PeopleCell from "./cells/PeopleCell";
import DateCell from "./cells/DateCell";
import NumberCell from "./cells/NumberCell";
import BudgetCell from "./cells/BudgetCell";
import CheckboxCell from "./cells/CheckboxCell";
import TextCell from "./cells/TextCell";
import DropdownCell from "./cells/DropdownCell";
import PriorityCell from "./cells/PriorityCell"; // Changed from TagsCell to PriorityCell

export default function ItemRow({ 
  item, 
  columns, 
  onUpdate, 
  onDelete, 
  index, 
  isDragging,
  draggableProvided,
  dragHandleWidth,
  checkboxWidth,
  taskColumnWidth,
  priorityColumnWidth, // Add priority column width
  totalMinWidth,
  actionColumnWidth
}) {
  const [isSelected, setIsSelected] = useState(false);

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
      onDelete(item.id);
    }
  };

  const renderCell = (column) => {
    const value = column.id === 'task' ? item.title : item.data?.[column.id];
    const commonProps = {
      value,
      options: column.options,
      onUpdate: (newValue) => {
        if (column.id === 'task') {
          onUpdate(item.id, { title: newValue });
        } else {
          onUpdate(item.id, { data: { ...item.data, [column.id]: newValue }});
        }
      }
    };
    
    switch (column.type) {
      case 'status':
        return <StatusCell {...commonProps} />;
      case 'people':
        return <PeopleCell {...commonProps} />;
      case 'date':
        return <DateCell {...commonProps} />;
      case 'number':
        return <NumberCell {...commonProps} />;
      case 'budget':
        return <BudgetCell {...commonProps} />;
      case 'checkbox':
        return <CheckboxCell {...commonProps} />;
      case 'dropdown':
        return <DropdownCell {...commonProps} />;
      case 'priority': // Changed from 'tags' to 'priority'
        return <PriorityCell {...commonProps} />;
      case 'text':
      default:
        return <TextCell {...commonProps} />;
    }
  };

  return (
    <div
      ref={draggableProvided.innerRef}
      {...draggableProvided.draggableProps}
      style={{
        ...draggableProvided.draggableProps.style,
        minWidth: `${totalMinWidth}px`
      }}
      className={`flex items-stretch border-b border-[#E1E5F3] hover:bg-[#F5F6F8] transition-colors group min-h-[48px] ${
        isDragging ? 'opacity-80 shadow-lg' : ''
      }`}
    >
      {/* Drag Handle */}
      <div
        {...draggableProvided.dragHandleProps}
        className="flex-shrink-0 flex items-center justify-center cursor-grab hover:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white group-hover:bg-[#F5F6F8]"
        style={{ 
            width: dragHandleWidth, 
            position: 'sticky', 
            left: 0, 
            zIndex: 1 
        }}
      >
        <GripVertical className="w-3 h-3 text-[#676879]" />
      </div>

      {/* Checkbox */}
      <div 
        className="flex-shrink-0 flex items-center justify-center bg-white group-hover:bg-[#F5F6F8]"
        style={{ 
            width: checkboxWidth, 
            position: 'sticky', 
            left: dragHandleWidth, 
            zIndex: 1 
        }}
      >
        <Checkbox
          checked={isSelected}
          onCheckedChange={setIsSelected}
          className="opacity-0 group-hover:opacity-100 transition-opacity data-[state=checked]:opacity-100"
        />
      </div>
      
      {/* Cells */}
      {columns.map((column) => {
        let cellStyle = { 
            width: column.width || 150, 
            minWidth: column.width || 150,
            backgroundColor: 'white'
        };
        
        // Make Task column sticky
        if (column.id === 'task') {
          cellStyle = {
            ...cellStyle,
            width: taskColumnWidth,
            minWidth: taskColumnWidth,
            position: 'sticky',
            left: dragHandleWidth + checkboxWidth,
            zIndex: 1,
            backgroundColor: 'white'
          };
        }
        // Make Priority column sticky next to Task
        else if (column.type === 'priority') {
          cellStyle = {
            ...cellStyle,
            width: priorityColumnWidth,
            minWidth: priorityColumnWidth,
            position: 'sticky',
            left: dragHandleWidth + checkboxWidth + taskColumnWidth,
            zIndex: 1,
            backgroundColor: 'white'
          };
        }
        
        return (
          <div
            key={column.id}
            className="px-3 py-2 border-l border-[#E1E5F3] flex items-center group-hover:bg-[#F5F6F8]"
            style={cellStyle}
          >
            {renderCell(column)}
          </div>
        );
      })}

      {/* Flexible spacer */}
      <div className="flex-1 min-w-0 bg-white group-hover:bg-[#F5F6F8]" />

      {/* Actions Menu - Sticky Right */}
      <div 
        className="flex-shrink-0 flex items-center justify-center border-l border-[#E1E5F3] bg-white group-hover:bg-[#F5F6F8]"
        style={{ 
          width: actionColumnWidth, 
          position: 'sticky', 
          right: 0, 
          zIndex: 1 
        }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#E1E5F3]"
            >
              <Trash2 className="w-3 h-3 text-[#676879]" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600 focus:bg-red-50">
              <Trash2 className="w-3 h-3 mr-2" />
              Delete Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}