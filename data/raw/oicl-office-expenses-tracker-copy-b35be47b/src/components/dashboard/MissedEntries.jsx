import React from "react";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export default function MissedEntries({ missedEntries }) {
  if (missedEntries.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-8 text-center bg-green-50/80 border-2 border-green-200">
        <div className="w-16 h-16 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-green-900 mb-2">All Caught Up!</h3>
        <p className="text-green-700 font-medium">No missing coffee entries for weekdays</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl p-8 bg-amber-50/80 border-2 border-amber-200">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="w-6 h-6 text-amber-600" />
        <h3 className="text-xl font-bold text-amber-900">Missing Coffee Entries</h3>
      </div>
      <p className="text-amber-800 font-medium mb-4">
        You haven't logged coffee expenses for these weekdays:
      </p>
      <div className="flex flex-wrap gap-3">
        {missedEntries.map((date, index) => (
          <Badge 
            key={index}
            className="bg-amber-100 text-amber-800 border-2 border-amber-300 px-4 py-2 rounded-2xl font-semibold text-base"
          >
            {format(date, 'MMM dd')}
          </Badge>
        ))}
      </div>
    </div>
  );
}