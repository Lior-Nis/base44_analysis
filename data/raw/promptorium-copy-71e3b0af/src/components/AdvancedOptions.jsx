import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, SlidersHorizontal } from 'lucide-react';

export default function AdvancedOptions({ settings, onSettingsChange, isOpen, setIsOpen, t }) {

  const optionsConfig = {
    tone: { label: t.advOptTone, values: t.advOptToneValues },
    length: { label: t.advOptLength, values: t.advOptLengthValues },
    format: { label: t.advOptFormat, values: t.advOptFormatValues },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="overflow-hidden"
        >
          <div className="magic-border rounded-2xl p-6 mt-6 mb-6" style={{ background: 'var(--bg-tertiary)' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold flex items-center gap-3" style={{ color: 'var(--text-secondary)' }}>
                <SlidersHorizontal className="w-5 h-5" />
                {t.advOptTitle}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full hover:bg-white/5">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(optionsConfig).map(([key, { label, values }]) => (
                <div key={key}>
                  <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>{label}</label>
                  <div className="flex flex-wrap gap-2">
                    {values.map(value => (
                      <button
                        key={value}
                        onClick={() => onSettingsChange(key, value)}
                        className={`px-3 py-1 text-sm rounded-full transition-all duration-200 ${
                          settings[key] === value
                            ? 'font-semibold text-white'
                            : 'text-slate-400 hover:bg-white/10'
                        }`}
                        style={{
                            background: settings[key] === value ? 'var(--gradient-magic)' : 'rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}