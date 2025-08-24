import React, { useState, useEffect, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CornerDownLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TaskCreationModal = memo(({ isOpen, onClose, onAddTask }) => {
    const [title, setTitle] = useState('');
    const [priority, setPriority] = useState('medium');
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
        } else {
            setTitle('');
            setPriority('medium');
        }
    }, [isOpen]);

    const handleSubmit = () => {
        if (title.trim()) {
            onAddTask({ title, priority });
            onClose();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
    };

    const priorityOptions = [
        { level: 'low', label: 'Low', color: '#3b82f6' },
        { level: 'medium', label: 'Medium', color: '#f97316' },
        { level: 'high', label: 'High', color: '#ef4444' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
        >
            <div 
                className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                onClick={onClose}
            />
            
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative w-full max-w-lg m-6"
            >
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200/50">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-full"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                    
                    <input
                        ref={inputRef}
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="New task..."
                        className="w-full bg-transparent text-3xl font-medium placeholder:text-gray-300 focus:outline-none mb-8"
                    />
                    
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-2xl">
                            {priorityOptions.map(opt => (
                                <button
                                    key={opt.level}
                                    onClick={() => setPriority(opt.level)}
                                    className="relative px-4 py-2 text-sm font-medium rounded-[14px] transition-colors"
                                    style={{ 
                                        color: priority === opt.level ? 'white' : 'black',
                                        backgroundColor: priority === opt.level ? opt.color : 'transparent'
                                    }}
                                >
                                    <span className="relative z-10">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                        
                        <Button
                            onClick={handleSubmit}
                            disabled={!title.trim()}
                            className="bg-gray-900 text-white rounded-2xl hover:bg-gray-700 px-6 py-3 flex items-center justify-center gap-2 shadow-lg disabled:bg-gray-300 touch-manipulation transition-colors duration-150"
                        >
                            <CornerDownLeft className="w-4 h-4" />
                            <span>Add</span>
                        </Button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
});

TaskCreationModal.displayName = 'TaskCreationModal';

export default TaskCreationModal;