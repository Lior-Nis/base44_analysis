import React from "react";
import { format, parseISO, getHours, getMinutes } from "date-fns";

const SLOT_WIDTH_PX = 60;

const getCategoryColor = (category) => {
  const colors = {
    work: "bg-gradient-to-r from-blue-400 to-blue-500",
    personal: "bg-gradient-to-r from-green-400 to-green-500",
    health: "bg-gradient-to-r from-red-400 to-red-500",
    learning: "bg-gradient-to-r from-purple-400 to-purple-500",
    creative: "bg-gradient-to-r from-pink-400 to-pink-500",
    social: "bg-gradient-to-r from-yellow-400 to-yellow-500",
    planning: "bg-gradient-to-r from-indigo-400 to-indigo-500"
  };
  return colors[category] || "bg-gradient-to-r from-gray-400 to-gray-500";
};

export default function TaskDisplayItem({ task, onTaskClick }) {
  if (!task.start_time || typeof task.duration_minutes !== 'number') {
    return null;
  }

  const taskStartDateTime = parseISO(task.start_time);
  const taskStartHour = getHours(taskStartDateTime);
  const taskStartMinute = getMinutes(taskStartDateTime);

  const displayDayStartHour = 7;
  let minutesFromDisplayStart = ((taskStartHour - displayDayStartHour) * 60) + taskStartMinute;

  if (taskStartHour < displayDayStartHour) {
    const taskEndMinutesFromMidnight = (taskStartHour * 60) + taskStartMinute + task.duration_minutes;
    const displayStartMinutesFromMidnight = displayDayStartHour * 60;
    if (taskEndMinutesFromMidnight > displayStartMinutesFromMidnight) {
        minutesFromDisplayStart = 0;
    } else {
        return null;
    }
  }

  const pixelsPerMinute = SLOT_WIDTH_PX / 60;
  const itemWidth = task.duration_minutes * pixelsPerMinute;
  const leftPosition = minutesFromDisplayStart * pixelsPerMinute;

  const finalLeftPosition = Math.max(0, leftPosition);
  const finalItemWidth = Math.max(itemWidth, 10);

  return (
    <div
      style={{
        left: `${finalLeftPosition}px`,
        width: `${finalItemWidth}px`,
        height: 'calc(100% - 6px)',
        top: '3px',
        position: 'absolute',
        zIndex: 10 + taskStartMinute,
      }}
      className={`rounded-lg px-2 py-0.5 text-white text-[10px] font-medium shadow-md cursor-pointer hover:opacity-80 transition-opacity duration-200 flex items-center justify-center ${getCategoryColor(task.category)} overflow-hidden`}
      onClick={(e) => { e.stopPropagation(); onTaskClick(task); }}
      title={`${task.title} - ${format(taskStartDateTime, 'HH:mm')} (${task.duration_minutes}m)`}
    >
      <span className="truncate block leading-tight">{task.title}</span>
    </div>
  );
}