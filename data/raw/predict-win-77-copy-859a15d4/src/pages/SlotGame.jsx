import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { User, SlotGame, SlotSpin } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Gamepad2, 
  Coins, 
  Zap, 
  RotateCcw,
  Crown,
  Star,
  Volume2,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SYMBOLS = {
  'cherry': '🍒',
  'lemon': '🍋',
  'orange': '🍊',
  'grape': '🍇',
  'watermelon': '🍉',
  'bell': '🔔',
  'bar': '▬',
  'seven': '7️⃣',
  'diamond': '💎',
  'crown': '👑',
  'star': '⭐',
  'wild': '🃏'
};

export default function SlotGamePage() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const gameKey = urlParams.get('game');
  
  const [user, setUser] = useState(null);
  const [game, setGame] = useState(null);
  const [betAmount, setBetAmount] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reelGrid, setReelGrid] = useState([]);
  const [lastWin, setLastWin] = useState(0);
  const [winningLines, setWinningLines] = useState([]);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    loadGameData();
  }, [gameKey]);

  const loadGameData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      setBalance(userData.wallet_balance || 0);

      const games = await SlotGame.filter({ game_key: gameKey });
      if (games.length > 0) {
        setGame(games[0]);
        initializeReels(games[0]);
      }
    } catch (error) {
      console.error("Error loading game data:", error);
    }
  };

  const initializeReels = (gameData) => {
    const symbols = Object.keys(SYMBOLS).slice(0, 8);
    const grid = Array(gameData.rows).fill().map(() => 
      Array(gameData.reels).fill().map(() => 
        symbols[Math.floor(Math.random() * symbols.length)]
      )
    );
    setReelGrid(grid);
  };

  const spin = async () => {
    if (!game || !user || isSpinning) return;
    if (balance < betAmount) {
      alert("Insufficient balance!");
      return;
    }

    setIsSpinning(true);
    setLastWin(0);
    setWinningLines([]);

    // Deduct bet amount
    const newBalance = balance - betAmount;
    setBalance(newBalance);
    await User.updateMyUserData({ wallet_balance: newBalance });

    // Simulate spinning animation
    const spinDuration = 2000;
    const spinInterval = setInterval(() => {
      const symbols = Object.keys(SYMBOLS).slice(0, 8);
      const newGrid = Array(game.rows).fill().map(() => 
        Array(game.reels).fill().map(() => 
          symbols[Math.floor(Math.random() * symbols.length)]
        )
      );
      setReelGrid(newGrid);
    }, 100);

    setTimeout(async () => {
      clearInterval(spinInterval);
      
      // Generate final result
      const finalResult = generateSpinResult();
      setReelGrid(finalResult.grid);
      
      // Calculate winnings
      const winData = calculateWinnings(finalResult.grid);
      setLastWin(winData.totalWin);
      setWinningLines(winData.lines);

      // Update balance with winnings
      if (winData.totalWin > 0) {
        const finalBalance = newBalance + winData.totalWin;
        setBalance(finalBalance);
        await User.updateMyUserData({ wallet_balance: finalBalance });
      }

      // Record spin
      await SlotSpin.create({
        user_id: user.id,
        game_key: game.game_key,
        bet_amount: betAmount,
        result_grid: finalResult.grid,
        winning_lines: winData.lines,
        total_win: winData.totalWin
      });

      setIsSpinning(false);
    }, spinDuration);
  };

  const generateSpinResult = () => {
    const symbols = Object.keys(SYMBOLS).slice(0, 8);
    const grid = Array(game.rows).fill().map(() => 
      Array(game.reels).fill().map(() => {
        // Weighted random selection
        const rand = Math.random();
        if (rand < 0.1) return 'wild'; // 10% wild
        if (rand < 0.15) return 'crown'; // 5% crown (high value)
        if (rand < 0.25) return 'diamond'; // 10% diamond
        return symbols[Math.floor(Math.random() * (symbols.length - 3))]; // Other symbols
      })
    );
    return { grid };
  };

  const calculateWinnings = (grid) => {
    const lines = [];
    let totalWin = 0;

    // Check horizontal lines
    for (let row = 0; row < grid.length; row++) {
      const line = grid[row];
      const matches = getLineMatches(line);
      if (matches.count >= 3) {
        const multiplier = getSymbolMultiplier(matches.symbol, matches.count);
        const lineWin = betAmount * multiplier;
        totalWin += lineWin;
        lines.push({
          type: 'horizontal',
          row: row,
          symbol: matches.symbol,
          count: matches.count,
          win: lineWin
        });
      }
    }

    return { totalWin, lines };
  };

  const getLineMatches = (line) => {
    const first = line[0];
    let count = 1;
    
    for (let i = 1; i < line.length; i++) {
      if (line[i] === first || line[i] === 'wild' || first === 'wild') {
        count++;
      } else {
        break;
      }
    }
    
    return { symbol: first === 'wild' ? line.find(s => s !== 'wild') || 'wild' : first, count };
  };

  const getSymbolMultiplier = (symbol, count) => {
    const multipliers = {
      'crown': { 3: 50, 4: 200, 5: 1000 },
      'diamond': { 3: 25, 4: 100, 5: 500 },
      'seven': { 3: 20, 4: 80, 5: 400 },
      'star': { 3: 15, 4: 60, 5: 300 },
      'bell': { 3: 10, 4: 40, 5: 200 },
      'wild': { 3: 100, 4: 500, 5: 2000 }
    };
    
    return multipliers[symbol]?.[count] || (count >= 3 ? count * 2 : 0);
  };

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto">
        {/* Game Header */}
        <Card className="bg-slate-800/90 border-purple-500/30 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{game.title}</h1>
                <div className="flex items-center gap-4">
                  <Badge className="bg-purple-500/20 text-purple-300">
                    {game.reels}x{game.rows} Reels
                  </Badge>
                  <Badge className="bg-yellow-500/20 text-yellow-300">
                    <Star className="w-3 h-3 mr-1" />
                    {game.rtp}% RTP
                  </Badge>
                  <Badge className="bg-green-500/20 text-green-300">
                    {game.paylines} Paylines
                  </Badge>
                </div>
              </div>
              {game.jackpot_enabled && (
                <div className="text-center">
                  <div className="text-yellow-400 text-sm">JACKPOT</div>
                  <div className="text-2xl font-bold text-white">
                    ₹{(game.jackpot_amount || 0).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-green-400 font-bold">
                Balance: ₹{balance.toLocaleString()}
              </div>
              {lastWin > 0 && (
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }}
                  className="text-yellow-400 font-bold text-xl"
                >
                  WIN: ₹{lastWin}
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Slot Machine */}
        <Card className="bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-yellow-500/50 mb-6">
          <CardContent className="p-8">
            {/* Reels */}
            <div className="mb-8">
              <div 
                className="grid gap-2 mx-auto bg-black/50 p-4 rounded-lg border-2 border-yellow-500/30"
                style={{
                  gridTemplateColumns: `repeat(${game.reels}, 1fr)`,
                  maxWidth: `${game.reels * 80}px`
                }}
              >
                {reelGrid.flat().map((symbol, index) => (
                  <motion.div
                    key={index}
                    className="w-16 h-16 bg-slate-700 border border-slate-600 rounded-lg flex items-center justify-center text-3xl"
                    animate={isSpinning ? { 
                      rotateY: [0, 360],
                      scale: [1, 1.1, 1]
                    } : {}}
                    transition={{ 
                      duration: 0.1,
                      repeat: isSpinning ? Infinity : 0
                    }}
                  >
                    {SYMBOLS[symbol] || symbol}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <label className="text-white text-sm">Bet:</label>
                <Input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  min={game.min_bet}
                  max={game.max_bet}
                  className="w-24 bg-slate-700 border-slate-600 text-white"
                  disabled={isSpinning}
                />
              </div>
              
              <Button
                onClick={spin}
                disabled={isSpinning || balance < betAmount}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-3 text-lg font-bold"
              >
                {isSpinning ? (
                  <>
                    <RotateCcw className="w-5 h-5 mr-2 animate-spin" />
                    SPINNING...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    SPIN (₹{betAmount})
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => setBetAmount(Math.min(betAmount * 2, game.max_bet))}
                disabled={isSpinning}
                variant="outline"
                className="border-purple-500 text-purple-300 hover:bg-purple-500/10"
              >
                MAX BET
              </Button>
            </div>

            {/* Quick Bet Buttons */}
            <div className="flex justify-center gap-2 mt-4">
              {[game.min_bet, 25, 50, 100, 250].filter(amount => amount <= game.max_bet).map(amount => (
                <Button
                  key={amount}
                  onClick={() => setBetAmount(amount)}
                  disabled={isSpinning}
                  variant="outline"
                  size="sm"
                  className="border-slate-600 text-gray-300 hover:bg-slate-700"
                >
                  ₹{amount}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Winning Lines */}
        <AnimatePresence>
          {winningLines.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="text-yellow-400 flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    Winning Lines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {winningLines.map((line, index) => (
                      <div key={index} className="flex justify-between items-center bg-slate-700/50 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{SYMBOLS[line.symbol]}</span>
                          <span className="text-white">
                            {line.count}x {line.symbol} - Line {line.row + 1}
                          </span>
                        </div>
                        <div className="text-yellow-400 font-bold">₹{line.win}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}