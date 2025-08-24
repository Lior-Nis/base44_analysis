import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin } from "lucide-react";

export default function FloorSelector({ floors, selectedFloor, onFloorChange }) {
  return (
    <Select value={selectedFloor} onValueChange={onFloorChange}>
      <SelectTrigger className="bg-white/80 backdrop-blur-sm border-slate-200">
        <SelectValue placeholder="Select floor" />
      </SelectTrigger>
      <SelectContent>
        {floors.map((floor) => (
          <SelectItem key={floor.id} value={floor.id}>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {floor.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}