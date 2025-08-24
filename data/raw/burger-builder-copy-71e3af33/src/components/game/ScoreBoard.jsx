import React from 'react';
import { motion } from 'framer-motion';
import { Award, Star, Clock, Zap, Layers, PauseCircle, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ScoreBoard = ({ score, level, completedOrders, timeLeft, isPaused, onTogglePause, isDisabled }) => {
  return (
    <motion.div 
      className="bg-gradient-to-r from-amber-500 to-amber-600 shadow-lg w-full overflow-hidden"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="w-full px-2 sm:px-4 py-1 sm:py-3">
        <div className="flex justify-between items-center mb-1 sm:mb-2">
          <h2 className="text-sm sm:text-lg font-bold flex items-center text-white">
            <Award className="w-3.5 h-3.5 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            Score Board
          </h2>
          <div className="flex items-center gap-1.5 sm:gap-3">
            <div className="text-white/80 text-xs sm:text-sm font-medium">
              Level: {level}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onTogglePause}
              className="flex items-center h-6 sm:h-8 bg-white/10 hover:bg-white/20 text-white py-0 px-1 sm:px-2"
              disabled={isDisabled}
            >
              {isPaused ? (
                <><PlayCircle className="w-3.5 h-3.5 mr-1" /> <span className="hidden xs:inline">Resume</span></>
              ) : (
                <><PauseCircle className="w-3.5 h-3.5 mr-1" /> <span className="hidden xs:inline">Pause</span></>
              )}
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-4 w-full bg-white/10 backdrop-blur-sm p-1 sm:p-2 border-t border-white/20">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center text-amber-100 mb-0 sm:mb-0.5">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
              <span className="text-[8px] sm:text-[10px] font-medium">Score</span>
            </div>
            <span className="text-base sm:text-lg font-bold text-white tracking-wide">{score}</span>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center text-amber-100 mb-0 sm:mb-0.5">
              <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
              <span className="text-[8px] sm:text-[10px] font-medium">Level</span>
            </div>
            <span className="text-base sm:text-lg font-bold text-white tracking-wide">{level}</span>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center text-amber-100 mb-0 sm:mb-0.5">
              <Layers className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
              <span className="text-[8px] sm:text-[10px] font-medium">Orders</span>
            </div>
            <span className="text-base sm:text-lg font-bold text-white tracking-wide">{completedOrders}</span>
          </div>
          
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center text-amber-100 mb-0 sm:mb-0.5">
              <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
              <span className="text-[8px] sm:text-[10px] font-medium">Time</span>
            </div>
            <span className="text-base sm:text-lg font-bold text-white tracking-wide">{timeLeft}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ScoreBoard;