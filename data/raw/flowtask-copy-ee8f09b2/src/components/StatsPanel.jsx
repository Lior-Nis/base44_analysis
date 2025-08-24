import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Avatar from './Avatar';

const LEVEL_THRESHOLDS = [
    { name: 'Novice', minXp: 0, emoji: '🌱' },
    { name: 'Beginner', minXp: 150, emoji: '🐣' },
    { name: 'Explorer', minXp: 350, emoji: '🦊' },
    { name: 'Achiever', minXp: 650, emoji: '🐺' },
    { name: 'Expert', minXp: 1100, emoji: '🦉' },
    { name: 'Master', minXp: 2000, emoji: '🦅' },
    { name: 'Champion', minXp: 3200, emoji: '🏆' },
    { name: 'Hero', minXp: 4700, emoji: '⚡' },
    { name: 'Legend', minXp: 6500, emoji: '🌟' },
    { name: 'Mythic', minXp: 8600, emoji: '🔥' },
    { name: 'Titan', minXp: 11000, emoji: '⚔️' },
    { name: 'Ascended', minXp: 13700, emoji: '👑' },
    { name: 'Divine', minXp: 16700, emoji: '💎' },
    { name: 'Eternal', minXp: 20000, emoji: '🌌' },
    { name: 'Transcendent', minXp: 23600, emoji: '✨' }
];

const LevelProgressBar = React.memo(({ totalXp }) => {
    const levelData = useMemo(() => {
        const currentLevelInfo = [...LEVEL_THRESHOLDS].reverse().find(l => totalXp >= l.minXp);
        if (!currentLevelInfo) return null;

        const currentLevelIndex = LEVEL_THRESHOLDS.findIndex(l => l.name === currentLevelInfo.name);
        const currentLevel = currentLevelIndex >= 0 ? currentLevelIndex + 1 : 1;
        const nextLevelInfo = LEVEL_THRESHOLDS.find(l => totalXp < l.minXp);
        
        const progress = nextLevelInfo 
            ? ((totalXp - currentLevelInfo.minXp) / (nextLevelInfo.minXp - currentLevelInfo.minXp)) * 100
            : 100;

        return { currentLevel, currentLevelInfo, nextLevelInfo, progress };
    }, [totalXp]);

    if (!levelData) return null;

    const { currentLevel, currentLevelInfo, nextLevelInfo, progress } = levelData;

    return (
        <div className="bg-gray-50 rounded-2xl p-4">
            <h3 className="font-semibold text-gray-800 mb-3 text-center">Level Progress</h3>
            <div className="text-center mb-3">
                <span className="text-2xl font-bold text-gray-900">Level {currentLevel}</span>
                {currentLevel >= 15 && <span className="text-xs text-amber-500 ml-2">MAX</span>}
            </div>
            <div className="relative h-2.5 bg-gray-200 rounded-full w-full">
                <motion.div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-cyan-500 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                />
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
                <span>{currentLevelInfo.emoji} {currentLevelInfo.name}</span>
                {nextLevelInfo && currentLevel < 15 ? (
                    <span>{nextLevelInfo.minXp - totalXp} XP to {nextLevelInfo.name}</span>
                ) : (
                    <span>Max Level! ✨</span>
                )}
            </div>
        </div>
    );
});

export default function StatsPanel({ userStats, isVisible, onClose }) {
    const currentLevel = useMemo(() => {
        if (!userStats || typeof userStats.total_xp === 'undefined') return 1;
        const currentLevelInfo = [...LEVEL_THRESHOLDS].reverse().find(l => userStats.total_xp >= l.minXp);
        if (!currentLevelInfo) return 1;
        const currentLevelIndex = LEVEL_THRESHOLDS.findIndex(l => l.name === currentLevelInfo.name);
        return currentLevelIndex >= 0 ? currentLevelIndex + 1 : 1;
    }, [userStats?.total_xp]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "linear" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
            
            <motion.div
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.98, opacity: 0 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-200/50 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-full z-10"
                >
                    <X className="w-5 h-5" />
                </Button>

                <div className="text-center mb-8">
                    <Avatar 
                        level={currentLevel}
                        totalCompleted={userStats?.total_completed || 0}
                        accessories={userStats?.avatar_accessories || []}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
                    <div className="bg-blue-50 rounded-2xl p-4 text-center">
                        <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-900">{userStats?.total_completed || 0}</p>
                        <p className="text-sm text-blue-600">Total Done</p>
                    </div>
                    
                    <div className="bg-amber-50 rounded-2xl p-4 text-center">
                        <Zap className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-amber-900">{userStats?.total_xp || 0}</p>
                        <p className="text-sm text-amber-600">Total XP</p>
                    </div>
                </div>

                <LevelProgressBar totalXp={userStats?.total_xp || 0} />
            </motion.div>
        </motion.div>
    );
}