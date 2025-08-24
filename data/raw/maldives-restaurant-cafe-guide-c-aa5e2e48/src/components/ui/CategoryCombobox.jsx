import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function CategoryCombobox({ 
  categories = [], 
  value, 
  onValueChange, 
  placeholder = "Select category...",
  searchPlaceholder = "Search categories...",
  emptyText = "No categories found.",
  className = "" 
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCategory = categories.find(cat => cat.slug === value);
  const displayValue = selectedCategory ? selectedCategory.name : '';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (slug) => {
    onValueChange(slug);
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button
        variant="outline"
        type="button"
        role="combobox"
        aria-expanded={open}
        className={`w-full justify-between font-normal ${!displayValue ? "text-muted-foreground" : ""}`}
        onClick={() => setOpen(!open)}
      >
        <span className="truncate">{displayValue || placeholder}</span>
        <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${open ? "rotate-180" : ""}`} />
      </Button>

      {open && (
        <div className="absolute top-full z-50 w-full mt-1 bg-white border rounded-md shadow-lg">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredCategories.length === 0 ? (
              <p className="px-3 py-2 text-sm text-gray-500">{emptyText}</p>
            ) : (
              filteredCategories.map((category) => (
                <div
                  key={category.slug}
                  className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 flex items-center justify-between"
                  onClick={() => handleSelect(category.slug)}
                >
                  <span className="truncate">{category.name}</span>
                  {value === category.slug && <Check className="h-4 w-4 text-blue-600" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}