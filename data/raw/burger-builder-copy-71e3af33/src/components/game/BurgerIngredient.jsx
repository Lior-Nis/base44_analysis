
import React from 'react';
import { motion } from 'framer-motion';

// Map of ingredient types to their visual properties
const ingredientStyles = {
  top_bun: {
    name: 'Top Bun',
    className: "bg-amber-300 rounded-t-full h-12 md:h-14 w-full relative border-b-4 border-amber-400", // Reduced height: h-12, md:h-14
    before: "absolute bottom-0 left-0 right-0 h-1 bg-amber-500 opacity-30"
  },
  bottom_bun: {
    name: 'Bottom Bun',
    className: "bg-amber-300 rounded-b-full h-10 md:h-10 w-full relative border-t-2 border-amber-400", // Reduced height: h-10, md:h-10
    after: "absolute top-0 left-0 right-0 h-1 bg-amber-500 opacity-30"
  },
  patty: {
    name: 'Patty',
    className: "bg-amber-900 h-8 md:h-10 w-[95%] rounded-lg mx-auto", // Adjusted other heights for proportion
    inner: "bg-amber-950 h-2 w-4/5 rounded-full mx-auto my-1"
  },
  cheese: {
    name: 'Cheese',
    className: "bg-yellow-400 h-5 md:h-6 w-[105%] -mx-[2.5%] rounded-sm",
    inner: "absolute top-1 left-2 right-2 bottom-1 bg-yellow-300 opacity-50 rounded-sm"
  },
  lettuce: {
    name: 'Lettuce',
    className: "bg-green-500 h-6 md:h-8 w-[110%] -mx-[5%] rounded-xl z-10 border-b-2 border-green-600",
    inner: "relative top-1 w-full h-4 md:h-6 flex flex-row",
    details: [
      "w-1/6 h-full bg-green-400 rounded-full mx-[1px]",
      "w-1/5 h-full bg-green-400 rounded-full mx-[1px]",
      "w-1/4 h-full bg-green-400 rounded-full mx-[1px]",
      "w-1/5 h-full bg-green-400 rounded-full mx-[1px]",
      "w-1/6 h-full bg-green-400 rounded-full mx-[1px]"
    ]
  },
  tomato: {
    name: 'Tomato',
    className: "bg-red-500 h-5 md:h-6 w-[95%] mx-auto rounded-full",
    inner: "bg-red-400 h-3 md:h-4 w-4/5 rounded-full mx-auto relative top-1 flex justify-center items-center",
    seeds: "flex w-3/4 justify-around",
    seed: "bg-red-300 h-1 w-1 rounded-full"
  },
  onion: {
    name: 'Onion',
    className: "bg-purple-200 h-3 md:h-4 w-[90%] mx-auto rounded-full",
    inner: "bg-purple-100 h-1 md:h-2 w-4/5 rounded-full mx-auto relative top-1"
  },
  pickle: {
    name: 'Pickle',
    className: "bg-green-600 h-2.5 md:h-3 w-3/4 mx-auto rounded-lg flex flex-row justify-center",
    dots: "flex w-3/4 justify-around items-center",
    dot: "bg-green-700 h-1 w-1 rounded-full"
  },
  bacon: {
    name: 'Bacon',
    className: "bg-red-700 h-3 md:h-4 w-[80%] mx-auto rounded-sm flex flex-row",
    details: [
      "w-1/4 h-full bg-red-300 mx-[2px]",
      "w-1/3 h-full bg-red-400 mx-[2px]",
      "w-1/4 h-full bg-red-300 mx-[2px]"
    ]
  },
  egg: {
    name: 'Egg',
    className: "bg-yellow-100 h-5 md:h-6 w-3/4 mx-auto rounded-full flex justify-center items-center",
    inner: "bg-yellow-300 h-3 md:h-4 w-3 md:w-4 rounded-full"
  },
  mushroom: {
    name: 'Mushroom',
    className: "bg-stone-200 h-4 md:h-5 w-[85%] mx-auto rounded-full",
    top: "bg-stone-300 h-2 md:h-3 w-full rounded-t-full",
    bottom: "bg-stone-100 h-2 w-full rounded-b-full"
  },
  avocado: {
    name: 'Avocado',
    className: "bg-green-300 h-3 md:h-4 w-[80%] mx-auto rounded-lg",
    inner: "bg-green-200 h-1 md:h-2 w-4/5 rounded-sm mx-auto relative top-1"
  }
};

const BurgerIngredient = ({ type, onClick, draggable = false, onDragStart }) => {
  const style = ingredientStyles[type] || ingredientStyles.patty;
  
  const variants = {
    initial: { scale: 0.8, opacity: 0, y: -3 }, // Even smaller animation for compact view
    animate: { scale: 1, opacity: 1, y: 0 },
    exit: { scale: 0.8, opacity: 0, y: 3 }, // Even smaller animation for compact view
    hover: { scale: 1.02, y: -0.5 } // Very subtle hover effect
  };

  const renderIngredientContent = () => {
    switch (type) {
      case 'lettuce':
        return (
          <div className={style.inner}>
            {style.details.map((detail, i) => (
              <div key={i} className={detail}></div>
            ))}
          </div>
        );
      case 'tomato':
        return (
          <div className={style.inner}>
            <div className={style.seeds}>
              {[...Array(5)].map((_, i) => (
                <div key={i} className={style.seed}></div>
              ))}
            </div>
          </div>
        );
      case 'pickle':
        return (
          <div className={style.dots}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className={style.dot}></div>
            ))}
          </div>
        );
      case 'bacon':
        return (
          <>
            {style.details.map((detail, i) => (
              <div key={i} className={detail}></div>
            ))}
          </>
        );
      case 'patty':
        return <div className={style.inner}></div>;
      case 'egg':
        return <div className={style.inner}></div>;
      case 'mushroom':
        return (
          <>
            <div className={style.top}></div>
            <div className={style.bottom}></div>
          </>
        );
      case 'cheese':
        return <div className={style.inner}></div>;
      case 'onion':
        return <div className={style.inner}></div>;
      case 'avocado':
        return <div className={style.inner}></div>;
      default:
        return null;
    }
  };

  return (
    <motion.div
      className={`${style.className} relative cursor-pointer shadow-sm`} // Changed shadow from shadow-md to shadow-sm
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover="hover"
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      aria-label={style.name || type}
      style={{ touchAction: 'manipulation' }}
    >
      {renderIngredientContent()}
      {style.before && <div className={style.before}></div>}
      {style.after && <div className={style.after}></div>}
    </motion.div>
  );
};

export { ingredientStyles };
export default BurgerIngredient;
