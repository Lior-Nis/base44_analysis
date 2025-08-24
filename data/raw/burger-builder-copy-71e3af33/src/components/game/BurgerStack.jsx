import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BurgerIngredient from './BurgerIngredient';

const BurgerStack = ({ ingredients, onRemoveIngredient }) => {
  return (
    <div className="flex flex-col items-center justify-center relative h-full w-full">
      <motion.div 
        className="relative min-h-[200px] max-h-[250px] w-full flex flex-col-reverse items-center overflow-hidden"
        animate={{ y: [3, 0, 3] }} // Smaller motion on mobile
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      >
        <AnimatePresence>
          {ingredients.length > 0 ? (
            ingredients.map((ingredient, index) => (
              <motion.div
                key={`${ingredient}-${index}`}
                className="w-full max-w-[180px] -mb-2 z-10" 
                onClick={() => onRemoveIngredient(index)}
                layoutId={`${ingredient}-${index}`}
                layout
                // Improved touch feedback
                whileTap={{ scale: 0.95, opacity: 0.8 }}
                style={{ touchAction: 'manipulation' }}
              >
                <BurgerIngredient type={ingredient} />
              </motion.div>
            ))
          ) : (
            <motion.div
              className="text-center text-gray-400 mt-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-sm">Start adding ingredients</p>
              <div className="mb-6 text-xl">👇</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Plate */}
        <motion.div 
          className="rounded-full w-[200px] h-6 bg-slate-200 shadow-lg absolute -bottom-2"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
        />
      </motion.div>
    </div>
  );
};

export default BurgerStack;