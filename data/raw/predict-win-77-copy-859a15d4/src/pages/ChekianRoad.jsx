import React, { useState, useEffect } from 'react';
import { User, ChekianRoadGame } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Map, Coins, Zap, Shield, Target, Gift, Skull, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const ROAD_LENGTH = 30;
const SEGMENTS = [
  { start: 0, end: 10, name: "Safe Valley", color: "from-green-500 to-emerald-500" },
  { start: 11, end: 20, name: "Risky Hills", color: "from-yellow-500 to-orange-500" },
  { start: 21, end: 30, name: "Danger Peak", color: "from-red-500 to-rose-500" }
];

export default function ChekianRoadPage() {
  const [user, setUser] = useState(null);
  const [gameState, setGameState] = useState('setup'); // setup, playing, finished
  const [betAmount, setBetAmount] = useState(50);
  const [pathType, setPathType] = useState('safe');
  const [currentGame, setCurrentGame] = useState(null);
  const [diceValue, setDiceValue] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [eventMessage, setEventMessage] = useState('');

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
    if (!user || betAmount < 10) return alert("Minimum bet is ₹10");
    if (user.wallet_balance < betAmount) return alert("Insufficient balance");

    const newBalance = user.wallet_balance - betAmount;
    await User.updateMyUserData({ wallet_balance: newBalance });
    setUser(prev => ({ ...prev, wallet_balance: newBalance }));

    const game = await ChekianRoadGame.create({
      user_id: user.id,
      bet_amount: betAmount,
      path_type: pathType
    });

    setCurrentGame(game);
    setGameState('playing');
    setEventMessage('Your journey begins! Roll the dice to move forward.');
  };

  const rollDice = async () => {
    if (!currentGame || isRolling) return;
    
    setIsRolling(true);
    const roll = Math.floor(Math.random() * 6) + 1;
    setDiceValue(roll);
    
    setTimeout(async () => {
      await movePlayer(roll);
      setIsRolling(false);
    }, 1000);
  };

  const movePlayer = async (steps) => {
    const newPosition = Math.min(currentGame.current_position + steps, ROAD_LENGTH);
    const spaceType = getSpaceType(newPosition);
    
    let rewards = currentGame.rewards_collected;
    let penalties = currentGame.penalties_hit;
    let multiplier = currentGame.multiplier;
    let message = '';

    // Process space effects
    switch (spaceType) {
      case 'safe':
        message = 'Safe space - no effect.';
        break;
      case 'reward':
        const rewardAmount = Math.floor(Math.random() * 20) + 10;
        rewards += rewardAmount;
        message = `💰 Found treasure! +₹${rewardAmount}`;
        break;
      case 'bonus':
        multiplier += 0.5;
        message = `⚡ Multiplier boost! Current: ${multiplier}x`;
        break;
      case 'hazard':
        if (pathType === 'safe') {
          message = '🛡️ Your safe path protected you from the hazard!';
        } else {
          const penalty = Math.floor(rewards * 0.2);
          rewards = Math.max(0, rewards - penalty);
          penalties++;
          message = `💀 Hit a hazard! Lost ₹${penalty}`;
        }
        break;
      case 'mystery':
        const mysteryOutcome = Math.random();
        if (mysteryOutcome < 0.6) {
          const bonus = Math.floor(Math.random() * 50) + 20;
          rewards += bonus;
          message = `🎁 Mystery bonus! +₹${bonus}`;
        } else {
          message = '❓ Mystery space... nothing happened.';
        }
        break;
    }

    // Check if reached end
    const status = newPosition >= ROAD_LENGTH ? 'completed' : 'active';
    
    await ChekianRoadGame.update(currentGame.id, {
      current_position: newPosition,
      rewards_collected: rewards,
      penalties_hit: penalties,
      multiplier: multiplier,
      status: status
    });

    setCurrentGame(prev => ({
      ...prev,
      current_position: newPosition,
      rewards_collected: rewards,
      penalties_hit: penalties,
      multiplier: multiplier,
      status: status
    }));

    setEventMessage(message);

    // End game if reached finish
    if (status === 'completed') {
      await endGame(rewards, multiplier);
    }
  };

  const endGame = async (finalRewards, multiplier) => {
    const totalWin = Math.floor(finalRewards * multiplier);
    const newBalance = user.wallet_balance + totalWin;
    
    await User.updateMyUserData({ wallet_balance: newBalance });
    setUser(prev => ({ ...prev, wallet_balance: newBalance }));
    
    setGameState('finished');
    setEventMessage(`🏆 Journey complete! You won ₹${totalWin} (₹${finalRewards} × ${multiplier}x)`);
  };

  const getSpaceType = (position) => {
    const spaceTypes = ['safe', 'safe', 'reward', 'safe', 'hazard', 'safe', 'bonus', 'safe', 'mystery', 'safe'];
    return spaceTypes[position % spaceTypes.length];
  };

  const getSpaceIcon = (position) => {
    const type = getSpaceType(position);
    switch (type) {
      case 'reward': return <Coins className="w-4 h-4 text-yellow-400" />;
      case 'bonus': return <Zap className="w-4 h-4 text-blue-400" />;
      case 'hazard': return <Skull className="w-4 h-4 text-red-400" />;
      case 'mystery': return <Gift className="w-4 h-4 text-purple-400" />;
      default: return <Shield className="w-4 h-4 text-green-400" />;
    }
  };

  const getCurrentSegment = () => {
    const position = currentGame?.current_position || 0;
    return SEGMENTS.find(seg => position >= seg.start && position <= seg.end) || SEGMENTS[0];
  };

  return (
    <div className="min-h-screen p-4 flex justify-center items-center">
      <div className="w-full max-w-6xl mx-auto">
        <Card className="bg-slate-800/50 border-slate-700/50 text-white">
          <CardHeader className="text-center">
            <Map className="w-12 h-12 mx-auto text-green-400 mb-4" />
            <CardTitle className="text-4xl font-bold">Chekian Road</CardTitle>
            <p className="text-gray-400">Choose your path and embark on an adventure!</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {gameState === 'setup' && (
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-400 text-sm">Bet Amount</label>
                    <Input
                      type="number"
                      value={betAmount}
                      onChange={e => setBetAmount(Number(e.target.value))}
                      className="bg-slate-700 mt-1"
                      min="10"
                    />
                  </div>
                  
                  <div>
                    <label className="text-gray-400 text-sm">Choose Your Path</label>
                    <div className="grid gap-3 mt-2">
                      <Button
                        onClick={() => setPathType('safe')}
                        variant={pathType === 'safe' ? 'default' : 'outline'}
                        className={`p-4 h-auto text-left ${pathType === 'safe' ? 'bg-green-600' : 'border-green-500 text-green-300'}`}
                      >
                        <div>
                          <div className="font-bold flex items-center gap-2">
                            <Shield className="w-4 h-4" /> Safe Route
                          </div>
                          <div className="text-sm opacity-75">Lower rewards, protected from hazards</div>
                        </div>
                      </Button>
                      
                      <Button
                        onClick={() => setPathType('fast')}
                        variant={pathType === 'fast' ? 'default' : 'outline'}
                        className={`p-4 h-auto text-left ${pathType === 'fast' ? 'bg-orange-600' : 'border-orange-500 text-orange-300'}`}
                      >
                        <div>
                          <div className="font-bold flex items-center gap-2">
                            <Zap className="w-4 h-4" /> Fast Track
                          </div>
                          <div className="text-sm opacity-75">Higher rewards, more risks</div>
                        </div>
                      </Button>
                    </div>
                  </div>

                  <Button onClick={startGame} className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-lg">
                    Start Journey
                  </Button>
                </div>

                <div className="p-4 rounded-lg bg-slate-700/50">
                  <h3 className="font-bold text-lg mb-4">Game Rules</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>• Roll dice to move along the 30-space road</li>
                    <li>• <Coins className="inline w-4 h-4 text-yellow-400" /> Reward spaces give you coins</li>
                    <li>• <Zap className="inline w-4 h-4 text-blue-400" /> Bonus spaces increase your multiplier</li>
                    <li>• <Skull className="inline w-4 h-4 text-red-400" /> Hazards can reduce your rewards</li>
                    <li>• <Gift className="inline w-4 h-4 text-purple-400" /> Mystery spaces have random effects</li>
                    <li>• Reach the end to win your rewards × multiplier</li>
                  </ul>
                </div>
              </div>
            )}

            {gameState === 'playing' && currentGame && (
              <div className="space-y-6">
                {/* Road Progress */}
                <div className="p-4 rounded-lg bg-slate-700/50">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-bold">{getCurrentSegment().name}</h3>
                      <p className="text-sm text-gray-400">Position: {currentGame.current_position}/{ROAD_LENGTH}</p>
                    </div>
                    <Badge className={`bg-gradient-to-r ${getCurrentSegment().color} text-white`}>
                      Segment {Math.floor(currentGame.current_position / 10) + 1}
                    </Badge>
                  </div>
                  
                  {/* Road Visualization */}
                  <div className="grid grid-cols-10 gap-1 mb-4">
                    {Array.from({ length: ROAD_LENGTH }, (_, i) => (
                      <div
                        key={i}
                        className={`h-8 rounded flex items-center justify-center text-xs ${
                          i === currentGame.current_position 
                            ? 'bg-blue-500 text-white' 
                            : i < currentGame.current_position 
                              ? 'bg-gray-600' 
                              : 'bg-slate-600'
                        }`}
                      >
                        {i === currentGame.current_position ? '🚶' : getSpaceIcon(i)}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-yellow-400 font-bold">₹{currentGame.rewards_collected}</div>
                      <div className="text-xs text-gray-400">Rewards</div>
                    </div>
                    <div>
                      <div className="text-blue-400 font-bold">{currentGame.multiplier}x</div>
                      <div className="text-xs text-gray-400">Multiplier</div>
                    </div>
                    <div>
                      <div className="text-red-400 font-bold">{currentGame.penalties_hit}</div>
                      <div className="text-xs text-gray-400">Penalties</div>
                    </div>
                  </div>
                </div>

                {/* Dice and Controls */}
                <div className="text-center space-y-4">
                  {diceValue && (
                    <motion.div
                      key={diceValue}
                      initial={{ scale: 0, rotate: 0 }}
                      animate={{ scale: 1, rotate: 360 }}
                      className="w-20 h-20 mx-auto bg-white rounded-lg flex items-center justify-center text-4xl font-bold text-black border-4 border-gray-300"
                    >
                      {diceValue}
                    </motion.div>
                  )}
                  
                  <Button
                    onClick={rollDice}
                    disabled={isRolling}
                    className="bg-green-600 hover:bg-green-700 h-12 px-8 text-lg"
                  >
                    {isRolling ? 'Rolling...' : 'Roll Dice'}
                  </Button>
                  
                  {eventMessage && (
                    <div className="p-3 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300">
                      {eventMessage}
                    </div>
                  )}
                </div>
              </div>
            )}

            {gameState === 'finished' && (
              <div className="text-center space-y-4">
                <Trophy className="w-16 h-16 mx-auto text-yellow-400" />
                <h3 className="text-2xl font-bold text-white">Journey Complete!</h3>
                <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/30">
                  <p className="text-green-300 text-lg">{eventMessage}</p>
                </div>
                <Button
                  onClick={() => {
                    setGameState('setup');
                    setCurrentGame(null);
                    setDiceValue(null);
                    setEventMessage('');
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Play Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}