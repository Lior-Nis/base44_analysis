
import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { Task } from '@/api/entities';
import { KanbanColumn } from '@/api/entities';
import { UserStats } from '@/api/entities';
import { DailyRecord } from '@/api/entities';
import { User } from '@/api/entities';
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DragDropContext } from '@hello-pangea/dnd';

import Header from '../components/Header';
import KanbanColumnComponent from '../components/KanbanColumn';
import TaskListView from '../components/TaskListView';
import Toast from '../components/Toast';
import LoadingScreen from '../components/LoadingScreen';
import { createPageUrl } from '@/utils';

// Lazy load modals for better performance
const TaskCreationModal = lazy(() => import('../components/TaskCreationModal'));
const StatsPanel = lazy(() => import('../components/StatsPanel'));
const LeaderboardModal = lazy(() => import('../components/LeaderboardModal'));
const FocusTimer = lazy(() => import('../components/FocusTimer'));


const DEFAULT_COLUMNS = [
    { title: 'Backlog', order_position: 1, is_default: true },
    { title: 'Today', order_position: 2, is_default: false },
    { title: 'Tomorrow', order_position: 3, is_default: false },
    { title: 'Weekend', order_position: 4, is_default: false },
    { title: 'Done', order_position: 5, is_default: true },
    { title: 'Archived', order_position: 6, is_default: true },
];

const getYYYYMMDD = (date) => date.toISOString().split('T')[0];

const isToday = (dateString) => {
    if (!dateString) return false;
    const today = getYYYYMMDD(new Date());
    const recordDate = getYYYYMMDD(new Date(dateString));
    return today === recordDate;
};

const calculateXPFromTasks = (tasks) => {
    return tasks.reduce((total, task) => {
        const xpValue = { low: 10, medium: 15, high: 25 }[task.priority] || 10;
        return total + xpValue;
    }, 0);
};

export default function TodoPage() {
    const [user, setUser] = useState(null);
    const [columnTasksData, setColumnTasksData] = useState({});
    const [columns, setColumns] = useState([]);
    const [userStats, setUserStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState('Initializing...');
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showStats, setShowStats] = useState(false);
    const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
    const [toast, setToast] = useState({ message: '', type: '', isVisible: false });
    const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);
    const [showArchived, setShowArchived] = useState(false);
    const [isKanbanView, setIsKanbanView] = useState(true);

    const showToast = useCallback((message, type) => {
        setToast({ message, type, isVisible: true });
    }, []);

    useEffect(() => {
        const initializeApp = async () => {
            try {
                setLoading(true);
                setLoadingMessage('Authenticating...');
                setLoadingProgress(10);
                
                const currentUser = await User.me();
                setUser(currentUser);
                setLoadingProgress(20);

                setLoadingMessage('Loading workspace...');
                setLoadingProgress(40);

                let [loadedColumns, loadedStats, loadedTasks] = await Promise.all([
                    KanbanColumn.list('order_position').catch(() => []),
                    UserStats.list().catch(() => []),
                    Task.list().catch(() => [])
                ]);
                setLoadingProgress(60);

                // Self-repair and standardization logic
                setLoadingMessage('Verifying workspace...');
                setLoadingProgress(70);
                
                const existingColumnTitles = new Set(loadedColumns.map(c => c.title));
                const columnsToCreate = DEFAULT_COLUMNS.filter(
                    defaultCol => !existingColumnTitles.has(defaultCol.title)
                );

                if (columnsToCreate.length > 0) {
                    setLoadingMessage('Updating workspace...');
                    for (const col of columnsToCreate) {
                        await KanbanColumn.create({ ...col, created_by: currentUser.email });
                    }
                    loadedColumns = await KanbanColumn.list('order_position');
                }
                
                const finalColumns = loadedColumns.filter(col => 
                    DEFAULT_COLUMNS.some(dc => dc.title === col.title)
                ).sort((a,b) => {
                    const orderA = DEFAULT_COLUMNS.find(dc => dc.title === a.title).order_position;
                    const orderB = DEFAULT_COLUMNS.find(dc => dc.title === b.title).order_position;
                    return orderA - orderB;
                });

                if (!loadedStats || loadedStats.length === 0) {
                     setLoadingMessage('Setting up stats...');
                     setLoadingProgress(80);
                     const newStats = await UserStats.create({ created_by: currentUser.email });
                     loadedStats = newStats ? [newStats] : [];
                }

                setColumns(finalColumns);
                setUserStats(loadedStats[0] || null);
                
                // Initialize columnTasksData with organized task data
                const initialColumnTasksData = {};
                finalColumns.forEach(col => {
                    initialColumnTasksData[col.title] = (loadedTasks || [])
                        .filter(task => task.column === col.title)
                        .sort((a, b) => a.order_position - b.order_position);
                });
                setColumnTasksData(initialColumnTasksData);
                
                setLoadingProgress(100);

            } catch (error) {
                console.error("Fatal initialization error:", error);
            } finally {
                setLoading(false);
            }
        };

        initializeApp();
    }, []);

    const handleDragEnd = useCallback(async (result) => {
        const { source, destination, draggableId } = result;
    
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    
        const sourceColId = source.droppableId;
        const destColId = destination.droppableId;
    
        // Create a deep copy to avoid mutation issues
        const newColumnTasksData = {};
        Object.keys(columnTasksData).forEach(colId => {
            newColumnTasksData[colId] = [...columnTasksData[colId]];
        });
        
        // Remove from source column
        const sourceTasks = newColumnTasksData[sourceColId];
        const taskIndex = sourceTasks.findIndex(task => task.id === draggableId);
        
        if (taskIndex === -1) {
            console.error('Task not found in source column');
            return;
        }
        
        const [movedTask] = sourceTasks.splice(taskIndex, 1);
        
        if (!movedTask) {
            console.error('Failed to remove task from source');
            return;
        }
        
        // Update task properties based on destination
        const updatedTask = { 
            ...movedTask, 
            column: destColId
        };
        
        // Handle completion status
        if (destColId === 'Done' && sourceColId !== 'Done') {
            updatedTask.completed = true;
            updatedTask.completed_at = new Date().toISOString();
        } else if (destColId === 'Archived' && sourceColId !== 'Archived') {
            updatedTask.completed = true;
            if (!movedTask.completed_at) {
                updatedTask.completed_at = new Date().toISOString();
            }
        } else if ((sourceColId === 'Done' || sourceColId === 'Archived') && 
                   (destColId !== 'Done' && destColId !== 'Archived')) {
            updatedTask.completed = false;
            updatedTask.completed_at = null;
        }
        
        // Add to destination column at the exact drop position
        const destTasks = newColumnTasksData[destColId];
        destTasks.splice(destination.index, 0, updatedTask);
        
        // CRITICAL FIX: Re-index ALL tasks in BOTH columns to ensure consistent order_position
        newColumnTasksData[sourceColId] = sourceTasks.map((task, idx) => ({
            ...task,
            order_position: idx
        }));
        
        newColumnTasksData[destColId] = destTasks.map((task, idx) => ({
            ...task,
            order_position: idx
        }));
        
        // Apply state update immediately for smooth UI
        setColumnTasksData(newColumnTasksData);
    
        // Backend update with the correct order_position
        try {
            const updatePayload = {
                column: destColId,
                order_position: destination.index,
                completed: updatedTask.completed,
                completed_at: updatedTask.completed_at,
            };
    
            await Task.update(draggableId, updatePayload);
            
            // ADDITIONAL FIX: Update order positions for all affected tasks in the destination column
            const destColumnTasks = newColumnTasksData[destColId];
            const updatePromises = destColumnTasks.map((task, index) => {
                if (task.id !== draggableId && task.order_position !== index) {
                    return Task.update(task.id, { order_position: index });
                }
                return Promise.resolve();
            });
            
            // Also update source column if it's different
            if (sourceColId !== destColId) {
                const sourceColumnTasks = newColumnTasksData[sourceColId];
                const sourceUpdatePromises = sourceColumnTasks.map((task, index) => {
                    if (task.order_position !== index) {
                        return Task.update(task.id, { order_position: index });
                    }
                    return Promise.resolve();
                });
                updatePromises.push(...sourceUpdatePromises);
            }
            
            // Execute all updates
            await Promise.all(updatePromises);
            
        } catch (error) {
            console.error('Failed to update task position:', error);
            showToast('Could not move task. Reverting.', 'error');
            // Revert to original state
            setColumnTasksData(columnTasksData);
        }
    }, [columnTasksData, showToast]);

    const handleAddTask = async ({ title, priority }) => {
        if (!title.trim() || !user) return;
        
        try {
            const backlogTasks = columnTasksData['Backlog'] || [];
            // Add to top (order_position 0)
            const newTask = await Task.create({
                title: title.trim(),
                column: 'Backlog',
                priority: priority,
                order_position: 0,
                created_by: user.email
            });
            
            if (newTask) {
                setColumnTasksData(prev => ({
                    ...prev,
                    'Backlog': [newTask, ...(prev['Backlog'] || [])]
                }));
                showToast(`Task "${title}" added!`, 'added');
            }
        } catch (error) {
            console.error('Failed to create task:', error);
            showToast('Failed to add task.', 'error');
        }
    };

    const handleDeleteTask = async (taskToDelete) => {
        try {
            await Task.delete(taskToDelete.id);
            
            setColumnTasksData(prev => ({
                ...prev,
                [taskToDelete.column]: (prev[taskToDelete.column] || []).filter(t => t.id !== taskToDelete.id)
            }));
            
            showToast(`Task "${taskToDelete.title}" deleted.`, 'deleted');
        } catch (error) {
            console.error('Failed to delete task:', error);
            showToast('Failed to delete task.', 'error');
        }
    };
    
    const handleQuickComplete = async (taskToComplete) => {
        try {
            const doneTasks = columnTasksData['Done'] || [];
            const newOrderPosition = doneTasks.length > 0 ? Math.max(...doneTasks.map(t => t.order_position)) + 1 : 0;

            const updatedTask = {
                ...taskToComplete,
                column: 'Done',
                completed: true,
                completed_at: new Date().toISOString(),
                order_position: newOrderPosition,
            };
            
            // Optimistic UI update
            setColumnTasksData(prev => ({
                ...prev,
                [taskToComplete.column]: (prev[taskToComplete.column] || []).filter(t => t.id !== taskToComplete.id),
                'Done': [...(prev['Done'] || []), updatedTask]
            }));
            
            showToast(`Task "${taskToComplete.title}" completed!`, 'success');

            await Task.update(taskToComplete.id, {
                column: 'Done',
                completed: true,
                completed_at: new Date().toISOString(),
                order_position: newOrderPosition,
            });
        } catch (error) {
            console.error('Failed to quick-complete task:', error);
            showToast('Failed to save completion. Reverting.', 'error');
            setColumnTasksData(columnTasksData);
        }
    };

    const todayCompleted = useMemo(() => {
        const doneTasks = columnTasksData['Done'] || [];
        return doneTasks.filter(t => isToday(t.completed_at)).length;
    }, [columnTasksData]);

    const derivedStats = useMemo(() => {
        if (!userStats) return null;
        const doneTasks = columnTasksData['Done'] || [];
        const archivedTasks = columnTasksData['Archived'] || [];
        const allCompletedTasks = [...doneTasks, ...archivedTasks];
        
        return {
            ...userStats,
            total_completed: allCompletedTasks.length,
            total_xp: calculateXPFromTasks(allCompletedTasks)
        };
    }, [columnTasksData, userStats]);
    
    const visibleColumns = useMemo(() => {
        return columns.filter(c => showArchived || c.title !== 'Archived');
    }, [columns, showArchived]);

    if (loading) {
        return <LoadingScreen progress={loadingProgress} message={loadingMessage} />;
    }

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="min-h-screen font-sans bg-[#F7F7F7] flex flex-col">
                <main className="flex-grow p-4 sm:p-6 lg:p-8 flex flex-col">
                    <Header
                        user={user}
                        todayCompleted={todayCompleted}
                        snapStreak={userStats?.snap_streak || 0}
                        onStatsOpen={() => setShowStats(true)}
                        onLeaderboardOpen={() => setIsLeaderboardOpen(true)}
                        onFocusModeOpen={() => setIsFocusModeOpen(true)}
                        onToggleArchived={() => setShowArchived(prev => !prev)}
                        isArchivedVisible={showArchived}
                        onToggleView={() => setIsKanbanView(prev => !prev)}
                        isKanbanView={isKanbanView}
                    />

                    <div className={`flex-grow w-full pb-4 ${isKanbanView ? 'overflow-x-auto overflow-y-hidden' : 'overflow-y-auto'}`}>
                        {isKanbanView ? (
                            <div className="flex gap-6 h-full">
                               {visibleColumns.map(column => (
                                    <KanbanColumnComponent
                                        key={column.id}
                                        column={column}
                                        tasks={columnTasksData[column.title] || []}
                                        onDeleteTask={handleDeleteTask}
                                        onQuickComplete={handleQuickComplete}
                                    />
                                ))}
                            </div>
                        ) : (
                             <TaskListView
                                columnTasksData={columnTasksData}
                                columns={visibleColumns}
                                onDeleteTask={handleDeleteTask}
                                onQuickComplete={handleQuickComplete}
                            />
                        )}
                    </div>
                    
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                        className="text-center pt-4 mt-auto border-t border-gray-200/30"
                    >
                        <button 
                            onClick={() => window.location.href = createPageUrl('Roadmap')}
                            className="text-xs text-gray-300 hover:text-gray-500 transition-colors font-light"
                        >
                            💡 Help shape FlowTask's future
                        </button>
                    </motion.div>
                </main>

                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="fixed bottom-8 right-8 z-40"
                >
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-gray-900 text-white rounded-2xl w-16 h-16 shadow-2xl flex items-center justify-center hover:bg-gray-700"
                    >
                        <Plus className="w-8 h-8" />
                    </Button>
                </motion.div>

                <Suspense fallback={null}>
                    <AnimatePresence>
                        {isModalOpen && <TaskCreationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddTask={handleAddTask} />}
                        {showStats && derivedStats && <StatsPanel userStats={derivedStats} isVisible={showStats} onClose={() => setShowStats(false)} />}
                        {isLeaderboardOpen && <LeaderboardModal isOpen={isLeaderboardOpen} onClose={() => setIsLeaderboardOpen(false)} />}
                        {isFocusModeOpen && <FocusTimer isVisible={isFocusModeOpen} onClose={() => setIsFocusModeOpen(false)} />}
                    </AnimatePresence>
                </Suspense>

                <Toast 
                    message={toast.message}
                    type={toast.type}
                    isVisible={toast.isVisible}
                    onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
                />
            </div>
        </DragDropContext>
    );
}
