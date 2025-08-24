import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, X, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AchievementBanner({ 
  achievement, 
  isVisible, 
  onClose 
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        setShow(false);
        onClose?.();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const handleClose = () => {
    setShow(false);
    onClose?.();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4"
        >
          <Card className="border-0 shadow-2xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-white overflow-hidden">
            <CardContent className="p-6 relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="absolute top-2 right-2 text-white hover:bg-white/20 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="text-3xl">{achievement?.icon}</div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="w-5 h-5" />
                    <span className="font-bold text-sm">ACHIEVEMENT UNLOCKED!</span>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{achievement?.title}</h3>
                  <p className="text-white/90 text-sm">{achievement?.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Star className="w-4 h-4" />
                    <span className="font-semibold">+{achievement?.points} points</span>
                  </div>
                </div>
              </div>

              {/* Sparkle animation */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white rounded-full"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: [0, 1, 0], 
                      scale: [0, 1, 0],
                      x: Math.random() * 300,
                      y: Math.random() * 100
                    }}
                    transition={{ 
                      duration: 2, 
                      delay: i * 0.2,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}