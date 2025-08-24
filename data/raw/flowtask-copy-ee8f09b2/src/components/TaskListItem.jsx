import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Flag, Trash2, CheckCircle2, GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

const priorityConfig = {
    high: { label: 'High', color: 'bg-red-100 text-red-700 border-red-200/80' },
    medium: { label: 'Medium', color: 'bg-amber-100 text-amber-700 border-amber-200/80' },
    low: { label: 'Low', color: 'bg-blue-100 text-blue-700 border-blue-200/80' },
};

const TaskListItem = React.memo(({ task, onDelete, onQuickComplete, provided, isDragging }) => {
    const isOverdue = !task.completed && task.created_date && new Date(task.created_date) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const daysAgo = formatDaysAgo(task.created_date);
    const isCompleted = task.column === 'Done' || task.column === 'Archived';
    const isArchived = task.column === 'Archived';

    const handleDelete = React.useCallback((e) => {
        e.stopPropagation();
        onDelete(task);
    }, [onDelete, task]);

    const handleQuickComplete = React.useCallback((e) => {
        e.stopPropagation();
        onQuickComplete(task);
    }, [onQuickComplete, task]);

    return (
        <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`group bg-white rounded-lg border border-gray-200/80 p-3 flex items-center gap-2 transition-all ${
                isArchived ? 'opacity-70 hover:opacity-100' : ''
            } ${isDragging ? 'shadow-lg rotate-1' : 'shadow-sm hover:shadow-md'}`}
        >
            <div {...provided.dragHandleProps} className="text-gray-400 hover:text-gray-600 cursor-grab p-1">
                <GripVertical className="w-5 h-5" />
            </div>
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <p className={`font-medium text-gray-800 text-sm pr-4 ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                        {task.title}
                    </p>
                    <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity duration-150">
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

                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`${priorityConfig[task.priority]?.color} text-xs font-normal`}>
                            {priorityConfig[task.priority]?.label}
                        </Badge>
                        {isOverdue && <Flag className="w-4 h-4 text-rose-500" title="This task is over 7 days old" />}
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

TaskListItem.displayName = 'TaskListItem';

export default TaskListItem;