
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Game } from '@/api/entities';
import { Button } from '@/components/ui/button';
// import { createPageUrl } from '@/utils'; // Not used directly here
// import { Link } from 'react-router-dom'; // Not used directly here
import { Trophy, Info, Play, Layers } from 'lucide-react'; // Replaced Menu with Layers

const MainMenu = ({ onStartGame, onViewInstructions }) => {
  const [showHighScores, setShowHighScores] = useState(false);
  const [highScores, setHighScores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (showHighScores) {
      loadHighScores();
    }
  }, [showHighScores]);

  const loadHighScores = async () => {
    setIsLoading(true);
    try {
      const scores = await Game.list('-score', 10); // Get top 10 scores
      setHighScores(scores);
    } catch (err) {
      console.error('Error loading high scores:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 p-4 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background burger elements - reduce count on mobile */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.1,
              fontSize: `${Math.random() * 30 + 15}px`, // Smaller emoji size for mobile
              transform: `rotate(${Math.random() * 180}deg)`,
            }}
            animate={{
              y: [0, 10, 0], // Reduced motion for better performance
              rotate: [`${Math.random() * 10}deg`, `${Math.random() * 10 + 10}deg`],
            }}
            transition={{
              duration: Math.random() * 4 + 3, // Slightly faster animations 
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          >
            {['🍔', '🍟', '🥤', '🥬', '🧀', '🍅', '🥓', '🍳'][Math.floor(Math.random() * 8)]}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="relative overflow-hidden">
          <motion.div 
            className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 md:p-8 text-center text-white"
            initial={{ backgroundPosition: '0% 50%' }}
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.div 
              className="text-3xl md:text-5xl font-bold mb-2 flex justify-center items-center"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              🍔
              <motion.span
                className="mx-2"
                animate={{ rotateX: [0, 360] }}
                transition={{ duration: 1.5, delay: 1, repeat: Infinity, repeatDelay: 3 }}
              >
                Burger
              </motion.span>
              <motion.span
                animate={{ rotateX: [0, 360] }}
                transition={{ duration: 1.5, delay: 1.5, repeat: Infinity, repeatDelay: 3 }}
              >
                Builder
              </motion.span>
              🍔
            </motion.div>
            <motion.div 
              className="text-amber-200 text-base md:text-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              The Tastiest Challenge!
            </motion.div>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {showHighScores ? (
            <motion.div 
              key="highscores"
              className="p-5 md:p-6"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ type: 'tween' }}
            >
              <div className="flex justify-between items-center mb-3 md:mb-4">
                <h2 className="text-lg md:text-xl font-bold flex items-center">
                  <Trophy className="w-4 h-4 md:w-5 md:h-5 mr-2 text-amber-500" />
                  High Scores
                </h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowHighScores(false)}
                >
                  Back
                </Button>
              </div>

              {isLoading ? (
                <div className="py-6 md:py-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-b-2 border-amber-500 mb-2 md:mb-3"></div>
                  <p className="text-gray-500">Loading data...</p>
                </div>
              ) : highScores.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-6 md:p-8 text-center">
                  <p className="text-gray-500">No high scores yet.</p>
                  <p className="text-gray-500 text-sm mt-2">Start playing to be the first on the list!</p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr className="text-left"> {/* Changed to text-left */}
                        <th className="py-2 px-3 font-medium">#</th>
                        <th className="py-2 px-3 font-medium">Name</th>
                        <th className="py-2 px-3 font-medium">Score</th>
                        <th className="py-2 px-3 font-medium">Level</th>
                        <th className="py-2 px-3 font-medium">Orders</th>
                      </tr>
                    </thead>
                    <tbody>
                      {highScores.map((entry, index) => (
                        <motion.tr 
                          key={entry.id} 
                          className="border-b border-gray-200"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <td className="py-2 px-3">{index + 1}</td>
                          <td className="py-2 px-3 font-medium">{entry.player_name}</td>
                          <td className="py-2 px-3">{entry.score}</td>
                          <td className="py-2 px-3">{entry.level_reached}</td>
                          <td className="py-2 px-3">{entry.completed_orders}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="menu"
              className="p-5 md:p-6"
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ type: 'tween' }}
            >
              <div className="space-y-3 md:space-y-4">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Button 
                    className="w-full bg-amber-500 hover:bg-amber-600 h-12 md:h-14 text-base md:text-lg"
                    onClick={onStartGame}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start Game
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Button 
                    className="w-full bg-white border border-amber-300 text-amber-700 hover:bg-amber-50 h-11 md:h-12"
                    onClick={onViewInstructions}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <Info className="w-5 h-5 mr-2" />
                    How to Play?
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button 
                    className="w-full bg-white border border-amber-300 text-amber-700 hover:bg-amber-50 h-11 md:h-12"
                    onClick={() => setShowHighScores(true)}
                    style={{ touchAction: 'manipulation' }}
                  >
                    <Trophy className="w-5 h-5 mr-2" />
                    High Scores
                  </Button>
                </motion.div>
              </div>

              <div className="mt-8 md:mt-10 text-center">
                <motion.p 
                  className="text-gray-500 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  © Burger Builder 2024
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MainMenu;
