import React from 'react';
import { motion } from 'framer-motion';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import TaskListItem from './TaskListItem';

const TaskListView = React.memo(({ columnTasksData, columns, onDeleteTask, onQuickComplete }) => {
    return (
        <div className="max-w-4xl mx-auto">
            {columns.map(column => {
                const tasks = columnTasksData[column.title] || [];
                return (
                    <motion.div
                        key={column.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">{column.title}</h2>
                            <span className="text-sm font-medium text-gray-500 bg-gray-200 rounded-full px-3 py-1">
                                {tasks.length}
                            </span>
                        </div>
                        <Droppable droppableId={column.title}>
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`space-y-3 transition-colors duration-200 rounded-lg p-2 ${snapshot.isDraggingOver ? 'bg-gray-200/50' : ''}`}
                                >
                                    {tasks.length > 0 ? (
                                        tasks.map((task, index) => (
                                            <Draggable key={task.id} draggableId={task.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <TaskListItem
                                                        task={task}
                                                        onDelete={onDeleteTask}
                                                        onQuickComplete={onQuickComplete}
                                                        provided={provided}
                                                        isDragging={snapshot.isDragging}
                                                    />
                                                )}
                                            </Draggable>
                                        ))
                                    ) : (
                                        !snapshot.isDraggingOver && (
                                            <p className="text-gray-400 text-sm italic py-4 text-center border border-dashed border-gray-200 rounded-lg">
                                                No tasks in this column.
                                            </p>
                                        )
                                    )}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </motion.div>
                );
            })}
        </div>
    );
});

TaskListView.displayName = 'TaskListView';

export default TaskListView;