import React, { useState, useEffect, useRef } from 'react';
import { User, HamsterRun } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MousePointer, Coins, Zap, Trophy, Play, Pause } from 'lucide-react';

export default function HamsterRunPage() {
  const [user, setUser] = useState(null);
  const [gameState, setGameState] = useState('menu'); // menu, playing, finished
  const [betAmount, setBetAmount] = useState(10);
  const [currentGame, setCurrentGame] = useState(null);
  const [hamsterPosition, setHamsterPosition] = useState(50);
  const [distance, setDistance] = useState(0);
  const [coins, setCoins] = useState(0);
  const [obstacles, setObstacles] = useState([]);
  const [collectibles, setCollectibles] = useState([]);
  const [gameSpeed, setGameSpeed] = useState(2);
  const [isJumping, setIsJumping] = useState(false);
  const gameIntervalRef = useRef(null);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      gameIntervalRef.current = setInterval(updateGame, 100);
      return () => clearInterval(gameIntervalRef.current);
    }
  }, [gameState, hamsterPosition, obstacles, collectibles]);

  const loadUser = async () => {
    const userData = await User.me();
    setUser(userData);
  };

  const startGame = async () => {
    if (user.wallet_balance < betAmount) {
      alert('Insufficient balance!');
      return;
    }

    // Deduct bet amount
    const newBalance = user.wallet_balance - betAmount;
    await User.updateMyUserData({ wallet_balance: newBalance });
    setUser(prev => ({ ...prev, wallet_balance: newBalance }));

    // Create game record
    const game = await HamsterRun.create({
      user_id: user.id,
      bet_amount: betAmount
    });

    setCurrentGame(game);
    setGameState('playing');
    setDistance(0);
    setCoins(0);
    setHamsterPosition(50);
    setObstacles([]);
    setCollectibles([]);
    setGameSpeed(2);
    generateInitialItems();
  };

  const generateInitialItems = () => {
    const newObstacles = [];
    const newCollectibles = [];

    // Generate obstacles
    for (let i = 0; i < 3; i++) {
      newObstacles.push({
        id: Math.random(),
        x: 800 + (i * 300),
        y: Math.random() * 60 + 20,
        width: 40,
        height: 40
      });
    }

    // Generate coins
    for (let i = 0; i < 5; i++) {
      newCollectibles.push({
        id: Math.random(),
        x: 600 + (i * 200),
        y: Math.random() * 80 + 10,
        width: 25,
        height: 25,
        type: 'coin'
      });
    }

    setObstacles(newObstacles);
    setCollectibles(newCollectibles);
  };

  const updateGame = () => {
    setDistance(prev => prev + gameSpeed);

    // Move obstacles
    setObstacles(prev => {
      const updated = prev.map(obs => ({ ...obs, x: obs.x - gameSpeed * 3 }))
                         .filter(obs => obs.x > -100);
      
      // Add new obstacles
      if (Math.random() < 0.02) {
        updated.push({
          id: Math.random(),
          x: 800,
          y: Math.random() * 60 + 20,
          width: 40,
          height: 40
        });
      }
      return updated;
    });

    // Move collectibles
    setCollectibles(prev => {
      const updated = prev.map(item => ({ ...item, x: item.x - gameSpeed * 3 }))
                          .filter(item => item.x > -50);
      
      // Add new coins
      if (Math.random() < 0.03) {
        updated.push({
          id: Math.random(),
          x: 800,
          y: Math.random() * 80 + 10,
          width: 25,
          height: 25,
          type: 'coin'
        });
      }
      return updated;
    });

    // Increase game speed gradually
    setGameSpeed(prev => Math.min(prev + 0.001, 5));
  };

  const jump = () => {
    if (!isJumping && gameState === 'playing') {
      setIsJumping(true);
      setHamsterPosition(prev => Math.max(prev - 30, 10));
      setTimeout(() => {
        setHamsterPosition(prev => Math.min(prev + 30, 80));
        setIsJumping(false);
      }, 300);
    }
  };

  const checkCollisions = () => {
    const hamsterRect = { x: 100, y: hamsterPosition, width: 40, height: 30 };

    // Check obstacle collisions
    obstacles.forEach(obs => {
      if (hamsterRect.x < obs.x + obs.width &&
          hamsterRect.x + hamsterRect.width > obs.x &&
          hamsterRect.y < obs.y + obs.height &&
          hamsterRect.y + hamsterRect.height > obs.y) {
        endGame();
      }
    });

    // Check coin collection
    collectibles.forEach(item => {
      if (hamsterRect.x < item.x + item.width &&
          hamsterRect.x + hamsterRect.width > item.x &&
          hamsterRect.y < item.y + item.height &&
          hamsterRect.y + hamsterRect.height > item.y) {
        setCoins(prev => prev + 1);
        setCollectibles(prev => prev.filter(c => c.id !== item.id));
      }
    });
  };

  useEffect(() => {
    if (gameState === 'playing') {
      checkCollisions();
    }
  }, [hamsterPosition, obstacles, collectibles]);

  const endGame = async () => {
    setGameState('finished');
    clearInterval(gameIntervalRef.current);

    if (currentGame) {
      const winAmount = calculateWinAmount();
      
      await HamsterRun.update(currentGame.id, {
        distance_covered: Math.floor(distance),
        coins_collected: coins,
        obstacles_hit: 1,
        status: 'completed',
        win_amount: winAmount
      });

      if (winAmount > 0) {
        const newBalance = user.wallet_balance + winAmount;
        await User.updateMyUserData({ wallet_balance: newBalance });
        setUser(prev => ({ ...prev, wallet_balance: newBalance }));
      }
    }
  };

  const calculateWinAmount = () => {
    const baseMultiplier = Math.floor(distance / 100) * 0.1;
    const coinBonus = coins * 0.5;
    const survivalBonus = distance > 500 ? betAmount * 0.5 : 0;
    
    return Math.floor((betAmount * baseMultiplier) + coinBonus + survivalBonus);
  };

  const resetGame = () => {
    setGameState('menu');
    setCurrentGame(null);
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">🐹 Hamster Run</h1>
          <p className="text-gray-300">Help the hamster run as far as possible and collect coins!</p>
        </div>

        {gameState === 'menu' && (
          <Card className="bg-slate-800/50 border-slate-700/50 max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-white text-center">Start New Game</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-white block mb-2">Bet Amount</label>
                <Input
                  type="number"
                  min="10"
                  max={user?.wallet_balance || 0}
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Available: ₹{user?.wallet_balance || 0}
                </p>
              </div>
              <div className="bg-slate-700/50 p-4 rounded-lg">
                <h3 className="text-white font-bold mb-2">How to Play:</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Click/Tap to make the hamster jump</li>
                  <li>• Avoid obstacles (lose game)</li>
                  <li>• Collect coins for bonus points</li>
                  <li>• Survive longer for higher multipliers</li>
                </ul>
              </div>
              <Button 
                onClick={startGame} 
                className="w-full bg-pink-600 hover:bg-pink-700"
                disabled={!user || user.wallet_balance < betAmount}
              >
                <Play className="w-4 h-4 mr-2" />
                Start Game (₹{betAmount})
              </Button>
            </CardContent>
          </Card>
        )}

        {gameState === 'playing' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-lg">
              <div className="flex gap-6">
                <Badge className="bg-blue-500/20 text-blue-300">
                  Distance: {Math.floor(distance)}m
                </Badge>
                <Badge className="bg-yellow-500/20 text-yellow-300">
                  <Coins className="w-4 h-4 mr-1" />
                  {coins}
                </Badge>
                <Badge className="bg-green-500/20 text-green-300">
                  Speed: {gameSpeed.toFixed(1)}x
                </Badge>
              </div>
              <div className="text-white">Bet: ₹{betAmount}</div>
            </div>

            <div 
              className="relative w-full h-96 bg-gradient-to-b from-sky-400 to-green-400 rounded-lg overflow-hidden cursor-pointer"
              onClick={jump}
            >
              {/* Ground */}
              <div className="absolute bottom-0 w-full h-20 bg-green-600"></div>
              
              {/* Hamster */}
              <div 
                style={{ top: `${hamsterPosition}%`, left: '100px' }}
                className={`absolute w-10 h-8 transition-all duration-300 ${isJumping ? 'scale-110' : ''}`}
              >
                <div className="text-3xl">🐹</div>
              </div>

              {/* Obstacles */}
              {obstacles.map(obs => (
                <div
                  key={obs.id}
                  style={{ 
                    left: `${obs.x}px`, 
                    top: `${obs.y}%`,
                    width: `${obs.width}px`,
                    height: `${obs.height}px`
                  }}
                  className="absolute bg-red-600 rounded-lg"
                >
                  <div className="text-2xl">🚧</div>
                </div>
              ))}

              {/* Collectibles */}
              {collectibles.map(item => (
                <div
                  key={item.id}
                  style={{ 
                    left: `${item.x}px`, 
                    top: `${item.y}%`,
                    width: `${item.width}px`,
                    height: `${item.height}px`
                  }}
                  className="absolute animate-pulse"
                >
                  <div className="text-xl">🪙</div>
                </div>
              ))}

              <div className="absolute top-4 left-4 text-white text-lg font-bold">
                Click to Jump!
              </div>
            </div>
          </div>
        )}

        {gameState === 'finished' && (
          <Card className="bg-slate-800/50 border-slate-700/50 max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-white text-center">Game Over!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div className="text-6xl mb-4">💥</div>
              <div className="space-y-2">
                <div className="text-white">Distance: {Math.floor(distance)}m</div>
                <div className="text-yellow-400">Coins Collected: {coins}</div>
                <div className="text-green-400 text-xl font-bold">
                  Won: ₹{calculateWinAmount()}
                </div>
              </div>
              <Button 
                onClick={resetGame} 
                className="w-full bg-pink-600 hover:bg-pink-700"
              >
                Play Again
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}