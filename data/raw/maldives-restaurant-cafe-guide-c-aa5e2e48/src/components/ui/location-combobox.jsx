import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function LocationCombobox({ 
  locations = [], 
  value, 
  onValueChange, 
  placeholder = "Select location...",
  searchPlaceholder = "Search locations...",
  emptyText = "No locations found.",
  className = "",
  disabled = false 
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Filter locations based on search query
  const filteredLocations = locations.filter(location =>
    location.display_name && location.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get selected location display name
  const selectedLocation = locations.find(loc => loc.id === value);
  const displayValue = selectedLocation ? selectedLocation.display_name : '';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle selection
  const handleSelect = (locationId) => {
    onValueChange(locationId);
    setOpen(false);
    setSearchQuery('');
  };

  // Handle clear selection
  const handleClear = (e) => {
    e.stopPropagation();
    onValueChange('');
    setSearchQuery('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <Button
        variant="outline"
        type="button"
        role="combobox"
        aria-expanded={open}
        className={`w-full justify-between font-normal ${!displayValue ? "text-muted-foreground" : ""}`}
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
      >
        <span className="truncate">
          {displayValue || placeholder}
        </span>
        <div className="flex items-center gap-1">
          {displayValue && !disabled && (
            <X 
              className="h-4 w-4 opacity-50 hover:opacity-100" 
              onClick={handleClear}
            />
          )}
          <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </Button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full z-50 w-full mt-1 bg-white border rounded-md shadow-lg">
          {/* Search Input */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                ref={inputRef}
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8"
                autoFocus
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredLocations.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                {emptyText}
              </div>
            ) : (
              filteredLocations.map((location) => (
                <div
                  key={location.id}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 flex items-center justify-between ${value === location.id ? "bg-gray-50" : ""}`}
                  onClick={() => handleSelect(location.id)}
                >
                  <span className="truncate">{location.display_name}</span>
                  {value === location.id && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Add "All Locations" option if not already selected */}
          {searchQuery === '' && (
            <div className="border-t">
              <div
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 flex items-center justify-between font-medium ${value === 'all' ? "bg-gray-50" : ""}`}
                onClick={() => handleSelect('all')}
              >
                <span>All Locations</span>
                {value === 'all' && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}