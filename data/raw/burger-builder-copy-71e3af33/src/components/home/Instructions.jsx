import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RotateCcw, ArrowRight, Clock, Award, Zap, HelpCircle } from 'lucide-react'; // Added HelpCircle

const Instructions = ({ onBack }) => {
  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-lg w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-white">
        <h2 className="text-2xl font-bold flex items-center">
          <HelpCircle className="mr-2 w-6 h-6" /> {/* Changed Icon */}
          How to Play?
        </h2>
      </div>

      <div className="p-6">
        <div className="space-y-6">
          <motion.div 
            className="flex gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <span className="text-2xl">🍔</span>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Build Burgers Fast</h3>
              <p className="text-gray-600">
                The goal is to build burgers according to customer orders quickly and efficiently.
              </p>
            </div>
          </motion.div>

          <motion.div 
            className="flex gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Time is Ticking</h3>
              <p className="text-gray-600">
                Each order has a timer. The faster you are, the more points you get!
              </p>
            </div>
          </motion.div>

          <motion.div 
            className="flex gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <Zap className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Complete Levels</h3>
              <p className="text-gray-600">
                With each level you pass, orders get more complex and the challenge increases.
              </p>
            </div>
          </motion.div>

          <motion.div 
            className="flex gap-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <Award className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Rack Up Points</h3>
              <p className="text-gray-600">
                Earn points for each successful order and claim your spot on the high score table!
              </p>
            </div>
          </motion.div>

          <motion.div
            className="p-4 bg-amber-50 rounded-lg border border-amber-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="font-bold mb-2 flex items-center">
              <RotateCcw className="w-5 h-5 mr-2 text-amber-600" />
              Game Tips:
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Place ingredients in the correct order - bottom bun, fillings, top bun.</li>
              <li>Pay attention to special customer requests in higher levels.</li>
              <li>It's often easier to start with larger ingredients then add smaller ones.</li>
              <li>If you make a mistake, click on an ingredient in the stack to remove it.</li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button 
            className="w-full bg-amber-500 hover:bg-amber-600" 
            onClick={onBack}
          >
            Back to Menu
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Instructions;