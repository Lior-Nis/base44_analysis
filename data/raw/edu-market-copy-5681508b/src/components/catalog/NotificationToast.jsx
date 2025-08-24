import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";

export default function NotificationToast({ show, type, message, onClose }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div
            className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-xl border-2 ${
              type === 'success' 
                ? 'bg-emerald-500 border-emerald-400 text-white' 
                : 'bg-red-500 border-red-400 text-white'
            }`}
          >
            {type === 'success' ? (
              <CheckCircle className="w-6 h-6 text-white" />
            ) : (
              <XCircle className="w-6 h-6 text-white" />
            )}
            <span className="font-semibold text-lg">
              {type === 'success' 
                ? 'The item has been added successfully!' 
                : 'It did not add successfully!'
              }
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}