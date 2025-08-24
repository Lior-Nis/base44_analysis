import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useTheme } from "./theme-provider";

const illustrations = {
  noData: (
    <svg width="200" height="150" viewBox="0 0 200 150" className="mx-auto">
      <defs>
        <linearGradient id="emptyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <rect width="200" height="150" fill="url(#emptyGrad)" rx="20" />
      <circle cx="100" cy="60" r="20" fill="#e5e7eb" />
      <rect x="70" y="90" width="60" height="4" fill="#e5e7eb" rx="2" />
      <rect x="80" y="100" width="40" height="4" fill="#e5e7eb" rx="2" />
    </svg>
  ),
  noResults: (
    <svg width="200" height="150" viewBox="0 0 200 150" className="mx-auto">
      <defs>
        <linearGradient id="searchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <rect width="200" height="150" fill="url(#searchGrad)" rx="20" />
      <circle cx="85" cy="60" r="25" fill="none" stroke="#94a3b8" strokeWidth="3" />
      <line x1="105" y1="80" x2="125" y2="100" stroke="#94a3b8" strokeWidth="3" />
      <text x="100" y="130" textAnchor="middle" fill="#64748b" fontSize="12">לא נמצא</text>
    </svg>
  ),
  loading: (
    <svg width="200" height="150" viewBox="0 0 200 150" className="mx-auto">
      <defs>
        <linearGradient id="loadingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <rect width="200" height="150" fill="url(#loadingGrad)" rx="20" />
      <motion.circle
        cx="100"
        cy="75"
        r="15"
        fill="none"
        stroke="#a855f7"
        strokeWidth="3"
        strokeLinecap="round"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </svg>
  )
};

const animations = {
  float: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  pulse: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export default function EmptyState({
  type = 'noData',
  title,
  description,
  actionText,
  onAction,
  language = 'he',
  className = "",
  animated = true
}) {
  const { themeClasses } = useTheme();

  const defaultMessages = {
    he: {
      noData: {
        title: "אין נתונים עדיין",
        description: "כאן יופיעו הנתונים שלך ברגע שתתחיל"
      },
      noResults: {
        title: "לא נמצאו תוצאות",
        description: "נסה לשנות את מונחי החיפוש או הסינון"
      },
      loading: {
        title: "טוען נתונים...",
        description: "אנא המתן בזמן שאנחנו מכינים עבורך את המידע"
      }
    },
    en: {
      noData: {
        title: "No data yet",
        description: "Your data will appear here once you get started"
      },
      noResults: {
        title: "No results found", 
        description: "Try adjusting your search or filter criteria"
      },
      loading: {
        title: "Loading data...",
        description: "Please wait while we prepare your information"
      }
    }
  };

  const messages = defaultMessages[language][type];
  const finalTitle = title || messages.title;
  const finalDescription = description || messages.description;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center py-12 px-6 ${className}`}
    >
      <motion.div
        animate={animated ? animations.float : {}}
        className="mb-6"
      >
        {illustrations[type]}
      </motion.div>

      <motion.div
        animate={animated ? animations.pulse : {}}
      >
        <h3 className={`text-xl font-semibold mb-3 ${themeClasses.textPrimary}`}>
          {finalTitle}
        </h3>
        <p className={`text-sm mb-6 max-w-md mx-auto leading-relaxed ${themeClasses.textSecondary}`}>
          {finalDescription}
        </p>

        {actionText && onAction && (
          <Button
            onClick={onAction}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {actionText}
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
}