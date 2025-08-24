import React from "react";
import { HexColorPicker } from "react-colorful";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function ColorPicker({ color, onChange, label }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label || "Color"}</label>
      <div className="flex items-center space-x-3">
        <Popover>
          <PopoverTrigger asChild>
            <div
              className="h-8 w-8 rounded-md border cursor-pointer shadow-sm"
              style={{ backgroundColor: color }}
            />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-none shadow-xl" align="start">
            <HexColorPicker color={color} onChange={onChange} />
          </PopoverContent>
        </Popover>
        <Input
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono"
        />
      </div>
    </div>
  );
}