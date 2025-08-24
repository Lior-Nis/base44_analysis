import React, { useState, useEffect, useRef } from 'react';
import { User, FishingGame } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Fish, Target, Zap, Trophy } from 'lucide-react';

export default function FishHunterPage() {
  const [user, setUser] = useState(null);
  const [gameState, setGameState] = useState('menu'); // menu, playing, finished
  const [betAmount, setBetAmount] = useState(10);
  const [currentGame, setCurrentGame] = useState(null);
  const [bullets, setBullets] = useState(50);
  const [fishCaught, setFishCaught] = useState(0);
  const [bonusFish, setBonusFish] = useState(0);
  const [score, setScore] = useState(0);
  const [fish, setFish] = useState([]);
  const [crosshair, setCrosshair] = useState({ x: 400, y: 300 });
  const gameAreaRef = useRef(null);

  const fishTypes = [
    { type: 'small', emoji: '🐠', points: 5, speed: 3, size: 30 },
    { type: 'medium', emoji: '🐟', points: 10, speed: 2, size: 40 },
    { type: 'large', emoji: '🐡', points: 20, speed: 1.5, size: 50 },
    { type: 'rare', emoji: '🦈', points: 50, speed: 1, size: 60 },
    { type: 'bonus', emoji: '🐙', points: 100, speed: 0.5, size: 70 }
  ];

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(updateFish, 100);
      const spawnInterval = setInterval(spawnFish, 2000);
      return () => {
        clearInterval(interval);
        clearInterval(spawnInterval);
      };
    }
  }, [gameState]);

  const loadUser = async () => {
    const userData = await User.me();
    setUser(userData);
  };

  const startGame = async () => {
    if (user.wallet_balance < betAmount) {
      alert('Insufficient balance!');
      return;
    }

    const newBalance = user.wallet_balance - betAmount;
    await User.updateMyUserData({ wallet_balance: newBalance });
    setUser(prev => ({ ...prev, wallet_balance: newBalance }));

    const game = await FishingGame.create({
      user_id: user.id,
      bet_amount: betAmount
    });

    setCurrentGame(game);
    setGameState('playing');
    setBullets(50);
    setFishCaught(0);
    setBonusFish(0);
    setScore(0);
    setFish([]);
    spawnInitialFish();
  };

  const spawnInitialFish = () => {
    const initialFish = [];
    for (let i = 0; i < 8; i++) {
      const fishType = fishTypes[Math.floor(Math.random() * fishTypes.length)];
      initialFish.push({
        id: Math.random(),
        ...fishType,
        x: Math.random() * 700,
        y: Math.random() * 500 + 50,
        direction: Math.random() < 0.5 ? 1 : -1,
        verticalDirection: Math.random() < 0.5 ? 1 : -1
      });
    }
    setFish(initialFish);
  };

  const spawnFish = () => {
    if (gameState !== 'playing') return;
    
    const fishType = fishTypes[Math.floor(Math.random() * fishTypes.length)];
    const newFish = {
      id: Math.random(),
      ...fishType,
      x: Math.random() < 0.5 ? -fishType.size : 800,
      y: Math.random() * 500 + 50,
      direction: Math.random() < 0.5 ? 1 : -1,
      verticalDirection: Math.random() < 0.5 ? 1 : -1
    };
    
    setFish(prev => [...prev, newFish]);
  };

  const updateFish = () => {
    setFish(prev => prev.map(f => ({
      ...f,
      x: f.x + (f.speed * f.direction),
      y: f.y + (f.speed * f.verticalDirection * 0.3),
      direction: f.x <= 0 || f.x >= 800 ? -f.direction : f.direction,
      verticalDirection: f.y <= 50 || f.y >= 550 ? -f.verticalDirection : f.verticalDirection
    })).filter(f => f.x > -100 && f.x < 900));
  };

  const handleMouseMove = (e) => {
    if (gameAreaRef.current && gameState === 'playing') {
      const rect = gameAreaRef.current.getBoundingClientRect();
      setCrosshair({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleShoot = (e) => {
    if (gameState !== 'playing' || bullets <= 0) return;
    
    setBullets(prev => prev - 1);
    
    // Check if we hit any fish
    const hitFish = fish.find(f => {
      const distance = Math.sqrt(
        Math.pow(crosshair.x - f.x, 2) + Math.pow(crosshair.y - f.y, 2)
      );
      return distance <= f.size;
    });

    if (hitFish) {
      setFish(prev => prev.filter(f => f.id !== hitFish.id));
      setFishCaught(prev => prev + 1);
      setScore(prev => prev + hitFish.points);
      
      if (hitFish.type === 'bonus') {
        setBonusFish(prev => prev + 1);
      }
    }

    // End game if no bullets left
    if (bullets <= 1) {
      setTimeout(endGame, 1000);
    }
  };

  const endGame = async () => {
    setGameState('finished');
    
    if (currentGame) {
      const multiplier = calculateMultiplier();
      const winAmount = Math.floor(betAmount * multiplier);
      
      await FishingGame.update(currentGame.id, {
        shots_fired: 50 - bullets,
        fish_caught: fishCaught,
        bonus_fish: bonusFish,
        multiplier: multiplier,
        win_amount: winAmount,
        status: 'completed'
      });

      if (winAmount > 0) {
        const newBalance = user.wallet_balance + winAmount;
        await User.updateMyUserData({ wallet_balance: newBalance });
        setUser(prev => ({ ...prev, wallet_balance: newBalance }));
      }
    }
  };

  const calculateMultiplier = () => {
    let multiplier = 0;
    multiplier += fishCaught * 0.1;
    multiplier += bonusFish * 0.5;
    multiplier += score / 100;
    return Math.max(0, multiplier);
  };

  const resetGame = () => {
    setGameState('menu');
    setCurrentGame(null);
  };

  return (
    <div className="min-h-screen p-4 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">🎣 Fish Hunter</h1>
          <p className="text-gray-300">Aim, shoot, and catch the biggest fish in the ocean!</p>
        </div>

        {gameState === 'menu' && (
          <Card className="bg-slate-800/50 border-slate-700/50 max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-white text-center">Start Fishing</CardTitle>
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
                <h3 className="text-white font-bold mb-2">Fish Values:</h3>
                <div className="space-y-1 text-sm">
                  {fishTypes.map(fish => (
                    <div key={fish.type} className="flex justify-between text-gray-300">
                      <span>{fish.emoji} {fish.type}</span>
                      <span>{fish.points} pts</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <Button 
                onClick={startGame} 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!user || user.wallet_balance < betAmount}
              >
                <Fish className="w-4 h-4 mr-2" />
                Start Fishing (₹{betAmount})
              </Button>
            </CardContent>
          </Card>
        )}

        {gameState === 'playing' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-lg">
              <div className="flex gap-6">
                <Badge className="bg-blue-500/20 text-blue-300">
                  <Target className="w-4 h-4 mr-1" />
                  Bullets: {bullets}
                </Badge>
                <Badge className="bg-green-500/20 text-green-300">
                  <Fish className="w-4 h-4 mr-1" />
                  Caught: {fishCaught}
                </Badge>
                <Badge className="bg-yellow-500/20 text-yellow-300">
                  Score: {score}
                </Badge>
              </div>
              <div className="text-white">Bet: ₹{betAmount}</div>
            </div>

            <div 
              ref={gameAreaRef}
              className="relative w-full h-96 bg-gradient-to-b from-blue-400 to-blue-800 rounded-lg overflow-hidden cursor-crosshair"
              onMouseMove={handleMouseMove}
              onClick={handleShoot}
            >
              {/* Water effects */}
              <div className="absolute inset-0 opacity-20">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-white rounded-full animate-pulse"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`
                    }}
                  />
                ))}
              </div>

              {/* Fish */}
              {fish.map(f => (
                <div
                  key={f.id}
                  style={{ 
                    left: `${f.x}px`, 
                    top: `${f.y}px`,
                    fontSize: `${f.size}px`
                  }}
                  className="absolute transition-all duration-100 cursor-pointer hover:scale-110"
                  title={`${f.type} - ${f.points} points`}
                >
                  {f.emoji}
                </div>
              ))}

              {/* Crosshair */}
              <div
                style={{ 
                  left: `${crosshair.x}px`, 
                  top: `${crosshair.y}px`
                }}
                className="absolute w-8 h-8 border-2 border-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              >
                <div className="absolute w-full h-0.5 bg-red-500 top-1/2 transform -translate-y-1/2"></div>
                <div className="absolute h-full w-0.5 bg-red-500 left-1/2 transform -translate-x-1/2"></div>
              </div>

              <div className="absolute top-4 left-4 text-white">
                <div className="text-lg font-bold">🎯 Click to Shoot!</div>
                <div className="text-sm">Move mouse to aim</div>
              </div>
            </div>
          </div>
        )}

        {gameState === 'finished' && (
          <Card className="bg-slate-800/50 border-slate-700/50 max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-white text-center">Fishing Complete!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <div className="text-6xl mb-4">🏆</div>
              <div className="space-y-2">
                <div className="text-white">Fish Caught: {fishCaught}</div>
                <div className="text-yellow-400">Bonus Fish: {bonusFish}</div>
                <div className="text-blue-400">Final Score: {score}</div>
                <div className="text-green-400 text-xl font-bold">
                  Won: ₹{currentGame ? Math.floor(betAmount * calculateMultiplier()) : 0}
                </div>
              </div>
              <Button 
                onClick={resetGame} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Fish Again
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}