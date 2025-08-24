import React, { useState, useEffect } from "react";
import { Users } from "lucide-react";

export default function CollaborationIndicator({ projectId }) {
  const [collaborators, setCollaborators] = useState([]);

  // Mock collaborators for now - in a real app this would connect to real-time presence
  useEffect(() => {
    // Simulate some collaborators
    setCollaborators([
      { id: 1, name: "Alex Design", color: "#3b82f6", cursor: { x: 150, y: 200 } },
      { id: 2, name: "Sarah UI", color: "#10b981", cursor: { x: 300, y: 150 } }
    ]);
  }, [projectId]);

  if (!collaborators.length) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-2">
        {collaborators.map((collaborator) => (
          <div
            key={collaborator.id}
            className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium text-white"
            style={{ backgroundColor: collaborator.color }}
            title={collaborator.name}
          >
            {collaborator.name.charAt(0)}
          </div>
        ))}
      </div>
      
      <div className="flex items-center gap-1 text-gray-400 text-sm">
        <Users className="w-4 h-4" />
        {collaborators.length}
      </div>
    </div>
  );
}