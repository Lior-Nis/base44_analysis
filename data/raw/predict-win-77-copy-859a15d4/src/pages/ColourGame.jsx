
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { ColourGame, ColourBet } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Timer,
  Coins,
  TrendingUp,
  RefreshCw,
  Zap,
  Target,
  Award,
  Ban,
  Play
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";

const BET_AMOUNT = 10;
const ROUND_DURATION = 60; // 1 minute betting time
const SHOW_DURATION = 10; // 10 seconds result show

export default function ColourGamePage() {
  const [user, setUser] = useState(null);
  const [currentGame, setCurrentGame] = useState(null);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [gamePhase, setGamePhase] = useState('betting'); // betting, showing, result
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentResults, setRecentResults] = useState([]);
  const [userBets, setUserBets] = useState([]);
  const [gameStats, setGameStats] = useState({ played: 0, won: 0, winnings: 0 });
  const [lastResult, setLastResult] = useState(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [revealedNumber, setRevealedNumber] = useState(null);
  const [spinningNumber, setSpinningNumber] = useState(0);
  const [roundRecap, setRoundRecap] = useState(null); // For Win/Loss message

  useEffect(() => {
    loadInitialData();
    const interval = setInterval(fetchLatestResult, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!currentGame) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (gamePhase === 'betting') {
            startRusseltShow();
            return SHOW_DURATION;
          } else if (gamePhase === 'showing') {
            handleRoundEnd();
            return ROUND_DURATION;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentGame, gamePhase]);

  const loadInitialData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      let activeGames = await ColourGame.filter({ status: 'active' });
      if (activeGames.length > 0) {
        setCurrentGame(activeGames[0]);
        loadUserBets(userData.id, activeGames[0].id);
      } else {
        let awaitingGame = await ColourGame.filter({status: 'awaiting_result'});
        if(awaitingGame.length === 0) {
            createNewGame();
        } else {
            setCurrentGame(awaitingGame[0]);
            setGamePhase('showing');
            setTimeLeft(SHOW_DURATION);
        }
      }

      const recent = await ColourGame.filter({ status: 'completed' }, '-created_date', 10);
      setRecentResults(recent);
      if(recent.length > 0) setLastResult(recent[0]);

      updateGameStats(userData.id);
    } catch (error) {
      console.error("Error loading initial data:", error);
    }
  };

  const fetchLatestResult = async () => {
    try {
      const latestCompleted = await ColourGame.filter({ status: 'completed' }, '-created_date', 1);
      if (latestCompleted.length > 0 && latestCompleted[0].id !== lastResult?.id) {
          setLastResult(latestCompleted[0]);
          const userData = await User.me(); 
          setUser(userData);
          updateGameStats(userData.id);
          
          const betsForCompletedGame = await ColourBet.filter({ user_id: userData.id, game_id: latestCompleted[0].id });
          const totalWinnings = betsForCompletedGame.reduce((sum, bet) => sum + (bet.actual_win || 0), 0);
          
          if (betsForCompletedGame.length > 0) {
              if (totalWinnings > 0) {
                  setRoundRecap({ status: 'won', amount: totalWinnings });
              } else {
                  const totalBetAmount = betsForCompletedGame.reduce((sum, bet) => sum + bet.bet_amount, 0);
                  setRoundRecap({ status: 'lost', amount: totalBetAmount });
              }
              setTimeout(() => setRoundRecap(null), 6000);
          }

          const recent = await ColourGame.filter({ status: 'completed' }, '-created_date', 10);
          setRecentResults(recent);
      }
    } catch (error) {
      console.error("Error fetching latest result:", error);
    }
  };

  const updateGameStats = async (userId) => {
    try {
      const allBets = await ColourBet.filter({ user_id: userId });
      const wonBets = allBets.filter(bet => bet.status === 'won');
      const totalWinnings = wonBets.reduce((sum, bet) => sum + (bet.actual_win || 0), 0);

      setGameStats({
        played: allBets.length,
        won: wonBets.length,
        winnings: totalWinnings
      });
    } catch (error) {
      console.error("Error updating game stats:", error);
    }
  };
  
  const loadUserBets = async (userId, gameId) => {
    try {
      const bets = await ColourBet.filter({ user_id: userId, game_id: gameId });
      setUserBets(bets);
    } catch (error) {
      console.error("Error loading user bets:", error);
    }
  };

  const createNewGame = async () => {
    try {
      const gameNumber = `CG${Date.now()}`;
      const newGame = await ColourGame.create({
        game_number: gameNumber,
        game_time: new Date().toISOString(),
        status: 'active'
      });
      setCurrentGame(newGame);
      setUserBets([]);
      setTimeLeft(ROUND_DURATION);
      setGamePhase('betting');
      setShowAnimation(false);
      setRevealedNumber(null);
    } catch (error) {
      console.error("Error creating game:", error);
    }
  };

  const startRusseltShow = async () => {
    if (!currentGame) return;
    
    setGamePhase('showing');
    setShowAnimation(true);
    setTimeLeft(SHOW_DURATION);
    
    // Start spinning animation
    const spinInterval = setInterval(() => {
      setSpinningNumber(Math.floor(Math.random() * 10));
    }, 100);

    // Stop spinning after 8 seconds, reveal result after 10
    setTimeout(() => {
      clearInterval(spinInterval);
    }, 8000);

    await ColourGame.update(currentGame.id, { status: 'awaiting_result' });
  };

  const placeBet = async (type, value) => {
    if (!currentGame || !user || isProcessing || gamePhase !== 'betting' || timeLeft <= 5) return;
    if (user.wallet_balance < BET_AMOUNT) {
      alert("Insufficient wallet balance!");
      return;
    }
    
    if(userBets.find(b => b.bet_type === type && b.bet_value === value)) {
        alert(`You have already placed this bet for the round.`);
        return;
    }

    setIsProcessing(true);
    const originalBalance = user.wallet_balance;

    try {
      const newBalance = originalBalance - BET_AMOUNT;
      setUser(prev => ({ ...prev, wallet_balance: newBalance }));
      await User.updateMyUserData({ wallet_balance: newBalance });

      // Calculate potential win based on Russelt Show logic
      let potentialWin = 20; // Default for Red/Green (2x)
      if (type === 'colour' && value === 'violet') {
        potentialWin = 45; // 4.5x for Violet
      } else if (type === 'number') {
        potentialWin = 90; // 9x for exact number
      }

      await ColourBet.create({
        user_id: user.id,
        game_id: currentGame.id,
        bet_type: type,
        bet_value: value,
        bet_amount: BET_AMOUNT,
        potential_win: potentialWin
      });

      loadUserBets(user.id, currentGame.id);
      updateGameStats(user.id);

    } catch (error) {
      console.error("Error placing bet:", error);
      await User.updateMyUserData({ wallet_balance: originalBalance });
      setUser(prev => ({ ...prev, wallet_balance: originalBalance }));
      alert("Failed to place bet. Please try again.");
    }
    setIsProcessing(false);
  };

  const handleRoundEnd = async () => {
    if (!currentGame) return;
    setGamePhase('result');
    createNewGame();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Russelt Show Logic: Convert number to colors
  const getColorsFromNumber = (number) => {
    const colorMap = {
      0: ['green', 'violet'],
      1: ['red'],
      2: ['green'],
      3: ['red'],
      4: ['green'],
      5: ['red', 'violet'],
      6: ['green'],
      7: ['red'],
      8: ['green'],
      9: ['red', 'violet']
    };
    return colorMap[number] || [];
  };

  const numberButtons = Array.from({ length: 10 }, (_, i) => i);
  const colorButtons = ["red", "green", "violet"];

  const hasBetOn = (type, value) => {
      return userBets.some(b => b.bet_type === type && b.bet_value === value);
  }

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">Russelt Show - Color Prediction</h1>
          <p className="text-gray-300">Experience the thrill of the classic Russelt Show!</p>
        </div>

        {/* Win/Loss Recap Message */}
        <AnimatePresence>
            {roundRecap && (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 p-4 rounded-lg shadow-2xl border-2 ${
                        roundRecap.status === 'won' ? 'bg-green-500/80 border-green-300' : 'bg-red-500/80 border-red-300'
                    }`}
                >
                    <div className="text-center text-white">
                        <h3 className="text-2xl font-bold">
                            {roundRecap.status === 'won' ? `🎉 You Won ₹${roundRecap.amount}! 🎉` : `😓 You Lost ₹${roundRecap.amount} 😓`}
                        </h3>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Game Timer & Status */}
        <Card className={`border-2 mb-8 overflow-hidden ${
          gamePhase === 'betting' ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30' :
          gamePhase === 'showing' ? 'bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-yellow-500/30' :
          'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/30'
        }`}>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Timer className="w-8 h-8 text-yellow-400" />
              <div>
                <div className="text-4xl font-bold text-white">{formatTime(timeLeft)}</div>
                <div className="text-sm text-gray-300">
                  {gamePhase === 'betting' ? 'Betting Time' : 
                   gamePhase === 'showing' ? 'Russelt Show Time!' : 'New Round Starting'}
                </div>
              </div>
              {gamePhase === 'showing' && <Play className="w-8 h-8 text-red-400 animate-pulse" />}
            </div>
            
            {currentGame && (
              <Badge className={`${
                gamePhase === 'betting' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                gamePhase === 'showing' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                'bg-green-500/20 text-green-300 border-green-500/30'
              }`}>
                Game #{currentGame.game_number?.slice(-4)} - {gamePhase.toUpperCase()}
              </Badge>
            )}

            {/* Russelt Show Animation */}
            <AnimatePresence>
              {gamePhase === 'showing' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="mt-6 p-6 bg-gradient-to-br from-slate-900 to-black rounded-lg border-2 border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                >
                  <h3 className="text-2xl font-bold text-yellow-400 mb-2 animate-pulse">🎭 RUSSELT SHOW LIVE! 🎭</h3>
                  <p className="text-gray-300 mb-4">The result is coming...</p>
                  <div className="flex justify-center items-center mb-4 h-28">
                    <motion.div
                      animate={{ y: [0, -10, 0], scale: [1, 1.05, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
                      className="w-28 h-28 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-5xl font-bold text-white shadow-lg shadow-yellow-500/30"
                    >
                      {revealedNumber !== null ? revealedNumber : spinningNumber}
                    </motion.div>
                  </div>
                  <div className="text-white text-lg animate-pulse">
                    {revealedNumber !== null ? '🎉 RESULT REVEALED! 🎉' : 'And the number is...'}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Last Result Display */}
            <AnimatePresence>
              {lastResult && gamePhase === 'betting' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-yellow-500/50"
                >
                  <h3 className="text-lg font-bold text-yellow-400 mb-2">🎯 Last Russelt Show Result</h3>
                  <div className="flex justify-center items-center gap-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Winning Number</p>
                      <p className="text-5xl font-bold text-white">
                        {lastResult.result_number}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-400">Winning Colors</p>
                      <div className="flex gap-2">
                        {getColorsFromNumber(lastResult.result_number).map(color => (
                          <div key={color} className={`w-8 h-8 rounded-full ${
                            color === 'red' ? 'bg-red-500' :
                            color === 'green' ? 'bg-green-500' : 'bg-violet-500'
                          }`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Betting Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Color Betting */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Predict the Color (Russelt Style)</CardTitle>
                <p className="text-sm text-gray-400">Red/Green: 2x payout | Violet: 4.5x payout</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <Button
                    onClick={() => placeBet('colour', 'red')}
                    disabled={isProcessing || gamePhase !== 'betting' || timeLeft <= 5 || hasBetOn('colour', 'red')}
                    className={`h-20 text-white text-xl font-bold transition-all duration-200 hover:scale-105 bg-red-600 hover:bg-red-700 ${hasBetOn('colour', 'red') && 'ring-4 ring-yellow-400 opacity-80'}`}
                  >
                    RED
                    <div className="text-xs">1,3,5,7,9</div>
                  </Button>
                  <Button
                    onClick={() => placeBet('colour', 'green')}
                    disabled={isProcessing || gamePhase !== 'betting' || timeLeft <= 5 || hasBetOn('colour', 'green')}
                    className={`h-20 text-white text-xl font-bold transition-all duration-200 hover:scale-105 bg-green-600 hover:bg-green-700 ${hasBetOn('colour', 'green') && 'ring-4 ring-yellow-400 opacity-80'}`}
                  >
                    GREEN
                    <div className="text-xs">0,2,4,6,8</div>
                  </Button>
                  <Button
                    onClick={() => placeBet('colour', 'violet')}
                    disabled={isProcessing || gamePhase !== 'betting' || timeLeft <= 5 || hasBetOn('colour', 'violet')}
                    className={`h-20 text-white text-xl font-bold transition-all duration-200 hover:scale-105 bg-violet-600 hover:bg-violet-700 ${hasBetOn('colour', 'violet') && 'ring-4 ring-yellow-400 opacity-80'}`}
                  >
                    VIOLET
                    <div className="text-xs">0,5,9</div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Number Betting */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Predict the Exact Number</CardTitle>
                <p className="text-sm text-gray-400">Each bet costs ₹10. Correct guess wins ₹90 (9x payout).</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-3">
                  {numberButtons.map((num) => (
                    <Button
                      key={num}
                      onClick={() => placeBet('number', num.toString())}
                      disabled={isProcessing || gamePhase !== 'betting' || timeLeft <= 5 || hasBetOn('number', num.toString())}
                      className={`h-16 transition-all duration-200 hover:scale-105 text-2xl font-bold ${
                        getColorsFromNumber(num).includes('red') && getColorsFromNumber(num).includes('violet') ? 
                          'bg-gradient-to-r from-red-600 to-violet-600 hover:from-red-700 hover:to-violet-700' :
                        getColorsFromNumber(num).includes('green') && getColorsFromNumber(num).includes('violet') ? 
                          'bg-gradient-to-r from-green-600 to-violet-600 hover:from-green-700 hover:to-violet-700' :
                        getColorsFromNumber(num).includes('red') ? 
                          'bg-red-600 hover:bg-red-700' : 
                          'bg-green-600 hover:bg-green-700'
                      } text-white ${hasBetOn('number', num.toString()) && 'ring-4 ring-yellow-400 opacity-80'}`}
                    >
                      {num}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Current Bets */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  Your Bets This Round
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userBets.length > 0 ? (
                  <div className="space-y-2">
                    {userBets.map(bet => (
                      <div key={bet.id} className="flex justify-between items-center bg-slate-700/50 p-2 rounded-lg">
                        <span className="text-white capitalize">
                          {bet.bet_type}: <span className="font-bold">{bet.bet_value}</span>
                        </span>
                        <div className="text-right">
                          <div className="text-yellow-300 font-bold">₹{bet.bet_amount}</div>
                          <div className="text-xs text-gray-400">Win: ₹{bet.potential_win}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-4">No bets placed yet.</p>
                )}
              </CardContent>
            </Card>

            {/* User Stats */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-400" />
                  Your Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-300">Played:</span>
                  <span className="text-white font-bold">{gameStats.played}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Won:</span>
                  <span className="text-green-400 font-bold">{gameStats.won}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Win Rate:</span>
                  <span className="text-blue-400 font-bold">
                    {gameStats.played > 0 ? ((gameStats.won / gameStats.played) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Winnings:</span>
                  <span className="text-yellow-400 font-bold">₹{gameStats.winnings}</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Results */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Recent Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentResults.length > 0 ? (
                  <div className="space-y-2">
                    {recentResults.map((result) => (
                      <div key={result.id} className="flex items-center justify-between p-2 bg-slate-700/30 rounded">
                        <div className="flex items-center gap-2">
                          <div className="text-white font-bold text-lg">{result.result_number}</div>
                          <div className="flex gap-1">
                            {getColorsFromNumber(result.result_number).map(color => (
                              <div key={color} className={`w-4 h-4 rounded-full ${
                                color === 'red' ? 'bg-red-500' :
                                color === 'green' ? 'bg-green-500' : 'bg-violet-500'
                              }`} />
                            ))}
                          </div>
                        </div>
                        <span className="text-gray-400 text-xs">#{result.game_number?.slice(-4)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-400">
                    <RefreshCw className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No results yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {gamePhase !== 'betting' && (
          <Alert className="mt-6 border-yellow-500/30 bg-yellow-500/10">
            <Ban className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-300">
              {gamePhase === 'showing' ? 
                '🎭 Russelt Show is LIVE! Watch the exciting reveal!' :
                '🎉 Round completed! New round starting soon...'
              }
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
