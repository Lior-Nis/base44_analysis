import React, { useState, useEffect } from 'react';
import { User, MinesGame } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bomb, Gem, Play, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

const GRID_SIZE = 25;
const MULTIPLIERS = [
  1.03, 1.08, 1.15, 1.23, 1.33, 1.44, 1.57, 1.72, 1.9, 2.1, 2.35, 2.65, 3.0, 3.4, 3.9, 4.5, 5.2, 6.1, 7.5, 9, 12, 15, 20, 25, 50,
];

export default function MinesPage() {
  const [user, setUser] = useState(null);
  const [betAmount, setBetAmount] = useState(10);
  const [mineCount, setMineCount] = useState(3);
  const [gameState, setGameState] = useState('idle'); // idle, active, busted
  const [grid, setGrid] = useState(Array(GRID_SIZE).fill({ revealed: false, type: 'safe' }));
  const [safePicks, setSafePicks] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [activeGame, setActiveGame] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await User.me();
        setUser(userData);
      } catch (e) {}
    };
    loadUser();
  }, []);

  const startGame = async () => {
    if (betAmount < 1) return alert("Bet must be at least ₹1.");
    if (user.wallet_balance < betAmount) return alert("Insufficient balance.");
    
    setGameState('active');
    setSafePicks(0);
    setCurrentMultiplier(1);
    
    const newBalance = user.wallet_balance - betAmount;
    await User.updateMyUserData({ wallet_balance: newBalance });
    setUser(prev => ({...prev, wallet_balance: newBalance}));

    const mineIndices = new Set();
    while (mineIndices.size < mineCount) {
      mineIndices.add(Math.floor(Math.random() * GRID_SIZE));
    }
    
    const newGridState = Array(GRID_SIZE).fill('safe').map((_, i) => mineIndices.has(i) ? 'mine' : 'safe');
    setGrid(Array(GRID_SIZE).fill({ revealed: false, type: 'safe' }));

    const gameRecord = await MinesGame.create({
        user_id: user.id,
        bet_amount: betAmount,
        mine_count: mineCount,
        grid_state: newGridState,
        status: 'active'
    });
    setActiveGame(gameRecord);
  };

  const handleTileClick = async (index) => {
    if (gameState !== 'active' || grid[index].revealed) return;
    
    const isMine = activeGame.grid_state[index] === 'mine';
    const newGrid = [...grid];

    if (isMine) {
      setGameState('busted');
      // Reveal all mines
      activeGame.grid_state.forEach((type, i) => {
        if (type === 'mine') newGrid[i] = { revealed: true, type: 'mine' };
      });
      await MinesGame.update(activeGame.id, {status: 'busted'});
    } else {
      newGrid[index] = { revealed: true, type: 'safe' };
      const newSafePicks = safePicks + 1;
      setSafePicks(newSafePicks);
      const multiplier = MULTIPLIERS[newSafePicks - 1] || 1;
      setCurrentMultiplier(multiplier);
      
      const revealedTiles = grid.map((t, i) => t.revealed || i === index ? i : -1).filter(i => i !== -1);
      await MinesGame.update(activeGame.id, {
          revealed_tiles: revealedTiles,
          cash_out_multiplier: multiplier
      });
    }
    setGrid(newGrid);
  };

  const cashOut = async () => {
    if (gameState !== 'active' || safePicks === 0) return;

    const winAmount = betAmount * currentMultiplier;
    const newBalance = user.wallet_balance + winAmount;
    await User.updateMyUserData({ wallet_balance: newBalance });
    setUser(prev => ({...prev, wallet_balance: newBalance}));
    
    await MinesGame.update(activeGame.id, { status: 'cashed_out', win_amount: winAmount });
    
    setGameState('idle');
    setActiveGame(null);
    alert(`You cashed out and won ₹${winAmount.toFixed(2)}!`);
  };

  return (
    <div className="min-h-screen p-4 flex justify-center items-center">
      <div className="w-full max-w-5xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 border-slate-700/50 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bomb className="text-red-400"/> Mines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-slate-700/50">
                    <p className="text-sm text-gray-400 flex items-center gap-2"><Wallet className="w-4 h-4"/> Balance</p>
                    <p className="text-xl font-bold text-green-400">₹{user?.wallet_balance?.toFixed(2) || '0.00'}</p>
                </div>
                
                {gameState === 'idle' ? (
                  <>
                    <div>
                      <label className="text-gray-400 text-sm">Bet Amount</label>
                      <Input type="number" value={betAmount} onChange={e => setBetAmount(Number(e.target.value))} className="bg-slate-700 mt-1" />
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm">Mines</label>
                      <Input type="number" value={mineCount} onChange={e => setMineCount(Number(e.target.value))} min="1" max="24" className="bg-slate-700 mt-1" />
                    </div>
                    <Button onClick={startGame} className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg"><Play className="mr-2"/> Start Game</Button>
                  </>
                ) : (
                  <div className="space-y-4">
                     <div className="text-center p-3 rounded-lg bg-slate-700/50">
                        <p className="text-sm text-gray-400">Next Tile Profit</p>
                        <p className="text-xl font-bold text-blue-400">{MULTIPLIERS[safePicks]?.toFixed(2) || 0}x</p>
                    </div>
                     <div className="text-center p-3 rounded-lg bg-slate-700/50">
                        <p className="text-sm text-gray-400">Total Profit</p>
                        <p className="text-xl font-bold text-yellow-400">₹{(betAmount * currentMultiplier - betAmount).toFixed(2)}</p>
                    </div>
                    <Button onClick={cashOut} disabled={safePicks === 0} className="w-full bg-yellow-600 hover:bg-yellow-700 h-12 text-lg">Cash Out</Button>
                  </div>
                )}
                {gameState === 'busted' && (
                    <Button onClick={() => setGameState('idle')} className="w-full bg-red-600 hover:bg-red-700 h-12 text-lg">Play Again</Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Game Grid */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-5 gap-2 aspect-square bg-slate-900/50 p-4 rounded-lg border border-purple-500/20">
              {grid.map((tile, index) => (
                <motion.div
                  key={index}
                  onClick={() => handleTileClick(index)}
                  className={`aspect-square rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300
                    ${tile.revealed 
                      ? (tile.type === 'mine' ? 'bg-red-500/80' : 'bg-green-500/20')
                      : 'bg-slate-700 hover:bg-slate-600'
                    }
                    ${gameState !== 'active' ? 'cursor-not-allowed' : ''}
                  `}
                  whileHover={gameState === 'active' && !tile.revealed ? {scale: 1.05} : {}}
                >
                  {tile.revealed && (
                    <motion.div initial={{scale:0}} animate={{scale:1}}>
                      {tile.type === 'mine' ? <Bomb className="w-8 h-8 text-white"/> : <Gem className="w-8 h-8 text-green-300"/>}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
            {gameState === 'busted' && (
              <div className="text-center mt-4 text-4xl font-bold text-red-500 animate-pulse">
                BOOM! Game Over.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}