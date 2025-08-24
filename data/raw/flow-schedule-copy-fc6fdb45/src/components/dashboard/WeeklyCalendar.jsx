import React, { useState, useEffect } from "react";
import { Task } from "@/api/entities";
import { startOfWeek, addDays, addHours, isSameDay, parseISO } from "date-fns";
import AddTaskModal from "./AddTaskModal";
import CalendarToolbar from "./calendar/CalendarToolbar";
import CalendarHeader from "./calendar/CalendarHeader";
import CalendarDayRow from "./calendar/CalendarDayRow";

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7);
const SLOT_WIDTH_PX = 60;
const DAY_LABEL_WIDTH_PX = 80;

export default function WeeklyCalendar({ onTaskUpdate }) {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [tasks, setTasks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    loadTasks();
  }, [currentWeek, onTaskUpdate]);

  const loadTasks = async () => {
    const allTasks = await Task.list();
    setTasks(allTasks.filter(task => task.start_time && task.duration_minutes));
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  const handleHourAreaClick = (day, event) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;

    const hourIndex = Math.floor(x / SLOT_WIDTH_PX);
    const clickedHour = HOURS[hourIndex];
    
    if (clickedHour !== undefined) {
        const slotDateTime = addHours(new Date(day), clickedHour);
        slotDateTime.setMinutes(0); 
        slotDateTime.setSeconds(0);
        slotDateTime.setMilliseconds(0);
      
        setSelectedSlot(slotDateTime);
        setSelectedTask(null);
        setShowAddModal(true);
    }
  };
  
  const handleEditTask = (task) => {
    setSelectedTask(task);
    setSelectedSlot(null);
    setShowAddModal(true);
  };

  const getTasksForDay = (dayDate) => {
    return tasks.filter(task => task.start_time && isSameDay(parseISO(task.start_time), dayDate));
  };

  const handleWeekChange = (newWeek) => {
    setCurrentWeek(newWeek);
  };

  const handleRefresh = () => {
    loadTasks();
  };

  const handleModalSave = () => {
    loadTasks();
    onTaskUpdate?.();
  };

  return (
    <>
      <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-4 md:p-5 shadow-xl border border-white/20">
        <CalendarToolbar 
          currentWeek={currentWeek}
          onWeekChange={handleWeekChange}
          onRefresh={handleRefresh}
        />

        <div className="overflow-auto pb-2 custom-scrollbar">
          <div style={{ minWidth: `${DAY_LABEL_WIDTH_PX + (HOURS.length * SLOT_WIDTH_PX)}px` }}>
            <CalendarHeader />

            <div className="space-y-1.5">
              {weekDays.map((day) => {
                const tasksForThisDay = getTasksForDay(day);
                return (
                  <CalendarDayRow
                    key={day.toISOString()}
                    day={day}
                    tasksForDay={tasksForThisDay}
                    onHourAreaClick={handleHourAreaClick}
                    onTaskClick={handleEditTask}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <AddTaskModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        selectedSlot={selectedSlot}
        selectedTask={selectedTask}
        onSave={handleModalSave}
      />
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(200, 200, 200, 0.1); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(100, 100, 100, 0.3); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(100, 100, 100, 0.5); }
      `}</style>
    </>
  );
}