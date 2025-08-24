import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

export default function BookingFilters({ filters, onFiltersChange, locations, zones, floors }) {
  const handleFilterChange = (key, value) => {
    onFiltersChange(prev => {
        const newFilters = { ...prev, [key]: value };

        // When location changes, check if the current zone is valid for the new location.
        // If not, reset the zone filter.
        if (key === 'location' && value !== 'all') {
            const locationFloors = floors.filter(f => f.location_id === value);
            const locationFloorIds = new Set(locationFloors.map(f => f.id));
            const isCurrentZoneValid = zones.some(z => z.id === newFilters.zone && locationFloorIds.has(z.floor_id));
            
            if (newFilters.zone !== 'all' && !isCurrentZoneValid) {
                newFilters.zone = 'all'; // Reset zone
            }
        }
        return newFilters;
    });
  };

  const availableZones = React.useMemo(() => {
    if (filters.location === 'all') {
        return zones;
    }
    const locationFloors = floors.filter(f => f.location_id === filters.location);
    const locationFloorIds = new Set(locationFloors.map(f => f.id));
    return zones.filter(z => locationFloorIds.has(z.floor_id));
  }, [filters.location, zones, floors]);

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-500 hidden sm:block" />
        <Select 
          value={filters.location} 
          onValueChange={(value) => handleFilterChange('location', value)}
        >
          <SelectTrigger className="w-full sm:w-40 bg-white/80 backdrop-blur-sm border-slate-200">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map((location) => (
              <SelectItem key={location.id} value={location.id}>
                {location.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Select 
        value={filters.zone} 
        onValueChange={(value) => handleFilterChange('zone', value)}
      >
        <SelectTrigger className="w-full sm:w-40 bg-white/80 backdrop-blur-sm border-slate-200">
          <SelectValue placeholder="Zone" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Zones</SelectItem>
          {availableZones.map((zone) => (
            <SelectItem key={zone.id} value={zone.id}>
              {zone.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}