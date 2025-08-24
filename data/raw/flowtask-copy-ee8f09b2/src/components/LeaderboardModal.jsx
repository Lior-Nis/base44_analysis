import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DailyRecord } from '@/api/entities';

const medalColors = [
    'text-amber-400', // Gold
    'text-slate-400', // Silver
    'text-amber-600'  // Bronze
];

export default function LeaderboardModal({ isOpen, onClose }) {
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            const fetchRecords = async () => {
                setIsLoading(true);
                try {
                    const topRecords = await DailyRecord.list('-completed_count', 5);
                    setRecords(topRecords);
                } catch (error) {
                    console.error("Failed to fetch leaderboard:", error);
                    setRecords([]);
                }
                setIsLoading(false);
            };
            fetchRecords();
        }
    }, [isOpen]);

    const formattedRecords = useMemo(() => {
        return records.map(record => ({
            ...record,
            formattedDate: new Date(record.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })
        }));
    }, [records]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                >
                    <div 
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    
                    <motion.div
                        initial={{ scale: 0.98, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.98, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="relative w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-gray-200/50"
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-500 hover:bg-gray-200 hover:text-gray-600 rounded-full"
                        >
                            <X className="w-5 h-5" />
                        </Button>

                        <div className="text-center mb-6">
                            <Trophy className="w-10 h-10 mx-auto text-amber-500 mb-2" />
                            <h2 className="text-2xl font-bold text-gray-900">Top Days</h2>
                            <p className="text-sm text-gray-500">Your most productive days ever.</p>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center items-center h-40">
                                <div className="w-6 h-6 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : formattedRecords.length === 0 ? (
                            <div className="text-center text-gray-500 py-10">
                                <p>No records yet.</p>
                                <p>Complete tasks to climb the ranks!</p>
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {formattedRecords.map((record, index) => (
                                    <li 
                                        key={record.id}
                                        className="flex items-center justify-between bg-gray-50/80 p-4 rounded-2xl border border-gray-100/90"
                                    >
                                        <div className="flex items-center gap-4">
                                            <Trophy className={`w-6 h-6 ${medalColors[index] || 'text-gray-400'}`} />
                                            <div>
                                                <p className="font-semibold text-gray-800">
                                                    {record.formattedDate}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-xl font-bold text-gray-900">{record.completed_count}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}