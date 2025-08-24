import React from "react";

export default function ToolBar({ tools, selectedTool, onToolSelect }) {
  return (
    <div className="flex flex-col gap-1 p-2">
      {tools.map((tool, index) => {
        if (tool.type === 'divider') {
          return <div key={`divider-${index}`} className="h-px w-full bg-[#30363d] my-1" />;
        }
        
        return (
          <button
            key={tool.id}
            onClick={() => onToolSelect(tool.id)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              selectedTool === tool.id
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-[#30363d]"
            }`}
            title={tool.label}
          >
            <tool.icon className="w-4 h-4" />
          </button>
        )
      })}
    </div>
  );
}