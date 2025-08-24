import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FocusTimer = ({ isVisible, onClose, onTimerComplete }) => {
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
    const [isRunning, setIsRunning] = useState(false);
    const [mode, setMode] = useState('focus'); // 'focus', 'shortBreak', 'longBreak'
    const [sessions, setSessions] = useState(0);

    const modes = useMemo(() => ({
        focus: { duration: 25 * 60, label: 'Focus Time', color: 'from-red-500 to-orange-500' },
        shortBreak: { duration: 5 * 60, label: 'Short Break', color: 'from-green-500 to-emerald-500' },
        longBreak: { duration: 15 * 60, label: 'Long Break', color: 'from-blue-500 to-indigo-500' }
    }), []);

    const formatTime = useCallback((seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    const startTimer = useCallback(() => {
        setIsRunning(true);
    }, []);

    const pauseTimer = useCallback(() => {
        setIsRunning(false);
    }, []);

    const resetTimer = useCallback(() => {
        setIsRunning(false);
        setTimeLeft(modes[mode].duration);
    }, [mode, modes]);

    const switchMode = useCallback((newMode) => {
        setMode(newMode);
        setTimeLeft(modes[newMode].duration);
        setIsRunning(false);
    }, [modes]);

    const progressPercentage = useMemo(() => {
        return ((modes[mode].duration - timeLeft) / modes[mode].duration) * 100;
    }, [modes, mode, timeLeft]);

    useEffect(() => {
        let interval = null;
        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(time => time - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsRunning(false);
            if (mode === 'focus') {
                setSessions(prev => prev + 1);
                onTimerComplete?.();
                // Auto-switch to break
                const nextMode = sessions > 0 && (sessions + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
                switchMode(nextMode);
            }
        }
        return () => clearInterval(interval);
    }, [isRunning, timeLeft, mode, sessions, onTimerComplete, switchMode]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            
            <motion.div
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.98, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50 w-full max-w-md"
            >
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-full"
                >
                    <X className="w-5 h-5" />
                </Button>

                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Clock className="w-6 h-6 text-gray-600" />
                        <h2 className="text-2xl font-bold text-gray-900">Focus Mode</h2>
                    </div>
                    <p className="text-gray-500">{modes[mode].label}</p>
                </div>

                <div className="relative mb-8">
                    <div className="w-48 h-48 mx-auto relative">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                className="text-gray-200"
                            />
                            <circle
                                cx="50"
                                cy="50"
                                r="45"
                                stroke="url(#gradient)"
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 45}`}
                                strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercentage / 100)}`}
                                className="transition-all duration-300 ease-out"
                            />
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" className={`stop-color-gradient-from bg-gradient-to-r ${modes[mode].color}`} />
                                    <stop offset="100%" className={`stop-color-gradient-to bg-gradient-to-r ${modes[mode].color}`} />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-4xl font-mono font-bold text-gray-900">
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center gap-3 mb-6">
                    {!isRunning ? (
                        <Button
                            onClick={startTimer}
                            className={`bg-gradient-to-r ${modes[mode].color} text-white px-6 py-3 rounded-2xl hover:opacity-90`}
                        >
                            <Play className="w-5 h-5 mr-2" />
                            Start
                        </Button>
                    ) : (
                        <Button
                            onClick={pauseTimer}
                            variant="outline"
                            className="px-6 py-3 rounded-2xl"
                        >
                            <Pause className="w-5 h-5 mr-2" />
                            Pause
                        </Button>
                    )}
                    <Button
                        onClick={resetTimer}
                        variant="outline"
                        className="px-6 py-3 rounded-2xl"
                    >
                        <Square className="w-5 h-5 mr-2" />
                        Reset
                    </Button>
                </div>

                <div className="flex justify-center gap-2">
                    {Object.entries(modes).map(([key, modeData]) => (
                        <button
                            key={key}
                            onClick={() => switchMode(key)}
                            className={`px-3 py-2 text-sm rounded-xl transition-colors ${
                                mode === key 
                                    ? 'bg-gray-900 text-white' 
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {modeData.label}
                        </button>
                    ))}
                </div>

                {sessions > 0 && (
                    <div className="text-center mt-4 text-sm text-gray-500">
                        Sessions completed: {sessions}
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default FocusTimer;