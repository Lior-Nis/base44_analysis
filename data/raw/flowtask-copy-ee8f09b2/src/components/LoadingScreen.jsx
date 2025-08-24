import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingScreen({ progress, message }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#F7F7F7] font-sans">
            <div className="text-center w-full max-w-sm px-4">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="text-2xl font-light tracking-tight text-gray-900 mb-6"
                >
                    FlowTask
                </motion.div>
                
                <div className="w-full bg-gray-200/70 rounded-full h-1.5 mb-3 overflow-hidden">
                    <motion.div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.4, ease: "circOut" }}
                    />
                </div>

                <motion.p
                    key={message}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="text-gray-600 text-sm"
                >
                    {message}
                </motion.p>
            </div>
        </div>
    );
}