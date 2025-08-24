import React from "react";
import { RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { addDays } from "date-fns";

export default function CalendarToolbar({ currentWeek, onWeekChange, onRefresh }) {
  return (
    <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
      <h2 className="text-xl font-semibold text-slate-800">Weekly Schedule</h2>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline" size="sm" onClick={() => onWeekChange(addDays(currentWeek, -7))}
          className="rounded-lg border-slate-200/90 hover:bg-slate-50/90 px-3 py-1.5 text-xs"
        > ← Previous </Button>
        <Button
          variant="outline" size="sm" onClick={() => onWeekChange(addDays(currentWeek, 7))}
          className="rounded-lg border-slate-200/90 hover:bg-slate-50/90 px-3 py-1.5 text-xs"
        > Next → </Button>
        <Button
          variant="outline" size="icon_sm" onClick={onRefresh}
          className="rounded-lg border-slate-200/90 hover:bg-slate-50/90 p-1.5" title="Refresh Calendar"
        > <RefreshCw className="w-3.5 h-3.5" /> </Button>
        <Button asChild variant="outline" size="sm" className="rounded-lg border-sky-200/90 hover:bg-sky-50/90 text-sky-700 px-3 py-1.5 text-xs">
          <Link to={createPageUrl("Planning")}> <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Full Planning </Link>
        </Button>
      </div>
    </div>
  );
}