import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { 
  Briefcase, 
  User, 
  Users, 
  Check, 
  Phone, 
  Video,
  X
} from "lucide-react";

export default function FloorLayout({ 
  zones, 
  workspaces, 
  getAvailability, 
  onWorkspaceClick 
}) {
  if (zones.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-lg">
        <p className="text-slate-500">No zones found for this floor.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {zones.map(zone => {
        const zoneWorkspaces = workspaces.filter(w => w.zone_id === zone.id);
        if (zoneWorkspaces.length === 0) return null;

        return (
          <div key={zone.id} className="p-6 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800">{zone.name}</h3>
              <Badge variant="outline" className="capitalize">
                {zone.zone_type.replace('_', ' ')}
              </Badge>
            </div>
            
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
              {zoneWorkspaces.map(workspace => {
                const availability = getAvailability(workspace.id);
                
                let bgColor = "bg-slate-300";
                let textColor = "text-slate-600";
                let Icon = Briefcase;
                let isClickable = false;

                switch (availability.status) {
                  case 'available':
                    bgColor = "bg-green-100 hover:bg-green-200 border-green-300";
                    textColor = "text-green-800";
                    Icon = Check;
                    isClickable = true;
                    break;
                  case 'booked_manual':
                  case 'booked_roster':
                    if (availability.isCurrentUser) {
                      bgColor = "bg-amber-200 border-amber-400";
                      textColor = "text-amber-800";
                      Icon = User;
                    } else {
                      bgColor = availability.type === 'manual' ? "bg-blue-200 border-blue-400" : "bg-purple-200 border-purple-400";
                      textColor = availability.type === 'manual' ? "text-blue-800" : "text-purple-800";
                      Icon = User;
                    }
                    break;
                  default: // unavailable, conflict
                    bgColor = "bg-slate-200 border-slate-300";
                    textColor = "text-slate-500";
                    Icon = X;
                    break;
                }

                return (
                  <TooltipProvider key={workspace.id} delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button 
                          className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center p-1 text-center transition-all duration-200 border-2 ${bgColor} ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                          onClick={() => isClickable && onWorkspaceClick(workspace)}
                          disabled={!isClickable}
                        >
                          <Icon className={`w-5 h-5 mb-1 ${textColor}`} />
                          <span className={`text-xs font-semibold truncate ${textColor}`}>{workspace.name}</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-bold">{workspace.name}</p>
                        <p className="capitalize">Status: <span className="font-medium">{availability.status.replace('_', ' ')}</span></p>
                        {availability.user && <p>User: <span className="font-medium">{availability.user}</span></p>}
                        {availability.conflictReason && <p className="text-red-500">{availability.conflictReason}</p>}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}