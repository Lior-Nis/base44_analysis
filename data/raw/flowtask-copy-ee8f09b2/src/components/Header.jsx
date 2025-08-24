
import React, { memo } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Trophy, BarChart3, Timer, Archive, List, LayoutGrid } from 'lucide-react';

const Header = memo(({ user, todayCompleted, snapStreak, onStatsOpen, onLeaderboardOpen, onFocusModeOpen, onToggleArchived, isArchivedVisible, onToggleView, isKanbanView }) => {
    const dailyGoal = 10;
    const progress = Math.min((todayCompleted / dailyGoal) * 100, 100);
    const firstName = user?.full_name?.split(' ')[0] || 'Your';
    const boardTitle = `${firstName}'s Flow`;

    return (
        <div className="pt-6 sm:pt-10 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl sm:text-4xl font-light text-gray-900 tracking-tight">{boardTitle}</h1>
                    <AnimatePresence>
                    {snapStreak > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.8 }}
                            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-full shadow-lg"
                        >
                            <Flame className="w-4 h-4" />
                            <span className="font-bold text-sm">{snapStreak}</span>
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>
                <div className="flex items-center gap-1 bg-gray-100/80 rounded-2xl p-1">
                    <button 
                        onClick={onToggleView} 
                        className={`p-2 transition-colors rounded-xl text-gray-500 hover:text-gray-800`} 
                        title={isKanbanView ? "Switch to List View" : "Switch to Kanban View"}
                    >
                        {isKanbanView ? (
                            <List className="w-5 h-5" />
                        ) : (
                            <LayoutGrid className="w-5 h-5" />
                        )}
                    </button>
                    <button onClick={onFocusModeOpen} className="p-2 text-gray-500 hover:text-gray-800 transition-colors rounded-xl" title="Focus Timer">
                        <Timer className="w-5 h-5" />
                    </button>
                    <button onClick={onStatsOpen} className="p-2 text-gray-500 hover:text-gray-800 transition-colors rounded-xl" title="My Stats">
                        <BarChart3 className="w-5 h-5" />
                    </button>
                    <button onClick={onLeaderboardOpen} className="p-2 text-gray-500 hover:text-gray-800 transition-colors rounded-xl" title="Leaderboard">
                        <Trophy className="w-5 h-5" />
                    </button>
                    <button onClick={onToggleArchived} className={`p-2 transition-colors rounded-xl ${isArchivedVisible ? 'text-blue-600 bg-blue-100' : 'text-gray-500 hover:text-gray-800'}`} title="Toggle Archived">
                        <Archive className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div>
                <div className="flex justify-between items-center text-sm mb-2">
                    <span className="font-medium text-gray-600">Daily Goal</span>
                    <span className="text-gray-500">{todayCompleted}/10</span>
                </div>
                <div className="h-1.5 bg-gray-200/70 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ type: "spring", stiffness: 200, damping: 25, duration: 0.4 }}
                    />
                </div>
                <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">
                        {todayCompleted >= 10 ? '🎉 Goal achieved!' : `${10 - todayCompleted} tasks left for today`}
                    </p>
                </div>
            </div>
        </div>
    );
});

Header.displayName = 'Header';

export default Header;
