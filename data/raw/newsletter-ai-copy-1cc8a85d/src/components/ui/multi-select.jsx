import React, { useState, useRef, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function MultiSelect({ options, selected, onChange, placeholder = "Select..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUnselect = (optionToRemove) => {
    onChange(selected.filter(item => item.value !== optionToRemove.value));
  };

  const handleSelect = (option) => {
    if (!selected.some(item => item.value === option.value)) {
      onChange([...selected, option]);
    }
    setIsOpen(false);
  };

  const availableOptions = options.filter(
    option => !selected.some(selectedItem => selectedItem.value === option.value)
  );

  return (
    <div className="relative" ref={containerRef}>
      <div 
        className="min-h-[2.5rem] w-full rounded-md border border-white/20 bg-white/30 backdrop-blur-sm px-3 py-2 text-sm cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1">
          {selected.map((option) => (
            <Badge key={option.value} variant="secondary" className="bg-white/40 text-gray-700">
              {option.label}
              <button
                className="ml-1 rounded-full outline-none hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUnselect(option);
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selected.length === 0 && (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`absolute right-3 top-3 h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-md border border-white/20 bg-white/90 backdrop-blur-xl shadow-lg">
          {availableOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              No more options available
            </div>
          ) : (
            availableOptions.map((option) => (
              <div
                key={option.value}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-white/40 transition-colors"
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}