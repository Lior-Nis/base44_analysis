
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import BurgerStack from '../components/game/BurgerStack';
import IngredientSelector from '../components/game/IngredientSelector';
import Order from '../components/game/Order';
import ScoreBoard from '../components/game/ScoreBoard';
import GameOverModal from '../components/game/GameOverModal';
import LevelCompleteModal from '../components/game/LevelCompleteModal';
import { AlertCircle } from 'lucide-react';

const ALL_INGREDIENTS = [
  'top_bun', 'bottom_bun', 'patty', 'cheese', 'lettuce', 
  'tomato', 'onion', 'pickle', 'bacon', 'egg', 'mushroom', 'avocado'
];

const LEVELS = [
  {
    numOrders: 3,
    maxIngredients: 4,
    timePerOrder: 30,
    orderTimeDecrement: 2,
    availableIngredients: ['top_bun', 'bottom_bun', 'patty', 'cheese', 'lettuce', 'tomato'],
    specialRules: null,
    levelName: "Burger Beginner"
  },
  {
    numOrders: 4,
    maxIngredients: 5,
    timePerOrder: 28,
    orderTimeDecrement: 2,
    availableIngredients: ['top_bun', 'bottom_bun', 'patty', 'cheese', 'lettuce', 'tomato', 'onion', 'pickle'],
    specialRules: null,
    levelName: "Grill Apprentice"
  },
  {
    numOrders: 5,
    maxIngredients: 6,
    timePerOrder: 25,
    orderTimeDecrement: 3,
    availableIngredients: ALL_INGREDIENTS,
    specialRules: null,
    levelName: "Patty Pro"
  },
  {
    numOrders: 5,
    maxIngredients: 7,
    timePerOrder: 22,
    orderTimeDecrement: 3,
    availableIngredients: ALL_INGREDIENTS,
    specialRules: 'double', 
    levelName: "Double Trouble"
  },
  {
    numOrders: 6,
    maxIngredients: 8,
    timePerOrder: 20,
    orderTimeDecrement: 2,
    availableIngredients: ALL_INGREDIENTS,
    specialRules: 'color', 
    levelName: "Color Coordinated Chef"
  },
  {
    numOrders: 7,
    maxIngredients: 10,
    timePerOrder: 18,
    orderTimeDecrement: 2,
    availableIngredients: ALL_INGREDIENTS,
    specialRules: 'complex', 
    levelName: "Burger Maestro"
  },
  {
    numOrders: 7,
    maxIngredients: 10,
    timePerOrder: 17,
    orderTimeDecrement: 2,
    availableIngredients: ALL_INGREDIENTS,
    specialRules: 'double',
    levelName: "Speedy Stacker"
  },
  {
    numOrders: 8,
    maxIngredients: 11,
    timePerOrder: 16,
    orderTimeDecrement: 2,
    availableIngredients: ALL_INGREDIENTS,
    specialRules: 'color',
    levelName: "Chromatic Cook"
  },
  {
    numOrders: 8,
    maxIngredients: 12,
    timePerOrder: 15,
    orderTimeDecrement: 1,
    availableIngredients: ALL_INGREDIENTS,
    specialRules: 'complex',
    levelName: "Burger Virtuoso"
  },
  {
    numOrders: 9,
    maxIngredients: 12,
    timePerOrder: 15,
    orderTimeDecrement: 1,
    availableIngredients: ALL_INGREDIENTS,
    specialRules: 'complex',
    levelName: "Burger Legend"
  },
  // Levels 11-20
  {
    numOrders: 9,
    maxIngredients: 12,
    timePerOrder: 14,
    orderTimeDecrement: 1,
    availableIngredients: ALL_INGREDIENTS,
    specialRules: 'double',
    levelName: "Grill Master's Gauntlet"
  },
  {
    numOrders: 10,
    maxIngredients: 12,
    timePerOrder: 14,
    orderTimeDecrement: 1,
    availableIngredients: ALL_INGREDIENTS,
    specialRules: 'color',
    levelName: "Condiment Chaos"
  },
  {
    numOrders: 10,
    maxIngredients: 12,
    timePerOrder: 13,
    orderTimeDecrement: 1,
    availableIngredients: ALL_INGREDIENTS,
    specialRules: 'complex',
    levelName: "The Perfectionist Patty"
  },
  {
    numOrders: 11,
    maxIngredients: 12,
    timePerOrder: 13,
    orderTimeDecrement: 1,
    availableIngredients: ALL_INGREDIENTS,
    specialRules: 'double',
    levelName: "Stack 'Em High"
  },
  {
    numOrders: 11,
    maxIngredients: 12,
    timePerOrder: 12,
    orderTimeDecrement: 1,
    availableIngredients: ALL_INGREDIENTS,
    specialRules: 'color',
    levelName: "Rainbow Rush"
  },
  {
    numOrders: 12,
    maxIngredients: 12,
    timePerOrder: 12,
    orderTimeDecrement: 0, // Time is fixed but short
    availableIngredients: ALL_INGREDIENTS,
    specialRules: 'complex',
    levelName: "The Ultimate Order"
  },
  {
    numOrders: 12,
    maxIngredients: 12,
    timePerOrder: 11,
    orderTimeDecrement: 0,
    availableIngredients: ALL_INGREDIENTS,
    specialRules: 'double',
    levelName: "Lightning Chef"
  },
  {
    numOrders: 13,
    maxIngredients: 12,
    timePerOrder: 11,
    orderTimeDecrement: 0,
    availableIngredients: ALL_INGREDIENTS,
    specialRules: 'color',
    levelName: "Artisan Assembler"
  },
  {
    numOrders: 14,
    maxIngredients: 12,
    timePerOrder: 10,
    orderTimeDecrement: 0,
    availableIngredients: ALL_INGREDIENTS,
    specialRules: 'complex',
    levelName: "Burger Baron"
  },
  {
    numOrders: 15,
    maxIngredients: 12,
    timePerOrder: 10,
    orderTimeDecrement: 0,
    availableIngredients: ALL_INGREDIENTS,
    specialRules: 'complex', // Ultimate challenge
    levelName: "Burger Godhood"
  }
];

export default function GamePage() {
  const navigate = useNavigate();
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [currentLevelConfig, setCurrentLevelConfig] = useState(LEVELS[0]);
  const [burgerIngredients, setBurgerIngredients] = useState([]);
  const [orderIngredients, setOrderIngredients] = useState([]);
  const [isOrderActive, setIsOrderActive] = useState(false);
  const [orderTimer, setOrderTimer] = useState(LEVELS[0].timePerOrder);
  const [initialOrderTimeForDisplay, setInitialOrderTimeForDisplay] = useState(LEVELS[0].timePerOrder);
  const [ordersCompletedThisLevel, setOrdersCompletedThisLevel] = useState(0);
  const [totalOrdersCompleted, setTotalOrdersCompleted] = useState(0);
  
  const [isGameOver, setIsGameOver] = useState(false);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isSpeeding, setIsSpeeding] = useState(false);
  const [shakeSelector, setShakeSelector] = useState(false);
  const [speedingTimeoutId, setSpeedingTimeoutId] = useState(null);

  const generateRandomOrder = useCallback(() => {
    const config = currentLevelConfig;
    let numIngredients = Math.floor(Math.random() * (config.maxIngredients - 2)) + 3; // Ensure at least 3, at most maxIng.
    if (numIngredients < 2) numIngredients = 2; // Fallback, should not happen with -2 above
    if (numIngredients > config.maxIngredients) numIngredients = config.maxIngredients;


    let ingredients = [];
    const availableForMiddle = [...config.availableIngredients].filter(
      i => i !== 'top_bun' && i !== 'bottom_bun'
    );

    let includeBottomBun = true;
    let includeTopBun = true;

    if (config.specialRules === 'complex' && Math.random() < 0.25) { // Increased chance for complex levels
        includeBottomBun = false;
    }
    if (config.specialRules === 'complex' && Math.random() < 0.25) { // Increased chance
        includeTopBun = false;
    }
    
    if (includeBottomBun) {
        ingredients.push('bottom_bun');
    }

    // Calculate how many middle ingredients we need to add
    let middleIngredientsCount = numIngredients - (includeBottomBun ? 1 : 0) - (includeTopBun ? 1 : 0);
    if (middleIngredientsCount < 0) middleIngredientsCount = 0; // Can't be negative

    if (config.specialRules === 'double' && Math.random() > 0.5 && availableForMiddle.length > 0 && middleIngredientsCount >=2) {
      const doubleItem = availableForMiddle[Math.floor(Math.random() * availableForMiddle.length)];
      ingredients.push(doubleItem);
      ingredients.push(doubleItem);
      for (let i = 0; i < middleIngredientsCount - 2; i++) {
        if(availableForMiddle.length > 0) {
            const randomIngredient = availableForMiddle[Math.floor(Math.random() * availableForMiddle.length)];
            ingredients.push(randomIngredient);
        }
      }
    } else if (config.specialRules === 'color' && Math.random() > 0.5 && middleIngredientsCount > 0) {
      const colorGroups = {
        'green': ['lettuce', 'pickle', 'avocado'],
        'red': ['tomato', 'bacon'], // Bacon is reddish when cooked
        'yellow': ['cheese', 'egg'],
        'brown': ['patty', 'mushroom']
      };
      const randomColor = Object.keys(colorGroups)[Math.floor(Math.random() * Object.keys(colorGroups).length)];
      const colorIngredients = colorGroups[randomColor].filter(ing => config.availableIngredients.includes(ing));
      
      for (let i = 0; i < middleIngredientsCount; i++) {
        if (colorIngredients.length > 0) {
          ingredients.push(colorIngredients[Math.floor(Math.random() * colorIngredients.length)]);
        } else if (availableForMiddle.length > 0) { 
            // Fallback if no color ingredients available for the chosen color in current level's available list
            ingredients.push(availableForMiddle[Math.floor(Math.random() * availableForMiddle.length)]);
        }
      }
    } else {
      for (let i = 0; i < middleIngredientsCount; i++) {
        if (availableForMiddle.length > 0) {
            const randomIngredient = availableForMiddle[Math.floor(Math.random() * availableForMiddle.length)];
            ingredients.push(randomIngredient);
        }
      }
    }
    
    if (includeTopBun) {
        ingredients.push('top_bun');
    }

    // Ensure order is not empty and has at least one item if buns were excluded and no middle items were added
    if (ingredients.length === 0) {
        if (availableForMiddle.length > 0) {
            ingredients.push(availableForMiddle[0]); 
        } else if (config.availableIngredients.includes('patty')) {
            ingredients.push('patty'); // Absolute fallback
        } else if (config.availableIngredients.length > 0) {
            ingredients.push(config.availableIngredients[0]); // Fallback to any available ingredient
        }
    }


    return ingredients;
  }, [currentLevelConfig]);

  const startNewOrder = useCallback(() => {
    setBurgerIngredients([]);
    const newOrder = generateRandomOrder();
    setOrderIngredients(newOrder);
    
    const baseTime = currentLevelConfig.timePerOrder;
    const decrementPerOrder = currentLevelConfig.orderTimeDecrement;
    // Ensure calculatedOrderTime doesn't go below a minimum, e.g., 5 seconds.
    const calculatedOrderTime = Math.max(8, baseTime - (decrementPerOrder * ordersCompletedThisLevel)); 
    
    setOrderTimer(calculatedOrderTime);
    setInitialOrderTimeForDisplay(calculatedOrderTime); 
    setIsOrderActive(true);
    setIsSpeeding(false);

    if (speedingTimeoutId) clearTimeout(speedingTimeoutId);

    // Speeding mechanic: trigger faster timer countdown for a portion of the order time
    // Adjust probability and duration based on level difficulty
    const speedingChance = 0.3 + (level * 0.05); // Increase chance with level, max around 0.3 + 0.5 = 0.8
    if (level > 2 && Math.random() < Math.min(0.8, speedingChance)) { 
      const speedingDelay = Math.floor(calculatedOrderTime * (0.3 + Math.random() * 0.3)); // Speeding starts between 30% and 60% of order time
      const timeoutId = setTimeout(() => {
        if (!isPaused && isOrderActive && !isGameOver && !isLevelComplete) { 
          setIsSpeeding(true);
        }
      }, speedingDelay * 1000);
      setSpeedingTimeoutId(timeoutId);
    }
  }, [generateRandomOrder, currentLevelConfig, ordersCompletedThisLevel, level, isPaused, isOrderActive, speedingTimeoutId, isGameOver, isLevelComplete]);
  
  useEffect(() => {
    const newConfig = LEVELS[level - 1] || LEVELS[LEVELS.length - 1]; // Ensure it defaults to last level if something goes wrong
    setCurrentLevelConfig(newConfig);
    setOrdersCompletedThisLevel(0); // Reset orders for the new level
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]); // Removed isGameOver from deps, it should not trigger level config change
  
  useEffect(() => {
    // This effect should run when currentLevelConfig is set (i.e., new level starts)
    // or when restarting after game over/level complete.
    if (!isGameOver && !isLevelComplete && currentLevelConfig) {
      startNewOrder();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLevelConfig, isGameOver, isLevelComplete, startNewOrder]); // Added startNewOrder as dependency

  useEffect(() => {
    let gameTimerInterval;
    if (!isPaused && isOrderActive && !isGameOver && !isLevelComplete) {
      gameTimerInterval = setInterval(() => {
        setGameTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(gameTimerInterval);
  }, [isPaused, isOrderActive, isGameOver, isLevelComplete]);

  useEffect(() => {
    let orderTimerInterval;
    if (isOrderActive && !isPaused && !isGameOver && !isLevelComplete) {
      const effectiveInterval = isSpeeding ? 700 : 1000; // Timer ticks faster if speeding
      orderTimerInterval = setInterval(() => {
        setOrderTimer(prev => {
          if (prev <= 1) {
            clearInterval(orderTimerInterval);
            setIsGameOver(true);
            if (speedingTimeoutId) clearTimeout(speedingTimeoutId);
            setIsSpeeding(false);
            return 0;
          }
          return prev - 1;
        });
      }, effectiveInterval);
    }
    return () => clearInterval(orderTimerInterval);
  }, [isOrderActive, isPaused, isGameOver, isLevelComplete, isSpeeding, speedingTimeoutId]);


  const checkOrder = useCallback((currentBurgerStack) => {
    if (!orderIngredients || orderIngredients.length === 0) return false; // Guard against empty/undefined order
    if (currentBurgerStack.length !== orderIngredients.length) {
      return false;
    }
    for (let i = 0; i < currentBurgerStack.length; i++) {
      if (currentBurgerStack[i] !== orderIngredients[i]) {
        return false;
      }
    }
    return true;
  }, [orderIngredients]);

  const handleOrderComplete = () => {
    const timeBonus = Math.floor(orderTimer * 10); // Points for remaining time
    const levelMultiplier = level; // Higher levels give more base points
    const speedingBonus = isSpeeding ? 200 : 50; // Bonus for completing during speeding phase
    const orderBasePoints = 100; // Base points for any completed order
    
    const orderPoints = orderBasePoints + timeBonus + speedingBonus;
    const totalPointsForOrder = orderPoints * levelMultiplier;
    
    setScore(prev => prev + totalPointsForOrder);
    setOrdersCompletedThisLevel(prev => prev + 1);
    setTotalOrdersCompleted(prev => prev + 1);
    
    setIsOrderActive(false); // Stop current order
    setIsSpeeding(false); // Reset speeding flag
    if (speedingTimeoutId) clearTimeout(speedingTimeoutId); // Clear any pending speeding timeout

    if (ordersCompletedThisLevel + 1 >= currentLevelConfig.numOrders) {
      setIsLevelComplete(true); // Trigger level complete modal
    } else {
      setTimeout(startNewOrder, 1000); // Start next order after a short delay
    }
  };

  const handleAddIngredient = (ingredient) => {
    if (!isOrderActive || isPaused || isGameOver || isLevelComplete) return;

    const updatedBurger = [...burgerIngredients, ingredient];
    setBurgerIngredients(updatedBurger);

    // Check if the order is complete only when the lengths match
    if (updatedBurger.length === orderIngredients.length) {
      if (checkOrder(updatedBurger)) {
        handleOrderComplete();
      } else {
        // Order is wrong, trigger shake
        setShakeSelector(true);
        setTimeout(() => setShakeSelector(false), 500); // Shake for 0.5s
      }
    } else if (updatedBurger.length > orderIngredients.length) {
      // Too many ingredients also means wrong order
      setShakeSelector(true);
      setTimeout(() => setShakeSelector(false), 500);
    }
  };
  
  const handleRemoveIngredient = (index) => {
    if (!isOrderActive || isPaused || isGameOver || isLevelComplete) return;
    setBurgerIngredients(prev => prev.filter((_, i) => i !== index));
  };

  const handleNextLevel = () => {
    const levelBonus = level * 500; // Bonus points for completing a level
    setScore(prev => prev + levelBonus);
     // ordersCompletedThisLevel is reset by useEffect on level change
    setIsLevelComplete(false); // Close modal
    
    if (level < LEVELS.length) {
      setLevel(prev => prev + 1); // This will trigger useEffect for currentLevelConfig
    } else {
      // Player has completed all levels
      setIsGameOver(true); 
    }
  };

  const handleRestart = () => {
    setLevel(1); 
    setScore(0);
    // ordersCompletedThisLevel will be reset by useEffect when level changes to 1
    setTotalOrdersCompleted(0);
    setGameTime(0);
    setIsGameOver(false);
    setIsLevelComplete(false); 
    setBurgerIngredients([]); // Clear current burger
    setIsSpeeding(false);
    if (speedingTimeoutId) clearTimeout(speedingTimeoutId);
    setSpeedingTimeoutId(null);
    
    // Critical: To ensure a fresh start, explicitly set isOrderActive to false
    // so that the useEffect for currentLevelConfig can properly initiate the first order of level 1.
    setIsOrderActive(false); 
    
    // Reset timer related states to initial values of the first level directly
    // because setLevel(1) might not immediately update currentLevelConfig for startNewOrder
    const firstLevelConfig = LEVELS[0];
    setOrderTimer(firstLevelConfig.timePerOrder); 
    setInitialOrderTimeForDisplay(firstLevelConfig.timePerOrder);
    
    // Let useEffect based on level change handle setting currentLevelConfig and starting new order.
  };

  const togglePause = () => {
    if (isGameOver || isLevelComplete) return; // Don't allow pause if game/level is over
    setIsPaused(!isPaused);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="h-screen bg-amber-50 flex flex-col overflow-hidden">
      {/* ScoreBoard at the very top with pause button integrated */}
      <ScoreBoard
        score={score}
        level={level}
        completedOrders={totalOrdersCompleted}
        timeLeft={formatTime(gameTime)}
        isPaused={isPaused}
        onTogglePause={togglePause}
        isDisabled={isGameOver || isLevelComplete}
      />

      {/* Main game content in a flex container that takes remaining height */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Order container with reduced padding and margin */}
        <div className="px-2 pt-1 pb-0">
          {isOrderActive && !isGameOver && !isLevelComplete && currentLevelConfig && orderIngredients.length > 0 && (
            <Order
              orderIngredients={orderIngredients}
              timer={orderTimer}
              isActive={!isPaused}
              isSpeeding={isSpeeding}
              initialOrderTime={initialOrderTimeForDisplay}
            />
          )}

          <AnimatePresence>
            {isPaused && !isGameOver && !isLevelComplete && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white p-2 rounded-lg text-center my-1 shadow-md"
              >
                <div className="text-base font-bold">Game Paused</div>
                <p className="text-gray-500 text-xs">Tap Resume to continue playing</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main game area with burger and ingredients */}
        <div className="flex-1 flex flex-col md:flex-row gap-2 px-2 min-h-0 overflow-hidden">
          {/* Burger stack with reduced padding */}
          <div className="flex-1 bg-white rounded-xl shadow-lg p-2 flex flex-col justify-center items-center min-h-0">
            <h3 className="text-center font-semibold mb-1 text-sm">Your Burger</h3>
            <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
              <BurgerStack
                ingredients={burgerIngredients}
                onRemoveIngredient={handleRemoveIngredient}
              />
            </div>
          </div>

          {/* Ingredients selector with reduced padding */}
          {currentLevelConfig && ( // Ensure config is loaded before rendering selector
            <div className="flex-1 flex flex-col min-h-0">
              <IngredientSelector
                onSelect={handleAddIngredient}
                availableIngredients={currentLevelConfig.availableIngredients}
                isDisabled={isPaused || !isOrderActive || isGameOver || isLevelComplete}
                shake={shakeSelector}
              />
              
              {shakeSelector && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-1 bg-red-50 text-red-600 p-1.5 rounded-lg text-xs flex items-start"
                >
                  <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                  <div>
                    <strong>Not quite!</strong> The burger doesn't match the order.
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>

      <LevelCompleteModal
        isOpen={isLevelComplete && !isGameOver}
        level={level}
        score={score}
        bonusPoints={level * 500}
        onContinue={handleNextLevel}
      />

      <GameOverModal
        isOpen={isGameOver}
        score={score}
        level={level}
        completedOrders={totalOrdersCompleted}
        timePlayed={gameTime}
        onRestart={handleRestart}
        onMainMenu={() => navigate(createPageUrl('Home'))}
      />
    </div>
  );
}
