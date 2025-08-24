import React from "react";
import { format, addHours } from "date-fns";

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7);
const DAY_LABEL_WIDTH_PX = 80;
const SLOT_WIDTH_PX = 60;

export default function CalendarHeader() {
  return (
    <div className="grid sticky top-0 bg-white/80 backdrop-blur-md z-20 py-2"
         style={{ gridTemplateColumns: `${DAY_LABEL_WIDTH_PX}px repeat(${HOURS.length}, ${SLOT_WIDTH_PX}px)` }}>
      <div className="p-1"></div>
      {HOURS.map((hour) => (
        <div key={hour} className="text-center p-1">
          <div className="font-semibold text-slate-700 text-xs">
            {format(addHours(new Date(2000,0,1,hour),0), 'HH:mm')}
          </div>
        </div>
      ))}
    </div>
  );
}