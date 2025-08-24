import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Zap, Award, ArrowRight, Gift } from 'lucide-react'; // Gift for bonus
import confetti from 'canvas-confetti';

const LevelCompleteModal = ({ isOpen, level, score, bonusPoints, onContinue }) => {
  React.useEffect(() => {
    if (isOpen) {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FCD34D', '#F59E0B', '#FBBF24']
        });
        
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#FCD34D', '#F59E0B', '#FBBF24']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', bounce: 0.4 }}
          >
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-white text-center">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.6, type: 'spring' }}
                className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center mb-3"
              >
                <Zap className="w-10 h-10 text-amber-500" />
              </motion.div>
              <motion.h2 
                className="text-2xl font-bold"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Level {level} Complete!
              </motion.h2>
              <motion.p 
                className="text-amber-100 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Well done! You're mastering the kitchen!
              </motion.p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <motion.div 
                  className="flex flex-col items-center p-4 bg-amber-50 rounded-lg"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Award className="w-6 h-6 text-amber-500 mb-1" />
                  <span className="text-sm text-gray-500">Current Score</span>
                  <span className="text-xl font-bold">{score}</span>
                </motion.div>
                
                <motion.div 
                  className="flex flex-col items-center p-4 bg-green-50 rounded-lg"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Gift className="w-6 h-6 text-green-500 mb-1" /> {/* Changed icon */}
                  <span className="text-sm text-gray-500">Level Bonus</span>
                  <motion.span 
                    className="text-xl font-bold text-green-600"
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  >
                    +{bonusPoints}
                  </motion.span>
                </motion.div>
              </div>

              <motion.div 
                className="p-4 bg-amber-100 rounded-lg mb-6 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <p className="text-amber-800">
                  <span className="font-bold">Next Level:</span> The challenges are getting tougher!
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <Button 
                  className="w-full bg-amber-500 hover:bg-amber-600" 
                  onClick={onContinue}
                >
                  Continue to Next Level
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LevelCompleteModal;