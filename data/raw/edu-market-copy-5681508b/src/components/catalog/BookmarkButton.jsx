import React from "react";
import { motion } from "framer-motion";

export default function BookmarkButton({ courseId, isBookmarked, onToggle }) {
  return (
    <motion.button
      className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg border border-slate-200/60 flex items-center justify-center transition-all duration-200 hover:scale-110"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle(courseId, isBookmarked);
      }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Custom bookmark icon using uploaded image as inspiration */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        className={`transition-colors duration-200 ${
          isBookmarked ? 'text-red-500 fill-red-500' : 'text-slate-400 hover:text-blue-600'
        }`}
      >
        <path
          d="M19 21L12 16L5 21V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={isBookmarked ? 'currentColor' : 'none'}
        />
      </svg>
    </motion.button>
  );
}