import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Game } from '@/api/entities';
import { User } from '@/api/entities'; // Import User entity
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Award, Star, Clock, Trophy, Save, AlertCircle, Layers, Medal } from 'lucide-react';

const GameOverModal = ({ 
  isOpen, 
  score, 
  level, 
  completedOrders, 
  timePlayed, 
  onRestart, 
  onMainMenu 
}) => {
  const [playerName, setPlayerName] = useState('');
  const [highScores, setHighScores] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setIsSubmitted(false);
      setPlayerName('');
      setError('');
      loadHighScores();
      fetchCurrentUser();
    }
  }, [isOpen]);

  const fetchCurrentUser = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);
      if (user && user.full_name && !playerName) { // Pre-fill name if available and not already entered
        setPlayerName(user.full_name);
      }
    } catch (err) {
      console.warn('Error fetching current user:', err);
      // It's okay if the user is not logged in, email will just not be saved.
    }
  };

  const loadHighScores = async () => {
    try {
      const scores = await Game.list('-score', 10);
      setHighScores(scores);
    } catch (err) {
      console.error('Error loading high scores:', err);
    }
  };

  const saveScore = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    const gameData = {
      player_name: playerName,
      score: score,
      level_reached: level,
      completed_orders: completedOrders,
      time_played: timePlayed,
      date: new Date().toISOString()
    };

    if (currentUser && currentUser.email) {
      gameData.user_email = currentUser.email;
    }

    try {
      const newRecord = await Game.create(gameData);
      
      setIsSubmitted(true);
      // Add the new score to the local high scores list if it qualifies
      // and avoid re-fetching if possible, for a snappier UI update.
      const updatedHighScores = [...highScores, { ...newRecord, id: newRecord.id || Date.now() }] // temp id if not returned
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      setHighScores(updatedHighScores);
      
    } catch (err) {
      setError('Error saving score. Please try again.');
      console.error('Error saving score:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getRankStyle = (index) => {
    if (index === 0) return "bg-amber-100 text-amber-700 border-amber-300";
    if (index === 1) return "bg-slate-100 text-slate-700 border-slate-300";
    if (index === 2) return "bg-orange-100 text-orange-700 border-orange-300";
    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getRankEmoji = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return "";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-xl shadow-xl max-w-sm sm:max-w-md w-full overflow-hidden"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', bounce: 0.4 }}
          >
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 sm:p-6 text-white">
              <div className="flex justify-between items-center">
                <h2 className="text-xl sm:text-2xl font-bold">Game Over!</h2>
                <Trophy className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <p className="text-amber-100 mt-1 text-sm sm:text-base">Let's see how you did...</p>
            </div>

            <div className="p-3 sm:p-4 max-h-[calc(100vh-120px)] sm:max-h-[calc(100vh-160px)] overflow-y-auto"> {/* Adjusted max-height for better scroll */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                {/* Stats cards */}
                {[
                  { icon: Star, label: "Score", value: score, color: "text-amber-500" },
                  { icon: Award, label: "Level", value: level, color: "text-amber-500" },
                  { icon: Layers, label: "Orders", value: completedOrders, color: "text-amber-500" },
                  { icon: Clock, label: "Play Time", value: formatTime(timePlayed), color: "text-amber-500" },
                ].map((item, index) => (
                  <div key={index} className="flex flex-col items-center p-2 sm:p-3 bg-amber-50 rounded-lg">
                    <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${item.color} mb-0.5 sm:mb-1`} />
                    <span className="text-[10px] sm:text-xs text-gray-500">{item.label}</span>
                    <span className="text-sm sm:text-base font-bold">{item.value}</span>
                  </div>
                ))}
              </div>

              {!isSubmitted ? (
                <div className="mb-3 sm:mb-4">
                  <h3 className="text-sm sm:text-base font-medium mb-1.5 sm:mb-2 flex items-center">
                    <Medal className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-amber-500" />
                    Save Your Score
                  </h3>
                  <div className="flex gap-2">
                    <Input 
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Enter your name"
                      className="flex-1 text-xs sm:text-sm"
                      disabled={isSubmitting}
                    />
                    <Button 
                      className="bg-amber-500 hover:bg-amber-600 text-xs sm:text-sm"
                      onClick={saveScore}
                      disabled={isSubmitting || !playerName.trim()}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1.5 sm:mr-2"></div>
                          Save
                        </div>
                      ) : (
                        <>
                          <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                  {error && (
                    <div className="mt-1.5 sm:mt-2 text-red-500 text-xs sm:text-sm flex items-center">
                      <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      {error}
                    </div>
                  )}
                </div>
              ) : (
                <motion.div 
                  className="mb-3 sm:mb-4 bg-green-50 text-green-700 p-2 sm:p-3 rounded-lg text-center text-xs sm:text-sm"
                  initial={{ opacity:0, y:10 }}
                  animate={{ opacity:1, y:0 }}
                >
                  Your score has been saved successfully!
                </motion.div>
              )}

              <div className="mb-3 sm:mb-4">
                <h3 className="text-sm sm:text-base font-medium mb-1.5 sm:mb-2 flex items-center">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 text-amber-500" />
                  High Scores
                </h3>
                
                <div className="border rounded-lg overflow-hidden shadow-sm">
                  <div className="bg-amber-500 text-white px-2 sm:px-3 py-1.5 sm:py-2 flex items-center text-xs sm:text-sm">
                    <div className="w-8 sm:w-10 text-center font-medium">#</div>
                    <div className="flex-1 font-medium truncate">Player</div>
                    <div className="w-16 sm:w-20 text-right font-medium">Score</div>
                  </div>
                  
                  <div className="max-h-[150px] sm:max-h-[180px] overflow-y-auto no-scrollbar"> {/* Custom scrollbar styling if desired */}
                    {highScores.length > 0 ? (
                      highScores.map((entry, index) => (
                        <motion.div
                          key={entry.id || index} // Use index if id is somehow missing temporarily
                          className={`flex items-center px-2 sm:px-3 py-1.5 sm:py-2 border-b text-xs sm:text-sm ${
                            entry.player_name === playerName && entry.score === score && isSubmitted
                              ? 'bg-amber-100 font-semibold'
                              : 'hover:bg-gray-50'
                          }`}
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           transition={{ delay: index * 0.05 }}
                        >
                          <div className="w-8 sm:w-10 flex justify-center">
                            <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs sm:text-sm font-bold ${getRankStyle(index)}`}>
                              {getRankEmoji(index) || (index + 1)}
                            </span>
                          </div>
                          <div className="flex-1 font-medium truncate" title={entry.player_name}>{entry.player_name}</div>
                          <div className="w-16 sm:w-20 text-right font-bold">{entry.score}</div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-3 sm:py-4 text-xs sm:text-sm">
                        No high scores yet. Be the first!
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 text-xs sm:text-sm py-2 h-auto" 
                  onClick={onMainMenu}
                >
                  Main Menu
                </Button>
                <Button 
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-xs sm:text-sm py-2 h-auto" 
                  onClick={onRestart}
                >
                  Play Again
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GameOverModal;