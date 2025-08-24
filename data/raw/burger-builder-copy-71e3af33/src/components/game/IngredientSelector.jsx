import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import BurgerIngredient, { ingredientStyles } from './BurgerIngredient';

const IngredientSelector = ({ onSelect, isDisabled, shake, availableIngredients }) => {
  const handleIngredientClick = (ingredient) => {
    if (!isDisabled) {
      onSelect(ingredient);
    }
  };

  const organizeIngredients = (ingredientsToOrganize) => {
    const order = [
      'bottom_bun', 'patty', 'cheese', 'bacon', 'egg', 'lettuce', 
      'tomato', 'onion', 'pickle', 'avocado', 'mushroom', 'top_bun'
    ];
    
    return [...ingredientsToOrganize].sort((a, b) => {
      const indexA = order.indexOf(a);
      const indexB = order.indexOf(b);
      
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
  };

  const gridRef = useRef(null);
  // Removed useEffect for scrollTop as scrolling is disabled

  const sortedIngredients = organizeIngredients(availableIngredients || []);

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-lg p-2 w-full flex-1 flex flex-col overflow-hidden" // Keep overflow-hidden on the component root
      animate={{ x: shake ? [0, -5, 5, -5, 5, 0] : 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* <h3 className="text-sm font-semibold mb-1 text-center text-gray-700">Ingredients</h3> Removed this line */}
      
      <div 
        ref={gridRef}
        className="grid grid-cols-4 gap-1.5 flex-1 pr-1" // Removed overflow-y-auto and no-scrollbar
      >
        {(sortedIngredients && sortedIngredients.length > 0) ? (
          sortedIngredients.map(ingredientKey => {
            const ingredientData = ingredientStyles[ingredientKey];
            if (!ingredientData) return null;
            
            return (
              <motion.button
                key={ingredientKey}
                className={`relative flex flex-col items-center p-1 rounded-lg border-2 ${
                  isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 
                  ingredientKey === 'top_bun' || ingredientKey === 'bottom_bun' ? 
                  'border-amber-300 bg-amber-50 hover:bg-amber-100' : 
                  'hover:border-amber-400 bg-amber-50 hover:bg-amber-100 border-gray-200'
                } flex justify-center items-center h-16`} // Reduced height from h-20 to h-16
                whileHover={!isDisabled ? { scale: 1.03 } : {}}
                whileTap={!isDisabled ? { scale: 0.97 } : {}}
                onClick={() => handleIngredientClick(ingredientKey)}
                style={{ touchAction: "manipulation" }}
              >
                {/* This div centers the scaled ingredient. mb-1 to give space from text. flex-1 ensures it takes available vertical space */}
                <div className="mb-1 flex-1 w-full flex items-center justify-center">
                  {/* Scale down the BurgerIngredient visual */}
                  <div style={{ transform: 'scale(0.65)', transformOrigin: 'center', width: '100%', height: '100%' }} className="flex items-center justify-center">
                    <BurgerIngredient type={ingredientKey} />
                  </div>
                </div>
                <span className="text-[9px] text-center font-medium text-gray-700 line-clamp-1 w-full absolute bottom-1 left-0 right-0"> {/* Ensure text is full width and at bottom */}
                  {ingredientData.name}
                </span>
              </motion.button>
            );
          })
        ) : (
          <p className="col-span-full text-center text-gray-500 py-4">No ingredients available</p>
        )}
      </div>
    </motion.div>
  );
};

export default IngredientSelector;