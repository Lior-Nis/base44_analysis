import React from "react";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import TaskDisplayItem from "./TaskDisplayItem";

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7);
const DAY_LABEL_WIDTH_PX = 80;
const SLOT_WIDTH_PX = 60;

export default function CalendarDayRow({ day, tasksForDay, onHourAreaClick, onTaskClick }) {
  const handleClick = (event) => {
    onHourAreaClick(day, event);
  };

  return (
    <div className="grid items-center"
         style={{ gridTemplateColumns: `${DAY_LABEL_WIDTH_PX}px 1fr`, minHeight: '50px' }}>
      {/* Day Label Cell */}
      <div className="p-1.5 text-left text-xs text-slate-600 font-medium flex flex-col justify-center items-start bg-slate-50/60 rounded-lg h-full">
        <div className="font-bold text-slate-800">{format(day, 'EEE')}</div>
        <div className="text-slate-500 text-[10px]">{format(day, 'MMM d')}</div>
      </div>

      {/* Hours Container for this day */}
      <div 
          className="relative h-full grid border-l border-slate-200/70"
          style={{ gridTemplateColumns: `repeat(${HOURS.length}, ${SLOT_WIDTH_PX}px)`}}
          onClick={handleClick}
      >
        {/* Background Hour Slot Cells */}
        {HOURS.map((hour, idx) => (
          <div key={`bg-${day.toISOString()}-${hour}`} 
               className={`h-full ${idx < HOURS.length -1 ? 'border-r' : ''} border-slate-200/50 group hover:bg-sky-50/30 transition-colors duration-150`}
          >
             <div className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
               <Plus className="w-3 h-3 text-sky-500" />
             </div>
          </div>
        ))}
        {/* Absolutely Positioned Tasks */}
        {tasksForDay.map(task => (
          <TaskDisplayItem key={task.id} task={task} onTaskClick={onTaskClick} />
        ))}
      </div>
    </div>
  );
}