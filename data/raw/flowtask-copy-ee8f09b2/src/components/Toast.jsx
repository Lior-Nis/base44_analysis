import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Plus, X, Trash2 } from 'lucide-react';

const Toast = ({ message, type, isVisible, onClose }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'added':
                return <Plus className="w-5 h-5 text-blue-600" />;
            case 'deleted':
                return <Trash2 className="w-5 h-5 text-red-600" />;
            default:
                return null;
        }
    };

    const getBgColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'added':
                return 'bg-blue-50 border-blue-200';
            case 'deleted':
                return 'bg-red-50 border-red-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    return (
        <div className="fixed inset-0 z-50 pointer-events-none">
            <div className="flex items-start justify-center h-full pt-6">
                <AnimatePresence>
                    {isVisible && (
                        <motion.div
                            initial={{ opacity: 0, y: -50, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -50, scale: 0.95 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="pointer-events-auto"
                        >
                            <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg border backdrop-blur-sm ${getBgColor()}`}>
                                {getIcon()}
                                <span className="text-sm font-medium text-gray-800">{message}</span>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Toast;