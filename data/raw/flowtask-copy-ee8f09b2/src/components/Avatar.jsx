import React from 'react';

const LEVEL_THRESHOLDS = [
    { name: 'Novice', minXp: 0, emoji: '🌱' },
    { name: 'Beginner', minXp: 150, emoji: '🐣' },
    { name: 'Explorer', minXp: 350, emoji: '🦊' },
    { name: 'Achiever', minXp: 650, emoji: '🐺' },
    { name: 'Expert', minXp: 1100, emoji: '🦉' },
    { name: 'Master', minXp: 1700, emoji: '🦅' },
    { name: 'Champion', minXp: 2500, emoji: '🏆' },
    { name: 'Hero', minXp: 3500, emoji: '⚡' },
    { name: 'Legend', minXp: 4800, emoji: '🌟' },
    { name: 'Mythic', minXp: 6400, emoji: '🔥' },
    { name: 'Titan', minXp: 8300, emoji: '⚔️' },
    { name: 'Ascended', minXp: 10600, emoji: '👑' },
    { name: 'Divine', minXp: 13300, emoji: '💎' },
    { name: 'Eternal', minXp: 16500, emoji: '🌌' },
    { name: 'Transcendent', minXp: 20300, emoji: '✨' }
];

export default function Avatar({ level, totalCompleted, accessories }) {
    const totalXp = (level - 1) * 100; // Approximate XP from level
    const currentLevelInfo = [...LEVEL_THRESHOLDS].reverse().find(l => totalXp >= l.minXp) || LEVEL_THRESHOLDS[0];
    
    const emoji = currentLevelInfo.emoji;
    const name = currentLevelInfo.name;

    const getAura = () => {
        if (level >= 25) return '✨';
        if (level >= 15) return '⭐';
        if (level >= 10) return '💫';
        return '';
    };

    return (
        <div className="relative">
            <div className="text-6xl">
                {emoji}
            </div>
            
            {getAura() && (
                <div className="absolute -inset-4 text-2xl flex items-center justify-center">
                    {getAura()}
                </div>
            )}
            
            <div className="text-center mt-2">
                <p className="text-sm font-medium text-gray-700">{name}</p>
                <p className="text-xs text-gray-500">Level {level}{level >= 30 ? ' (MAX)' : ''}</p>
            </div>
        </div>
    );
}