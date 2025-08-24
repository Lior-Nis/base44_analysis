import React, { useState } from 'react';
import { Clock, Flag, Trash2, CheckCircle2, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Task } from '@/api/entities';

const formatDaysAgo = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    
    date.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
};

const TaskCard = React.memo(({ task, provided, isDragging, onDelete, onQuickComplete }) => {
    const [showPriorityMenu, setShowPriorityMenu] = useState(false);
    
    const priorityConfig = {
        high: { label: 'High', color: 'bg-red-100 text-red-700 border-red-200/80', dot: 'bg-red-500' },
        medium: { label: 'Medium', color: 'bg-amber-100 text-amber-700 border-amber-200/80', dot: 'bg-amber-500' },
        low: { label: 'Low', color: 'bg-blue-100 text-blue-700 border-blue-200/80', dot: 'bg-blue-500' },
    };

    const handlePriorityChange = async (newPriority) => {
        try {
            await Task.update(task.id, { priority: newPriority });
            task.priority = newPriority;
            setShowPriorityMenu(false);
        } catch (error) {
            console.error('Failed to update priority:', error);
        }
    };

    const daysAgo = formatDaysAgo(task.created_date);
    const isCompleted = task.completed;
    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isCompleted;
    const isArchived = task.column === 'Archived';

    const handleQuickComplete = (e) => {
        e.stopPropagation();
        onQuickComplete(task);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(task);
    };

    return (
        <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="group touch-manipulation"
        >
            <div
                className={`bg-white rounded-lg border p-4 ${
                    isDragging 
                        ? 'shadow-lg border-gray-300' 
                        : 'shadow-sm hover:shadow-md hover:border-gray-300 border-gray-200/80'
                } ${isArchived ? 'opacity-70 hover:opacity-100' : ''}`}
                style={{
                    transition: isDragging ? 'none' : 'all 0.15s ease-out'
                }}
            >
                <div className="flex justify-between items-start">
                    <p className={`font-medium text-gray-800 text-sm pr-4 ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                        {task.title}
                    </p>
                    <div className="flex items-center gap-1 transition-opacity duration-150 md:opacity-0 md:group-hover:opacity-100 opacity-100">
                        {!isCompleted && (
                            <button 
                                onClick={handleQuickComplete}
                                className="text-gray-400 hover:text-green-600 transition-colors duration-150 flex-shrink-0 p-1 rounded"
                                title="Quick complete"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                            </button>
                        )}
                        <button 
                            onClick={handleDelete}
                            className="text-gray-400 hover:text-rose-500 transition-colors duration-150 flex-shrink-0 p-1 rounded"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <button
                                onClick={() => setShowPriorityMenu(!showPriorityMenu)}
                                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors p-1 rounded"
                            >
                                <div className={`w-2 h-2 rounded-full ${priorityConfig[task.priority]?.dot}`} />
                                {priorityConfig[task.priority]?.label}
                            </button>
                            
                            {showPriorityMenu && (
                                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 min-w-20">
                                    {Object.entries(priorityConfig).map(([key, config]) => (
                                        <button
                                            key={key}
                                            onClick={() => handlePriorityChange(key)}
                                            className="w-full px-3 py-1.5 text-xs text-left hover:bg-gray-50 flex items-center gap-2"
                                        >
                                            <div className={`w-2 h-2 rounded-full ${config.dot}`} />
                                            {config.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{daysAgo}</span>
                    </div>
                </div>
            </div>
        </div>
    );
});

TaskCard.displayName = 'TaskCard';

export default TaskCard;