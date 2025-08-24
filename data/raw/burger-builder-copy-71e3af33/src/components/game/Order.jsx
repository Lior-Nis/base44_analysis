import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { ingredientStyles } from './BurgerIngredient'; 

const ingredientDisplayInfo = Object.keys(ingredientStyles).reduce((acc, key) => {
  let emoji = '🍔'; 
  let color = 'text-gray-700'; 
  switch (key) {
    case 'top_bun': case 'bottom_bun': emoji = '🍞'; color = 'text-amber-600'; break;
    case 'patty': emoji = '🥩'; color = 'text-amber-900'; break;
    case 'cheese': emoji = '🧀'; color = 'text-yellow-400'; break;
    case 'lettuce': emoji = '🥬'; color = 'text-green-500'; break;
    case 'tomato': emoji = '🍅'; color = 'text-red-500'; break;
    case 'onion': emoji = '🧅'; color = 'text-purple-300'; break;
    case 'pickle': emoji = '🥒'; color = 'text-green-600'; break;
    case 'bacon': emoji = '🥓'; color = 'text-red-700'; break;
    case 'egg': emoji = '🍳'; color = 'text-yellow-200'; break;
    case 'mushroom': emoji = '🍄'; color = 'text-stone-300'; break;
    case 'avocado': emoji = '🥑'; color = 'text-green-300'; break;
  }
  acc[key] = { base: ingredientStyles[key].name, emoji, color };
  return acc;
}, {});

const customerPhrases = [
  "I want",
  "Make me",
  "I'd like",
  "Give me",
  "I need",
  "Craving",
  "Hungry for",
  "Quick! I need"
];

const Order = ({ orderIngredients, timer, isActive, isSpeeding, initialOrderTime }) => {
  const [progress, setProgress] = useState(100);
  const [activePhraseIndex] = useState(Math.floor(Math.random() * customerPhrases.length));

  useEffect(() => {
    if (isActive && timer >= 0 && initialOrderTime > 0) {
      setProgress((timer / initialOrderTime) * 100);
    } else if (isActive && timer <= 0) {
      setProgress(0);
    }
  }, [timer, isActive, initialOrderTime]);

  const formatOrderText = () => {
    return orderIngredients.map((ingredientKey, index) => {
      const info = ingredientDisplayInfo[ingredientKey];
      if (!info) {
        return <span key={index} className="text-gray-700 font-medium"> {ingredientKey} </span>;
      }
      return (
        <motion.span 
          key={index}
          className={`inline-flex items-center ${info.color} mx-0.5 whitespace-nowrap`}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * index }}
        >
          <span className="mr-0.5">{info.emoji}</span>
          <span className="font-medium text-xs">{info.base}</span>
        </motion.span>
      );
    });
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-lg p-2 w-full mb-2"
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 30, opacity: 0 }}
    >
      <div className="flex items-start gap-2">
        <motion.div 
          className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-lg flex-shrink-0"
          animate={{ rotate: isActive ? [0, 5, 0, -5, 0] : 0 }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        >
          {['👨‍🦰', '👩‍🦱', '👨‍🦱', '👩', '🧔‍♂️'][Math.floor(Math.random() * 5)]}
        </motion.div>
        
        <div className="flex-1">
          <div className="bg-amber-50 p-2 rounded-lg rounded-tl-none shadow-sm relative mb-1">
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-amber-50 transform rotate-45"></div>
            <p className="text-xs text-gray-800 mb-1">
              {customerPhrases[activePhraseIndex]}:
            </p>
            <div className="flex flex-wrap gap-0.5 text-xs">
              {formatOrderText()}
            </div>
          </div>
          
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
            <motion.div 
              className={`h-full ${
                progress > 60 ? 'bg-green-500' : 
                progress > 30 ? 'bg-yellow-500' : 
                'bg-red-500'
              }`}
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "linear" }}
            />
          </div>
          
          <div className="flex justify-between items-center mt-0.5">
            <div className="flex items-center">
              <Clock className={`w-3 h-3 ${timer <= 10 ? 'text-red-500 animate-pulse' : 'text-gray-500'} mr-0.5`} />
              <span className={`text-xs ${timer <= 10 ? 'text-red-500 font-bold' : 'text-gray-500'}`}>
                {timer}s
              </span>
            </div>
            
            {isSpeeding && (
              <motion.span 
                className="text-xs text-orange-500 font-semibold"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                Faster! 🔥
              </motion.span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Order;