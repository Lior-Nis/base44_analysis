import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";
import { MoreHorizontal, Users, Clock, FileText, Trash2, Edit, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ProjectPreview from "./ProjectPreview";

export default function ProjectCard({ project, viewMode = "grid", onUpdate }) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(project.name);

  const handleRename = async () => {
    if (newName.trim() === "" || newName === project.name) {
      setIsRenaming(false);
      return;
    }
    try {
      await base44.entities.Project.update(project.id, { name: newName });
      onUpdate();
    } catch (error) {
      console.error("Error renaming project:", error);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
      try {
        await base44.entities.Project.delete(project.id);
        onUpdate();
      } catch (error) {
        console.error("Error deleting project:", error);
      }
    }
  };

  if (viewMode === "list") {
    return (
      <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200 group">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-md flex-shrink-0 overflow-hidden">
             <ProjectPreview elements={project.canvas_data?.elements} backgroundColor={project.background_color} />
          </div>
          <div className="min-w-0">
            <Link 
                to={createPageUrl(`Editor?projectId=${project.id}`)}
                className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors truncate block text-sm"
            >
              {project.name}
            </Link>
            {project.description && (
              <p className="text-xs text-gray-500 truncate">{project.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-gray-500 flex-shrink-0 ml-4">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {format(new Date(project.last_accessed || project.created_date), 'MMM d, yyyy')}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="w-7 h-7 p-0 data-[state=open]:bg-gray-100">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsRenaming(true)}>
                <Edit className="w-3 h-3 mr-2"/> Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="w-3 h-3 mr-2"/> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  return (
    <div className="group cursor-pointer bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md hover:border-gray-300 transition-all duration-300">
      {/* Thumbnail */}
      <Link 
        to={createPageUrl(`Editor?projectId=${project.id}`)}
        className="block"
      >
        <div className="aspect-[16/10] bg-gradient-to-br from-blue-50 to-purple-50 relative overflow-hidden">
          <ProjectPreview elements={project.canvas_data?.elements} backgroundColor={project.background_color} />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
        </div>
      </Link>

      {/* Content */}
      <div className="p-3">
        <div className="flex items-start justify-between mb-2">
          {isRenaming ? (
            <div className="flex items-center gap-1 w-full">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                className="h-7 text-sm"
                autoFocus
              />
              <Button size="sm" className="h-7 w-7 p-0" onClick={handleRename}><Check className="w-4 h-4"/></Button>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => setIsRenaming(false)}><X className="w-4 h-4"/></Button>
            </div>
          ) : (
            <h3 className="font-semibold text-gray-800 text-sm leading-tight truncate flex-1 pr-2">
              {project.name}
            </h3>
          )}
          
          {!isRenaming && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="w-7 h-7 p-0 data-[state=open]:bg-gray-100 flex-shrink-0">
                  <MoreHorizontal className="w-4 h-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsRenaming(true)}>
                  <Edit className="w-3 h-3 mr-2"/> Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                  <Trash2 className="w-3 h-3 mr-2"/> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Opened {format(new Date(project.last_accessed || project.created_date), 'MMM d')}</span>
          </div>
          
          <div className="flex -space-x-2">
            <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-white text-[9px] font-medium">A</span>
            </div>
            <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-teal-600 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-white text-[9px] font-medium">B</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}