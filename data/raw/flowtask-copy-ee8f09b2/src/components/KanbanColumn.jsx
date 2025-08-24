import React, { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { ChevronDown, ChevronUp } from 'lucide-react';
import TaskCard from './TaskCard';

const KanbanColumn = React.memo(({ column, tasks, onDeleteTask, onQuickComplete }) => {
    const [showAllTasks, setShowAllTasks] = useState(false);
    
    const TASK_LIMIT = 25;
    const hasOverflow = tasks.length > TASK_LIMIT;
    const visibleTasks = hasOverflow && !showAllTasks ? tasks.slice(0, TASK_LIMIT) : tasks;
    const hiddenCount = hasOverflow ? tasks.length - TASK_LIMIT : 0;

    return (
        <div className="bg-gray-100/70 rounded-2xl p-3 w-[90vw] sm:w-80 h-full flex flex-col flex-shrink-0 snap-center">
            <div className="flex justify-between items-center mb-4 px-1">
                <h2 className="font-semibold text-gray-700">{column.title}</h2>
                <span className="text-sm font-medium text-gray-500 bg-gray-200 rounded-full px-2 py-0.5">
                    {tasks.length}
                </span>
            </div>
            <Droppable droppableId={column.title}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-grow min-h-[100px] rounded-lg transition-colors duration-200 ${
                            snapshot.isDraggingOver ? 'bg-gray-200/80' : 'bg-transparent'
                        }`}
                    >
                        {visibleTasks.map((task, index) => (
                            <Draggable 
                                key={`${task.id}-${task.column}-${task.order_position}`} 
                                draggableId={task.id} 
                                index={index}
                            >
                                {(provided, snapshot) => (
                                    <div className="mb-3">
                                        <TaskCard 
                                            task={task} 
                                            provided={provided}
                                            isDragging={snapshot.isDragging}
                                            onDelete={onDeleteTask}
                                            onQuickComplete={onQuickComplete}
                                        />
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                        
                        {hasOverflow && (
                            <button
                                onClick={() => setShowAllTasks(!showAllTasks)}
                                className="w-full mt-2 p-3 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-200/50 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                {showAllTasks ? (
                                    <>
                                        <ChevronUp className="w-4 h-4" />
                                        Show less
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="w-4 h-4" />
                                        Show {hiddenCount} more tasks
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </Droppable>
        </div>
    );
});

KanbanColumn.displayName = 'KanbanColumn';

export default KanbanColumn;